/* eslint-disable no-case-declarations */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Auth, calendar_v3, drive_v3, google, meet_v2, sheets_v4 } from 'googleapis'
import { Readable } from 'stream'

import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from '@/application/admin/availability/dto/calendar-event.dto'
// DTOs merged from other services/controllers (ensure these paths are correct or define inline)
import { CreateIntegrationCalendarDto } from '@/application/admin/availability/dto/create-integration-calendar.dto'
import { RefreshGoogleTokenDto as RefreshCalendarTokenDto } from '@/application/admin/availability/dto/refresh-google-token.dto' // Alias to avoid name clash
import { UpdateIntegrationCalendarDto } from '@/application/admin/availability/dto/update-integration-calendar.dto'
import { CreateIntegrationOnlineMeetingDto } from '@/application/admin/integration-google/dto/create-online-meeting.dto'
import {
  CreateMeetingEventDto,
  UpdateMeetingEventDto,
} from '@/application/admin/integration-google/dto/meeting-event.dto'
import { RefreshGoogleMeetTokenDto } from '@/application/admin/integration-google/dto/refresh-google-token.dto'
import { UpdateIntegrationOnlineMeetingDto } from '@/application/admin/integration-google/dto/update-online-meeting.dto'
import { ALLOWED_MIME_TYPES } from '@/common/constants/files.constants'
import { INTEGRATION_ERROR, INTEGRATION_ERROR_CODES } from '@/exceptions/error-message/integration'
import { handleGoogleIntegrationAuthError } from '@/exceptions/google-integration.exception'
import { IntegrationConnectStatus } from '@/models/enums/status'
import {
  GoogleDriveServiceSettings,
  GoogleServiceType,
  GoogleSheetConfiguration,
  GoogleSyncStatus,
  IntegrationGoogleEntity,
  IntegrationGoogleRepository,
} from '@/models/integration-google.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'

import { UploadProgressService } from './upload-progress'

// Export placeholder types
export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  parents?: string[]
  driveId?: string
  size?: string
  modifiedTime?: string
  createdTime?: string
  // other relevant fields like parentId, etc.
}

export interface GoogleSheetAPITabConfig {
  // Renamed to avoid conflict with entity's config
  title: string
  dataType: 'studentCRM' | 'paymentProof'
}

export interface GoogleSheetUserConfig {
  // User-facing configuration for creating/updating a sheet
  folderId: string
  folderName?: string // For storing alongside ID
  spreadsheetName: string
  tabs: GoogleSheetAPITabConfig[]
  syncFrequency?: 'daily' | 'weekly' | 'manual'
  autoSync?: boolean
}

// Google Drive Interface

export interface GoogleDriveFileUpload {
  name: string
  content: Buffer | string
  mimeType?: string
  parentId?: string
}

export interface GoogleDriveDownloadResult {
  content: Buffer
  mimeType: string
  name: string
}

export interface GoogleDriveUserConfig {
  rootFolderId: string
  rootFolderName: string
  folderStructure?: {
    classFiles?: string
    studentFiles?: string
  }
}

@Injectable()
export class IntegrationGoogleService {
  // TODO: Move these constants to config/env service
  private GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  private GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  private GOOGLE_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI // Default redirect URI

  private readonly logger = new Logger(IntegrationGoogleService.name)

  private oauth2Client: Auth.OAuth2Client // Base client for initial auth. DEPRECATED for direct use in auth URL generation or token exchange.

  constructor(
    // Inject the single repository
    private readonly integrationGoogleRepository: IntegrationGoogleRepository,
    private readonly uploadProgressService: UploadProgressService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userRoleRepository: UserRolesRepository
  ) {
    // Initialize base client - used primarily for initial auth URL generation and callback handling
    this.oauth2Client = new google.auth.OAuth2(
      this.GOOGLE_CLIENT_ID,
      this.GOOGLE_CLIENT_SECRET,
      this.GOOGLE_REDIRECT_URI
    )
  }

  async getInstitutionIdForUser(userId: number): Promise<number> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, isSiteManager: true },
    })
    return userRole?.institutionId ?? 0
  }

  // Define base scopes by service type
  private readonly BASE_SCOPES_BY_SERVICE = {
    [GoogleServiceType.DRIVE]: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
    [GoogleServiceType.SHEETS]: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  }

  // --- Helper: Get Specific Integration Type ---
  private async getIntegrationById(
    id: number,
    expectedType?: GoogleServiceType
  ): Promise<IntegrationGoogleEntity> {
    const whereClause: any = { id }
    if (expectedType) {
      whereClause.serviceType = expectedType
    }
    const integration = await this.integrationGoogleRepository.findOne({ where: whereClause })
    if (!integration) {
      throw new NotFoundException(
        `Google integration with ID ${id}${
          expectedType ? ` and type ${expectedType}` : ''
        } not found.`
      )
    }
    return integration
  }

  private async findByInstitution(
    institutionId: number,
    serviceType: GoogleServiceType
  ): Promise<IntegrationGoogleEntity[]> {
    // Note: institutionId maps to userId in the IntegrationGoogleEntity
    return this.integrationGoogleRepository.find({
      where: { userId: institutionId, serviceType },
    })
  }

  // --- Helper: Create OAuth2 Client from Integration ---
  private async createOAuth2ClientFromIntegration(
    integration: IntegrationGoogleEntity,
    accessTokenOverride?: string // Optional fresh token
  ): Promise<Auth.OAuth2Client> {
    if (!integration.accessToken || !integration.googleUserId) {
      throw new BadRequestException({
        message: INTEGRATION_ERROR.AUTHENTICATION_FAILED,
        errorCode: INTEGRATION_ERROR_CODES.AUTHENTICATION_FAILED,
      })
    }
    const oauth2Client = new google.auth.OAuth2(
      this.GOOGLE_CLIENT_ID,
      this.GOOGLE_CLIENT_SECRET,
      this.GOOGLE_REDIRECT_URI
    )
    oauth2Client.setCredentials({
      access_token: accessTokenOverride || integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: integration.expiryDate?.getTime(),
    })
    // Apply refresh logic directly here
    return this._refreshAccessTokenIfNeededInternal(oauth2Client, integration)
  }

  // --- Helper: Refresh Token Logic (Internal) ---
  private async _refreshAccessTokenIfNeededInternalDeprecated(
    oauthClient: Auth.OAuth2Client,
    integration: IntegrationGoogleEntity
  ): Promise<Auth.OAuth2Client> {
    const now = Date.now()
    const expiry = oauthClient.credentials.expiry_date || 0

    if (now >= expiry - 5 * 60 * 1000) {
      // 5 min buffer
      console.log(
        `Refreshing Google token for user ${integration.userId}, service ${integration.serviceType}`
      )
      if (!oauthClient.credentials.refresh_token) {
        integration.status = IntegrationConnectStatus.RESTRICTED // Mark as error if no refresh token
        await this.integrationGoogleRepository.save(integration)
        throw new BadRequestException('Google session expired, no refresh token. Please reconnect.')
      }
      try {
        const { credentials } = await oauthClient.refreshAccessToken()
        oauthClient.setCredentials(credentials)

        // Update the entity in the database
        integration.accessToken = credentials.access_token!
        integration.expiryDate = credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined
        // Preserve refresh token if Google didn't send a new one
        integration.refreshToken = credentials.refresh_token ?? integration.refreshToken
        integration.status = IntegrationConnectStatus.ENABLED // Mark as enabled after successful refresh
        await this.integrationGoogleRepository.save(integration)
        console.log(
          `Token refreshed for user ${integration.userId}, service ${integration.serviceType}`
        )
      } catch (error) {
        console.error(
          'Failed to refresh Google access token:',
          error.response?.data || error.message || error
        )
        integration.status = IntegrationConnectStatus.RESTRICTED // Mark as error on failure
        await this.integrationGoogleRepository.save(integration)
        // Use the generic handler if available, otherwise throw specific error
        handleGoogleIntegrationAuthError(error, integration.id, integration.serviceType)
        throw new InternalServerErrorException('Failed to refresh Google access token.')
      }
    }
    return oauthClient
  }

  // Update _refreshAccessTokenIfNeededInternal method
  private async _refreshAccessTokenIfNeededInternal(
    oauthClient: Auth.OAuth2Client,
    integration: IntegrationGoogleEntity
  ): Promise<Auth.OAuth2Client> {
    const now = Date.now()
    const expiry = oauthClient.credentials.expiry_date || 0

    if (now >= expiry - 5 * 60 * 1000) {
      this.logger.log(
        `Refreshing Google token for user ${integration.userId}, service ${integration.serviceType}`
      )

      if (!oauthClient.credentials.refresh_token) {
        this.logger.warn(
          `No refresh token available for user ${integration.userId}, service ${integration.serviceType}`
        )
        integration.status = IntegrationConnectStatus.RESTRICTED
        await this.integrationGoogleRepository.save(integration)
        throw new BadRequestException('Google session expired, no refresh token. Please reconnect.')
      }

      try {
        const { credentials } = await oauthClient.refreshAccessToken()
        oauthClient.setCredentials(credentials)

        // Update the entity in the database
        integration.accessToken = credentials.access_token!
        integration.expiryDate = credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined
        integration.refreshToken = credentials.refresh_token ?? integration.refreshToken
        integration.status = IntegrationConnectStatus.ENABLED

        await this.integrationGoogleRepository.save(integration)
        this.logger.log(
          `Token refreshed successfully for user ${integration.userId}, service ${integration.serviceType}`
        )
      } catch (error) {
        this.logger.error(
          'Failed to refresh Google access token:',
          error.response?.data || error.message || error
        )
        integration.status = IntegrationConnectStatus.RESTRICTED
        await this.integrationGoogleRepository.save(integration)

        throw new BadRequestException(
          'Google session expired. Please reconnect your Google account.'
        )
      }
    }
    return oauthClient
  }

  // --- Helper: Get API Clients ---
  private async getCalendarApiClient(
    integrationId: number,
    accessToken?: string
  ): Promise<calendar_v3.Calendar> {
    const integration = await this.getIntegrationById(integrationId, GoogleServiceType.CALENDAR)
    const auth = await this.createOAuth2ClientFromIntegration(integration, accessToken)
    return google.calendar({ version: 'v3', auth })
  }

  private async getMeetApiClient(integrationId: number): Promise<meet_v2.Meet> {
    const integration = await this.getIntegrationById(integrationId, GoogleServiceType.MEET)
    const auth = await this.createOAuth2ClientFromIntegration(integration)
    return google.meet({ version: 'v2', auth })
  }

  private async getDriveApiClient(
    integrationId: number
  ): Promise<{ drive: drive_v3.Drive; auth: Auth.OAuth2Client }> {
    const integration = await this.getIntegrationById(integrationId, GoogleServiceType.DRIVE)
    const auth = await this.createOAuth2ClientFromIntegration(integration)
    return {
      drive: google.drive({ version: 'v3', auth }),
      auth,
    }
  }

  private async getSheetsApiClient(integrationId: number): Promise<sheets_v4.Sheets> {
    const integration = await this.getIntegrationById(integrationId, GoogleServiceType.SHEETS)
    const auth = await this.createOAuth2ClientFromIntegration(integration)
    return google.sheets({ version: 'v4', auth })
  }

  // getGoogleAuthUrl(
  //   scopes: string[],
  //   serviceType: GoogleServiceType,
  //   redirectUri?: string,
  //   userId?: number
  // ): { authUrl: string; state: string } {
  //   const effectiveRedirectUri = redirectUri || this.GOOGLE_REDIRECT_URI

  //   // ✅ ADD THIS LOG — CRITICAL FOR DEBUGGING
  //   this.logger.log(`🔐 [SERVICE] Generating Google Auth URL with redirectUri: ${effectiveRedirectUri}`)
  //   console.log('🔐 [SERVICE CONSOLE] Generating Google Auth URL with redirectUri:', effectiveRedirectUri)

  //   const baseScopes = this.BASE_SCOPES_BY_SERVICE[serviceType] || []
  //   const finalScopes = Array.from(new Set([...baseScopes, ...scopes]))

  //   const randomPart = crypto.getRandomValues(new Uint8Array(8)).join('')
  //   const state = userId ? `user_${userId}|${randomPart}` : randomPart

  //   const client = new google.auth.OAuth2(
  //     this.GOOGLE_CLIENT_ID,
  //     this.GOOGLE_CLIENT_SECRET,
  //     effectiveRedirectUri
  //   )

  //   const authUrl = client.generateAuthUrl({
  //     response_type: 'code',
  //     access_type: 'offline',
  //     prompt: 'consent',
  //     scope: finalScopes,
  //     state,
  //     include_granted_scopes: true,
  //     redirect_uri: effectiveRedirectUri // ✅ Explicitly passed
  //   })

  //   // ✅ ALSO LOG THE FULL AUTH URL (for manual inspection)
  //   this.logger.log(`🔗 Generated Google Auth URL: ${authUrl}`)
  //   console.log('🔗 [SERVICE CONSOLE] Generated Google Auth URL:', authUrl)

  //   return { authUrl, state }
  // }

  /**
   * Generate Google OAuth URL with userId encoded in state
   *
   * @param scopes - Google OAuth scopes
   * @param serviceType - Type of Google service (DRIVE, CALENDAR, etc)
   * @param redirectUri - Optional custom redirect URI
   * @param userId - REQUIRED: User ID to associate with OAuth flow
   * @returns Object containing authUrl and state
   */
  getGoogleAuthUrl(
    scopes: string[],
    serviceType: GoogleServiceType,
    redirectUri?: string,
    userId?: number // ✅ This is CRITICAL
  ): { authUrl: string; state: string } {
    const effectiveRedirectUri = redirectUri || this.GOOGLE_REDIRECT_URI

    this.logger.log(`🔐 Generating Google Auth URL with redirectUri: ${effectiveRedirectUri}`)
    console.log('🔐 Generating Google Auth URL with redirectUri:', effectiveRedirectUri)

    // Get base scopes for the service type
    const baseScopes = this.BASE_SCOPES_BY_SERVICE[serviceType] || []
    const finalScopes = Array.from(new Set([...baseScopes, ...scopes]))

    // ✅ FIX: Generate state with userId included
    const randomPart = crypto.getRandomValues(new Uint8Array(8)).join('')

    // ✅ CRITICAL: Include userId in state format: "user_{userId}|{random}"
    const state = userId ? `user_${userId}|${randomPart}` : randomPart

    // ✅ Log the state for debugging
    this.logger.log(`✅ Generated state with userId: ${state}`)
    console.log('✅ Generated state with userId:', state)

    // Create OAuth2 client
    const client = new google.auth.OAuth2(
      this.GOOGLE_CLIENT_ID,
      this.GOOGLE_CLIENT_SECRET,
      effectiveRedirectUri
    )

    // Generate authorization URL
    const authUrl = client.generateAuthUrl({
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: finalScopes,
      state, // ✅ State now includes userId
      include_granted_scopes: true,
      redirect_uri: effectiveRedirectUri,
    })

    this.logger.log(`🔗 Generated Google Auth URL: ${authUrl}`)
    console.log('🔗 Generated Google Auth URL:', authUrl)

    return { authUrl, state }
  }

  private generateSecureState(): string {
    return crypto.getRandomValues(new Uint8Array(16)).join('')
  }

  async handleGoogleOAuthCallback(
    authCode: string,
    userId: number,
    serviceType: GoogleServiceType,
    redirectUri: string
  ): Promise<IntegrationGoogleEntity> {
    this.logger.log(
      `Processing OAuth callback - User: ${userId}, Service: ${serviceType}, RedirectUri: ${redirectUri}`
    )
    this.logger.log(`Auth code (first 10 chars): ${authCode.substring(0, 10)}...`)
    this.logger.log(`Google Client ID: ${this.GOOGLE_CLIENT_ID?.substring(0, 20)}...`)
    this.logger.log(`Google Client Secret configured: ${!!this.GOOGLE_CLIENT_SECRET}`)

    console.log('🔑 Handling callback for redirectUri:', process.env.GOOGLE_OAUTH_REDIRECT_URI)

    if (!redirectUri) {
      throw new BadRequestException('Redirect URI is required for OAuth callback processing.')
    }

    try {
      const client = new google.auth.OAuth2(
        this.GOOGLE_CLIENT_ID,
        this.GOOGLE_CLIENT_SECRET,
        redirectUri
      )

      this.logger.log(`OAuth2 client configured with redirect URI: ${redirectUri}`)

      // Add this to see the exact request being made
      this.logger.log(`Attempting to exchange auth code for tokens...`)

      const { tokens } = await client.getToken(authCode)
      client.setCredentials(tokens)

      if (!tokens.access_token) {
        throw new InternalServerErrorException('Failed to retrieve Google access token.')
      }

      const oauth2 = google.oauth2({ auth: client, version: 'v2' })
      const userInfoResponse = await oauth2.userinfo.get()
      const googleUserId = userInfoResponse.data.id
      const googleUserEmail = userInfoResponse.data.email

      if (!googleUserId || !googleUserEmail) {
        throw new InternalServerErrorException('Failed to retrieve Google user information.')
      }

      this.logger.log(
        `OAuth callback successful for user ${userId}, service ${serviceType}, email ${googleUserEmail}`
      )

      const savedIntegration = await this.saveGoogleCredentials(
        userId,
        await this.getInstitutionIdForUser(userId),
        googleUserId,
        googleUserEmail,
        tokens.access_token,
        tokens.refresh_token || undefined,
        tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        tokens.scope ? tokens.scope.split(' ') : undefined,
        serviceType
      )

      // savedIntegration.status = IntegrationConnectStatus.ENABLED
      // await this.integrationGoogleRepository.save(savedIntegration)

      return savedIntegration
    } catch (error) {
      this.logger.error('Detailed OAuth error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        authCode: authCode.substring(0, 10) + '...',
        redirectUri,
        clientId: this.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        // Log the full error for debugging
        fullError: error,
      })

      if (error.response?.data?.error === 'invalid_grant') {
        throw new BadRequestException('Invalid or expired Google authorization code.')
      }
      throw new InternalServerErrorException('An error occurred during Google authentication.')
    }
  }

  async saveGoogleCredentials(
    userId: number,
    institutionId: number,
    googleUserId: string,
    googleUserEmail: string,
    accessToken: string,
    refreshToken: string | undefined,
    expiryDate: Date | undefined,
    scopes: string[] | undefined,
    serviceType: GoogleServiceType,
    redirectUriUsed?: string
  ): Promise<IntegrationGoogleEntity> {
    this.logger.log(
      `[SAVE CREDENTIALS] User: ${userId}, Service: ${serviceType}, GoogleEmail: ${googleUserEmail}, GoogleUserId: ${googleUserId}`
    )

    // Step 1: Find currently ACTIVE integration for this user+service
    const activeIntegration = await this.integrationGoogleRepository.findOne({
      where: { userId, serviceType },
    })

    // Step 2: Check if we're switching Google accounts
    const isSwitchingAccount = activeIntegration && activeIntegration.googleUserId !== googleUserId

    if (isSwitchingAccount) {
      // SOFT-DELETE the currently active one
      await this.integrationGoogleRepository.softRemove(activeIntegration)
      this.logger.log(
        `[SOFT DELETED] Old integration id=${activeIntegration.id} for ${activeIntegration.googleUserEmail}`
      )
    }

    // Step 3: If switching accounts, ALWAYS create a NEW row — even if soft-deleted record exists
    // This preserves history and avoids TypeORM entity confusion
    if (isSwitchingAccount) {
      this.logger.log(`[SWITCHING ACCOUNTS] Creating NEW integration record for ${googleUserEmail}`)
      const newIntegration = this.integrationGoogleRepository.create({
        userId,
        institutionId,
        googleUserId,
        googleUserEmail,
        accessToken,
        refreshToken,
        expiryDate,
        scopes,
        status: IntegrationConnectStatus.ENABLED,
        serviceType,
        sheetSettings: serviceType === GoogleServiceType.SHEETS ? {} : undefined,
        calendarSettings: serviceType === GoogleServiceType.CALENDAR ? {} : undefined,
        meetSettings: serviceType === GoogleServiceType.MEET ? {} : undefined,
        driveSettings: serviceType === GoogleServiceType.DRIVE ? {} : undefined,
      })

      const saved = await this.integrationGoogleRepository.save(newIntegration)
      this.logger.log(`[CREATED NEW RECORD] id=${saved.id} for ${googleUserEmail}`)

      return saved
    }

    // Step 4: If NOT switching (same Google account), find and update/restore
    let integration = await this.integrationGoogleRepository.findOne({
      where: { userId, googleUserId, serviceType },
      withDeleted: true,
    })

    if (integration) {
      this.logger.log(
        `[FOUND EXISTING RECORD] id=${
          integration.id
        }, deletedAt=${integration.deletedAt?.toISOString()}`
      )
      // Restore if needed
      integration.googleUserEmail = googleUserEmail
      integration.institutionId = institutionId ?? integration.institutionId ?? userId
      integration.accessToken = accessToken
      integration.refreshToken = refreshToken ?? integration.refreshToken
      integration.expiryDate = expiryDate
      integration.scopes = scopes
      integration.status = IntegrationConnectStatus.ENABLED
      integration.deletedAt = null // Restore
      this.logger.log(`[UPDATED & RESTORED] Integration id=${integration.id}`)
    } else {
      // Brand new connection for this Google account
      integration = this.integrationGoogleRepository.create({
        userId,
        institutionId,
        googleUserId,
        googleUserEmail,
        accessToken,
        refreshToken,
        expiryDate,
        scopes,
        status: IntegrationConnectStatus.ENABLED,
        serviceType,
        sheetSettings: serviceType === GoogleServiceType.SHEETS ? {} : undefined,
        calendarSettings: serviceType === GoogleServiceType.CALENDAR ? {} : undefined,
        meetSettings: serviceType === GoogleServiceType.MEET ? {} : undefined,
        driveSettings: serviceType === GoogleServiceType.DRIVE ? {} : undefined,
      })
      this.logger.log(`[CREATED NEW RECORD] for Google account ${googleUserEmail}`)
    }

    const savedIntegration = await this.integrationGoogleRepository.save(integration)
    this.logger.log(
      `[SAVED SUCCESS] Final id=${savedIntegration.id}, deletedAt=${savedIntegration.deletedAt}`
    )

    return savedIntegration
  }

  async getActiveIntegration({
    userId,
    institutionId,
    options,
  }: {
    userId?: number
    institutionId: number
    options?: { throwIfMissing?: boolean }
  }): Promise<IntegrationGoogleEntity | null> {
    // Resolve institutionId first - it's the primary identifier
    const resolvedInstitutionId =
      institutionId ?? (userId ? await this.getInstitutionIdForUser(userId) : undefined)

    const baseCondition = {
      status: IntegrationConnectStatus.ENABLED,
    }

    // Primary lookup: by institutionId
    if (resolvedInstitutionId) {
      let integration = await this.integrationGoogleRepository.findOne({
        where: {
          ...baseCondition,
          institutionId: resolvedInstitutionId,
        },
      })

      // If not found by institutionId, try master admin's integration
      if (!integration) {
        const masterAdmin = await this.userRoleRepository.findOne({
          where: { institutionId: resolvedInstitutionId, isMasterAdmin: true },
        })

        if (masterAdmin) {
          integration = await this.integrationGoogleRepository.findOne({
            where: {
              ...baseCondition,
              userId: masterAdmin.userId,
            },
          })
        }
      }

      if (integration) {
        return integration
      }
    }

    // Fallback: if userId provided but no institutionId found, try by userId directly
    if (userId && !resolvedInstitutionId) {
      const integration = await this.integrationGoogleRepository.findOne({
        where: {
          ...baseCondition,
          userId,
        },
      })

      if (integration) {
        return integration
      }
    }

    // No integration found
    if (options?.throwIfMissing) {
      throw new BadRequestException('Google integration not active.')
    }

    return null
  }

  // Consolidated Disconnect (disables specific service type)
  async disconnectGoogleIntegrationDeprecated(
    userId: number,
    serviceType: GoogleServiceType
  ): Promise<void> {
    const integration = await this.integrationGoogleRepository.findOne({
      where: { userId, serviceType },
    })

    if (!integration) {
      throw new NotFoundException(
        `Google integration for ${serviceType} not found for user ${userId}.`
      )
    }

    // Only disable this specific service type record
    integration.status = IntegrationConnectStatus.RESTRICTED // Use DISABLED status
    // Optionally clear specific settings
    if (serviceType === GoogleServiceType.SHEETS) integration.sheetSettings = {}
    else if (serviceType === GoogleServiceType.CALENDAR) integration.calendarSettings = {}
    else if (serviceType === GoogleServiceType.MEET) integration.meetSettings = {}

    // We DO NOT clear tokens here, as they might be shared with other active services for the same Google Account.
    // Revocation should happen only if ALL services for that googleUserId are disconnected.
    // integration.accessToken = 'revoked'; // Don't do this here
    // integration.refreshToken = undefined; // Don't do this here

    await this.integrationGoogleRepository.save(integration)

    // TODO: Implement logic to check if this was the LAST active service for the googleUserId/userId pair.
    // If so, THEN revoke the actual Google tokens.
  }

  /**
   * Disconnect Google service integration
   *
   * @param userId - User ID
   * @param serviceType - Google service type (DRIVE, CALENDAR, etc.)
   * @returns Object with disconnect status and token revocation status
   */
  async disconnectGoogleIntegration(
    userId: number,
    serviceType: GoogleServiceType
  ): Promise<{ message: string; tokensRevoked: boolean }> {
    this.logger.log(`[DISCONNECT] User: ${userId}, Service: ${serviceType}`)

    const integration = await this.integrationGoogleRepository.findOne({
      where: { userId, serviceType },
    })

    if (!integration) {
      throw new NotFoundException(`Google ${serviceType} integration not found for user ${userId}.`)
    }

    this.logger.log(
      `[FOUND] Integration id=${integration.id}, email=${integration.googleUserEmail}`
    )

    const googleUserId = integration.googleUserId
    const googleUserEmail = integration.googleUserEmail
    const refreshToken = integration.refreshToken

    await this.integrationGoogleRepository.update({ id: integration.id }, { deletedAt: new Date() })

    this.logger.log(`[SOFT DELETED] Integration id=${integration.id} for ${serviceType}`)

    const remainingIntegrations = await this.integrationGoogleRepository.count({
      where: {
        googleUserId,
        userId,
      },
    })

    this.logger.log(
      `[REMAINING SERVICES] ${remainingIntegrations} active integrations for ${googleUserEmail}`
    )

    let tokensRevoked = false
    if (remainingIntegrations === 0 && refreshToken) {
      this.logger.log(`[REVOKING TOKENS] Last service disconnected for ${googleUserEmail}`)

      try {
        await this.revokeGoogleTokens(refreshToken)
        tokensRevoked = true
        this.logger.log(`[TOKENS REVOKED] Successfully revoked tokens for ${googleUserEmail}`)
      } catch (error) {
        this.logger.error(
          `[REVOKE FAILED] Error revoking tokens for ${googleUserEmail}:`,
          error.message
        )
      }
    }

    return {
      message: `Successfully disconnected Google ${serviceType} for ${googleUserEmail}`,
      tokensRevoked,
    }
  }

  /**
   * Revoke Google OAuth tokens
   *
   * This makes the refresh token invalid, requiring user to re-authorize
   *
   * @param refreshToken - Google OAuth refresh token
   */
  private async revokeGoogleTokens(refreshToken: string): Promise<void> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET
      )

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      })

      await oauth2Client.revokeCredentials()

      this.logger.log('[REVOKE SUCCESS] Google OAuth tokens revoked')
    } catch (error) {
      this.logger.error('[REVOKE ERROR] Failed to revoke Google tokens:', {
        message: error.message,
        response: error.response?.data,
      })
      throw error
    }
  }

  // --- Sheets Methods (from original IntegrationGoogleService) ---
  async getSheetIntegrationStatus(userId: number): Promise<Partial<IntegrationGoogleEntity>> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
    })
    if (!integration) {
      return { status: IntegrationConnectStatus.RESTRICTED } // Or NOT_CONNECTED
    }
    // Return relevant fields, avoid exposing tokens directly to frontend if possible
    return {
      id: integration.id,
      googleUserEmail: integration.googleUserEmail,
      status: integration.status,
      sheetSettings: integration.sheetSettings,
      // Add other relevant non-sensitive fields
    }
  }

  async listGoogleDriveFolders(userId: number): Promise<GoogleDriveFile[]> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })
    const { drive } = await this.getDriveApiClient(integration.id)
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name, webViewLink, parents)',
        spaces: 'drive',
      })
      return (response.data.files || []) as GoogleDriveFile[]
    } catch (error) {
      console.error('Error listing Google Drive folders:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.SHEETS)
      throw new InternalServerErrorException('Failed to list Google Drive folders.')
    }
  }

  async createOrUpdateSheet(
    userId: number,
    config: GoogleSheetUserConfig
  ): Promise<GoogleSheetConfiguration> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })
    const { drive } = await this.getDriveApiClient(integration.id)
    const sheetsApi = await this.getSheetsApiClient(integration.id)

    const currentSheetSettings = integration.sheetSettings || {}
    let spreadsheetId = currentSheetSettings.spreadsheetId

    try {
      if (!spreadsheetId) {
        const spreadsheet = await sheetsApi.spreadsheets.create({
          requestBody: { properties: { title: config.spreadsheetName } },
        })
        spreadsheetId = spreadsheet.data.spreadsheetId
        if (!spreadsheetId) throw new InternalServerErrorException('Failed to create Google Sheet.')
        currentSheetSettings.spreadsheetId = spreadsheetId
        currentSheetSettings.spreadsheetUrl = spreadsheet.data.spreadsheetUrl
        currentSheetSettings.spreadsheetName = config.spreadsheetName
      } else if (currentSheetSettings.spreadsheetName !== config.spreadsheetName) {
        await sheetsApi.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                updateSpreadsheetProperties: {
                  properties: { title: config.spreadsheetName },
                  fields: 'title',
                },
              },
            ],
          },
        })
        currentSheetSettings.spreadsheetName = config.spreadsheetName
      }

      if (config.folderId && spreadsheetId) {
        // Simplified move: assumes it needs moving. Real implementation checks parents.
        // Find current parents first to remove them if moving.
        const file = await drive.files.get({ fileId: spreadsheetId, fields: 'parents' })
        const currentParents = file.data.parents || []
        // Move only if the target folder is not already the parent
        if (!currentParents.includes(config.folderId)) {
          await drive.files.update({
            fileId: spreadsheetId,
            addParents: config.folderId,
            removeParents: currentParents.join(','), // Remove all previous parents
            fields: 'id, parents',
          })
        }
        currentSheetSettings.selectedFolderId = config.folderId
        currentSheetSettings.selectedFolderName = config.folderName
      }

      // TODO: Tab creation/update logic using _fetchTabData and sheetsApi.spreadsheets.batchUpdate

      currentSheetSettings.lastSyncStatus = GoogleSyncStatus.PENDING
      currentSheetSettings.lastSyncAt = new Date()

      integration.sheetSettings = currentSheetSettings
      await this.integrationGoogleRepository.save(integration)
      return integration.sheetSettings
    } catch (error) {
      console.error('Failed to create/update Google Sheet:', error.response?.data || error.message)
      integration.sheetSettings = {
        ...(integration.sheetSettings || {}),
        lastSyncStatus: GoogleSyncStatus.FAILED,
        lastSyncAt: new Date(),
      }
      await this.integrationGoogleRepository.save(integration)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.SHEETS)
      throw new InternalServerErrorException('Failed to create or update Google Sheet.')
    }
  }

  // Private method to fetch data - Placeholder
  private async _fetchTabData(
    userId: number,
    dataType: 'studentCRM' | 'paymentProof'
  ): Promise<any[][]> {
    console.log(`Fetching data for user ${userId}, type: ${dataType}`)
    // TODO: Implement actual data fetching logic
    return []
  }

  // --- Calendar Methods (merged from IntegrationCalendarService + GoogleCalendarService) ---

  // Find calendar integrations for an institution (userId)
  async findCalendarIntegrationsByInstitution(
    institutionId: number
  ): Promise<IntegrationGoogleEntity[]> {
    return this.findByInstitution(institutionId, GoogleServiceType.CALENDAR)
  }

  // Find a specific calendar integration by its ID
  async findOneCalendarIntegration(id: number): Promise<IntegrationGoogleEntity> {
    return this.getIntegrationById(id, GoogleServiceType.CALENDAR)
  }

  // Create a Calendar Integration (needs careful review)
  // A standard OAuth flow (handleGoogleOAuthCallback) is generally preferred.
  async createCalendarIntegration(
    createDto: CreateIntegrationCalendarDto
  ): Promise<IntegrationGoogleEntity> {
    const syntheticGoogleUserId = `institution-${createDto.institutionId}`
    const syntheticGoogleEmail = `institution-${createDto.institutionId}@local.flowclass`

    // Use consolidated save method - passing necessary details
    return this.saveGoogleCredentials(
      createDto.institutionId,
      createDto.institutionId,
      syntheticGoogleUserId,
      syntheticGoogleEmail,
      createDto.accessToken,
      undefined,
      new Date(Date.now() + 60 * 60 * 1000),
      undefined,
      GoogleServiceType.CALENDAR
    )
  }

  // Update a Calendar Integration (e.g., set calendar ID/name)
  async updateCalendarIntegration(
    id: number,
    updateDto: UpdateIntegrationCalendarDto
  ): Promise<IntegrationGoogleEntity> {
    const integration = await this.getIntegrationById(id, GoogleServiceType.CALENDAR)

    if (updateDto.isEnabled !== undefined) {
      integration.status = updateDto.isEnabled
        ? IntegrationConnectStatus.ENABLED
        : IntegrationConnectStatus.RESTRICTED // Use DISABLED
    }

    if (!integration.calendarSettings) integration.calendarSettings = {}
    let settingsUpdated = false
    if (updateDto.calendarId !== undefined) {
      integration.calendarSettings.calendarId = updateDto.calendarId
      settingsUpdated = true
    }
    if (updateDto.calendarName !== undefined) {
      integration.calendarSettings.calendarName = updateDto.calendarName
      settingsUpdated = true
    }

    return this.integrationGoogleRepository.save(integration)
  }

  // Delete a Calendar Integration record (soft delete by disabling usually preferred)
  async removeCalendarIntegration(id: number): Promise<void> {
    const integration = await this.getIntegrationById(id, GoogleServiceType.CALENDAR)
    await this.integrationGoogleRepository.delete(integration.id) // Hard delete example
    // Consider using disconnectGoogleIntegration(integration.userId, GoogleServiceType.CALENDAR) for soft delete.
  }

  // Toggle Calendar Integration Status
  async toggleCalendarIntegration(id: number): Promise<IntegrationGoogleEntity> {
    const integration = await this.getIntegrationById(id, GoogleServiceType.CALENDAR)
    integration.status =
      integration.status === IntegrationConnectStatus.ENABLED
        ? IntegrationConnectStatus.RESTRICTED // Use DISABLED
        : IntegrationConnectStatus.ENABLED
    return this.integrationGoogleRepository.save(integration)
  }

  // Get Google Calendar List for an integration
  async getGoogleCalendarList(integrationId: number): Promise<calendar_v3.Schema$CalendarList> {
    const calendar = await this.getCalendarApiClient(integrationId)
    try {
      const response = await calendar.calendarList.list()
      return response.data
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationId, GoogleServiceType.CALENDAR)
      throw error
    }
  }

  // Calendar Event Methods
  async listCalendarEvents(
    integrationId: number,
    calendarApiId: string,
    startDate: Date,
    endDate: Date,
    accessToken?: string
  ): Promise<calendar_v3.Schema$Event[]> {
    const calendar = await this.getCalendarApiClient(integrationId, accessToken)
    try {
      const response = await calendar.events.list({
        calendarId: calendarApiId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })
      return response.data?.items || []
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationId, GoogleServiceType.CALENDAR)
      throw error
    }
  }

  async createCalendarEvent(
    integrationId: number,
    calendarApiId: string,
    eventData: CreateCalendarEventDto
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendarApiClient(integrationId)
    try {
      const response = await calendar.events.insert({
        calendarId: calendarApiId,
        requestBody: eventData,
      })
      return response.data
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationId, GoogleServiceType.CALENDAR)
      throw error
    }
  }

  async getCalendarEvent(
    integrationId: number,
    calendarApiId: string,
    eventId: string
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendarApiClient(integrationId)
    try {
      const response = await calendar.events.get({ calendarId: calendarApiId, eventId })
      return response.data
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationId, GoogleServiceType.CALENDAR)
      throw error
    }
  }

  async updateCalendarEvent(
    integrationId: number,
    calendarApiId: string,
    eventId: string,
    eventData: UpdateCalendarEventDto
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendarApiClient(integrationId)
    try {
      const response = await calendar.events.patch({
        calendarId: calendarApiId,
        eventId,
        requestBody: eventData,
      })
      return response.data
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationId, GoogleServiceType.CALENDAR)
      throw error
    }
  }

  async deleteCalendarEvent(
    integrationId: number,
    calendarApiId: string,
    eventId: string
  ): Promise<void> {
    const calendar = await this.getCalendarApiClient(integrationId)
    try {
      await calendar.events.delete({ calendarId: calendarApiId, eventId })
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationId, GoogleServiceType.CALENDAR)
      throw error
    }
  }

  // Refresh Calendar Token (specific DTO variant)
  async refreshCalendarToken(dto: RefreshCalendarTokenDto): Promise<IntegrationGoogleEntity> {
    // This flow seems specific to ID token refresh for Google OAuth.
    // A standard refresh uses the Google Refresh Token. Re-implementing using standard refresh token logic.
    const integration = await this.getIntegrationById(dto.integrationId, GoogleServiceType.CALENDAR)
    if (integration.userId !== dto.institutionId) {
      throw new BadRequestException('Integration does not belong to the institution.')
    }
    if (!integration.refreshToken) {
      integration.status = IntegrationConnectStatus.RESTRICTED
      await this.integrationGoogleRepository.save(integration)
      throw new BadRequestException('No refresh token available. Please reconnect.')
    }
    const oauthClient = new google.auth.OAuth2(
      this.GOOGLE_CLIENT_ID,
      this.GOOGLE_CLIENT_SECRET,
      this.GOOGLE_REDIRECT_URI
    )
    oauthClient.setCredentials({ refresh_token: integration.refreshToken })
    // Trigger internal refresh logic which saves the updated entity
    await this._refreshAccessTokenIfNeededInternal(oauthClient, integration)
    // Return the updated integration
    return this.getIntegrationById(dto.integrationId, GoogleServiceType.CALENDAR) // Fetch again to get latest state
  }

  // --- Meet Methods (merged from IntegrationOnlineMeetingService + GoogleMeetService) ---

  // Find Meet integrations for an institution (userId)
  async findMeetIntegrationsByInstitution(
    institutionId: number
  ): Promise<IntegrationGoogleEntity[]> {
    return this.findByInstitution(institutionId, GoogleServiceType.MEET)
  }

  // Find a specific Meet integration by its ID
  async findOneMeetIntegration(id: number): Promise<IntegrationGoogleEntity> {
    return this.getIntegrationById(id, GoogleServiceType.MEET)
  }

  // Create Meet Integration
  async createMeetIntegration(
    createDto: CreateIntegrationOnlineMeetingDto
  ): Promise<IntegrationGoogleEntity> {
    const syntheticGoogleUserId = `institution-${createDto.institutionId}`
    const syntheticGoogleEmail = `institution-${createDto.institutionId}@local.flowclass`

    return this.saveGoogleCredentials(
      createDto.institutionId,
      createDto.institutionId,
      syntheticGoogleUserId,
      syntheticGoogleEmail,
      createDto.accessToken,
      undefined,
      new Date(Date.now() + 60 * 60 * 1000),
      undefined,
      GoogleServiceType.MEET
    )
  }

  // Update Meet Integration
  async updateMeetIntegration(
    id: number,
    updateDto: UpdateIntegrationOnlineMeetingDto
  ): Promise<IntegrationGoogleEntity> {
    const integration = await this.getIntegrationById(id, GoogleServiceType.MEET)
    if (updateDto.isEnabled !== undefined) {
      integration.status = updateDto.isEnabled
        ? IntegrationConnectStatus.ENABLED
        : IntegrationConnectStatus.RESTRICTED
    }
    // Update meetSettings if/when they exist
    // if (!integration.meetSettings) integration.meetSettings = {};
    return this.integrationGoogleRepository.save(integration)
  }

  // Delete Meet Integration record
  async removeMeetIntegration(id: number): Promise<void> {
    const integration = await this.getIntegrationById(id, GoogleServiceType.MEET)
    await this.integrationGoogleRepository.delete(integration.id)
  }

  // Toggle Meet Integration Status
  async toggleMeetIntegration(id: number): Promise<IntegrationGoogleEntity> {
    const integration = await this.getIntegrationById(id, GoogleServiceType.MEET)
    integration.status =
      integration.status === IntegrationConnectStatus.ENABLED
        ? IntegrationConnectStatus.RESTRICTED
        : IntegrationConnectStatus.ENABLED
    return this.integrationGoogleRepository.save(integration)
  }

  // Get Meet meetings (via Calendar)
  async getMeetMeetings(integrationMeetId: number): Promise<calendar_v3.Schema$Event[]> {
    const integrationMeet = await this.getIntegrationById(integrationMeetId, GoogleServiceType.MEET)
    // Find corresponding calendar integration
    const integrationCalendar = await this.integrationGoogleRepository.findOne({
      where: {
        googleUserId: integrationMeet.googleUserId,
        userId: integrationMeet.userId,
        serviceType: GoogleServiceType.CALENDAR,
        status: IntegrationConnectStatus.ENABLED,
      },
    })

    if (!integrationCalendar || !integrationCalendar.calendarSettings?.calendarId) {
      console.warn(
        `Cannot list Meet meetings for integration ${integrationMeetId}: No active calendar integration found or calendar ID missing.`
      )
      return [] // Cannot list via calendar
    }

    try {
      const calendar = await this.getCalendarApiClient(
        integrationCalendar.id,
        integrationMeet.accessToken
      ) // Use Meet token if possible?
      const response = await calendar.events.list({
        calendarId: integrationCalendar.calendarSettings.calendarId,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
        q: 'hangoutsMeet', // Filter for Meet events
      })
      return (
        response.data.items?.filter((event) =>
          event.conferenceData?.entryPoints?.some((ep) => ep.entryPointType === 'video')
        ) || []
      )
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationMeetId, GoogleServiceType.MEET)
      throw error
    }
  }

  // Get a specific Meet space
  async getMeetSpace(
    integrationMeetId: number,
    meetingName: string
  ): Promise<meet_v2.Schema$Space | null> {
    const meet = await this.getMeetApiClient(integrationMeetId)
    try {
      const response = await meet.spaces.get({ name: meetingName })
      return response.data
    } catch (error) {
      if (error.code === 5) return null // Not found
      handleGoogleIntegrationAuthError(error, integrationMeetId, GoogleServiceType.MEET)
      throw error
    }
  }

  // Create Meet space and optionally a calendar event
  async createMeetMeetingAndEvent(integrationMeetId: number, meetingData: CreateMeetingEventDto) {
    const integrationMeet = await this.getIntegrationById(integrationMeetId, GoogleServiceType.MEET)
    const meet = await this.getMeetApiClient(integrationMeetId)
    let spaceResponse: meet_v2.Schema$Space | null = null
    let calendarResponse: calendar_v3.Schema$Event | null = null

    try {
      const createdSpace = await meet.spaces.create()
      spaceResponse = createdSpace.data

      if (spaceResponse?.meetingUri) {
        // Find corresponding calendar integration
        const integrationCalendar = await this.integrationGoogleRepository.findOne({
          where: {
            googleUserId: integrationMeet.googleUserId,
            userId: integrationMeet.userId,
            serviceType: GoogleServiceType.CALENDAR,
            status: IntegrationConnectStatus.ENABLED,
          },
        })

        if (integrationCalendar && integrationCalendar.calendarSettings?.calendarId) {
          const calendar = await this.getCalendarApiClient(
            integrationCalendar.id,
            integrationMeet.accessToken
          )
          const event = {
            summary: meetingData.summary,
            description: meetingData.description,
            start: meetingData.start,
            end: meetingData.end,
            conferenceData: {
              entryPoints: [
                {
                  entryPointType: 'video',
                  uri: spaceResponse.meetingUri,
                  label: meetingData.summary,
                },
              ],
              conferenceSolution: { key: { type: 'hangoutsMeet' }, name: 'Google Meet' },
            },
          }
          const createdEvent = await calendar.events.insert({
            calendarId: integrationCalendar.calendarSettings.calendarId,
            conferenceDataVersion: 1,
            requestBody: event,
          })
          calendarResponse = createdEvent.data
        }
      }
      return { spaceResponse, calendarResponse }
    } catch (error) {
      handleGoogleIntegrationAuthError(error, integrationMeetId, GoogleServiceType.MEET)
      throw error
    }
  }

  // Update Meet meeting (primarily updates calendar event)
  async updateMeetMeeting(
    integrationMeetId: number,
    meetingName: string,
    meetingData: UpdateMeetingEventDto
  ): Promise<any> {
    // Meet API v2 doesn't allow updating space details like summary.
    // This should primarily update the associated calendar event if one exists and can be found.
    const integrationMeet = await this.getIntegrationById(integrationMeetId, GoogleServiceType.MEET)
    const integrationCalendar = await this.integrationGoogleRepository.findOne({
      where: {
        googleUserId: integrationMeet.googleUserId,
        userId: integrationMeet.userId,
        serviceType: GoogleServiceType.CALENDAR,
        status: IntegrationConnectStatus.ENABLED,
      },
    })

    if (integrationCalendar && integrationCalendar.calendarSettings?.calendarId) {
      // PROBLEM: We need the CALENDAR EVENT ID, not the meetingName (spaces/xxx)
      console.warn('Updating Meet calendar event requires specific event ID mapping.')
      // Placeholder: If event ID was stored or derivable, call updateCalendarEvent here.
      // e.g., const eventId = findEventIdForMeetingName(meetingName);
      // await this.updateCalendarEvent(integrationCalendar.id, integrationCalendar.calendarSettings.calendarId, eventId, meetingData);
      return {
        message: 'Meet space cannot be updated directly. Calendar event update requires Event ID.',
      }
    } else {
      return {
        message: 'Meet space cannot be updated directly. No linked calendar integration found.',
      }
    }
  }

  // Delete Meet meeting (ends conference, optionally deletes calendar event)
  async deleteMeetMeeting(
    integrationMeetId: number,
    meetingName: string
  ): Promise<{ success: boolean }> {
    const integrationMeet = await this.getIntegrationById(integrationMeetId, GoogleServiceType.MEET)
    const meet = await this.getMeetApiClient(integrationMeetId)

    // Try to end active conference
    try {
      await meet.spaces.endActiveConference({ name: meetingName })
    } catch (meetError) {
      if (meetError.code === 5) {
        // Not found
        console.warn(`No active conference to end for space ${meetingName} or space not found.`)
      } else {
        handleGoogleIntegrationAuthError(meetError, integrationMeetId, GoogleServiceType.MEET)
        throw meetError
      }
    }

    // Try to delete associated calendar event (requires Event ID)
    const integrationCalendar = await this.integrationGoogleRepository.findOne({
      where: {
        googleUserId: integrationMeet.googleUserId,
        userId: integrationMeet.userId,
        serviceType: GoogleServiceType.CALENDAR,
        status: IntegrationConnectStatus.ENABLED,
      },
    })
    if (integrationCalendar && integrationCalendar.calendarSettings?.calendarId) {
      // PROBLEM: Need CALENDAR EVENT ID
      console.warn('Deleting Meet calendar event requires specific event ID mapping.')
      // Placeholder: If event ID was stored or derivable, call deleteCalendarEvent here.
      // e.g., const eventId = findEventIdForMeetingName(meetingName);
      // await this.deleteCalendarEvent(integrationCalendar.id, integrationCalendar.calendarSettings.calendarId, eventId);
    }
    return { success: true } // Indicate conference ended / delete attempted
  }

  // Refresh Meet Token (specific DTO variant) - Uses standard refresh token logic now
  async refreshMeetToken(dto: RefreshGoogleMeetTokenDto): Promise<IntegrationGoogleEntity> {
    const integration = await this.getIntegrationById(
      dto.integrationOnlineMeetingId,
      GoogleServiceType.MEET
    )
    if (integration.userId !== dto.institutionId) {
      throw new BadRequestException('Integration does not belong to the institution.')
    }
    if (!integration.refreshToken) {
      integration.status = IntegrationConnectStatus.RESTRICTED
      await this.integrationGoogleRepository.save(integration)
      throw new BadRequestException('No refresh token available. Please reconnect.')
    }
    const oauthClient = new google.auth.OAuth2(
      this.GOOGLE_CLIENT_ID,
      this.GOOGLE_CLIENT_SECRET,
      this.GOOGLE_REDIRECT_URI
    )
    oauthClient.setCredentials({ refresh_token: integration.refreshToken })
    await this._refreshAccessTokenIfNeededInternal(oauthClient, integration)
    return this.getIntegrationById(dto.integrationOnlineMeetingId, GoogleServiceType.MEET)
  }

  // --- Google Drive Methods ---

  /**
   * Get Drive integration status for a user
   */
  // async getDriveIntegrationStatus(userId: number): Promise<Partial<IntegrationGoogleEntity>> {
  //   const integration = await this.getActiveIntegration(userId, GoogleServiceType.DRIVE)
  //   if (!integration) {
  //     return { status: IntegrationConnectStatus.RESTRICTED }
  //   }
  //   return {
  //     id: integration.id,
  //     googleUserEmail: integration.googleUserEmail,
  //     status: integration.status,
  //     // driveSettings: integration.driveSettings,
  //   }
  // }handleGoogleOAuthCallback

  async getDriveIntegrationStatus(institutionId: number): Promise<any> {
    const integration = await this.getActiveIntegration({
      institutionId,
    })

    if (!integration) {
      return {
        status: IntegrationConnectStatus.RESTRICTED,
        isConnected: false,
        userEmail: null,
        configuration: null,
      }
    }

    return {
      id: integration.id,
      userEmail: integration.googleUserEmail,
      isConnected: integration.status === IntegrationConnectStatus.ENABLED,
      status: integration.status,
      configuration: integration.driveSettings,
    }
  }

  /**
   * List Google Drive folders with optional parent folder filtering
   */
  async listGoogleDriveFoldersForDrive(
    institutionId: number,
    parentFolderId?: string
  ): Promise<GoogleDriveFile[]> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      let query = "mimeType='application/vnd.google-apps.folder' and trashed=false"
      if (parentFolderId) {
        query += ` and '${parentFolderId}' in parents`
      }

      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink, parents)',
        spaces: 'drive',
        pageSize: 100,
        orderBy: 'name',
      })

      return (response.data.files || []) as GoogleDriveFile[]
    } catch (error) {
      console.error('Error listing Google Drive folders:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to list Google Drive folders.')
    }
  }

  /**
   * Create a new folder in Google Drive
   */
  async createGoogleDriveFolder({
    userId,
    institutionId,
    folderName,
    parentFolderId,
    options,
  }: {
    userId?: number
    institutionId: number
    folderName: string
    parentFolderId?: string
    options?: { reuseExisting?: boolean }
  }): Promise<GoogleDriveFile> {
    const resolvedInstitutionId = institutionId ?? (await this.getInstitutionIdForUser(userId))
    const integration = await this.getActiveIntegration({
      institutionId: resolvedInstitutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      if (options?.reuseExisting) {
        const sanitizedName = folderName.replace(/'/g, "\\'")
        const queryParts = [
          "mimeType='application/vnd.google-apps.folder'",
          'trashed=false',
          `name='${sanitizedName}'`,
        ]
        if (parentFolderId) {
          queryParts.push(`'${parentFolderId}' in parents`)
        } else {
          queryParts.push("'root' in parents")
        }

        const existingFolders = await drive.files.list({
          q: queryParts.join(' and '),
          fields: 'files(id, name, webViewLink, parents)',
          spaces: 'drive',
          pageSize: 1,
        })

        if (existingFolders.data.files && existingFolders.data.files.length > 0) {
          return existingFolders.data.files[0] as GoogleDriveFile
        }
      }

      const folderMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }

      if (parentFolderId) {
        folderMetadata.parents = [parentFolderId]
      }

      const response = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink, parents',
      })

      return response.data as GoogleDriveFile
    } catch (error) {
      console.error('Error creating Google Drive folder:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to create Google Drive folder.')
    }
  }

  /**
   * Validate and set root folder for Drive integration
   */
  async setDriveRootFolder(
    institutionId: number,
    config: GoogleDriveUserConfig
  ): Promise<GoogleDriveServiceSettings> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    // Check if root folder is already set and warn about immutability
    const currentDriveSettings = integration.driveSettings || {}
    // if (currentDriveSettings.rootFolderId && currentDriveSettings.rootFolderId !== config.rootFolderId) {
    //   throw new BadRequestException(
    //     'Root folder cannot be changed once set. This action is irreversible to prevent data loss.'
    //   )
    // }

    if (
      currentDriveSettings.rootFolderId &&
      currentDriveSettings.rootFolderId !== config.rootFolderId
    ) {
      // Check if existing root folder is still valid
      const isValid = await this.validateFolderExists(
        institutionId,
        currentDriveSettings.rootFolderId
      )
      if (isValid.exists) {
        throw new BadRequestException(
          'Root folder cannot be changed once set. This action is irreversible to prevent data loss.'
        )
      }
    }

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      // Validate folder exists and user has access
      await drive.files.get({
        fileId: config.rootFolderId,
        fields: 'id, name, mimeType, capabilities',
      })

      // Test write permissions by creating a small test file
      const testFile = await drive.files.create({
        requestBody: {
          name: '.flowclass_access_test',
          parents: [config.rootFolderId],
        },
        media: {
          mimeType: 'text/plain',
          body: 'Flowclass access test - safe to delete',
        },
      })

      // Clean up test file
      if (testFile.data.id) {
        await drive.files.delete({ fileId: testFile.data.id })
      }

      // Create folder structure if specified
      const folderStructure: any = {}
      if (config.folderStructure) {
        for (const [key, folderName] of Object.entries(config.folderStructure)) {
          if (folderName) {
            const folder = await this.createGoogleDriveFolder({
              institutionId,
              folderName,
              parentFolderId: config.rootFolderId,
            })
            folderStructure[key] = {
              folderId: folder.id,
              folderName: folder.name,
            }
          }
        }
      }

      // Update integration settings
      const updatedDriveSettings = {
        ...currentDriveSettings,
        rootFolderId: config.rootFolderId,
        rootFolderName: config.rootFolderName,
        folderStructure,
        configuredAt: new Date(),
      }

      integration.driveSettings = updatedDriveSettings
      await this.integrationGoogleRepository.save(integration)

      return integration.driveSettings
    } catch (error) {
      console.error('Failed to set Drive root folder:', error.response?.data || error.message)
      if (error.code === 404) {
        throw new BadRequestException('Selected folder not found or access denied.')
      }
      if (error.code === 403) {
        throw new BadRequestException('Insufficient permissions to write to selected folder.')
      }
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to configure Google Drive root folder.')
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFileToDrive(
    userId: number,
    fileData: GoogleDriveFileUpload,
    targetFolder?: 'classFiles' | 'studentFiles',
    onConflict?: 'overwrite' | 'rename' | 'error'
  ): Promise<GoogleDriveFile> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const driveSettings = integration.driveSettings
    if (!driveSettings?.rootFolderId) {
      throw new BadRequestException('Google Drive root folder not configured.')
    }

    let parentFolderId = driveSettings.rootFolderId

    if (targetFolder && driveSettings.folderStructure?.[targetFolder]?.folderId) {
      parentFolderId = driveSettings.folderStructure[targetFolder].folderId
    } else if (fileData.parentId) {
      const isInHierarchy = await this.isFolderInRootHierarchy(userId, fileData.parentId)
      if (!isInHierarchy) {
        throw new BadRequestException(
          'Uploads must be within your configured root folder hierarchy.'
        )
      }
      parentFolderId = fileData.parentId
    }

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      const fileMetadata: any = {
        name: fileData.name,
        parents: [parentFolderId],
      }

      const media = {
        mimeType: fileData.mimeType || 'application/octet-stream',
        body: Buffer.isBuffer(fileData.content)
          ? Readable.from(fileData.content)
          : fileData.content,
      }

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink, parents, mimeType',
      })

      return response.data as GoogleDriveFile
    } catch (error) {
      console.error('Failed to upload file to Drive:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to upload file to Google Drive.')
    }
  }

  async uploadFilesToDriveBatch(
    institutionId: number,
    filesData: GoogleDriveFileUpload[],
    targetFolder?: 'classFiles' | 'studentFiles',
    options?: {
      onConflict?: 'overwrite' | 'rename' | 'error'
      maxConcurrent?: number
      uploadId?: string // Add upload ID for tracking
    }
  ): Promise<Array<GoogleDriveFile & { success: boolean; error?: string }>> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const driveSettings = integration.driveSettings
    if (!driveSettings?.rootFolderId) {
      throw new BadRequestException('Google Drive root folder not configured.')
    }

    const { drive } = await this.getDriveApiClient(integration.id)
    const maxConcurrent = options?.maxConcurrent || 3
    const results: Array<GoogleDriveFile & { success: boolean; error?: string }> = []
    let completedCount = 0

    // Update progress if uploadId provided
    const updateProgress = (fileName?: string) => {
      if (options?.uploadId) {
        this.uploadProgressService.updateProgress(options.uploadId, {
          completedFiles: completedCount,
          currentFile: fileName,
          status: 'uploading',
        })
      }
    }

    for (let i = 0; i < filesData.length; i += maxConcurrent) {
      const batch = filesData.slice(i, i + maxConcurrent)

      const batchPromises = batch.map(async (fileData) => {
        try {
          updateProgress(fileData.name)

          let parentFolderId = driveSettings.rootFolderId

          if (fileData.parentId) {
            const isInHierarchy = await this.isFolderInRootHierarchy(
              institutionId,
              fileData.parentId
            )
            if (!isInHierarchy) {
              throw new BadRequestException(
                'Uploads must be within your configured root folder hierarchy.'
              )
            }
            parentFolderId = fileData.parentId
          } else if (targetFolder && driveSettings.folderStructure?.[targetFolder]?.folderId) {
            parentFolderId = driveSettings.folderStructure[targetFolder].folderId
          }

          const response = await drive.files.create({
            requestBody: {
              name: fileData.name,
              parents: [parentFolderId],
            },
            media: {
              mimeType: fileData.mimeType || 'application/octet-stream',
              body: Buffer.isBuffer(fileData.content)
                ? Readable.from(fileData.content)
                : fileData.content,
            },
            fields: 'id, name, webViewLink, parents, mimeType',
          })

          completedCount++
          updateProgress()

          return {
            ...response.data,
            success: true,
          } as GoogleDriveFile & { success: boolean }
        } catch (error) {
          completedCount++
          updateProgress()

          this.logger.error(`Failed to upload file ${fileData.name}:`, error.message)
          return {
            id: '',
            name: fileData.name,
            mimeType: fileData.mimeType || '',
            success: false,
            error: error.message || 'Upload failed',
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    // Mark upload as complete
    if (options?.uploadId) {
      this.uploadProgressService.completeUpload(options.uploadId, results)
    }

    return results
  }

  /**
   * Download file from Google Drive by file ID
   */
  async downloadFileFromDrive(userId: number, fileId: string): Promise<GoogleDriveDownloadResult> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      // Get file metadata first
      const fileInfo = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size',
      })

      // Download file content
      const response = await drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        {
          responseType: 'arraybuffer',
        }
      )

      return {
        content: Buffer.from(response.data as ArrayBuffer),
        mimeType: fileInfo.data.mimeType || 'application/octet-stream',
        name: fileInfo.data.name || 'unknown',
      }
    } catch (error) {
      console.error('Failed to download file from Drive:', error.response?.data || error.message)
      if (error.response?.status === 404) {
        throw new NotFoundException('File not found in Google Drive.')
      }
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to download file from Google Drive.')
    }
  }

  /**
   * Download file from Google Drive using a Drive URL
   */
  async downloadFileFromDriveUrl(
    userId: number,
    driveUrl: string
  ): Promise<GoogleDriveDownloadResult> {
    // Extract file ID from various Google Drive URL formats
    const fileId = this.extractFileIdFromDriveUrl(driveUrl)
    if (!fileId) {
      throw new BadRequestException('Invalid Google Drive URL format.')
    }

    return this.downloadFileFromDrive(userId, fileId)
  }

  /**
   * List files in Google Drive folder
   */
  async listFilesInDriveFolder(
    institutionId: number,
    folderId?: string,
    mimeTypeFilter?: string
  ): Promise<GoogleDriveFile[]> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const driveSettings = integration.driveSettings
    const targetFolderId = folderId || driveSettings?.rootFolderId

    if (!targetFolderId) {
      throw new BadRequestException('No folder specified and no root folder configured.')
    }

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      let query = `'${targetFolderId}' in parents and trashed=false`
      if (mimeTypeFilter) {
        query += ` and mimeType='${mimeTypeFilter}'`
      }

      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, webViewLink, parents, size, modifiedTime)',
        spaces: 'drive',
        pageSize: 100,
        orderBy: 'name',
      })

      return (response.data.files || []) as GoogleDriveFile[]
    } catch (error) {
      console.error('Error listing files in Drive folder:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to list files in Google Drive folder.')
    }
  }

  /**
   * Get file information from Google Drive
   */
  async getDriveFileInfo(userId: number, fileId: string): Promise<GoogleDriveFile> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink, parents, size, modifiedTime, createdTime',
      })

      return response.data as GoogleDriveFile
    } catch (error) {
      console.error('Failed to get Drive file info:', error.response?.data || error.message)
      if (error.response?.status === 404) {
        throw new NotFoundException('File not found in Google Drive.')
      }
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to get file information from Google Drive.')
    }
  }

  /**
   * Checks if the configured root folder still exists and is writable.
   * Returns actionable feedback for frontend.
   */
  async checkRootFolderHealth(userId: number): Promise<{
    healthy: boolean
    message: string
    actionRequired: boolean
    suggestedAction?: string
  }> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
    })
    if (!integration || !integration.driveSettings?.rootFolderId) {
      return {
        healthy: false,
        message: 'No Google Drive root folder configured.',
        actionRequired: true,
        suggestedAction: 'Please select a root folder to continue using Google Drive features.',
      }
    }

    const rootFolderId = integration.driveSettings.rootFolderId

    try {
      // Step 1: Check if folder exists and is accessible
      const folderInfo = await this.validateFolderExists(userId, rootFolderId)

      if (!folderInfo.exists) {
        return {
          healthy: false,
          message: 'Configured root folder was deleted or is no longer accessible.',
          actionRequired: true,
          suggestedAction: 'Please re-select a new root folder in settings.',
        }
      }

      // Step 2: Validate write access (optional but recommended)
      const hasWriteAccess = await this.testAndValidateWriteAccess(userId, rootFolderId)
      if (!hasWriteAccess) {
        return {
          healthy: false,
          message: 'You no longer have write permissions to the root folder.',
          actionRequired: true,
          suggestedAction: 'Please choose a folder where you have edit permissions.',
        }
      }

      return {
        healthy: true,
        message: 'Root folder is healthy and accessible.',
        actionRequired: false,
      }
    } catch (error) {
      console.error(`Root folder health check failed for user ${userId}:`, error.message)

      return {
        healthy: false,
        message: 'Unable to verify root folder status. It may have been deleted or moved.',
        actionRequired: true,
        suggestedAction: 'Please re-select your root folder to restore functionality.',
      }
    }
  }

  /**
   * Helper method to extract file ID from various Google Drive URL formats
   */
  private extractFileIdFromDriveUrl(url: string): string | null {
    // Handle various Google Drive URL formats:
    // https://drive.google.com/file/d/FILE_ID/view
    // https://drive.google.com/open?id=FILE_ID
    // https://docs.google.com/document/d/FILE_ID/edit
    // https://docs.google.com/spreadsheets/d/FILE_ID/edit
    // etc.

    const patterns = [
      /\/d\/([a-zA-Z0-9-_]+)/, // /d/FILE_ID format
      /[?&]id=([a-zA-Z0-9-_]+)/, // ?id=FILE_ID or &id=FILE_ID format
      /\/([a-zA-Z0-9-_]+)\/edit/, // /FILE_ID/edit format (Google Docs)
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  /**
   * Validate user has write permissions to a folder
   */
  async validateFolderWriteAccess(institutionId: number, folderId: string): Promise<boolean> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      // Create a test file to verify write permissions
      const testFile = await drive.files.create({
        requestBody: {
          name: '.flowclass_write_test_' + Date.now(),
          parents: [folderId],
        },
        media: {
          mimeType: 'text/plain',
          body: 'Flowclass write permission test - safe to delete',
        },
      })

      // Clean up test file immediately
      if (testFile.data.id) {
        await drive.files.delete({ fileId: testFile.data.id })
      }

      return true
    } catch (error) {
      console.error('Write permission test failed:', error.response?.data || error.message)
      if (error.code === 403) {
        return false // No write permissions
      }
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw error
    }
  }

  /**
   * Get Google Drive quota information
   */
  async getDriveQuotaInfo(userId: number): Promise<{
    limit: number
    usage: number
    usageInDrive: number
    usageInDriveTrash: number
  }> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      const response = await drive.about.get({
        fields: 'storageQuota',
      })

      const quota = response.data.storageQuota
      return {
        limit: parseInt(quota?.limit || '0'),
        usage: parseInt(quota?.usage || '0'),
        usageInDrive: parseInt(quota?.usageInDrive || '0'),
        usageInDriveTrash: parseInt(quota?.usageInDriveTrash || '0'),
      }
    } catch (error) {
      console.error('Failed to get Drive quota:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to get Google Drive quota information.')
    }
  }

  /**
   * Check if folder exists and user has access
   */
  async validateFolderExists(
    institutionId: number,
    folderId: string
  ): Promise<{
    exists: boolean
    name?: string
    hasWriteAccess?: boolean
  }> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      const response = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType, capabilities',
      })

      const file = response.data
      const hasWriteAccess = file.capabilities?.canAddChildren && file.capabilities?.canEdit

      return {
        exists: true,
        name: file.name,
        hasWriteAccess,
      }
    } catch (error) {
      if (error.code === 404) {
        return { exists: false }
      }
      console.error('Failed to validate folder:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw error
    }
  }

  async createDefaultFolderStructure(
    institutionId: number
  ): Promise<{ [key: string]: { folderId: string; folderName: string } }> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const driveSettings = integration.driveSettings
    if (Object.keys(driveSettings.folderStructure || {}).length > 0) {
      return driveSettings.folderStructure
    }
    if (!driveSettings?.rootFolderId) {
      throw new BadRequestException('Google Drive root folder not configured.')
    }
    const defaultFolders = {
      classFiles: 'Class Materials',
      studentFiles: 'Student Submissions',
    }

    const folderStructure: any = {}

    // Get master admin userId for folder creation
    const masterAdmin = await this.userRoleRepository.findOne({
      where: { institutionId, isMasterAdmin: true },
    })
    const userId = masterAdmin?.userId

    if (!userId) {
      throw new BadRequestException('No master admin found for institution.')
    }

    for (const [key, folderName] of Object.entries(defaultFolders)) {
      try {
        const folder = await this.createGoogleDriveFolder({
          userId,
          institutionId,
          folderName,
          parentFolderId: driveSettings.rootFolderId,
        })
        folderStructure[key] = {
          folderId: folder.id,
          folderName: folder.name,
        }
      } catch (error) {
        console.error(`Failed to create ${folderName} folder:`, error)
        throw new InternalServerErrorException(`Failed to create ${folderName} folder structure.`)
      }
    }
    driveSettings.folderStructure = folderStructure
    await this.integrationGoogleRepository.update(integration.id, {
      driveSettings,
    })
    return folderStructure
  }
  public validateFileTypes(files: Express.Multer.File[], jobId?: string): boolean {
    const invalidFiles: string[] = []
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        invalidFiles.push(`${file.originalname} (${file.mimetype})`)
      }
    }

    if (invalidFiles.length > 0) {
      this.uploadProgressService.updateProgress(jobId, {
        status: 'failed',
        results: [],
        message: 'Some files have unsupported types',
      })
      return false
    }
    return true
  }

  async createClassFolderStructure({
    userId,
    institutionId,
    classLessonId,
    type,
    studentId,
    additionalFolderName,
    lessonFolderName,
  }: {
    userId: number
    institutionId: number
    classLessonId: number
    type: 'classFiles' | 'studentFiles' | 'teacherFeedbackFiles'
    studentId?: number
    additionalFolderName?: string
    lessonFolderName?: string
  }) {
    const folderStructure = await this.createDefaultFolderStructure(institutionId)
    const rootFolderId =
      folderStructure[type === 'teacherFeedbackFiles' ? 'studentFiles' : type].folderId
    const baseFolderName = `${classLessonId.toString()}${
      additionalFolderName ? `_${additionalFolderName}` : ''
    }`

    let courseFilesFolder = await this.createGoogleDriveFolder({
      userId,
      institutionId,
      folderName: baseFolderName,
      parentFolderId: rootFolderId,
      options: { reuseExisting: true },
    })
    if (type === 'teacherFeedbackFiles') {
      courseFilesFolder = await this.createGoogleDriveFolder({
        userId,
        institutionId,
        folderName: `${studentId}${additionalFolderName ? `_${additionalFolderName}` : ''}`,
        parentFolderId: courseFilesFolder.id,
        options: { reuseExisting: true },
      })
    }
    const lessonFolderLabel =
      type === 'classFiles' && lessonFolderName
        ? `${this.generateFolderName(type)}_${lessonFolderName}`
        : this.generateFolderName(type)

    let filesFolder = await this.createGoogleDriveFolder({
      userId,
      institutionId,
      folderName: lessonFolderLabel,
      parentFolderId: courseFilesFolder.id,
      options: { reuseExisting: true },
    })
    if (studentId) {
      filesFolder = await this.createGoogleDriveFolder({
        userId,
        institutionId,
        folderName: `${studentId}${additionalFolderName ? `_${additionalFolderName}` : ''}`,
        parentFolderId: filesFolder.id,
        options: { reuseExisting: true },
      })
    }
    return {
      rootFolderId,
      courseFilesFolder,
      filesFolder,
    }
  }

  private generateFolderName(type: 'classFiles' | 'studentFiles' | 'teacherFeedbackFiles') {
    switch (type) {
      case 'classFiles':
        return `Lesson Materials`
      case 'studentFiles':
        return `Student Materials`
      case 'teacherFeedbackFiles':
        return `Teacher Feedback Materials`
    }
  }

  /**
   * Get folder breadcrumb path
   */
  async getFolderBreadcrumb(
    userId: number,
    folderId: string
  ): Promise<
    Array<{
      id: string
      name: string
    }>
  > {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    const { drive } = await this.getDriveApiClient(integration.id)
    const breadcrumb: Array<{ id: string; name: string }> = []
    let currentFolderId = folderId

    try {
      while (currentFolderId && currentFolderId !== 'root') {
        const response = await drive.files.get({
          fileId: currentFolderId,
          fields: 'id, name, parents',
        })

        const folder = response.data
        breadcrumb.unshift({
          id: folder.id!,
          name: folder.name!,
        })

        // Get parent folder
        if (folder.parents && folder.parents.length > 0) {
          currentFolderId = folder.parents[0]
        } else {
          break
        }
      }

      return breadcrumb
    } catch (error) {
      console.error('Failed to get folder breadcrumb:', error.response?.data || error.message)
      handleGoogleIntegrationAuthError(error, integration.id, GoogleServiceType.DRIVE)
      throw new InternalServerErrorException('Failed to get folder path.')
    }
  }

  /**
   * Validates that a given folder ID is within the user's configured root folder hierarchy
   */
  async isFolderInRootHierarchy(institutionId: number, folderId: string): Promise<boolean> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })
    if (!integration || !integration.driveSettings?.rootFolderId) {
      return false // No root → no valid hierarchy
    }

    const { drive } = await this.getDriveApiClient(integration.id)

    try {
      let currentFolderId = folderId

      // Traverse upward until we hit root or find our configured rootFolderId
      while (currentFolderId && currentFolderId !== 'root') {
        const response = await drive.files.get({
          fileId: currentFolderId,
          fields: 'id, name, parents',
        })

        const folder = response.data

        // If we reached the configured root folder → valid!
        if (folder.id === integration.driveSettings.rootFolderId) {
          return true
        }

        // Move up to parent
        if (folder.parents && folder.parents.length > 0) {
          currentFolderId = folder.parents[0]
        } else {
          break
        }
      }

      // If we reached here, we didn't find the root folder in ancestry → invalid
      return false
    } catch (error) {
      console.error('Error validating folder hierarchy:', error.message)
      return false // Treat errors as invalid for safety
    }
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // Check if it's a rate limit error
        if (error.code === 429 || error.response?.status === 429) {
          const delay = Math.pow(2, i) * 1000 // Exponential backoff
          this.logger.warn(`Rate limited, retrying after ${delay}ms`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        // If not rate limit, throw immediately
        throw error
      }
    }

    throw lastError
  }

  private async handleFileNameCollision(
    drive: drive_v3.Drive,
    fileName: string,
    parentId: string,
    onConflict: 'overwrite' | 'rename' | 'error' = 'rename'
  ): Promise<{ finalName: string; existingFileId?: string }> {
    // Check for existing file
    const query = `name='${fileName}' and '${parentId}' in parents and trashed=false`
    const existing = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
    })

    if (!existing.data.files || existing.data.files.length === 0) {
      return { finalName: fileName }
    }

    switch (onConflict) {
      case 'overwrite':
        return {
          finalName: fileName,
          existingFileId: existing.data.files[0].id,
        }

      case 'rename':
        let counter = 1
        let newName = fileName
        const nameParts = fileName.match(/^(.+?)(\.[^.]+)?$/)
        const baseName = nameParts?.[1] || fileName
        const extension = nameParts?.[2] || ''

        while (counter < 100) {
          newName = `${baseName} (${counter})${extension}`
          const checkQuery = `name='${newName}' and '${parentId}' in parents and trashed=false`
          const check = await drive.files.list({
            q: checkQuery,
            fields: 'files(id)',
          })

          if (!check.data.files || check.data.files.length === 0) {
            return { finalName: newName }
          }
          counter++
        }

        break

      case 'error':
      default:
        throw new BadRequestException(`File "${fileName}" already exists in the target folder`)
    }
  }

  /**
   * Validates write access by actually creating and deleting a test file.
   * More reliable than permission checks alone.
   */
  async testAndValidateWriteAccess(userId: number, folderId: string): Promise<boolean> {
    const fileName = `__test_write_access_${Date.now()}.txt`
    const fileContent = Buffer.from('Test file for write permission validation.')

    try {
      // Step 1: Upload test file
      const uploadedFile = await this.uploadFileToDrive(userId, {
        name: fileName,
        content: fileContent,
        mimeType: 'text/plain',
        parentId: folderId,
      })

      if (!uploadedFile?.id) {
        return false
      }

      // Step 2: Delete the test file immediately
      await this.deleteDriveFile(userId, uploadedFile.id)

      return true // Success: wrote and deleted
    } catch (error) {
      console.warn(`Write access validation failed for folder ${folderId}:`, error.message)
      return false
    }
  }

  async deleteDriveFile(institutionId: number, fileId: string): Promise<void> {
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })
    const oauth2Client = await this.createOAuth2ClientFromIntegration(integration)
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    try {
      await drive.files.delete({
        fileId,
        supportsAllDrives: true,
      })
    } catch (error) {
      console.error(`Failed to delete test file ${fileId}:`, error)
      // Don't throw — we're cleaning up; failure is non-critical
    }
  }

  /**
   * Retrieves an authorized OAuth2 client for the given user and service type.
   * Refreshes token if expired.
   */
  async getOAuth2ClientForUser(
    userId: number,
    serviceType: GoogleServiceType
  ): Promise<Auth.OAuth2Client> {
    const institutionId = await this.getInstitutionIdForUser(userId)
    const integration = await this.getActiveIntegration({
      institutionId,
      options: { throwIfMissing: true },
    })

    // Reuse your existing helper that handles token refresh
    return this.createOAuth2ClientFromIntegration(integration)
  }
}
