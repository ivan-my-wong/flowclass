/// <reference types="stripe-event-types" />
import {
  BadRequestException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { randomUUID } from 'crypto'
import { Request } from 'express'
import Stripe from 'stripe'
import { Money } from 'ts-money'
import { FindOptionsWhere, In } from 'typeorm'
import { Transactional } from 'typeorm-transactional'

import { CreateProductDto } from '@/application/admin/stripe-connect/dto/create-product.dto'
import {
  CreateLoginLinkDto,
  CreateLoginLinkResponse,
  CreateStripeConnectDto,
  CreateStripeConnectResponse,
} from '@/application/admin/stripe-connect/dto/create-stripe-connect.dto'
import { EnableStripeDto } from '@/application/admin/stripe-connect/dto/enable-stripe.dto'
import { StripeWebhookResponse } from '@/application/admin/stripe-connect/dto/stripe-connect.dto'
import { StudentData } from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { STRIPE_CLIENT } from '@/common/constants/provider-keys'
import { ensureStripeConfigured } from '@/common/stripe-guard'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { EmailService } from '@/domain/external/email.service'
import { SettingSiteErrorMessage } from '@/exceptions/error-message/setting-site'
import { StripeErrorMessage } from '@/exceptions/error-message/stripe'
import { Course } from '@/models/courses.entity'
import { CreateCheckoutSessionReturnType } from '@/models/custom-types/stripe'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import {
  PaymentMethod,
  PromotionType as PromotionTypeEnum,
  StripeCheckoutSessionType,
  StripePriceInterval,
  StripePriceSessionType,
} from '@/models/enums/'
import {
  CheckoutStatus,
  EnrollConfirmStatus,
  IntegrationConnectStatus,
  PaymentStatus,
  PromotionUsedStatus,
} from '@/models/enums/status'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { InvoicePromotionUsedRepository } from '@/models/invoice-promotion-used.repository'
import { SettingSiteRepository } from '@/models/setting-site.repository'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'
import { StripeProductPricesRepository } from '@/models/stripe-product-prices.repository'
import { Transaction } from '@/models/transaction.entity'
import { TransactionRepository } from '@/models/transaction.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { enrollIntoInfoToString } from '@/utils/string.utils'

import { CouponsService } from '../service/coupons.service'
import { SettingSiteService } from '../service/setting-site.service'
import { StripeProductPricesService } from '../service/stripe-product-prices.service'

export interface CreateCheckoutSessionParams {
  course: Course
  priceId: string
  returnUrl: string
  customerEmail: string
  token: string
  type: StripeCheckoutSessionType
  enrollInto: string
}

@Injectable()
export class StripeConnectService {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly stripeConnectRepository: StripeConnectRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly logger: CloudWatchLoggerProvider,
    private readonly emailService: EmailService,
    private settingSiteRepository: SettingSiteRepository,
    private readonly invoicePromotionUsedRepository: InvoicePromotionUsedRepository,
    private readonly settingSiteService: SettingSiteService,
    private readonly usersRepository: UsersRepository,
    private readonly stripeProductPricesService: StripeProductPricesService,
    private readonly stripeProductPricesRepository: StripeProductPricesRepository,
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe | null
  ) {}

  private get stripe(): Stripe {
    ensureStripeConfigured(this.stripeClient)
    return this.stripeClient
  }

  @Transactional()
  async webhook(req: Request, payload: any): Promise<StripeWebhookResponse> {
    const sig = req.headers['stripe-signature']
    let event
    try {
      if (!payload) {
        throw new BadRequestException('Payload is required')
      }

      const eventData = JSON.parse(payload.toString())

      const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET
      event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret)

      const session = event.data.object
      const connectedAccountId = event.account
      switch (event.type as Stripe.DiscriminatedEvent.Type) {
        case 'checkout.session.completed':
          await this.handleCompletedCheckoutSession(session)
          break
        case 'checkout.session.async_payment_failed':
          await this.handleFailedCheckoutSession(connectedAccountId, session)
          break
        case 'account.updated':
          await this.handleUpdateAccount(session)
          break
        case 'customer.subscription.deleted':
          this.logger.warn('Subscription deleted event ignored (subscription not configured)')
          break
        case 'price.created':
        case 'price.updated':
          await this.stripeProductPricesService.createOrUpdateStripeProductPrices(session)
          break
        case 'product.created':
        case 'product.updated':
          await this.stripeProductPricesService.createOrUpdateStripeProductPrices(session)
          break
        case 'price.deleted':
          await this.stripeProductPricesService.deleteStripeProductPrices(session)
          break
        case 'product.deleted':
          await this.stripeProductPricesService.deleteStripeProductPrices(session)
          break
        case 'invoice.payment_succeeded':
          this.logger.warn('Invoice payment succeeded ignored (subscription not configured)')
          break
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`)
          break
      }
      return { received: true }
    } catch (error) {
      // this.logger.error('webhook', error.stack);
      throw new BadRequestException(`Webhook Error: ${error.message}`)
    }
  }

  async createConnectAccount(institution: Institution): Promise<StripeConnect> {
    try {
      const settingSiteDetail = await this.settingSiteRepository.findOneBy({
        siteId: institution.siteId,
      })
      if (!settingSiteDetail) {
        throw new BadRequestException(SettingSiteErrorMessage.SITE_NOT_FOUND)
      }
      if (!settingSiteDetail.countryCode) {
        throw new BadRequestException(SettingSiteErrorMessage.COUNTRY_CODE_NOT_FOUND)
      }
      const stripeAccountCreateParams: Stripe.AccountCreateParams = {
        type: 'standard',
        country: settingSiteDetail.countryCode,
        // capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        // settings: { payouts: { schedule: { interval: 'manual' } } },
      }
      if (institution.email) {
        stripeAccountCreateParams.email = institution.email
      }
      const stripeConnectAccount = await this.stripeConnectRepository.findOneBy({
        institutionId: institution.id,
      })
      if (stripeConnectAccount?.customerId) {
        // This try method is for during the migration of Stripe. After all accounts have been migrated, simply change it back to a simple throw new statement
        try {
          await this.stripe.accounts.retrieve(stripeConnectAccount.customerId)
        } catch (e) {
          if (e && !e?.message.includes('does not have access to account')) {
            throw new BadRequestException(StripeErrorMessage.STRIPE_ACCOUNT_ALREADY_EXIST)
          }
        }
      }

      const stripeAccount = await this.stripe.accounts.create(stripeAccountCreateParams)
      if (!stripeAccount) {
        throw new UnprocessableEntityException(StripeErrorMessage.CANNOT_CREATE_CONNECT_ACCOUNT)
      }

      if (stripeConnectAccount) {
        stripeConnectAccount.stripeAccountId = stripeAccount.id
        return await this.stripeConnectRepository.save(stripeConnectAccount)
      } else {
        const siteInstance = this.stripeConnectRepository.create({
          siteId: institution.siteId,
          institutionId: institution.id,
          stripeAccountId: stripeAccount.id,
        })
        return await this.stripeConnectRepository.save(siteInstance)
      }
    } catch (error) {
      this.logger.error('createConnectAccount', error.stack)
      throw new BadRequestException(StripeErrorMessage.CANNOT_CREATE_CONNECT_ACCOUNT)
    }
  }

  async createExpressAccount(institution: Institution): Promise<StripeConnect> {
    try {
      const settingSiteDetail = await this.settingSiteRepository.findOneBy({
        siteId: institution.siteId,
      })
      if (!settingSiteDetail) {
        throw new BadRequestException(SettingSiteErrorMessage.SITE_NOT_FOUND)
      }
      if (!settingSiteDetail.countryCode) {
        throw new BadRequestException(SettingSiteErrorMessage.COUNTRY_CODE_NOT_FOUND)
      }

      const stripeAccountCreateParams: Stripe.AccountCreateParams = {
        type: 'express',
        country: settingSiteDetail.countryCode,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      }
      if (institution.email) {
        stripeAccountCreateParams.email = institution.email
      }
      const stripeConnectAccount = await this.stripeConnectRepository.findOneBy({
        institutionId: institution.id,
      })
      if (stripeConnectAccount?.stripeAccountId) {
        throw new BadRequestException(StripeErrorMessage.STRIPE_ACCOUNT_ALREADY_EXIST)
      }

      const stripeAccount = await this.stripe.accounts.create(stripeAccountCreateParams)
      if (!stripeAccount) {
        throw new UnprocessableEntityException(StripeErrorMessage.CANNOT_CREATE_CONNECT_ACCOUNT)
      }

      if (stripeConnectAccount) {
        stripeConnectAccount.stripeAccountId = stripeAccount.id
        return await this.stripeConnectRepository.save(stripeConnectAccount)
      } else {
        const siteInstance = this.stripeConnectRepository.create({
          siteId: institution.siteId,
          institutionId: institution.id,
          stripeAccountId: stripeAccount.id,
        })
        return await this.stripeConnectRepository.save(siteInstance)
      }
    } catch (error) {
      this.logger.error('error', error.stack)
      this.logger.error('createConnectAccount', error.stack)
      throw new BadRequestException(error.message)
    }
  }

  async createCustomerAccount(institution: Institution): Promise<StripeConnect | null> {
    if (!this.stripeClient) {
      return null
    }
    try {
      const stripeConnectAccount = await this.stripeConnectRepository.findOneBy({
        institutionId: institution.id,
      })
      if (stripeConnectAccount?.customerId) {
        // This try method is for during the migration of Stripe. After all accounts have been migrated, simply change it back to a simple throw new statement
        try {
          const customerDetails = await this.stripe.customers.retrieve(
            stripeConnectAccount.customerId
          )

          if (customerDetails) {
            throw new BadRequestException(StripeErrorMessage.CUSTOMER_ACCOUNT_ALREADY_EXIST)
          }
        } catch (e) {
          this.logger.log(e.message)
        }
      }
      const stripeCustomer = await this.stripe.customers.create({
        email: institution.email,
        ...(process.env.STRIPE_TEST_CLOCK && {
          test_clock: process.env.STRIPE_TEST_CLOCK,
        }),
      })
      if (!stripeCustomer) {
        throw new UnprocessableEntityException(StripeErrorMessage.CANNOT_CREATE_CUSTOMER_ACCOUNT)
      }

      if (stripeConnectAccount) {
        stripeConnectAccount.customerId = stripeCustomer.id
        return await this.stripeConnectRepository.save(stripeConnectAccount)
      } else {
        const siteInstance = this.stripeConnectRepository.create({
          siteId: institution.siteId,
          institutionId: institution.id,
          customerId: stripeCustomer.id,
        })
        return await this.stripeConnectRepository.save(siteInstance)
      }
    } catch (error) {
      this.logger.error('createConnectAccount', error.stack)
      throw new BadRequestException(error.message)
    }
  }

  async enableStripe(
    institutionId: number,
    enableStripeDto: EnableStripeDto
  ): Promise<StripeConnect> {
    try {
      const stripeConnectAccount = await this.stripeConnectRepository.findOneBy({
        institutionId,
      })
      if (!stripeConnectAccount) {
        throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
      }
      stripeConnectAccount.enabled = enableStripeDto.enabled
      return await this.stripeConnectRepository.save(stripeConnectAccount)
    } catch (error) {
      this.logger.error('enableStripe', error.stack)
      throw new BadRequestException(error.message)
    }
  }

  async createProduct(
    course: Course,
    createProductDto: CreateProductDto
  ): Promise<Stripe.Product | { [key: string]: any }> {
    try {
      const stripeConnect = await this.stripeConnectRepository.findOneBy({
        institutionId: course.institutionId,
      })
      return this.stripe.products.create(
        {
          name: createProductDto.name,
          default_price_data: {
            unit_amount: Money.fromDecimal(
              createProductDto.unitAmount,
              createProductDto.currency
            ).getAmount(),
            currency: createProductDto.currency,
          },
          expand: ['default_price'],
        },
        {
          stripeAccount: stripeConnect.stripeAccountId,
        }
      )
    } catch (error) {
      this.logger.error('createProduct', error.stack)
      throw new BadRequestException(StripeErrorMessage.CANNOT_CREATE_PRODUCT)
    }
  }

  async createPaymentLink(
    course: Course,
    currentUser: User,
    price: string,
    type: StripeCheckoutSessionType,
    enrollInto: string,
    redirectUrl: string
  ): Promise<Stripe.Response<Stripe.PaymentLink>> {
    try {
      //Check whether Stripe can send payout to this account
      const stripeConnect = await this.stripeConnection(course.institutionId)
      if (stripeConnect.status == IntegrationConnectStatus.NOTFOUND) {
        throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
      }
      const paymentLink = await this.stripe.paymentLinks.create(
        {
          // payment_method_types: ['card', 'alipay', 'wechat_pay'],
          payment_method_types: ['card'],
          line_items: [
            {
              price,
              quantity: 1,
            },
          ],
          after_completion: {
            type: 'redirect',
            redirect: {
              url: redirectUrl,
            },
          },
          metadata: {
            type,
            enrollInto,
          },
        },
        {
          stripeAccount: stripeConnect.stripeAccountId,
        }
      )
      const transaction = this.transactionRepository.create({
        siteId: course.siteId,
        institutionId: course.institutionId,
        courseId: course.id,
        status: CheckoutStatus.PROCESSING,
        paymentLinkId: paymentLink.id,
        paymentMethod: PaymentMethod.PAY_NOW,
      })
      await this.transactionRepository.save(transaction)
      return paymentLink
    } catch (error) {
      this.logger.error('cannotCreatePaymentLink', error.stack)
      if (error.type === 'card_error') {
        throw new BadRequestException(StripeErrorMessage.CARD_NOT_ACCEPTED)
      } else if (error.code === 'amount_too_low') {
        throw new BadRequestException(StripeErrorMessage.AMOUNT_TOO_LOW)
      } else {
        throw new BadRequestException(StripeErrorMessage.CANNOT_CREATE_PAYMENT_LINK)
      }
    }
  }

  async createCheckoutSession({
    course,
    priceId,
    returnUrl,
    customerEmail,
    token,
    type,
    enrollInto,
  }: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionReturnType> {
    const stripeConnect = await this.stripeConnection(course.institutionId)

    if (stripeConnect.status == IntegrationConnectStatus.NOTFOUND) {
      throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
    }
    const session = await this.stripe.checkout.sessions.create(
      {
        ui_mode: 'embedded',
        customer_email: customerEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${returnUrl}&token=${token}&session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          type,
          enrollInto,
        },
      },
      {
        stripeAccount: stripeConnect.stripeAccountId,
      }
    )

    const transaction = this.transactionRepository.create({
      siteId: course.siteId,
      institutionId: course.institutionId,
      courseId: course.id,
      status: CheckoutStatus.PROCESSING,
      paymentLinkId: session.id,
      paymentMethod: PaymentMethod.PAY_NOW,
    })
    await this.transactionRepository.save(transaction)
    return {
      status: session.status,
      clientSecret: {
        id: session.id,
        clientSecret: session.client_secret,
      },
    }
  }

  async retrieveSession(
    institutionId: number,
    sessionId: string
  ): Promise<CreateCheckoutSessionReturnType> {
    const stripeConnect = await this.stripeConnection(institutionId)

    if (stripeConnect.status == IntegrationConnectStatus.NOTFOUND) {
      throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
    }

    let session

    try {
      session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        stripeAccount: stripeConnect.stripeAccountId,
      })

      const transaction = await this.transactionRepository.findOneBy({
        paymentLinkId: sessionId,
      })

      if (transaction && !!session.id) {
        transaction.paymentLinkId = session.id
        await this.transactionRepository.save(transaction)
      }
    } catch (e) {
      if (e.message.includes('No such checkout.session')) {
        return null
      }
      throw e
    }
    return {
      status: session.status,
      clientSecret: {
        id: session.id,
        clientSecret: session.client_secret,
      },
    }
  }

  async getPaymentLink(paymentLinkId: string): Promise<Stripe.PaymentLink> {
    try {
      const paymentLink = await this.stripe.paymentLinks.retrieve(paymentLinkId)
      return paymentLink
    } catch (error) {
      this.logger.error('getPaymentLink', error.stack)
      return null
    }
  }

  async create(
    createStripeConnectDto: CreateStripeConnectDto
  ): Promise<CreateStripeConnectResponse> {
    const stripeConnect = await this.stripeConnectRepository.findOneBy({
      institutionId: createStripeConnectDto.institutionId,
    })
    if (!stripeConnect) {
      throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
    }
    const accountLink = await this.stripe.accountLinks.create({
      account: stripeConnect.stripeAccountId,
      refresh_url: createStripeConnectDto.refreshUrl ?? process.env.NEXT_PUBLIC_WEB_BASE_URL,
      return_url:
        createStripeConnectDto.returnUrl ?? `${process.env.NEXT_PUBLIC_WEB_BASE_URL}/subscription`,
      type: 'account_onboarding',
    })
    return accountLink
  }

  async findOneBy(
    where: FindOptionsWhere<StripeConnect> | FindOptionsWhere<StripeConnect>[]
  ): Promise<StripeConnect | null> {
    return this.stripeConnectRepository.findOneBy(where)
  }

  // async transfers(requestPayout: RequestPayout): Promise<void> {
  //   try {
  //     await this.stripe.transfers.create({
  //       amount: requestPayout.amount,
  //       currency: STRIPE_CURRENCY.USD,
  //       destination: requestPayout.destination,
  //     });
  //   } catch (error) {
  //     throw new BadGatewayException(error.message);
  //   }
  // }

  async createLinkLogin(createLoginLinkDto: CreateLoginLinkDto): Promise<CreateLoginLinkResponse> {
    try {
      const stripeConnect = await this.stripeConnectRepository.findOneBy({
        institutionId: createLoginLinkDto.institutionId,
      })

      if (!stripeConnect) {
        throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
      }
      const loginLink = await this.stripe.accounts.createLoginLink(stripeConnect.stripeAccountId)
      if (!loginLink) {
        throw new BadRequestException(StripeErrorMessage.CANNOT_CREATE_LOGIN_LINK)
      }
      return loginLink
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async createBillingPortalLink(
    institution: Institution
  ): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    try {
      const stripeConnect = await this.stripeConnectRepository.findOneBy({
        institutionId: institution.id,
      })

      if (!stripeConnect) {
        throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
      }
      const portalLink = await this.stripe.billingPortal.sessions.create({
        customer: stripeConnect.customerId,
      })
      return portalLink
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async getExpressAccountDetail(institution: Institution): Promise<Stripe.Account> {
    try {
      const stripeConnect = await this.stripeConnectRepository.findOneBy({
        institutionId: institution.id,
      })

      if (!stripeConnect.stripeAccountId) {
        throw new BadRequestException(StripeErrorMessage.STRIPE_CONNECT_ACCOUNT_NOT_FOUND)
      }

      const accountDetail = await this.stripe.accounts.retrieve(stripeConnect.stripeAccountId)

      return accountDetail
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async createRefund(enrollCourse: EnrollCourse): Promise<Stripe.Refund> {
    try {
      const stripeConnect = await this.stripeConnectRepository.findOneBy({
        institutionId: enrollCourse.institutionId,
      })
      const invoice = await this.invoiceRepository.findOneBy({
        id: enrollCourse.id,
      })
      const transaction = await this.transactionRepository.findOneBy({
        invoiceId: invoice.id,
      })

      const refund = await this.stripe.refunds.create(
        {
          payment_intent: transaction.paymentIntent,
        },
        {
          stripeAccount: stripeConnect.stripeAccountId,
        }
      )
      return refund
    } catch (error) {
      this.logger.error('createRefund', error.stack)
      throw new BadRequestException(StripeErrorMessage.CANNOT_CREATE_REFUND)
    }
  }

  // Please check out stripe-webhook-example.json for the session object structure
  async handleCompletedCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
    const { type } = session.metadata
    if (!type) {
      this.logger.warn('Checkout session completed without type in metadata')
      return
    }

    switch (session.metadata.type) {
      case StripeCheckoutSessionType.ENROLL_COURSE:
        await this.handleEnrollCourse(session)
        break
      default:
        this.logger.warn(`Unhandled checkout session type: ${type} (subscription not configured)`)
        break
    }
  }

  async handlePriceUpdated(session): Promise<void> {
    switch (session.metadata.type) {
      case StripePriceSessionType.PLAN:
        await this.handleUpdatedSubscriptionPrice(session)
        break
      default:
        break
    }
  }

  async handleUpdatedSubscriptionPrice(session): Promise<void> {
    const {
      id: priceId,
      product: productId,
      recurring: { interval },
      metadata: { planType },
    } = session

    await this.stripeProductPricesRepository.update(
      {
        lookupKey: planType,
      },
      {
        stripeProductId: productId as string,
        stripePriceId: priceId,
        interval: interval as StripePriceInterval,
      }
    )
  }

  async handleFailedCheckoutSession(connectedAccountId, session): Promise<void> {
    await this.transactionRepository.update(
      {
        paymentLinkId: session.payment_link,
      },
      {
        status: CheckoutStatus.FAILED,
      }
    )
  }

  async handleEnrollCourse(session): Promise<void> {
    let invoice, invoiceTokenFromReturnUrl

    const invoiceRelations = {
      course: true,
      enrollCourses: {
        multipleClassMapping: true,
        course: true,
        studentSchedule: {
          studentLessons: true,
        },
      },
      userAlias: true,
      user: true,
    }

    if (session.return_url && typeof session.return_url === 'string') {
      try {
        const url = new URL(session.return_url)
        invoiceTokenFromReturnUrl = url.searchParams.get('token') ?? undefined
      } catch (error) {
        // Fallback to old parsing method if URL parsing fails
        const tokenMatch = session.return_url.split('token=')[1]
        invoiceTokenFromReturnUrl = tokenMatch ? tokenMatch.split('&')[0] : undefined
      }
    }

    if (invoiceTokenFromReturnUrl) {
      invoice = await this.invoiceRepository.findOne({
        where: { proofToken: invoiceTokenFromReturnUrl },
        relations: invoiceRelations,
      })
    } else {
      // We need to handle the case where the transaction payment link is not the same as the invoice payment link
      invoice = await this.invoiceRepository.findOne({
        where: { paymentLinkId: session.id },
        relations: invoiceRelations,
      })
    }

    const transaction =
      (await this.transactionRepository.findOne({
        where: { paymentLinkId: session.id },
      })) ?? new Transaction()

    // this is fall back in case the invoice payment link is not the same as the transaction payment link
    if (!!transaction && !invoice) {
      // step 1, find the original enroll course
      let thisEnrollCourse = await this.enrollCourseRepository.findOne({
        where: { email: session.customer_email, courseId: transaction.courseId },
        relations: { course: true },
        order: { createdAt: 'DESC' },
      })

      if (!thisEnrollCourse) {
        thisEnrollCourse = await this.enrollCourseRepository.findOne({
          where: { name: session.customer_details.name, courseId: transaction.courseId },
          relations: { course: true },
          order: { createdAt: 'DESC' },
        })
      }

      // set the invoice to the latest invoice
      invoice = await this.invoiceRepository.findOne({
        where: { enrollCourses: { id: thisEnrollCourse.id } },
        relations: {
          course: true,
          enrollCourses: {
            multipleClassMapping: true,
            course: true,
            studentSchedule: {
              studentLessons: true,
            },
          },
          userAlias: true,
          user: true,
        },
        order: { createdAt: 'DESC' },
      })

      if (invoice) {
        await this.invoiceRepository.update({ id: invoice.id }, { paymentLinkId: session.id })
      }
    }

    Object.assign(transaction, {
      status: CheckoutStatus.COMPLETED,
      paymentIntent: session.payment_intent,
      checkoutSessionId: session.object.id,
      invoiceId: invoice?.id,
      amountSubtotal: session.object.amount_subtotal,
      amountTotal: session.object.amount_total,
      currency: session.currency,
      customer: session.customer_details,
      description: enrollIntoInfoToString(session.metadata.enrollInto),
      authorizationCode: 'By_Stripe',
      transactionId: randomUUID(),
    })

    await this.transactionRepository.save(transaction)

    for (const enrollCourse of invoice.enrollCourses) {
      await this.enrollCourseRepository.update(
        {
          id: enrollCourse.id,
        },
        {
          confirmState: EnrollConfirmStatus.ACCEPTED,
          paymentAmount: session.object.amount_total,
        }
      )
    }
    invoice.paymentState = PaymentStatus.PAID
    invoice.amountPaid = invoice.payAmount ?? 0
    invoice.paymentMethod = PaymentMethod.PAY_NOW
    invoice.transactionId = transaction.transactionId
    await this.invoiceRepository.save(invoice)

    const invoicePromoUsed = await this.invoicePromotionUsedRepository.findOneBy({
      invoiceId: invoice.id,
      promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
    })

    if (invoicePromoUsed && invoicePromoUsed.usedStatus !== PromotionUsedStatus.CONFIRMED) {
      await this.invoicePromotionUsedRepository.save({
        ...invoicePromoUsed,
        usedStatus: PromotionUsedStatus.CONFIRMED,
      })
    }

    for (const enrollCourse of invoice.enrollCourses) {
      /**
       * The following code is for sending email confirmation to student and admin
       */
      try {
        const applicants = await this.usersRepository.find({
          where: { id: In(invoice.applicants) },
        })
        const applicantsData: StudentData[] = applicants.map((applicant) => ({
          id: applicant.id,
          studentName: applicant.firstName + ' ' + applicant.lastName,
          email: applicant.email,
          phoneNumber: applicant.phone,
        }))
        await this.emailService.sendClassStudentPaymentConfirmedEmail({
          invoice,
          transaction,
          applicants: applicantsData,
          userAlias: invoice.userAlias,
        })
        await this.emailService.sendClassAdminPaymentConfirmedEmail({
          enrollCourse,
          invoice,
          transaction,
        })
      } catch (e) {
        this.logger.error('EMAIL_CONFIRMATION_TO_STUDENT_ENROLLMENT', JSON.stringify(e.body))
      }

      // GA4 measurement removed from open-source build
    }
  }

  async handleUpdateAccount(session: Stripe.Account): Promise<void> {
    const { id, charges_enabled, capabilities } = session

    const status =
      charges_enabled &&
      capabilities.card_payments === 'active' &&
      capabilities.transfers === 'active'
        ? IntegrationConnectStatus.COMPLETE
        : IntegrationConnectStatus.NOTFOUND

    await this.stripeConnectRepository.update({ stripeAccountId: id }, { status })
  }

  async stripeConnection(institutionId: number): Promise<StripeConnect> {
    const stripeConnect = await this.stripeConnectRepository.findOneBy({
      institutionId,
    })

    if (!stripeConnect || !stripeConnect.stripeAccountId || !this.stripe) {
      return plainToInstance(StripeConnect, {
        institutionId,
        status: IntegrationConnectStatus.NOTFOUND,
        enabled: false,
      })
    }

    try {
      const stripeAccountRetrieve = await this.stripe.accounts.retrieve(
        stripeConnect.stripeAccountId
      )
      if (!stripeAccountRetrieve || !stripeAccountRetrieve.payouts_enabled) {
        stripeConnect.status = IntegrationConnectStatus.NOTFOUND
      }
    } catch {
      stripeConnect.status = IntegrationConnectStatus.NOTFOUND
    }

    return plainToInstance(StripeConnect, stripeConnect)
  }

  async createStripeCustomerAccountIfInvalid(customerId: string, institution: Institution) {
    try {
      await this.stripe.customers.retrieve(customerId)
    } catch (e) {
      if (e && !e?.message.includes('No such customer')) {
        throw new BadRequestException(StripeErrorMessage.CUSTOMER_NOT_FOUND)
      } else {
        return await this.createCustomerAccount(institution)
      }
    }
    return null
  }

  async retrieveSessionLineItems(
    stripeAccountId: string,
    sessionId: string
  ): Promise<Stripe.ApiList<Stripe.LineItem>> {
    const lineItems = await this.stripe.checkout.sessions.listLineItems(sessionId, {
      stripeAccount: stripeAccountId,
    })

    return lineItems
  }
}
