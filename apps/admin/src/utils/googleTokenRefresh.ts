import ApiError from '@/api/errors/apiError'
import { GoogleErrorMessages } from '@/api/errors/errorMessage'
import { IntegrationCalendar } from '@/types/integrationCalendar.type'

/**
 * Utility function to refresh Google tokens for various services
 * This can be used by any component that needs to interact with Google APIs
 *
 * @param integrationCalendars - Array of integration calendars (if available)
 * @param institutionId - The institution ID
 * @returns A promise that resolves to a new token or null
 */
export const refreshGoogleToken = async (
  _integrationCalendars: IntegrationCalendar[] = [],
  _institutionId = 0
): Promise<string | undefined> => {
  // Google token refresh is disabled in OSS mode.
  return undefined
}

/**
 * Helper function to check if an error is an authentication error
 *
 * @param error - The error to check
 * @returns True if the error is an authentication error
 */
export const isGoogleAuthError = (error: unknown): boolean => {
  const apiError = error as ApiError

  return apiError?.message === GoogleErrorMessages.GOOGLE_API_EXPIRED
}
