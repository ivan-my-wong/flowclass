// Types for Online Meeting Integration

import { BaseModelWithTimestamps } from './common'

export enum OnlineMeetingProvider {
  GOOGLE_MEET = 'google_meet',
  ZOOM = 'zoom',
  MICROSOFT_TEAMS = 'microsoft_teams',
}

export type IntegrationOnlineMeeting = BaseModelWithTimestamps & {
  siteId: number
  institutionId: number
  provider: OnlineMeetingProvider
  accountId: string
  accountName: string
  accessToken: string
  refreshToken: string
  isPrimary: boolean
  isEnabled: boolean
}

export type CreateIntegrationOnlineMeetingDto = {
  institutionId: number
  provider: OnlineMeetingProvider
  idToken: string
  accessToken: string
}

export type UpdateIntegrationOnlineMeetingDto = {
  isPrimary?: boolean
  isEnabled?: boolean
}

export type RefreshGoogleTokenDto = {
  integrationOnlineMeetingId: number
  institutionId: number
  idToken: string
  accessToken: string
}

// Google Meet specific types
export type GoogleMeetingItem = {
  id: string
  kind: string
  etag: string
  summary: string
  description?: string
  hangoutLink?: string
  conferenceData?: {
    conferenceId: string
    conferenceSolution: {
      key: {
        type: string
      }
      name: string
      iconUri: string
    }
    entryPoints: Array<{
      entryPointType: string
      uri: string
      label?: string
    }>
  }
}
export type GoogleMeetEvent = {
  name: string
  meetingUri: string
  meetingCode: string
  config: {
    accessType: string
    entryPointAccess: string
    moderation: string
    attendanceReportGenerationType: string
    artifactConfig: {
      recordingConfig: {
        autoRecordingGeneration: string
      }
      transcriptionConfig: {
        autoTranscriptionGeneration: string
      }
      smartNotesConfig: {
        autoSmartNotesGeneration: string
      }
    }
  }
}
