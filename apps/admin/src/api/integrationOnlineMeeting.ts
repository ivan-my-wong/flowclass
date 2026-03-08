import { ErrorCodes } from '@/api/errors/errorMessage'
import {
  CreateIntegrationOnlineMeetingDto,
  GoogleMeetEvent,
  IntegrationOnlineMeeting,
  RefreshGoogleTokenDto,
  UpdateIntegrationOnlineMeetingDto,
} from '@/types/integrationOnlineMeeting.type'

import apiClient from '.'

// Online Meeting Connection API endpoints
export const getAllIntegrationOnlineMeetings = async (
  institutionId: number,
  accessToken?: string
): Promise<IntegrationOnlineMeeting[]> => {
  const res = await apiClient.get({
    url: '/admin/integration-online-meeting/connections',
    params: { institutionId, accessToken },
    needAuth: true,
  })

  if (res?.data?.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message:
          res?.data?.message || 'Failed to fetch online meeting connections',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const getIntegrationOnlineMeeting = async (
  id: number,
  accessToken?: string
): Promise<IntegrationOnlineMeeting> => {
  const res = await apiClient.get({
    url: `/admin/integration-online-meeting/connections/${id}`,
    params: { accessToken },
    needAuth: true,
  })

  if (res?.data?.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message:
          res?.data?.message || 'Failed to fetch online meeting connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const createIntegrationOnlineMeeting = async (
  data: CreateIntegrationOnlineMeetingDto
): Promise<IntegrationOnlineMeeting> => {
  const res = await apiClient.post({
    url: '/admin/integration-online-meeting/connections',
    data,
    needAuth: true,
  })

  if (res?.data?.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message:
          res?.data?.message || 'Failed to create online meeting connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const updateIntegrationOnlineMeeting = async (
  id: number,
  data: UpdateIntegrationOnlineMeetingDto,
  accessToken?: string
): Promise<IntegrationOnlineMeeting> => {
  const res = await apiClient.patch({
    url: `/admin/integration-online-meeting/connections/${id}`,
    data,
    params: { accessToken },
    needAuth: true,
  })

  if (res?.data?.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message:
          res?.data?.message || 'Failed to update online meeting connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

export const deleteIntegrationOnlineMeeting = async (
  id: number,
  accessToken?: string
): Promise<void> => {
  const res = await apiClient.delete({
    url: `/admin/integration-online-meeting/connections/${id}`,
    params: { accessToken },
    needAuth: true,
  })

  if (!res) {
    const errorResponse = {
      response: {
        data: {
          message: 'Failed to delete online meeting connection',
          errorCode: ErrorCodes.CALENDAR_CONNECTION_ERROR,
        },
      },
    }
    throw errorResponse
  }
}

export const toggleIntegrationOnlineMeeting = async (
  id: number,
  accessToken?: string
): Promise<IntegrationOnlineMeeting> => {
  const res = await apiClient.patch({
    url: `/admin/integration-online-meeting/connections/${id}/toggle`,
    params: { accessToken },
    needAuth: true,
  })

  if (res?.data?.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message:
          res?.data?.message || 'Failed to toggle online meeting connection',
        errorCode: res?.data?.errorCode || ErrorCodes.CALENDAR_CONNECTION_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Get meetings from an online meeting connection
 * @param connectionId - Online meeting connection ID
 * @param startDate - Start date for meetings (optional, defaults to current date)
 * @param endDate - End date for meetings (optional, defaults to 30 days from start date)
 * @param accessToken - Optional access token for authentication
 * @returns Promise with meeting events
 */
export const getMeetings = async (
  institutionId: number,
  connectionId: number,
  accessToken?: string
): Promise<GoogleMeetEvent[]> => {
  const res = await apiClient.get({
    url: `/admin/integration-online-meeting/connections/${connectionId}/meetings`,
    params: { institutionId, accessToken },
    needAuth: true,
  })

  if (res.data && res.data.success && res.data.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to fetch meetings',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_EVENT_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Get a specific meeting from an online meeting connection
 * @param connectionId - Online meeting connection ID
 * @param meetingId - Meeting ID
 * @param accessToken - Optional access token for authentication
 * @returns Promise with meeting details
 */
export const getMeeting = async (
  connectionId: number,
  meetingId: string,
  accessToken?: string
): Promise<GoogleMeetEvent> => {
  const res = await apiClient.get({
    url: `/admin/integration-online-meeting/connections/${connectionId}/meetings/${meetingId}`,
    params: { accessToken },
    needAuth: true,
  })

  if (res.data && res.data.success && res.data.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to fetch meeting',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_EVENT_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Create a new meeting
 * @param connectionId - Online meeting connection ID
 * @param meetingData - Meeting data including summary, description, start and end times
 * @param accessToken - Optional access token for authentication
 * @returns Promise with created meeting details
 */
export const createMeeting = async (
  connectionId: number,
  meetingData: {
    summary: string
    description?: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
  },
  institutionId: number,
  accessToken?: string
): Promise<GoogleMeetEvent> => {
  const res = await apiClient.post({
    url: `/admin/integration-online-meeting/connections/${connectionId}/meetings`,
    data: meetingData,
    params: { accessToken, institutionId },
    needAuth: true,
  })

  if (res.data && res.data.success && res.data.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to create meeting',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_EVENT_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Update an existing meeting
 * @param connectionId - Online meeting connection ID
 * @param meetingId - Meeting ID
 * @param meetingData - Meeting data to update
 * @param accessToken - Optional access token for authentication
 * @returns Promise with updated meeting details
 */
export const updateMeeting = async (
  connectionId: number,
  meetingId: string,
  meetingData: {
    summary?: string
    description?: string
    start?: { dateTime: string; timeZone: string }
    end?: { dateTime: string; timeZone: string }
  },
  accessToken?: string
): Promise<GoogleMeetEvent> => {
  const res = await apiClient.patch({
    url: `/admin/integration-online-meeting/connections/${connectionId}/meetings/${meetingId}`,
    data: meetingData,
    params: { accessToken },
    needAuth: true,
  })

  if (res.data && res.data.success && res.data.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message: res.data?.message || 'Failed to update meeting',
        errorCode: res.data?.errorCode || ErrorCodes.CALENDAR_EVENT_ERROR,
      },
    },
  }
  throw errorResponse
}

/**
 * Delete a meeting
 * @param connectionId - Online meeting connection ID
 * @param meetingId - Meeting ID
 * @param accessToken - Optional access token for authentication
 */
export const deleteMeeting = async (
  connectionId: number,
  meetingId: string,
  accessToken?: string
): Promise<GoogleMeetEvent> => {
  const res = await apiClient.delete({
    url: `/admin/integration-online-meeting/connections/${connectionId}/meetings/${meetingId}`,
    params: { accessToken },
    needAuth: true,
  })

  if (!res) {
    const errorResponse = {
      response: {
        data: {
          message: 'Failed to delete meeting',
          errorCode: ErrorCodes.CALENDAR_EVENT_ERROR,
        },
      },
    }
    throw errorResponse
  }

  return res.data
}

/**
 * Refresh Google token for online meeting integration
 * @param dto - The refresh token DTO containing integration ID, institution ID, idToken and accessToken
 * @returns A promise that resolves to the new access token
 */
export const refreshGoogleToken = async ({
  institutionId,
  integrationOnlineMeetingId,
  idToken,
  accessToken,
}: RefreshGoogleTokenDto): Promise<string> => {
  const res = await apiClient.post({
    url: '/admin/integration-online-meeting/refresh-google-token',
    data: { institutionId, integrationOnlineMeetingId, idToken, accessToken },
    needAuth: true,
  })

  if (res?.data?.data) {
    return res.data.data
  }

  const errorResponse = {
    response: {
      data: {
        message: res?.data?.message || 'Failed to refresh Google token',
        errorCode:
          res?.data?.errorCode || ErrorCodes.GOOGLE_TOKEN_REFRESH_ERROR,
      },
    },
  }
  throw errorResponse
}
