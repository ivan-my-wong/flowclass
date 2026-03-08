import { BaseModelWithTimestamps } from './common'

export enum CalendarProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export type IntegrationCalendar = BaseModelWithTimestamps & {
  siteId: number
  institutionId: number
  provider: CalendarProvider
  calendarAccountId: string
  calendarName: string
  calendarAccessToken: string
  calendarRefreshToken: string
  isPrimary: boolean
  isEnabled: boolean
  calendarId: string
}

// DTOs for API requests
export type CreateIntegrationCalendarDto = {
  institutionId: number
  provider: CalendarProvider
  idToken: string
  accessToken: string
}

export type UpdateIntegrationCalendarDto = {
  calendarName?: string
  isPrimary?: boolean
  isEnabled?: boolean
}

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
  isAllDay?: boolean
}

export type RefreshGoogleTokenDto = {
  institutionId: number
  integrationCalendarId: number
  idToken: string
  accessToken: string
}
