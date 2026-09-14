import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@firebase/auth'

import ApiError from '@/api/errors/apiError'
import { GoogleErrorMessages } from '@/api/errors/errorMessage'
import { refreshGoogleToken as refreshGoogleTokenApi } from '@/api/integrationCalendar'
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
  integrationCalendars: IntegrationCalendar[] = [],
  institutionId = 0,
  googleAuthProvider: GoogleAuthProvider
): Promise<string | undefined> => {
  try {
    const firebaseAuth = getAuth()
    const { currentUser } = firebaseAuth
    if (!currentUser) {
      // eslint-disable-next-line no-console
      console.error('No user is currently signed in')
      return undefined
    }

    // First check if we have a valid integration
    const hasValidIntegration =
      integrationCalendars.length > 0 &&
      integrationCalendars.some(integration => integration.isEnabled)

    if (hasValidIntegration) {
      const idToken = await currentUser.getIdToken()

      if (!idToken) {
        throw new Error('Failed to get ID token')
      }

      const credential = GoogleAuthProvider.credential(idToken)
      const credential2 = await signInWithCredential(firebaseAuth, credential)

      const accessTokenResult =
        GoogleAuthProvider.credentialFromResult(credential2)

      if (!accessTokenResult) {
        throw new Error('Failed to get access token')
      }

      const { accessToken } = accessTokenResult

      if (!accessToken) {
        throw new Error('Failed to get access token')
      }

      // Call the backend API to refresh the Google token
      await refreshGoogleTokenApi({
        institutionId,
        integrationCalendarId: integrationCalendars[0].id,
        idToken,
        accessToken,
      })
      return accessToken
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error refreshing Google token:', error)
    return undefined
  }

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
