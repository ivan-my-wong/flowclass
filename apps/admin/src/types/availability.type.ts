import { AppointmentForm } from './appointment'
import { BaseModelWithTimestamps } from './common'
import {
  CalendarProvider,
  IntegrationCalendar,
} from './integrationCalendar.type'

export type WorkingHoursDay = {
  enabled: boolean
  startTime: string
  endTime: string
}

export type WorkingHours = {
  [key: string]: WorkingHoursDay
}

export type CalendarItem = {
  id: string
  name: string
  email?: string
  primary?: boolean
  enabled?: boolean
}

export type SingleRecurringSchedule = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

export type DateOverride = {
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}

export type Availability = BaseModelWithTimestamps & {
  siteId: number
  institutionId: number
  name?: string
  description?: string
  startDate?: string | Date
  endDate?: string | Date
  availableSchedules?: SingleRecurringSchedule[]
  integrationCalendarId?: number

  dateOverrides?: DateOverride[]

  integrationCalendar?: IntegrationCalendar
}

export type AvailabilityWithAppointmentForm = Availability & {
  appointments?: AppointmentForm[]
}

// DTOs for API requests
export type CreateCalendarConnectDto = {
  siteId: number
  institutionId: number
  provider: CalendarProvider
}

export type UpdateCalendarConnectDto = {
  calendarName?: string
  isPrimary?: boolean
  isEnabled?: boolean
}

export type CreateAvailabilityDto = {
  siteId: number
  name: string
  institutionId: number
  availableSchedules?: SingleRecurringSchedule[]
  integrationCalendarId?: number
  dateOverrides?: DateOverrideProps[]
}

export type UpdateAvailabilityDto = {
  availableSchedules?: SingleRecurringSchedule[]
  integrationCalendarId?: number
  dateOverrides?: DateOverride[]
}

export enum AvailabilityMenu {
  WORKING_HOURS = 'workingHours',
  DATE_OVERRIDE = 'dateOverride',
  LIST_CLASS = 'listClass',
  // CONNECT_GOOGLE_CALENDAR = 'connectGoogleCalendar',
}

export type DateOverrideProps = {
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}
