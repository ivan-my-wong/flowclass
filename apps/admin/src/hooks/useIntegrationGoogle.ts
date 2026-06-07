import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query'
import { toast } from 'sonner'

import { handleApiError } from '@/api/errors/apiError'
// API Client (Assuming merged file `googleIntegration.ts` exists)
import {
  createCalendarEvent as apiCreateCalendarEvent,
  createCalendarIntegration as apiCreateCalendarIntegration,
  createMeetIntegration as apiCreateMeetIntegration,
  createMeetMeetingAndEvent as apiCreateMeetMeetingAndEvent,
  createOrUpdateGoogleSheet as apiCreateOrUpdateGoogleSheet,
  deleteCalendarEvent as apiDeleteCalendarEvent,
  deleteMeetMeeting as apiDeleteMeetMeeting,
  DisconnectGoogleDto,
  disconnectGoogleIntegration as apiDisconnectIntegration, // Consistent renaming
  driveCreateFolder,
  driveDeleteFile,
  driveDownloadByUrl,
  driveQuota,
  driveSearchFiles,
  driveSetRootFolder,
  driveUpload,
  driveValidatePermission,
  // Calendar
  getAllCalendarIntegrations as apiGetAllCalendarIntegrations,
  // Meet
  getAllMeetIntegrations as apiGetAllMeetIntegrations,
  getDriveFile,
  getDriveFileDownload,
  getDriveFiles,
  getDriveFolder,
  getDriveStatus,
  getGoogleAuthUrl as apiGetGoogleAuthUrl,
  // Generic
  getGoogleCalendarList,
  getMeetSpace as apiGetMeetSpace,
  getMeetSpaceList,
  // Sheets
  getSheetIntegrationStatus as apiGetSheetIntegrationStatus,
  handleGoogleOAuthCallback as apiHandleGoogleOAuthCallback,
  listCalendarEvents,
  listGoogleDriveFolders,
  toggleCalendarIntegration, // Assumes exists
  toggleMeetIntegration,
  updateCalendarEvent as apiUpdateCalendarEvent,
  updateGoogleSheetConfiguration,
  updateMeetIntegration as apiUpdateMeetMeeting,
  updatePrimaryCalendar as apiUpdatePrimaryCalendar,
} from '@/api/external/googleIntegration' // Using the merged API client file
import { QUERY_KEY } from '@/constants/queryKey' // Added import
import {
  GoogleCalendarEvent,
  GoogleCalendarItem,
} from '@/types/external/googleCalendar.type'
// Types
// Assuming GoogleServiceType enum is defined and exported correctly
import {
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
  GoogleServiceType as GoogleServiceTypeValue,
  GoogleSheetConfiguration,
  HandleGoogleOAuthCallbackPayload, // Now correctly imported
  IntegrationGoogleEntity, // Now correctly imported
  UpdateSheetConfigurationPayload,
} from '@/types/external/googleIntegration.type'
import {
  CalendarProvider,
  CreateIntegrationCalendarDto, // Use DTO name directly
  IntegrationCalendar,
} from '@/types/integrationCalendar.type'
import {
  CreateIntegrationOnlineMeetingDto, // Use DTO name directly
  GoogleMeetEvent,
  IntegrationOnlineMeeting,
  OnlineMeetingProvider,
} from '@/types/integrationOnlineMeeting.type'

// TODO: Define a generic IntegrationGoogle type if needed
// Hooks and Utils
import useAuth from './useAuth'
import useSchoolData from './useSchoolData'

// Return type for the unified hook
export interface UseGoogleIntegrationReturn {
  // Status & Connections
  sheetIntegrationStatus: UseQueryResult<GoogleIntegrationStatus, Error>
  calendarConnections: UseQueryResult<IntegrationCalendar[], Error>
  meetConnections: UseQueryResult<IntegrationOnlineMeeting[], Error>
  selectedCalendarIntegration: IntegrationCalendar | undefined
  selectedMeetIntegration: IntegrationOnlineMeeting | undefined

  // Auth & General Actions
  isAuthLoading: boolean
  getAuthUrl: UseMutationResult<
    GoogleAuthUrlResponse,
    Error,
    {
      scopes: string[]
      serviceType: GoogleServiceType
      redirectUri: string
      userId: number
    },
    unknown
  >
  handleGoogleAuthCallback: UseMutationResult<
    IntegrationGoogleEntity,
    Error,
    HandleGoogleOAuthCallbackPayload, // Payload includes redirectUri
    unknown
  >
  connectCalendar: UseMutationResult<IntegrationCalendar, Error, void, unknown>
  connectMeet: UseMutationResult<IntegrationOnlineMeeting, Error, void, unknown>
  disconnectIntegration: UseMutationResult<
    void,
    Error,
    DisconnectGoogleDto, // Use the DTO type here
    unknown
  >
  toggleCalendarStatus: UseMutationResult<
    IntegrationCalendar,
    Error,
    number,
    unknown
  >
  toggleMeetStatus: UseMutationResult<
    IntegrationOnlineMeeting,
    Error,
    number,
    unknown
  >

  // Sheets Specific
  refetchSheetIntegrationStatus: () => void
  driveFolders: UseQueryResult<GoogleDriveFolder[], Error>
  fetchDriveFolders: (enabled?: boolean) => void
  createSheet: UseMutationResult<
    GoogleSheetConfiguration,
    Error,
    CreateSheetPayload
  >
  updateSheetConfig: UseMutationResult<
    GoogleSheetConfiguration,
    Error,
    UpdateSheetConfigurationPayload,
    unknown
  >

  // Calendar Specific
  googleCalendars: UseQueryResult<GoogleCalendarItem[], Error>
  useFetchCalendarEvents: (
    integrationId: number | undefined,
    calendarApiId: string | undefined,
    startDate?: string,
    endDate?: string
  ) => UseQueryResult<GoogleCalendarEvent[], Error>
  updatePrimaryCalendar: UseMutationResult<
    IntegrationCalendar,
    Error,
    { integrationId: number; calendarId: string; calendarName: string },
    unknown
  >
  createCalendarEvent: UseMutationResult<
    GoogleCalendarEvent,
    Error,
    { integrationId: number; calendarApiId: string; eventData: any },
    unknown
  >
  updateCalendarEvent: UseMutationResult<
    GoogleCalendarEvent,
    Error,
    {
      integrationId: number
      calendarApiId: string
      eventId: string
      eventData: any
    },
    unknown
  >
  deleteCalendarEvent: UseMutationResult<
    void,
    Error,
    { integrationId: number; calendarApiId: string; eventId: string },
    unknown
  >

  // Meet Specific
  googleMeetEvents: UseQueryResult<GoogleMeetEvent[], Error>
  useFetchMeetSpace: (
    integrationId: number | undefined,
    meetingName: string | undefined
  ) => UseQueryResult<any, Error>
  createMeetMeeting: UseMutationResult<
    any,
    Error,
    { integrationId: number; meetingData: any },
    unknown
  >
  updateMeetMeeting: UseMutationResult<
    IntegrationOnlineMeeting,
    Error,
    { integrationId: number; isPrimary: boolean; isEnabled: boolean },
    unknown
  >
  deleteMeetMeeting: UseMutationResult<
    { success: boolean },
    Error,
    { integrationId: number; meetingName: string },
    unknown
  >

  driveIntegrationStatus: UseQueryResult<GoogleDriveIntegrationStatus, Error>
  useDriveFolders: (
    parentFolderId?: string
  ) => UseQueryResult<GoogleDriveFoldersResponse, Error>
  fetchDriveFolderByParent: (
    parentFolderId?: string
  ) => Promise<GoogleDriveFoldersResponse>
  useDriveFiles: (
    folderId?: string,
    mimeTypeFilter?: string
  ) => UseQueryResult<GoogleDriveFile[], Error>
  useDriveFile: (fileId?: string) => UseQueryResult<GoogleDriveFile, Error>
  useDriveFileDownload: (
    fileId?: string
  ) => UseQueryResult<DriveDownloadResponse, Error>
  useDriveSearch: (
    searchPayload?: DriveSearchPayload
  ) => UseQueryResult<GoogleDriveFile[], Error>
  useDriveQuota: (
    parentFolderId?: string
  ) => UseQueryResult<GoogleDriveQuotaResponse, Error>

  createDriveFolder: UseMutationResult<
    DriveCreateFolderResponse,
    Error,
    DriveCreateFolderPayload,
    unknown
  >
  setRootDriveFolder: UseMutationResult<
    GoogleDriveIntegrationStatus,
    Error,
    DriveSetRootFolderPayload,
    unknown
  >
  uploadDriveFile: UseMutationResult<
    DriveUploadResponse,
    Error,
    DriveFileUploadPayload,
    unknown
  >
  downloadDriveByUrl: UseMutationResult<
    DriveDownloadResponse,
    Error,
    { driveUrl: string },
    unknown
  >
  deleteDriveFile: UseMutationResult<
    { success: boolean },
    Error,
    { fileId: string },
    unknown
  >
  validateFolderAccess: UseMutationResult<
    DriveValidatePermissionResponse,
    Error,
    DriveValidatePermissionPayload,
    unknown
  >
}

// The Unified Hook
export const useIntegrationGoogle = (): UseGoogleIntegrationReturn => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['integrations', 'integration', 'availability'])
  const { currentSchool } = useSchoolData()
  const institutionId = currentSchool?.id ?? 0
  const { isLogin } = useAuth()

  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // --- Queries ---
  const sheetIntegrationStatus = useQuery<GoogleIntegrationStatus, Error>(
    // Use imported key
    [...QUERY_KEY.googleIntegration.sheetStatusKey, institutionId],
    () => apiGetSheetIntegrationStatus(institutionId),
    { enabled: false }
  )

  const driveFolders = useQuery<GoogleDriveFolder[], Error>(
    // Use imported key
    [...QUERY_KEY.googleIntegration.driveFoldersKey, institutionId],
    () => listGoogleDriveFolders(),
    { enabled: false }
  )

  const calendarConnections = useQuery<IntegrationCalendar[], Error>(
    // Use imported key
    [...QUERY_KEY.googleIntegration.calendarConnectionsKey, institutionId],
    () => apiGetAllCalendarIntegrations(institutionId ?? 0),
    {
      enabled: false,
      onError: error => handleApiError({ error, t }),
    }
  )
  const selectedCalendarIntegration = calendarConnections.data?.[0]

  const googleCalendars = useQuery<GoogleCalendarItem[], Error>(
    // Use imported key
    [
      ...QUERY_KEY.googleIntegration.calendarListKey,
      selectedCalendarIntegration?.id,
    ],
    () => getGoogleCalendarList(selectedCalendarIntegration!.id),
    {
      enabled: false,
      onError: error => handleApiError({ error, t }),
    }
  )

  const useFetchCalendarEvents = (
    integrationId: number | undefined,
    calendarApiId: string | undefined,
    startDate?: string,
    endDate?: string
  ) =>
    useQuery<GoogleCalendarEvent[], Error>(
      [
        // Use imported key
        ...QUERY_KEY.googleIntegration.calendarEventsKey,
        integrationId,
        calendarApiId,
        startDate,
        endDate,
      ],
      () =>
        listCalendarEvents(
          integrationId ?? 0,
          calendarApiId ?? '',
          startDate,
          endDate
        ),
      {
        enabled: false,
        onError: error => handleApiError({ error, t }),
      }
    )

  const meetConnections = useQuery<IntegrationOnlineMeeting[], Error>(
    // Use imported key
    [...QUERY_KEY.googleIntegration.meetConnectionsKey, institutionId],
    () => apiGetAllMeetIntegrations(institutionId ?? 0),
    {
      enabled: false,
      onError: error => handleApiError({ error, t }),
    }
  )
  const selectedMeetIntegration = meetConnections.data?.[0]

  const googleMeetEvents = useQuery<GoogleMeetEvent[], Error>(
    // Use imported key
    [...QUERY_KEY.googleIntegration.meetEventsKey, selectedMeetIntegration?.id],
    () => getMeetSpaceList(selectedMeetIntegration?.id ?? 0),
    {
      enabled: false,
      onError: error => handleApiError({ error, t }),
    }
  )

  const useFetchMeetSpace = (
    integrationId: number | undefined,
    meetingName: string | undefined
  ) =>
    useQuery<any, Error>(
      // Use imported key
      [...QUERY_KEY.googleIntegration.meetSpaceKey, integrationId, meetingName],
      () => apiGetMeetSpace(integrationId!, meetingName!),
      {
        enabled: false,
        onError: error => handleApiError({ error, t }),
      }
    )

  // --- Mutations ---
  const getAuthUrl = useMutation<
    GoogleAuthUrlResponse,
    Error,
    {
      scopes: string[]
      serviceType: GoogleServiceType
      redirectUri: string
      userId: number
    },
    unknown
  >(
    async ({ scopes, serviceType, redirectUri, userId }) => {
      const res = await apiGetGoogleAuthUrl(
        institutionId,
        scopes,
        serviceType,
        redirectUri,
        userId
      )
      return res
    },
    {
      onSuccess: (data, variables) => {
        toast.success(
          t('notifications.authUrlGenerated', {
            service: variables.serviceType,
          })
        )
      },
      onError: error => {
        toast.error(
          t('errors.getAuthUrlFailed', {
            error: error.message,
          })
        )
      },
    }
  )

  const handleGoogleAuthCallback = useMutation<
    IntegrationGoogleEntity,
    Error,
    HandleGoogleOAuthCallbackPayload, // Payload includes redirectUri
    unknown
  >(
    async payload => {
      return apiHandleGoogleOAuthCallback(payload, institutionId)
    },
    {
      onSuccess: (data, variables) => {
        toast.success(
          t('notifications.googleConnected', {
            service: variables.serviceType,
          })
        )
        const service = variables.serviceType
        if (service === GoogleServiceTypeValue.SHEETS) {
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.sheetStatusKey
          )
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.driveFoldersKey
          )
        } else if (service === GoogleServiceTypeValue.CALENDAR) {
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.calendarConnectionsKey
          )
        } else if (service === GoogleServiceTypeValue.MEET) {
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.meetConnectionsKey
          )
        } else if (service === GoogleServiceTypeValue.DRIVE) {
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.driveStatusKey
          )
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.driveFoldersKey
          )
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.driveFilesKey
          )
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.driveQuotaKey
          )
        }
      },
      onError: (error, variables) => {
        toast.error(
          t('errors.googleConnectFailed', {
            service: variables.serviceType,
            error: error.message,
          })
        )
        handleApiError({ error, t })
      },
    }
  )

  const disconnectIntegration = useMutation<void, Error, DisconnectGoogleDto>(
    disconnectDto => apiDisconnectIntegration(disconnectDto),
    {
      onSuccess: (_, variables) => {
        toast.success(
          t('googleDrove.account.disconnectSuccess', {
            service: variables.serviceType,
          })
        )
        const service = variables.serviceType
        if (service === GoogleServiceTypeValue.SHEETS) {
          // Use imported key
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.sheetStatusKey
          )
          queryClient.removeQueries(QUERY_KEY.googleIntegration.driveFoldersKey)
        } else if (service === GoogleServiceTypeValue.CALENDAR) {
          // Use imported key
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.calendarConnectionsKey
          )
          queryClient.removeQueries(QUERY_KEY.googleIntegration.calendarListKey)
          queryClient.removeQueries(
            QUERY_KEY.googleIntegration.calendarEventsKey
          )
        } else if (service === GoogleServiceTypeValue.MEET) {
          // Use imported key
          queryClient.invalidateQueries(
            QUERY_KEY.googleIntegration.meetConnectionsKey
          )
          queryClient.removeQueries(QUERY_KEY.googleIntegration.meetEventsKey)
          queryClient.removeQueries(QUERY_KEY.googleIntegration.meetSpaceKey)
        }
      },
      onError: (error, variables) => {
        toast.error(
          t('errors.disconnectFailed', {
            service: variables.serviceType,
            error: error.message,
          })
        )
        handleApiError({ error, t })
      },
    }
  )

  const connectCalendar = useMutation<IntegrationCalendar, Error, void>(
    async () => {
      setIsAuthLoading(true)
      try {
        throw new Error('Google popup authentication is disabled in OSS mode.')
      } finally {
        setIsAuthLoading(false)
      }
    },
    {
      onSuccess: () => {
        toast.success(t('availability.integrationCalendared'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.calendarConnectionsKey
        )
      },
      onError: error => {
        toast.error(t('availability.errors.connectCalendar'))
        handleApiError({ error, t })
      },
    }
  )

  const connectMeet = useMutation<IntegrationOnlineMeeting, Error, void>(
    async () => {
      setIsAuthLoading(true)
      try {
        throw new Error('Google popup authentication is disabled in OSS mode.')
      } finally {
        setIsAuthLoading(false)
      }
    },
    {
      onSuccess: () => {
        toast.success(t('onlineMeeting.integrationConnected'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.meetConnectionsKey
        )
      },
      onError: error => {
        toast.error(t('onlineMeeting.errors.connectOnlineMeeting'))
        handleApiError({ error, t })
      },
    }
  )

  // --- Sheets Mutations ---
  const refetchSheetIntegrationStatus = () => {
    queryClient.invalidateQueries([
      ...QUERY_KEY.googleIntegration.sheetStatusKey,
      institutionId,
    ])
  }

  const fetchDriveFolders = (enabled = true) => {
    if (enabled && institutionId) {
      queryClient.prefetchQuery(
        [...QUERY_KEY.googleIntegration.driveFoldersKey, institutionId],
        () => listGoogleDriveFolders()
      )
    }
  }

  const createSheet = useMutation<
    GoogleSheetConfiguration,
    Error,
    CreateSheetPayload
  >(payload => apiCreateOrUpdateGoogleSheet(payload), {
    onSuccess: () => {
      toast.success(t('googleSheet.createSuccess'))
      queryClient.invalidateQueries([
        ...QUERY_KEY.googleIntegration.sheetStatusKey,
        institutionId,
      ])
    },
    onError: error => {
      toast.error(
        t('googleSheet.errors.createFailed', { error: error.message })
      )
      handleApiError({ error, t })
    },
  })

  const updateSheetConfig = useMutation<
    GoogleSheetConfiguration,
    Error,
    UpdateSheetConfigurationPayload
  >(
    (data: UpdateSheetConfigurationPayload) =>
      updateGoogleSheetConfiguration(data),
    {
      onSuccess: () => {
        toast.success(t('googleSheet.updateConfigSuccess'))
        queryClient.invalidateQueries([
          ...QUERY_KEY.googleIntegration.sheetStatusKey,
          institutionId,
        ])
      },
      onError: error => {
        toast.error(
          t('googleSheet.errors.updateConfigFailed', {
            error: error.message,
          })
        )
        handleApiError({ error, t })
      },
    }
  )

  // --- Calendar Mutations ---
  const updatePrimaryCalendar = useMutation<
    IntegrationCalendar,
    Error,
    { integrationId: number; calendarId: string; calendarName: string }
  >(payload => apiUpdatePrimaryCalendar(payload), {
    onSuccess: () => {
      toast.success(t('googleCalendar.primaryCalendarUpdated'))
      queryClient.invalidateQueries(
        QUERY_KEY.googleIntegration.calendarConnectionsKey
      )
    },
    onError: error => {
      toast.error(t('googleCalendar.errors.updatePrimaryCalendar'))
      handleApiError({ error, t })
    },
  })

  const createCalendarEvent = useMutation<
    GoogleCalendarEvent,
    Error,
    { integrationId: number; calendarApiId: string; eventData: any },
    unknown
  >(
    ({ integrationId, calendarApiId, eventData }) =>
      apiCreateCalendarEvent(integrationId, calendarApiId, eventData),
    {
      onSuccess: () => {
        toast.success(t('availability.eventCreated'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.calendarEventsKey
        )
      },
      onError: error => {
        toast.error(t('availability.errors.createEventFailed'))
        handleApiError({ error, t })
      },
    }
  )

  const updateCalendarEvent = useMutation<
    GoogleCalendarEvent,
    Error,
    {
      integrationId: number
      calendarApiId: string
      eventId: string
      eventData: any
    },
    unknown
  >(
    ({ integrationId, calendarApiId, eventId, eventData }) =>
      apiUpdateCalendarEvent(integrationId, calendarApiId, eventId, eventData),
    {
      onSuccess: () => {
        toast.success(t('availability.eventUpdated'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.calendarEventsKey
        )
      },
      onError: error => {
        toast.error(t('availability.errors.updateEventFailed'))
        handleApiError({ error, t })
      },
    }
  )

  const deleteCalendarEvent = useMutation<
    void,
    Error,
    { integrationId: number; calendarApiId: string; eventId: string },
    unknown
  >(
    ({ integrationId, calendarApiId, eventId }) =>
      apiDeleteCalendarEvent(integrationId, calendarApiId, eventId),
    {
      onSuccess: () => {
        toast.success(t('availability.eventDeleted'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.calendarEventsKey
        )
      },
      onError: error => {
        toast.error(t('availability.errors.deleteEventFailed'))
        handleApiError({ error, t })
      },
    }
  )

  const toggleCalendarStatus = useMutation<IntegrationCalendar, Error, number>(
    integrationId => toggleCalendarIntegration(integrationId),
    {
      onSuccess: () => {
        toast.success(t('googleCalendar.statusToggled'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.calendarConnectionsKey
        )
      },
      onError: error => {
        toast.error(t('googleCalendar.errors.toggleStatus'))
        handleApiError({ error, t })
      },
    }
  )

  // --- Meet Mutations ---
  const toggleMeetStatus = useMutation<IntegrationOnlineMeeting, Error, number>(
    integrationId => toggleMeetIntegration(integrationId),
    {
      onSuccess: () => {
        toast.success(t('onlineMeeting.statusToggled'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.meetConnectionsKey
        )
      },
      onError: error => {
        toast.error(t('onlineMeeting.errors.toggleStatus'))
        handleApiError({ error, t })
      },
    }
  )

  const createMeetMeeting = useMutation<
    any,
    Error,
    { integrationId: number; meetingData: any }
  >(
    ({ integrationId, meetingData }) =>
      apiCreateMeetMeetingAndEvent(integrationId, meetingData),
    {
      onSuccess: () => {
        toast.success(t('onlineMeeting.meetingCreated'))
        queryClient.invalidateQueries(QUERY_KEY.googleIntegration.meetEventsKey)
      },
      onError: error => {
        toast.error(t('onlineMeeting.errors.createMeeting'))
        handleApiError({ error, t })
      },
    }
  )

  const updateMeetMeeting = useMutation<
    IntegrationOnlineMeeting,
    Error,
    { integrationId: number; isPrimary: boolean; isEnabled: boolean }
  >(
    ({ integrationId, isPrimary, isEnabled }) =>
      apiUpdateMeetMeeting(integrationId, { isPrimary, isEnabled }),
    {
      onSuccess: () => {
        toast.success(t('onlineMeeting.meetingUpdated'))
        queryClient.invalidateQueries(QUERY_KEY.googleIntegration.meetEventsKey)
      },
      onError: error => {
        toast.error(t('onlineMeeting.errors.updateMeeting'))
        handleApiError({ error, t })
      },
    }
  )

  const deleteMeetMeeting = useMutation<
    { success: boolean },
    Error,
    { integrationId: number; meetingName: string }
  >(
    ({ integrationId, meetingName }) =>
      apiDeleteMeetMeeting(integrationId, meetingName),
    {
      onSuccess: () => {
        toast.success(t('onlineMeeting.meetingDeleted'))
        queryClient.invalidateQueries(QUERY_KEY.googleIntegration.meetEventsKey)
      },
      onError: error => {
        toast.error(t('onlineMeeting.errors.deleteMeeting'))
        handleApiError({ error, t })
      },
    }
  )

  // --- Drive Queries with proper types ---
  const driveIntegrationStatus = useQuery<GoogleDriveIntegrationStatus, Error>(
    [...QUERY_KEY.googleIntegration.driveStatusKey, institutionId],
    () => getDriveStatus(institutionId),
    {
      enabled: !!isLogin && !!institutionId,
      onError: error => handleApiError({ error, t }),
    }
  )

  const useDriveFolders = (parentFolderId?: string) =>
    useQuery<GoogleDriveFoldersResponse, Error>(
      [
        ...QUERY_KEY.googleIntegration.driveFoldersKey,
        institutionId,
        parentFolderId,
      ],
      () => getDriveFolder(parentFolderId!, institutionId),
      {
        enabled: !!parentFolderId && !!institutionId,
        onError: error => handleApiError({ error, t }),
      }
    )

  const fetchDriveFolderByParent = async (parentFolderId?: string) => {
    return queryClient.fetchQuery<GoogleDriveFoldersResponse, Error>(
      [
        ...QUERY_KEY.googleIntegration.driveFoldersKey,
        institutionId,
        parentFolderId,
      ],
      () => getDriveFolder(parentFolderId!, institutionId)
    )
  }

  const useDriveFiles = (folderId?: string, mimeTypeFilter?: string) =>
    useQuery<GoogleDriveFile[], Error>(
      [
        ...QUERY_KEY.googleIntegration.driveFilesKey,
        institutionId,
        folderId,
        mimeTypeFilter,
      ],
      () => getDriveFiles(folderId!, mimeTypeFilter),
      {
        enabled: !!folderId,
        onError: error => handleApiError({ error, t }),
      }
    )

  const useDriveFile = (fileId?: string) =>
    useQuery<GoogleDriveFile, Error>(
      [...QUERY_KEY.googleIntegration.driveFileKey, institutionId, fileId],
      () => getDriveFile(fileId!),
      {
        enabled: !!fileId,
        onError: error => handleApiError({ error, t }),
      }
    )

  const useDriveFileDownload = (fileId?: string) =>
    useQuery<DriveDownloadResponse, Error>(
      [
        ...QUERY_KEY.googleIntegration.driveDownloadByUrlKey,
        institutionId,
        fileId,
      ],
      () => getDriveFileDownload(fileId!),
      {
        enabled: !!fileId,
        onError: error => handleApiError({ error, t }),
      }
    )

  const useDriveSearch = (searchPayload?: DriveSearchPayload) =>
    useQuery<GoogleDriveFile[], Error>(
      [
        ...QUERY_KEY.googleIntegration.driveSearchKey,
        institutionId,
        searchPayload,
      ],
      () => driveSearchFiles(searchPayload!),
      {
        enabled: !!searchPayload,
        onError: error => handleApiError({ error, t }),
      }
    )

  // --- Drive Mutations with proper types ---
  const createDriveFolder = useMutation<
    DriveCreateFolderResponse,
    Error,
    DriveCreateFolderPayload
  >(
    (payload: DriveCreateFolderPayload) =>
      driveCreateFolder(
        payload.folderName,
        payload.parentFolderId,
        institutionId
      ),
    {
      onSuccess: data => {
        toast.success(t('googleDrive.folderCreated'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.driveFoldersKey
        )
        // Don't return data here - the mutation already returns it
      },
      onError: error => {
        toast.error(t('googleDrive.errors.createFolderFailed'))
        handleApiError({ error, t })
      },
    }
  )

  const setRootDriveFolder = useMutation<
    GoogleDriveIntegrationStatus,
    Error,
    DriveSetRootFolderPayload
  >(
    (body: DriveSetRootFolderPayload) =>
      driveSetRootFolder(body, institutionId),
    {
      onSuccess: data => {
        toast.success(t('googleDrive.rootFolderSet'))
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.driveStatusKey
        )
        queryClient.invalidateQueries(
          QUERY_KEY.googleIntegration.driveFoldersKey
        )
        // Don't return data here
      },
      onError: error => {
        toast.error(t('googleDrive.errors.setRootFolderFailed'))
        handleApiError({ error, t })
      },
    }
  )

  const uploadDriveFile = useMutation<
    DriveUploadResponse,
    Error,
    DriveFileUploadPayload
  >((body: DriveFileUploadPayload) => driveUpload(body, institutionId), {
    onSuccess: data => {
      toast.success(t('googleDrive.uploadSuccess'))
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveFilesKey)
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveQuotaKey)
    },
    onError: error => {
      toast.error(t('googleDrive.errors.uploadFailed'))
      handleApiError({ error, t })
    },
  })

  const downloadDriveByUrl = useMutation<
    DriveDownloadResponse,
    Error,
    { driveUrl: string }
  >(({ driveUrl }) => driveDownloadByUrl(driveUrl), {
    onSuccess: data => {
      toast.success(t('googleDrive.downloadSuccess'))
      // Don't return data here
    },
    onError: error => {
      toast.error(t('googleDrive.errors.downloadFailed'))
      handleApiError({ error, t })
    },
  })

  const deleteDriveFile = useMutation<
    { success: boolean },
    Error,
    { fileId: string }
  >(({ fileId }) => driveDeleteFile(fileId), {
    onSuccess: () => {
      toast.success(t('googleDrive.fileDeleted'))
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveFilesKey)
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveFoldersKey)
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveQuotaKey)
    },
    onError: error => {
      toast.error(t('googleDrive.errors.deleteFileFailed'))
      handleApiError({ error, t })
    },
  })

  const useDriveQuota = () =>
    useQuery<GoogleDriveQuotaResponse, Error>(
      [...QUERY_KEY.googleIntegration.driveQuotaKey, institutionId],
      () => driveQuota(institutionId),
      {
        // Only fetch the quota when Drive integration is actually connected —
        // otherwise the API returns 400 and we churn the network log.
        enabled:
          !!institutionId && !!driveIntegrationStatus.data?.isConnected,
        onError: error => handleApiError({ error, t }),
      }
    )

  const validateFolderAccess = useMutation<
    DriveValidatePermissionResponse,
    Error,
    DriveValidatePermissionPayload
  >((body: DriveValidatePermissionPayload) => driveValidatePermission(body), {
    onSuccess: data => {
      toast.success(t('googleDrive.rootFolderSet'))
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveStatusKey)
      queryClient.invalidateQueries(QUERY_KEY.googleIntegration.driveFoldersKey)
      // Don't return data here
    },
    onError: error => {
      toast.error(t('googleDrive.errors.setRootFolderFailed'))
      handleApiError({ error, t })
    },
  })

  // --- Return Object ---
  return {
    sheetIntegrationStatus,
    calendarConnections,
    meetConnections,
    selectedCalendarIntegration,
    selectedMeetIntegration,
    isAuthLoading,
    getAuthUrl,
    handleGoogleAuthCallback,
    connectCalendar,
    connectMeet,
    disconnectIntegration,
    toggleCalendarStatus,
    toggleMeetStatus,
    refetchSheetIntegrationStatus,
    driveFolders,
    fetchDriveFolders,
    createSheet,
    updateSheetConfig,
    googleCalendars,
    useFetchCalendarEvents,
    updatePrimaryCalendar,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    googleMeetEvents,
    useFetchMeetSpace,
    createMeetMeeting,
    updateMeetMeeting,
    deleteMeetMeeting,

    // Drive
    driveIntegrationStatus,
    useDriveFolders,
    fetchDriveFolderByParent,
    useDriveFiles,
    useDriveFile,
    useDriveFileDownload,
    useDriveSearch,
    createDriveFolder,
    setRootDriveFolder,
    uploadDriveFile,
    downloadDriveByUrl,
    deleteDriveFile,
    useDriveQuota,
    validateFolderAccess,
  }
}
