import { BadRequestException } from '@nestjs/common'

import { createGoogleTokenExpiredError } from '@/exceptions/error-message/integration'
import { GoogleServiceType } from '@/models/integration-google.entity'

/**
 * Checks if an error is related to Google API authentication issues
 * @param error The error object to check
 * @returns boolean indicating if the error is an authentication error
 */
export const isGoogleAuthError = (error: any): boolean => {
  return (
    error.message?.includes('Invalid Credentials') ||
    error.message?.includes('invalid_grant') ||
    error.message?.includes('Token has been expired or revoked')
  )
}

/**
 * Handles Google integration authentication errors in a standardized way
 * @param error The original error object
 * @param integrationId The ID of the integration (calendar or meeting)
 * @param integrationType The type of integration ('calendar' or 'meeting')
 * @throws BadRequestException with standardized error format
 */
export const handleGoogleIntegrationAuthError = (
  error: any,
  integrationId: number,
  integrationType: GoogleServiceType
): never => {
  if (isGoogleAuthError(error)) {
    throw new BadRequestException(createGoogleTokenExpiredError(integrationId, integrationType))
  }
  throw error
}
