import { GoogleServiceType } from '@/models/integration-google.entity'

export const INTEGRATION_ERROR = {
  // Calendar integration errors
  CALENDAR_CONNECTION_NOT_FOUND: 'Calendar connection not found',
  NO_GOOGLE_USER_ID: 'No Google user ID available for this calendar connection',
  AUTHENTICATION_FAILED: 'Authentication failed',
  TOKEN_EXPIRED: 'Authentication token has expired',
  FAILED_TO_REFRESH_TOKEN: 'Failed to refresh token',

  // Online meeting integration errors
  MEETING_CONNECTION_NOT_FOUND: 'Online meeting connection not found',
  NO_MEETING_GOOGLE_USER_ID: 'No Google user ID available for this meeting connection',
  MEETING_AUTHENTICATION_FAILED: 'Meeting authentication failed',
  MEETING_TOKEN_EXPIRED: 'Meeting authentication token has expired',
  FAILED_TO_REFRESH_MEETING_TOKEN: 'Failed to refresh meeting token',

  // General integration errors
  INVALID_PROVIDER: 'Invalid provider',
  INTEGRATION_DISABLED: 'Integration is disabled',
  INTEGRATION_NOT_FOUND: 'Integration not found',
  GOOGLE_TOKEN_EXPIRED: 'Google API token has expired',
}

// Standard error codes for integration errors
export const INTEGRATION_ERROR_CODES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  INTEGRATION_NOT_FOUND: 'INTEGRATION_NOT_FOUND',
  INTEGRATION_DISABLED: 'INTEGRATION_DISABLED',
}

// Standard error response format for Google API token errors
export const createGoogleTokenExpiredError = (
  integrationId: number,
  integrationType: GoogleServiceType
) => ({
  message: INTEGRATION_ERROR.GOOGLE_TOKEN_EXPIRED,
  errorCode: INTEGRATION_ERROR_CODES.TOKEN_EXPIRED,
  integrationId,
  integrationType,
  requiresReauthentication: true,
  timestamp: new Date().toISOString(),
})
