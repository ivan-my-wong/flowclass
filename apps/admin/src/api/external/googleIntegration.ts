// --- Types ---
import type {
  GoogleCalendarEvent,
  GoogleCalendarItem,
} from '@/types/external/googleCalendar.type'
import type {
  CreateSheetPayload,
  DriveCreateFolderPayload,
  DriveCreateFolderResponse,
  DriveDownloadResponse,
  DriveFileUploadPayload,
  DriveSearchPayload,
  DriveSetRootFolderPayload,
  DriveUploadResponse,
  DriveValidatePermissionPayload,
  DriveValidatePermissionResponse,
  GoogleAuthUrlResponse,
  GoogleDriveFile,
  GoogleDriveFolder,
  GoogleDriveFoldersResponse,
  GoogleDriveIntegrationStatus,
  GoogleDriveQuotaResponse,
  GoogleIntegrationStatus,
  GoogleServiceType,
  GoogleSheetConfiguration, // Ensuring this is correctly used from imports
  HandleGoogleOAuthCallbackPayload,
  IntegrationGoogleEntity,
  UpdateSheetConfigurationPayload,
} from '@/types/external/googleIntegration.type'
import type {
  CreateIntegrationCalendarDto,
  IntegrationCalendar,
  UpdateIntegrationCalendarDto, // Using the imported Update DTO
} from '@/types/integrationCalendar.type'
import type {
  CreateIntegrationOnlineMeetingDto,
  GoogleMeetEvent,
  IntegrationOnlineMeeting,
  UpdateIntegrationOnlineMeetingDto, // Using the imported Update DTO
} from '@/types/integrationOnlineMeeting.type'

import apiClient from '../index'

export interface HandleGoogleOAuthCallbackDto {
  authCode: string
  serviceType: GoogleServiceType
}

export interface DisconnectGoogleDto {
  serviceType: GoogleServiceType
}

export interface DisconnectGoogleIntegrationResponse {
  message: string
  tokensRevoked: boolean
}

// For Calendar Events (matching backend DTOs)
export interface CreateCalendarEventDto {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  attendees?: Array<{ email: string }>
  conferenceData?: any
}
export type UpdateCalendarEventDto = Partial<CreateCalendarEventDto>

// For Calendar Token Refresh (matching backend DTOs)
export interface RefreshCalendarTokenDto {
  integrationId: number
  institutionId: number // As per controller, though backend might derive from user
}

// For Meet Events (matching backend DTOs)
export interface CreateMeetingEventDto {
  summary: string
  description?: string
  startDateTime: string // ISO string
  endDateTime: string // ISO string
  timeZone?: string
  createCalendarEvent?: boolean
}
export type UpdateMeetingEventDto = Partial<CreateMeetingEventDto>

// For Meet Token Refresh (matching backend DTOs)
export interface RefreshGoogleMeetTokenDto {
  integrationId: number
  institutionId: number // As per controller
}

const API_BASE_URL = '/admin/integrations/google'

// --- Generic Auth Routes ---
export const getGoogleAuthUrl = async (
  institutionId: number,
  scopes: string[],
  serviceType: GoogleServiceType,
  redirectUri: string,
  userId: number
): Promise<GoogleAuthUrlResponse> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/auth-url`,
    params: { institutionId, scopes, serviceType, redirectUri },
    needAuth: true,
  })

  return response.data.data
}

export const handleGoogleOAuthCallback = async (
  payload: HandleGoogleOAuthCallbackPayload,
  institutionId?: string | number
): Promise<IntegrationGoogleEntity> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/oauth-callback`,
    data: payload,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return response.data.data as IntegrationGoogleEntity
}

export const disconnectGoogleIntegration = async (
  disconnectDto: DisconnectGoogleDto
): Promise<void> => {
  await apiClient.post({
    url: `${API_BASE_URL}/disconnect`,
    data: disconnectDto,
    needAuth: true,
  })
}

// --- Google Sheets Specific Routes ---
export const getSheetIntegrationStatus = async (
  institutionId: number
): Promise<GoogleIntegrationStatus> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/sheets/status`,
    params: { institutionId },
    needAuth: true,
  })
  return response.data
}

export const listGoogleDriveFolders = async (): Promise<
  GoogleDriveFolder[]
> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/sheets/drive/folders`,
    needAuth: true,
  })
  return response.data
}

export const createOrUpdateGoogleSheet = async (
  createSheetDto: CreateSheetPayload
): Promise<GoogleSheetConfiguration> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/sheets/sheet`,
    data: createSheetDto,
    needAuth: true,
  })
  return response.data
}

export const updateGoogleSheetConfiguration = async (
  payload: UpdateSheetConfigurationPayload
): Promise<GoogleSheetConfiguration> => {
  return createOrUpdateGoogleSheet(payload as CreateSheetPayload)
}

// --- Google Calendar Specific Routes ---
export const getAllCalendarIntegrations = async (
  institutionId: number
): Promise<IntegrationCalendar[]> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/calendar/connections`,
    params: { institutionId },
    needAuth: true,
  })
  return response.data
}

export const createCalendarIntegration = async (
  createDto: CreateIntegrationCalendarDto
): Promise<IntegrationCalendar> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/calendar/connections`,
    data: createDto,
    needAuth: true,
  })
  return response.data
}

export const getCalendarIntegrationById = async (
  id: number
): Promise<IntegrationCalendar> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/calendar/connections/${id}`,
    needAuth: true,
  })
  return response.data
}

export const updateCalendarIntegration = async (
  id: number,
  updateDto: Partial<UpdateIntegrationCalendarDto> // Using imported DTO
): Promise<IntegrationCalendar> => {
  const response = await apiClient.patch({
    url: `${API_BASE_URL}/calendar/connections/${id}`,
    data: updateDto,
    needAuth: true,
  })
  return response.data
}

export const updatePrimaryCalendar = async (payload: {
  integrationId: number
  calendarId: string
  calendarName: string
}): Promise<IntegrationCalendar> => {
  return updateCalendarIntegration(payload.integrationId, {
    isPrimary: true,
    calendarName: payload.calendarName,
  })
}

export const deleteCalendarIntegration = async (id: number): Promise<void> => {
  await apiClient.delete({
    url: `${API_BASE_URL}/calendar/connections/${id}`,
    needAuth: true,
  })
}

export const toggleCalendarIntegration = async (
  id: number
): Promise<IntegrationCalendar> => {
  const response = await apiClient.patch({
    url: `${API_BASE_URL}/calendar/connections/${id}/toggle`,
    needAuth: true,
  })
  return response.data
}

export const getGoogleCalendarList = async (
  integrationId: number
): Promise<GoogleCalendarItem[]> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/calendar/connections/${integrationId}/calendars`,
    needAuth: true,
  })
  return response.data
}

export const listCalendarEvents = async (
  integrationId: number,
  calendarApiId: string,
  startDate?: string,
  endDate?: string
): Promise<GoogleCalendarEvent[]> => {
  const params: Record<string, string> = { calendarApiId }
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const response = await apiClient.get({
    url: `${API_BASE_URL}/calendar/connections/${integrationId}/events`,
    params,
    needAuth: true,
  })
  return response.data
}

export const createCalendarEvent = async (
  integrationId: number,
  calendarApiId: string,
  eventData: CreateCalendarEventDto
): Promise<GoogleCalendarEvent> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/calendar/connections/${integrationId}/events`,
    params: { calendarApiId },
    data: eventData,
    needAuth: true,
  })
  return response.data
}

export const getCalendarEvent = async (
  integrationId: number,
  calendarApiId: string,
  eventId: string
): Promise<GoogleCalendarEvent> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/calendar/connections/${integrationId}/events/${eventId}`,
    params: { calendarApiId },
    needAuth: true,
  })
  return response.data
}

export const updateCalendarEvent = async (
  integrationId: number,
  calendarApiId: string,
  eventId: string,
  eventData: UpdateCalendarEventDto
): Promise<GoogleCalendarEvent> => {
  const response = await apiClient.patch({
    url: `${API_BASE_URL}/calendar/connections/${integrationId}/events/${eventId}`,
    params: { calendarApiId },
    data: eventData,
    needAuth: true,
  })
  return response.data
}

export const deleteCalendarEvent = async (
  integrationId: number,
  calendarApiId: string,
  eventId: string
): Promise<void> => {
  await apiClient.delete({
    url: `${API_BASE_URL}/calendar/connections/${integrationId}/events/${eventId}`,
    params: { calendarApiId },
    needAuth: true,
  })
}

export const refreshCalendarToken = async (
  refreshTokenDto: RefreshCalendarTokenDto
): Promise<IntegrationCalendar> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/calendar/refresh-token`,
    data: refreshTokenDto,
    needAuth: true,
  })
  return response.data
}

// --- Google Meet Specific Routes ---
export const getAllMeetIntegrations = async (
  institutionId: number
): Promise<IntegrationOnlineMeeting[]> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/meet/connections`,
    params: { institutionId },
    needAuth: true,
  })
  return response.data
}

export const createMeetIntegration = async (
  createDto: CreateIntegrationOnlineMeetingDto
): Promise<IntegrationOnlineMeeting> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/meet/connections`,
    data: createDto,
    needAuth: true,
  })
  return response.data
}

export const getMeetIntegrationById = async (
  id: number
): Promise<IntegrationOnlineMeeting> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/meet/connections/${id}`,
    needAuth: true,
  })
  return response.data
}

export const updateMeetIntegration = async (
  id: number,
  updateDto: Partial<UpdateIntegrationOnlineMeetingDto> // Using imported DTO
): Promise<IntegrationOnlineMeeting> => {
  const response = await apiClient.patch({
    url: `${API_BASE_URL}/meet/connections/${id}`,
    data: updateDto,
    needAuth: true,
  })
  return response.data
}

export const deleteMeetIntegration = async (id: number): Promise<void> => {
  await apiClient.delete({
    url: `${API_BASE_URL}/meet/connections/${id}`,
    needAuth: true,
  })
}

export const toggleMeetIntegration = async (
  id: number
): Promise<IntegrationOnlineMeeting> => {
  const response = await apiClient.patch({
    url: `${API_BASE_URL}/meet/connections/${id}/toggle`,
    needAuth: true,
  })
  return response.data
}

export const createMeetMeetingAndEvent = async (
  integrationId: number,
  meetingData: CreateMeetingEventDto
): Promise<any> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/meet/connections/${integrationId}/meetings`,
    data: meetingData,
    needAuth: true,
  })
  return response.data // Backend returns { space, event }
}

export const getMeetSpaceList = async (
  integrationId: number
): Promise<GoogleMeetEvent[]> => {
  console.warn(
    'getMeetSpaceList called, but endpoint fetches meetings. Consider using getMeetMeetings.'
  )
  const response = await apiClient.get({
    url: `${API_BASE_URL}/meet/connections/${integrationId}/meetings`,
    needAuth: true,
  })
  return response.data // Returns array of meeting events
}

export const getMeetSpace = async (
  integrationId: number,
  meetingName: string
): Promise<any> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/meet/connections/${integrationId}/meetings/${meetingName}`,
    needAuth: true,
  })
  return response.data // Define MeetSpace type if available
}

export const updateMeetMeeting = async (
  integrationId: number,
  meetingName: string,
  meetingData: UpdateMeetingEventDto
): Promise<any> => {
  const response = await apiClient.patch({
    url: `${API_BASE_URL}/meet/connections/${integrationId}/meetings/${meetingName}`,
    data: meetingData,
    needAuth: true,
  })
  return response.data // Define specific return type
}

export const deleteMeetMeeting = async (
  integrationId: number,
  meetingName: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.delete({
    url: `${API_BASE_URL}/meet/connections/${integrationId}/meetings/${meetingName}`,
    needAuth: true,
  })
  return response.data
}

export const refreshMeetToken = async (
  refreshTokenDto: RefreshGoogleMeetTokenDto
): Promise<IntegrationOnlineMeeting> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/meet/refresh-token`,
    data: refreshTokenDto,
    needAuth: true,
  })
  return response.data
}

// --- Google Drive Specific Routes ---
export const getDriveStatus = async (
  institutionId?: string | number
): Promise<GoogleDriveIntegrationStatus> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/status`,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return response.data.data
}

export const getDriveFolder = async (
  parentFolderId: string,
  institutionId?: string | number
): Promise<GoogleDriveFoldersResponse> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/folders`,
    needAuth: true,
    params: { parentFolderId, institutionId },
  })
  return response.data
}

export const getDriveFiles = async (
  folderId: string,
  mimeTypeFilter?: string
): Promise<GoogleDriveFile[]> => {
  const params: Record<string, string> = { folderId }
  if (mimeTypeFilter) params.mimeTypeFilter = mimeTypeFilter
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/files`,
    needAuth: true,
    params,
  })

  return response.data
}

export const getDriveFile = async (
  fileId: string
): Promise<GoogleDriveFile> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/files/${fileId}`,
    needAuth: true,
  })
  return response.data
}

export const getDriveFileDownload = async (
  fileId: string
): Promise<DriveDownloadResponse> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/files/${fileId}/download`,
    needAuth: true,
  })
  return response.data
}

export const driveCreateFolder = async (
  folderName: string,
  parentFolderId?: string,
  institutionId?: string | number
): Promise<DriveCreateFolderResponse> => {
  const payload: DriveCreateFolderPayload = {
    folderName,
    parentFolderId,
  }

  const response = await apiClient.post({
    url: `${API_BASE_URL}/drive/folders`,
    data: payload,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return response.data
}

export const driveSetRootFolder = async (
  body: DriveSetRootFolderPayload,
  institutionId?: string | number
): Promise<GoogleDriveIntegrationStatus> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/drive/root-folder`,
    data: body,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return response.data
}

export const driveUpload = async (
  body: DriveFileUploadPayload,
  institutionId: string | number
): Promise<DriveUploadResponse> => {
  const form = new FormData()
  form.append('file', body.file)
  if (body.parentFolderId) form.append('parentFolderId', body.parentFolderId)
  if (body.description) form.append('description', body.description)
  if (typeof body.overwrite === 'boolean') {
    form.append('overwrite', String(body.overwrite))
  }
  const response = await apiClient.post({
    url: `${API_BASE_URL}/drive/upload?institutionId=${institutionId}`,
    data: form,
    needAuth: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const driveDownloadByUrl = async (
  driveUrl: string
): Promise<DriveDownloadResponse> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/drive/download-by-url`,
    data: { driveUrl },
    needAuth: true,
  })
  return response.data
}

// Additional useful Drive API functions
export const driveSearchFiles = async (
  searchPayload: DriveSearchPayload
): Promise<GoogleDriveFile[]> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/search`,
    params: searchPayload,
    needAuth: true,
  })
  return response.data
}

export const driveDeleteFile = async (
  fileId: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.delete({
    url: `${API_BASE_URL}/drive/files/${fileId}`,
    needAuth: true,
  })
  return response.data
}

export const driveQuota = async (
  institutionId?: string | number
): Promise<GoogleDriveQuotaResponse> => {
  const response = await apiClient.get({
    url: `${API_BASE_URL}/drive/quota`,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return response.data
}

export const driveValidatePermission = async (
  body: DriveValidatePermissionPayload
): Promise<DriveValidatePermissionResponse> => {
  const response = await apiClient.post({
    url: `${API_BASE_URL}/drive/validate-folder-access`,
    data: body,
    needAuth: true,
  })
  return response.data
}
