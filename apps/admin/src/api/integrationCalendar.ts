import { ErrorCodes } from '@/api/errors/errorMessage'
import {
  GoogleCalendarEvent,
  GoogleCalendarItem,
} from '@/types/external/googleCalendar.type'
import {
  CreateIntegrationCalendarDto,
  IntegrationCalendar,
  RefreshGoogleTokenDto,
  UpdateIntegrationCalendarDto,
} from '@/types/integrationCalendar.type'

import apiClient from '.'

// Calendar Connection API endpoints
export const getAllIntegrationCalendars = async (
  institutionId: number,
  accessToken?: string
): Promise<IntegrationCalendar[]> => {
  const res = await apiClient.get({
    url: '/admin/integration-calendar/connections',
    params: { institutionId, accessToken },
    needAuth: true,
  })

  if (res && res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res?.data?.message || 'Failed to fetch calendar connections',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const getIntegrationCalendar = async (
  id: number,
  accessToken?: string
): Promise<IntegrationCalendar> => {
  const res = await apiClient.get({
    url: `/admin/integration-calendar/connections/${id}`,
    params: { accessToken },
    needAuth: true,
  })

  if (res && res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res?.data?.message || 'Failed to fetch calendar connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const createIntegrationCalendar = async (
  data: CreateIntegrationCalendarDto
): Promise<IntegrationCalendar> => {
  const res = await apiClient.post({
    url: '/admin/integration-calendar/connections',
    data,
    needAuth: true,
  })

  if (res && res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res?.data?.message || 'Failed to create calendar connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const updateIntegrationCalendar = async (
  id: number,
  data: UpdateIntegrationCalendarDto,
  accessToken?: string
): Promise<IntegrationCalendar> => {
  const res = await apiClient.patch({
    url: `/admin/integration-calendar/connections/${id}`,
    data,
    params: { accessToken },
    needAuth: true,
  })

  if (res && res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res?.data?.message || 'Failed to update calendar connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const deleteIntegrationCalendar = async (
  id: number,
  accessToken?: string
): Promise<void> => {
  const res = await apiClient.delete({
    url: `/admin/integration-calendar/connections/${id}`,
    params: { accessToken },
    needAuth: true,
  })

  if (!res || !res.data) {
    // Format error to match Google API error format for consistent handling
    const errorResponse = {
      response: {
        data: {
          message: 'Failed to delete calendar connection',
          errorCode: ErrorCodes.CALENDAR_CONNECTION_ERROR,
        },
      },
    }
    throw errorResponse
  }
}

/**
 * Get events from a calendar connection
 * @param connectionId - Calendar connection ID
 * @param startDate - Start date for events (optional, defaults to current date)
 * @param endDate - End date for events (optional, defaults to 30 days from start date)
 * @returns Promise with calendar events
 */
export const getCalendarEvents = async (
  institutionId: number,
  connectionId: number,
  calendarId: string,
  startDate?: Date,
  endDate?: Date,
  accessToken?: string
): Promise<GoogleCalendarEvent[]> => {
  const start = startDate ? startDate.toISOString() : new Date().toISOString()
  const defaultEnd = new Date()
  defaultEnd.setDate(defaultEnd.getDate() + 30) // Default to 30 days from now
  const end = endDate ? endDate.toISOString() : defaultEnd.toISOString()

  const res = await apiClient.get({
    url: `/admin/integration-calendar/connections/${connectionId}/events`,
    params: {
      startDate: start,
      endDate: end,
      institutionId,
      calendarId,
      accessToken,
    },
    needAuth: true,
  })

  if (res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to fetch calendar events',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_EVENT_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Get a specific event from a calendar connection
 * @param connectionId - Calendar connection ID
 * @param eventId - Calendar event ID
 * @returns Promise with calendar event details
 */
export const getCalendarEvent = async (
  institutionId: number,
  connectionId: number,
  eventId: string,
  accessToken?: string
): Promise<GoogleCalendarEvent> => {
  const res = await apiClient.get({
    url: `/admin/integration-calendar/connections/${connectionId}/events/${eventId}`,
    params: { institutionId, accessToken },
    needAuth: true,
  })

  if (res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to fetch calendar event',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_EVENT_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Get list of calendars from a calendar connection
 * @param connectionId - Calendar connection ID
 * @returns Promise with list of calendars
 */
export const getCalendarList = async (
  institutionId: number,
  connectionId: number,
  accessToken?: string
): Promise<GoogleCalendarItem[]> => {
  const res = await apiClient.get({
    url: `/admin/integration-calendar/connections/${connectionId}/calendars`,
    params: { institutionId, accessToken },
    needAuth: true,
  })

  if (res.data && res.data.data && res.data.data.items) {
    return res.data.data.items
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to fetch calendar list',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_LIST_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Refresh Google token for a specific calendar connection
 * @param institutionId - Institution ID
 * @param connectionId - Calendar connection ID
 * @param idToken - Google ID token
 * @returns Promise with refreshed access token
 */
export const refreshGoogleToken = async ({
  institutionId,
  integrationCalendarId,
  idToken,
  accessToken,
}: RefreshGoogleTokenDto): Promise<string> => {
  const res = await apiClient.post({
    url: '/admin/integration-calendar/refresh-google-token',
    data: { institutionId, integrationCalendarId, idToken, accessToken },
    needAuth: true,
  })

  if (res.data && res.data.data) {
    return res.data.data.accessToken
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to refresh Google token',
        errorCode: res.data?.errorCode || ErrorCodes.AUTHENTICATION_FAILED,
      },
    },
  }
  throw errorResponse
}

export const updatePrimaryCalendar = async ({
  institutionId,
  connectionId,
  calendarId,
  calendarName,
  accessToken,
}: {
  institutionId: number
  connectionId: number
  calendarId: string
  calendarName: string
  accessToken?: string
}): Promise<GoogleCalendarItem> => {
  const res = await apiClient.patch({
    url: `/admin/integration-calendar/connections/${connectionId}/calendars`,
    data: { institutionId, calendarName, calendarId },
    params: { accessToken },
    needAuth: true,
  })

  if (res.data && res.data.data) {
    return res.data.data
  }

  // Format error to match Google API error format for consistent handling
  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to update primary calendar',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}
