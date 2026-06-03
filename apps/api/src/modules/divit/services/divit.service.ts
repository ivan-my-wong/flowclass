import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm'
import { firstValueFrom } from 'rxjs'
import { Repository } from 'typeorm'

import { Course } from '@/models/courses.entity'
import { PaymentMethod } from '@/models/enums'
import { PaymentStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'

import {
  decryptDivitKey,
  encryptDivitKey,
  verifyDivitWebhookSignature,
} from '../crypto/divit-crypto.util'
import { DivitConfigResponseDto, SaveDivitConfigDto } from '../dto/divit-config.dto'
import {
  CreateDivitOrderDto,
  DivitOrderResponseDto,
  DivitPaymentStatusDto,
} from '../dto/divit-order.dto'
import { DivitWebhookEvent } from '../dto/divit-webhook.dto'
import { DivitConfig, DivitConfigRepository } from '../entities/divit-config.entity'
import { DivitOrder, DivitOrderRepository } from '../entities/divit-order.entity'

const DIVIT_BASE_URLS: Record<'sandbox' | 'production', string> = {
  sandbox: 'https://sandbox-api.divit.dev',
  production: 'https://api.divit.com.hk',
}

const DIVIT_EVENT_PAYMENT_SUCCESS = 2001

@Injectable()
export class DivitService {
  private readonly logger = new Logger(DivitService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly divitConfigRepository: DivitConfigRepository,
    private readonly divitOrderRepository: DivitOrderRepository,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>
  ) {}

  // ─── Config ───────────────────────────────────────────────────────────────

  async getConfig(institutionId: number): Promise<DivitConfigResponseDto | null> {
    const config = await this.divitConfigRepository.findOne({
      where: { institutionId },
    })
    if (!config) return null
    return this.maskConfig(config)
  }

  async saveConfig(dto: SaveDivitConfigDto): Promise<DivitConfigResponseDto> {
    let config = await this.divitConfigRepository.findOne({
      where: { institutionId: dto.institutionId },
    })

    if (!config) {
      config = this.divitConfigRepository.create({
        institutionId: dto.institutionId,
        siteId: dto.siteId,
      })
    }

    if (dto.apiKey !== undefined && dto.apiKey !== '') {
      config.apiKeyEncrypted = encryptDivitKey(dto.apiKey)
    }
    if (dto.signatureKey !== undefined && dto.signatureKey !== '') {
      config.signatureKeyEncrypted = encryptDivitKey(dto.signatureKey)
    }

    config.environment = dto.environment ?? config.environment ?? 'sandbox'
    config.enabled = dto.enabled ?? config.enabled ?? false
    config.siteId = dto.siteId

    await this.divitConfigRepository.save(config)
    return this.maskConfig(config)
  }

  private maskConfig(config: DivitConfig): DivitConfigResponseDto {
    return {
      id: config.id,
      institutionId: config.institutionId,
      siteId: config.siteId,
      apiKeyMasked: config.apiKeyEncrypted ? '••••••' : null,
      signatureKeyMasked: config.signatureKeyEncrypted ? '••••••' : null,
      environment: config.environment,
      enabled: config.enabled,
    }
  }

  // ─── Student Connection Check ─────────────────────────────────────────────

  async getConnection(institutionId: number): Promise<{ enabled: boolean }> {
    const config = await this.divitConfigRepository.findOne({
      where: { institutionId },
    })
    return { enabled: !!(config?.enabled && config?.apiKeyEncrypted) }
  }

  // ─── Create Order ─────────────────────────────────────────────────────────

  async createOrder(dto: CreateDivitOrderDto, proofToken: string): Promise<DivitOrderResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: dto.invoiceId },
    })
    if (!invoice) throw new NotFoundException('Invoice not found')
    if (!proofToken || invoice.proofToken !== proofToken) throw new UnauthorizedException()

    if (invoice.paymentState === PaymentStatus.PAID) {
      throw new BadRequestException('Invoice is already paid')
    }

    const config = await this.divitConfigRepository.findOne({
      where: { institutionId: invoice.institutionId, enabled: true },
    })
    if (!config)
      throw new BadRequestException('Divit payment is not configured for this institution')
    if (!config.apiKeyEncrypted) throw new BadRequestException('Divit API key is not configured')

    const apiKey = decryptDivitKey(config.apiKeyEncrypted)
    const baseUrl = DIVIT_BASE_URLS[config.environment]

    const user = await this.userRepository.findOne({ where: { id: invoice.userId } })
    const course = await this.courseRepository.findOne({ where: { id: invoice.courseId } })
    const site = await this.siteRepository.findOne({ where: { id: invoice.siteId } })

    const webBaseUrl =
      this.configService.get<string>('NEXT_PUBLIC_WEB_BASE_URL') || 'http://localhost:3001'
    // DIVIT_WEBHOOK_BASE_URL should be a publicly reachable URL (e.g. ngrok) so Divit can POST back.
    // Falls back to API_BASE_URL, then localhost.
    const apiBaseUrl =
      this.configService.get<string>('DIVIT_WEBHOOK_BASE_URL') ||
      this.configService.get<string>('API_BASE_URL') ||
      'http://localhost:3100'

    this.logger.log(`Divit createOrder: webBaseUrl=${webBaseUrl}, apiBaseUrl=${apiBaseUrl}`)

    // Amount in integer format: multiply by 100 (HKD cents)
    const amountInt = Math.round(Number(invoice.payAmount) * 100)
    const expiredAt = Math.floor(Date.now() / 1000) + 30 * 60 // 30 minutes

    const merchantRef = `INV-${String(invoice.id).padStart(5, '0')}`.substring(0, 36)

    const payload = {
      order: {
        totalAmount: {
          amount: amountInt,
          currency: invoice.currency || 'HKD',
        },
        webhookSuccess: `${webBaseUrl}/enrol/divit-return?invoiceId=${invoice.id}&token=${
          invoice.proofToken
        }&school=${site?.url ?? ''}&course=${encodeURIComponent(course?.path ?? '')}`,
        webhookFailure: `${webBaseUrl}/enrol/divit-return?invoiceId=${
          invoice.id
        }&status=failed&token=${invoice.proofToken}&school=${
          site?.url ?? ''
        }&course=${encodeURIComponent(course?.path ?? '')}`,
        webhookEvents: `${apiBaseUrl}/admin/divit/webhook?institutionId=${invoice.institutionId}`,
        expiredAt,
        merchantRef,
        merchantUniqueOrderID: `${invoice.id}`,
        language: 'en',
      },
      customer: {
        firstName: user?.firstName || 'Customer',
        lastName: user?.lastName || '',
        email: user?.email || '',
        tel: user?.phone || '',
        country: user?.country || 'HK',
        language: 'en',
      },
    }

    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}/directpay/o/order`, payload, {
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      })
    )

    const { data: divitResponse } = response
    if (divitResponse.code !== 0) {
      this.logger.error('Divit create-order failed', divitResponse)
      throw new BadRequestException(`Divit error: ${divitResponse.message}`)
    }

    const divitData = divitResponse.data
    const order = this.divitOrderRepository.create({
      siteId: invoice.siteId,
      institutionId: invoice.institutionId,
      invoiceId: invoice.id,
      divitOrderId: divitData.orderID,
      divitOrderToken: divitData.token,
      redirectUrl: divitData.redirectURI,
      status: 'pending',
      environment: config.environment,
    })
    await this.divitOrderRepository.save(order)

    return {
      redirectUrl: divitData.redirectURI,
      invoiceId: invoice.id,
      divitOrderId: divitData.orderID,
    }
  }

  // ─── Webhook ──────────────────────────────────────────────────────────────

  async handleWebhook(
    rawBody: string,
    signatureHeader: string,
    institutionId: number
  ): Promise<{ received: boolean }> {
    const config = await this.divitConfigRepository.findOne({
      where: { institutionId },
    })
    if (!config || !config.signatureKeyEncrypted) {
      this.logger.warn(`Divit webhook: no config for institution ${institutionId}`)
      throw new UnauthorizedException('Invalid webhook')
    }

    const signatureKey = decryptDivitKey(config.signatureKeyEncrypted)
    const isValid = verifyDivitWebhookSignature(rawBody, signatureHeader, signatureKey)
    if (!isValid) {
      this.logger.warn(
        `Divit webhook: signature verification failed for institution ${institutionId}`
      )
      throw new UnauthorizedException('Invalid webhook signature')
    }

    let event: DivitWebhookEvent
    try {
      event = JSON.parse(rawBody)
    } catch {
      throw new BadRequestException('Invalid webhook payload')
    }

    this.logger.log(
      `Divit webhook event ${event.event.eventId} for order ${event.eventData?.OrderID}`
    )

    if (event.event.eventId === DIVIT_EVENT_PAYMENT_SUCCESS) {
      await this.handlePaymentSuccess(event)
    }

    return { received: true }
  }

  private async handlePaymentSuccess(event: DivitWebhookEvent): Promise<void> {
    const { OrderID } = event.eventData

    const order = await this.divitOrderRepository.findOne({
      where: { divitOrderId: OrderID },
    })
    if (!order) {
      this.logger.warn(`Divit webhook: no order found for Divit OrderID ${OrderID}`)
      return
    }

    order.status = 'paid'
    await this.divitOrderRepository.save(order)

    const invoice = await this.invoiceRepository.findOne({ where: { id: order.invoiceId } })
    if (!invoice) {
      this.logger.warn(`Divit webhook: no invoice found for order invoiceId ${order.invoiceId}`)
      return
    }

    if (invoice.paymentState === PaymentStatus.PAID) {
      this.logger.log(`Invoice ${invoice.id} already marked PAID, skipping`)
      return
    }

    invoice.paymentState = PaymentStatus.PAID
    invoice.paymentMethod = PaymentMethod.PAY_NOW_DIVIT
    invoice.amountPaid = invoice.payAmount ?? 0
    await this.invoiceRepository.save(invoice)

    this.logger.log(`Invoice ${invoice.id} marked PAID via Divit order ${OrderID}`)
  }

  // ─── Payment Status (polling) ─────────────────────────────────────────────

  async getPaymentStatus(invoiceId: number, proofToken: string): Promise<DivitPaymentStatusDto> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } })
    if (!invoice) throw new NotFoundException('Invoice not found')
    if (!proofToken || invoice.proofToken !== proofToken) throw new UnauthorizedException()

    const order = await this.divitOrderRepository.findOne({
      where: { invoiceId },
      order: { createdAt: 'DESC' },
    })

    const paid = invoice.paymentState === PaymentStatus.PAID
    return {
      paid,
      status: order?.status || 'pending',
    }
  }
}
