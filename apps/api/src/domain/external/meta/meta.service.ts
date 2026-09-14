import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { randomInt, randomUUID } from 'crypto'

import { CompleteMetaEmbeddedSignupDto } from '@/application/admin/meta/dto/complete-meta-embedded-signup.dto'
import { CreateMetaEmbeddedSignupDto } from '@/application/admin/meta/dto/create-meta-embedded-signup.dto'
import { UpdateMetaEmbeddedSignupDto } from '@/application/admin/meta/dto/update-meta-embedded-signup.dto'
import { InstitutionsRepository } from '@/models/institutions.repository'
import {
  MetaEmbeddedSignup,
  MetaEmbeddedSignupRepository,
  MetaEmbeddedSignupStatus,
} from '@/models/meta-embedded-signup.entity'
import {
  WhatsAppProvider,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'

import { MetaGraphApiService } from './meta-graph-api.service'
import { WhatsAppProviderConnectionService } from './whatsapp-provider-connection.service'
import { WhatsAppProviderCredentialService } from './whatsapp-provider-credential.service'

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name)

  constructor(
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly metaEmbeddedSignupRepository: MetaEmbeddedSignupRepository,
    private readonly whatsappProviderConnectionService: WhatsAppProviderConnectionService,
    private readonly whatsappProviderCredentialService: WhatsAppProviderCredentialService,
    private readonly metaGraphApiService: MetaGraphApiService
  ) {}

  private toSafeSignup(signup: MetaEmbeddedSignup): MetaEmbeddedSignup {
    const safe = { ...signup }
    delete (safe as Record<string, unknown>).accessToken
    delete (safe as Record<string, unknown>).authorizationCode
    delete (safe as Record<string, unknown>).embeddedSignupPayload
    delete (safe as Record<string, unknown>).businessId
    delete (safe as Record<string, unknown>).configurationId
    delete (safe as Record<string, unknown>).embeddedSignupState
    return safe
  }

  private resolveRedirectUri(): string {
    return process.env.META_EMBEDDED_SIGNUP_REDIRECT_URI?.trim() || ''
  }

  private toCustomerProvisioningError(error: unknown): {
    code: string
    message: string
    status: MetaEmbeddedSignupStatus
  } {
    const raw = error instanceof Error ? error.message.toLowerCase() : ''
    if (raw.includes('permission') || raw.includes('(#200)')) {
      return {
        code: 'MISSING_PERMISSION',
        message:
          "Your Facebook account doesn't have Admin permission to manage this Meta Business Portfolio. Please ensure your account has Full Control in Meta Business Settings and click 'Continue with Meta again'.",
        status: MetaEmbeddedSignupStatus.FAILED,
      }
    }
    if (raw.includes('already registered') || raw.includes('133010')) {
      return {
        code: 'PHONE_ALREADY_REGISTERED',
        message:
          'This phone number is already registered with another WhatsApp setup. Return to Meta and select an eligible number.',
        status: MetaEmbeddedSignupStatus.FAILED,
      }
    }
    if (raw.includes('token') || raw.includes('oauth') || raw.includes('(#190)')) {
      return {
        code: 'REAUTH_REQUIRED',
        message: 'Your Meta authorization expired. Continue with Meta again.',
        status: MetaEmbeddedSignupStatus.REAUTH_REQUIRED,
      }
    }
    return {
      code: 'PROVISIONING_FAILED',
      message:
        error instanceof Error && error.message
          ? error.message
          : 'Could not finish the Meta setup. Please retry the setup.',
      status: MetaEmbeddedSignupStatus.FAILED,
    }
  }

  async initiateEmbeddedSignup(createDto: CreateMetaEmbeddedSignupDto): Promise<{
    embeddedSignup: MetaEmbeddedSignup
    configuration: {
      appId: string | null
      configurationId: string | null
      redirectUri: string | null
      graphApiVersion: string
      scopes: string[]
      state: string | null
    }
  }> {
    const institution = await this.institutionsRepository.findOne({
      where: { id: createDto.institutionId },
    })
    if (!institution) {
      throw new NotFoundException('Institution not found')
    }

    const existing = await this.metaEmbeddedSignupRepository.findByInstitutionId(
      createDto.institutionId
    )
    const configurationId = process.env.META_EMBEDDED_SIGNUP_CONFIG_ID || '896013446059431' // ezchat default config ID
    const appId = process.env.META_APP_ID || '1169305084905353' // ezchat default app ID
    const embeddedSignupState = randomUUID()

    await this.whatsappProviderConnectionService.upsertConnection({
      institutionId: createDto.institutionId,
      provider: WhatsAppProvider.META_CLOUD,
      status: WhatsAppProviderConnectionStatus.PENDING,
    })

    const signup =
      existing ??
      this.metaEmbeddedSignupRepository.create({
        institutionId: createDto.institutionId,
      })

    signup.configurationId = configurationId
    signup.embeddedSignupState = embeddedSignupState
    signup.stateExpiresAt = new Date(Date.now() + 15 * 60 * 1000)
    signup.stateConsumedAt = undefined
    signup.isCoexistence = createDto.isCoexistence ?? signup.isCoexistence
    signup.status = MetaEmbeddedSignupStatus.META_AUTH_PENDING
    signup.provisioningStep = 'meta_authorization'
    signup.lastErrorCode = undefined
    signup.lastErrorMessage = undefined

    const saved = await this.metaEmbeddedSignupRepository.save(signup)
    const redirectUri = this.resolveRedirectUri()

    return {
      embeddedSignup: this.toSafeSignup(saved),
      configuration: {
        appId,
        configurationId: saved.configurationId || null,
        redirectUri,
        graphApiVersion: 'v21.0',
        scopes: [
          'whatsapp_business_management',
          'whatsapp_business_messaging',
          'business_management',
        ],
        state: saved.embeddedSignupState || null,
      },
    }
  }

  async getSystemUserPhoneNumbers(
    wabaId: string,
    institutionId?: number,
    userProvidedToken?: string
  ) {
    let systemToken = userProvidedToken?.trim() || process.env.META_SYSTEM_USER_TOKEN
    if (!systemToken && institutionId) {
      const metaCred = await this.whatsappProviderCredentialService.getMeta(institutionId)
      if (metaCred?.accessToken) {
        systemToken = metaCred.accessToken
      }
    }

    if (!systemToken) {
      throw new BadRequestException(
        'System User Token is not provided, and META_SYSTEM_USER_TOKEN is not configured on the server.'
      )
    }
    return this.metaGraphApiService.getPhoneNumbers(wabaId, systemToken)
  }

  async connectSystemUser(
    institutionId: number,
    wabaId: string,
    phoneNumberId: string,
    pin: string,
    userProvidedToken?: string
  ) {
    const institution = await this.institutionsRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      throw new NotFoundException('Institution not found')
    }

    let systemToken = userProvidedToken?.trim() || process.env.META_SYSTEM_USER_TOKEN
    if (!systemToken) {
      const metaCred = await this.whatsappProviderCredentialService.getMeta(institutionId)
      if (metaCred?.accessToken) {
        systemToken = metaCred.accessToken
      }
    }

    if (!systemToken) {
      throw new BadRequestException(
        'System User Token is not provided, and META_SYSTEM_USER_TOKEN is not configured on the server.'
      )
    }

    const phoneNumber = await this.metaGraphApiService.getPhoneNumber(
      wabaId,
      phoneNumberId,
      systemToken
    )

    try {
      await this.metaGraphApiService.subscribeWaba(wabaId, systemToken)
    } catch (subErr) {
      this.logger.warn(`subscribeWaba non-fatal warning: ${subErr}`)
    }

    const cleanPin = pin.trim()
    if (!/^\d{6}$/.test(cleanPin)) {
      throw new BadRequestException('PIN must be a 6-digit number.')
    }
    let registrationError: string | null = null
    try {
      await this.metaGraphApiService.registerPhoneNumber(phoneNumberId, cleanPin, systemToken)
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } }
        message?: string
      }
      registrationError =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to register phone number PIN with Meta.'
    }

    await this.whatsappProviderConnectionService.upsertConnection({
      institutionId,
      provider: WhatsAppProvider.META_CLOUD,
      status: registrationError
        ? WhatsAppProviderConnectionStatus.DISCONNECTED
        : WhatsAppProviderConnectionStatus.CONNECTED,
      statusReason: registrationError,
      displayPhoneNumber: phoneNumber.display_phone_number,
      externalPhoneNumberId: phoneNumber.id,
      wabaId,
      verifiedName: phoneNumber.verified_name,
      isSystemUser: true,
    })

    if (userProvidedToken?.trim()) {
      await this.whatsappProviderCredentialService.upsertMeta(
        institutionId,
        userProvidedToken.trim()
      )
    }

    if (registrationError) {
      throw new BadRequestException(
        `Connected to WABA, but Meta Phone Number registration failed: ${registrationError}`
      )
    }
  }

  async registerConnectedPhoneNumber(institutionId: number, pin: string): Promise<void> {
    const institution = await this.institutionsRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      throw new NotFoundException('Institution not found')
    }

    const connection = await this.whatsappProviderConnectionService.getConnection(institutionId)
    if (
      !connection ||
      connection.provider !== WhatsAppProvider.META_CLOUD ||
      !connection.externalPhoneNumberId
    ) {
      throw new BadRequestException(
        'Connected Meta WhatsApp phone number not found for this institution.'
      )
    }

    let accessToken: string | undefined
    if (connection.isSystemUser) {
      accessToken = process.env.META_SYSTEM_USER_TOKEN
      if (!accessToken) {
        throw new InternalServerErrorException('META_SYSTEM_USER_TOKEN is not configured.')
      }
    } else {
      const credential = await this.whatsappProviderCredentialService.getMeta(institutionId)
      if (!credential?.accessToken) {
        throw new BadRequestException('Meta access token not found for this institution.')
      }
      accessToken = credential.accessToken
    }

    const cleanPin = pin.trim()
    if (!/^\d{6}$/.test(cleanPin)) {
      throw new BadRequestException('PIN must be a 6-digit number.')
    }

    await this.metaGraphApiService.registerPhoneNumber(
      connection.externalPhoneNumberId,
      cleanPin,
      accessToken
    )

    await this.whatsappProviderConnectionService.upsertConnection({
      institutionId,
      provider: WhatsAppProvider.META_CLOUD,
      status: WhatsAppProviderConnectionStatus.CONNECTED,
      statusReason: null,
      displayPhoneNumber: connection.displayPhoneNumber,
      externalPhoneNumberId: connection.externalPhoneNumberId,
      wabaId: connection.wabaId,
      verifiedName: connection.verifiedName,
      isSystemUser: connection.isSystemUser,
    })
  }

  async completeEmbeddedSignup(
    completeDto: CompleteMetaEmbeddedSignupDto
  ): Promise<MetaEmbeddedSignup> {
    const institution = await this.institutionsRepository.findOne({
      where: { id: completeDto.institutionId },
    })
    if (!institution) {
      throw new NotFoundException('Institution not found')
    }

    const signup = await this.metaEmbeddedSignupRepository.findByInstitutionId(
      completeDto.institutionId
    )
    if (!signup?.embeddedSignupState) {
      throw new BadRequestException('Meta Embedded Signup must be initiated before completion.')
    }
    if (!completeDto.state || completeDto.state !== signup.embeddedSignupState) {
      throw new BadRequestException('Invalid or expired Meta Embedded Signup state.')
    }

    if (!signup.stateExpiresAt || signup.stateExpiresAt.getTime() <= Date.now()) {
      signup.status = MetaEmbeddedSignupStatus.REAUTH_REQUIRED
      signup.lastErrorCode = 'SESSION_EXPIRED'
      signup.lastErrorMessage = 'The Meta setup session expired. Continue with Meta again.'
      await this.metaEmbeddedSignupRepository.save(signup)
      throw new BadRequestException(signup.lastErrorMessage)
    }
    if (signup.stateConsumedAt) {
      throw new BadRequestException('This Meta Embedded Signup session has already been used.')
    }

    const redirectUri = this.resolveRedirectUri()
    signup.status = MetaEmbeddedSignupStatus.PROVISIONING
    signup.provisioningStep = 'authorization_code_exchange'
    signup.provisioningAttempts = (signup.provisioningAttempts || 0) + 1
    await this.metaEmbeddedSignupRepository.save(signup)

    try {
      const token = await this.metaGraphApiService.exchangeAuthorizationCode(
        completeDto.authorizationCode,
        redirectUri
      )
      signup.stateConsumedAt = new Date()
      signup.status = MetaEmbeddedSignupStatus.META_AUTH_COMPLETED
      signup.provisioningStep = 'asset_validation'
      await this.metaEmbeddedSignupRepository.save(signup)

      const waba = await this.metaGraphApiService.getAccessibleWaba(
        completeDto.businessId,
        completeDto.wabaId,
        token.accessToken
      )
      const phoneNumber = completeDto.phoneNumberId
        ? await this.metaGraphApiService.getPhoneNumber(
            completeDto.wabaId,
            completeDto.phoneNumberId,
            token.accessToken
          )
        : (await this.metaGraphApiService.getPhoneNumbers(completeDto.wabaId, token.accessToken))[0]
      if (!phoneNumber?.id) {
        throw new BadRequestException('Meta did not return a phone number for the selected WABA.')
      }

      signup.businessId = completeDto.businessId
      signup.embeddedSignupPayload = {
        wabaId: completeDto.wabaId,
        phoneNumberId: phoneNumber.id,
      }
      signup.provisioningStep = 'credential_storage'
      await this.metaEmbeddedSignupRepository.save(signup)
      await this.whatsappProviderCredentialService.upsertMeta(
        completeDto.institutionId,
        token.accessToken,
        token.expiresAt
      )

      signup.provisioningStep = 'webhook_subscription'
      await this.metaEmbeddedSignupRepository.save(signup)
      try {
        await this.metaGraphApiService.subscribeWaba(completeDto.wabaId, token.accessToken)
      } catch (subErr) {
        this.logger.warn(
          `WABA webhook subscription warning for ${completeDto.wabaId}: ${
            subErr instanceof Error ? subErr.message : subErr
          }`
        )
      }

      const creditLineId = process.env.META_CREDIT_LINE_ID?.trim()
      const systemUserToken = process.env.META_SYSTEM_USER_TOKEN?.trim()
      if (creditLineId && systemUserToken && waba.currency && !waba.primary_funding_id) {
        signup.provisioningStep = 'billing_configuration'
        await this.metaEmbeddedSignupRepository.save(signup)
        try {
          await this.metaGraphApiService.attachCreditLine(
            creditLineId,
            waba.id,
            waba.currency,
            systemUserToken
          )
        } catch (billingErr) {
          this.logger.warn(
            `Credit line attach warning for WABA ${waba.id}: ${
              billingErr instanceof Error ? billingErr.message : billingErr
            }`
          )
        }
      }

      signup.status = MetaEmbeddedSignupStatus.PHONE_REGISTRATION_PENDING
      signup.provisioningStep = 'phone_registration'
      await this.metaEmbeddedSignupRepository.save(signup)
      const registrationPin = String(randomInt(0, 1_000_000)).padStart(6, '0')
      await this.metaGraphApiService.registerPhoneNumber(
        phoneNumber.id,
        registrationPin,
        token.accessToken
      )

      signup.embeddedSignupState = undefined
      signup.grantedScopes = [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
        'business_management',
      ]
      signup.status = MetaEmbeddedSignupStatus.CONNECTED
      signup.provisioningStep = 'completed'
      signup.lastErrorCode = undefined
      signup.lastErrorMessage = undefined

      const saved = await this.metaEmbeddedSignupRepository.save(signup)
      await this.whatsappProviderConnectionService.upsertConnection({
        institutionId: completeDto.institutionId,
        provider: WhatsAppProvider.META_CLOUD,
        status: WhatsAppProviderConnectionStatus.CONNECTED,
        statusReason: null,
        displayPhoneNumber: phoneNumber.display_phone_number,
        externalPhoneNumberId: phoneNumber.id,
        wabaId: waba.id,
        verifiedName: phoneNumber.verified_name,
        isSystemUser: false,
      })
      return this.toSafeSignup(saved)
    } catch (error: unknown) {
      const customerError = this.toCustomerProvisioningError(error)
      signup.status = customerError.status
      signup.lastErrorCode = customerError.code
      signup.lastErrorMessage = customerError.message
      await this.metaEmbeddedSignupRepository.save(signup)
      await this.whatsappProviderConnectionService.upsertConnection({
        institutionId: completeDto.institutionId,
        provider: WhatsAppProvider.META_CLOUD,
        status: WhatsAppProviderConnectionStatus.DISCONNECTED,
        statusReason: customerError.message,
      })
      throw new BadRequestException(customerError.message)
    }
  }

  async updateEmbeddedSignup(updateDto: UpdateMetaEmbeddedSignupDto): Promise<MetaEmbeddedSignup> {
    const institution = await this.institutionsRepository.findOne({
      where: { id: updateDto.institutionId },
    })
    if (!institution) {
      throw new NotFoundException('Institution not found')
    }

    const existing = await this.metaEmbeddedSignupRepository.findByInstitutionId(
      updateDto.institutionId
    )
    const signup =
      existing ??
      this.metaEmbeddedSignupRepository.create({
        institutionId: updateDto.institutionId,
        status: MetaEmbeddedSignupStatus.INITIATED,
      })

    signup.businessId = updateDto.businessId ?? signup.businessId
    signup.configurationId = updateDto.configurationId ?? signup.configurationId
    signup.embeddedSignupState = updateDto.embeddedSignupState ?? signup.embeddedSignupState
    signup.grantedScopes = updateDto.grantedScopes ?? signup.grantedScopes
    signup.isCoexistence = updateDto.isCoexistence ?? signup.isCoexistence

    if (updateDto.status) {
      signup.status = updateDto.status
    } else if (updateDto.businessId) {
      signup.status = MetaEmbeddedSignupStatus.COMPLETED
    } else if (signup.status === MetaEmbeddedSignupStatus.INITIATED) {
      signup.status = MetaEmbeddedSignupStatus.IN_PROGRESS
    }

    const saved = await this.metaEmbeddedSignupRepository.save(signup)
    await this.whatsappProviderConnectionService.upsertConnection({
      institutionId: updateDto.institutionId,
      provider: WhatsAppProvider.META_CLOUD,
      status:
        saved.status === MetaEmbeddedSignupStatus.COMPLETED
          ? WhatsAppProviderConnectionStatus.CONNECTED
          : saved.status === MetaEmbeddedSignupStatus.FAILED
          ? WhatsAppProviderConnectionStatus.DISCONNECTED
          : WhatsAppProviderConnectionStatus.PENDING,
    })
    return this.toSafeSignup(saved)
  }

  async retryEmbeddedSignup(institutionId: number): Promise<MetaEmbeddedSignup> {
    const signup = await this.metaEmbeddedSignupRepository.findByInstitutionId(institutionId)
    const payload = signup?.embeddedSignupPayload as
      | { phoneNumberId?: string; wabaId?: string }
      | undefined
    if (!signup || !payload?.wabaId || !payload.phoneNumberId) {
      throw new BadRequestException(
        'No recoverable Meta provisioning session was found. Please click "Continue with Meta again" to start a new connection.'
      )
    }
    if (
      ![
        MetaEmbeddedSignupStatus.FAILED,
        MetaEmbeddedSignupStatus.PAYMENT_REQUIRED,
        MetaEmbeddedSignupStatus.PHONE_REGISTRATION_PENDING,
      ].includes(signup.status)
    ) {
      throw new BadRequestException('This Meta onboarding session cannot be retried.')
    }

    const credential = await this.whatsappProviderCredentialService.getMeta(institutionId)
    if (!credential?.accessToken) {
      signup.status = MetaEmbeddedSignupStatus.REAUTH_REQUIRED
      signup.lastErrorCode = 'REAUTH_REQUIRED'
      signup.lastErrorMessage = 'Meta authorization expired. Continue with Meta again.'
      return this.toSafeSignup(await this.metaEmbeddedSignupRepository.save(signup))
    }

    signup.status = MetaEmbeddedSignupStatus.PROVISIONING
    signup.provisioningAttempts = (signup.provisioningAttempts || 0) + 1
    signup.lastErrorCode = undefined
    signup.lastErrorMessage = undefined
    await this.metaEmbeddedSignupRepository.save(signup)

    try {
      const [waba, phoneNumber] = await Promise.all([
        this.metaGraphApiService.getAccessibleWaba(
          signup.businessId,
          payload.wabaId,
          credential.accessToken
        ),
        this.metaGraphApiService.getPhoneNumber(
          payload.wabaId,
          payload.phoneNumberId,
          credential.accessToken
        ),
      ])
      try {
        await this.metaGraphApiService.subscribeWaba(payload.wabaId, credential.accessToken)
      } catch (subErr) {
        this.logger.warn(
          `WABA webhook subscription warning on retry for ${payload.wabaId}: ${
            subErr instanceof Error ? subErr.message : subErr
          }`
        )
      }

      const creditLineId = process.env.META_CREDIT_LINE_ID?.trim()
      const systemUserToken = process.env.META_SYSTEM_USER_TOKEN?.trim()
      if (creditLineId && systemUserToken && waba.currency && !waba.primary_funding_id) {
        signup.provisioningStep = 'billing_configuration'
        await this.metaEmbeddedSignupRepository.save(signup)
        try {
          await this.metaGraphApiService.attachCreditLine(
            creditLineId,
            payload.wabaId,
            waba.currency,
            systemUserToken
          )
        } catch (billingErr) {
          this.logger.warn(
            `Credit line attach warning on retry for WABA ${payload.wabaId}: ${
              billingErr instanceof Error ? billingErr.message : billingErr
            }`
          )
        }
      }

      signup.status = MetaEmbeddedSignupStatus.PHONE_REGISTRATION_PENDING
      signup.provisioningStep = 'phone_registration'
      await this.metaEmbeddedSignupRepository.save(signup)
      const registrationPin = String(randomInt(0, 1_000_000)).padStart(6, '0')
      await this.metaGraphApiService.registerPhoneNumber(
        payload.phoneNumberId,
        registrationPin,
        credential.accessToken
      )

      await this.whatsappProviderConnectionService.upsertConnection({
        institutionId,
        provider: WhatsAppProvider.META_CLOUD,
        status: WhatsAppProviderConnectionStatus.CONNECTED,
        statusReason: null,
        displayPhoneNumber: phoneNumber.display_phone_number,
        externalPhoneNumberId: phoneNumber.id,
        wabaId: waba.id,
        verifiedName: phoneNumber.verified_name,
        isSystemUser: false,
      })
      signup.status = MetaEmbeddedSignupStatus.CONNECTED
      signup.provisioningStep = 'completed'
      signup.lastErrorCode = undefined
      signup.lastErrorMessage = undefined
      return this.toSafeSignup(await this.metaEmbeddedSignupRepository.save(signup))
    } catch (error: unknown) {
      const customerError = this.toCustomerProvisioningError(error)
      signup.status = customerError.status
      signup.lastErrorCode = customerError.code
      signup.lastErrorMessage = customerError.message
      await this.metaEmbeddedSignupRepository.save(signup)
      throw new BadRequestException(customerError.message)
    }
  }

  async triggerCoexistenceSync(institutionId: number): Promise<void> {
    const signup = await this.findByInstitutionId(institutionId)
    const connection = await this.whatsappProviderConnectionService.getConnection(institutionId)

    if (!signup.isCoexistence || !connection?.externalPhoneNumberId) {
      throw new BadRequestException('Institution is not configured for Coexistence sync.')
    }

    const credential = await this.whatsappProviderCredentialService.getMeta(institutionId)
    if (!credential?.accessToken) {
      throw new BadRequestException('Meta access token not found.')
    }

    try {
      await this.metaGraphApiService.triggerCoexistenceSync(
        connection.externalPhoneNumberId,
        'smb_app_state_sync',
        credential.accessToken
      )

      await this.metaGraphApiService.triggerCoexistenceSync(
        connection.externalPhoneNumberId,
        'history',
        credential.accessToken
      )
    } catch (error: unknown) {
      const err = error as {
        message?: string
        response?: { data?: { error?: { message?: string } } }
        status?: number
      }
      const errMsg = err?.message || err?.response?.data?.error?.message || ''
      if (
        errMsg.includes('only available to WhatsApp Business App') ||
        errMsg.includes('131000') ||
        err?.status === 400
      ) {
        throw new BadRequestException(
          'This phone number is registered directly on WhatsApp Cloud API, not via WhatsApp Business App Coexistence mode. Coexistence sync is only available for numbers onboarded from the WhatsApp Business mobile app.'
        )
      }
      throw error
    }
  }

  async findByInstitutionId(institutionId: number): Promise<
    MetaEmbeddedSignup & {
      displayPhoneNumber?: string
      wabaId?: string
      phoneNumberId?: string
      verifiedName?: string
    }
  > {
    const signup = await this.metaEmbeddedSignupRepository.findByInstitutionId(institutionId)
    if (!signup) {
      throw new NotFoundException('Meta embedded signup not found')
    }
    const safe = this.toSafeSignup(signup)
    const connection = await this.whatsappProviderConnectionService.getConnection(institutionId)
    return {
      ...safe,
      displayPhoneNumber: connection?.displayPhoneNumber,
      wabaId: connection?.wabaId || (signup.embeddedSignupPayload as any)?.wabaId,
      phoneNumberId:
        connection?.externalPhoneNumberId || (signup.embeddedSignupPayload as any)?.phoneNumberId,
      verifiedName: connection?.verifiedName,
    } as any
  }
}
