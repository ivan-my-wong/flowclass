import type { BaseModelWithTimestamps } from '@/types/common'

import type { DateOverrideProps } from './availability.type'
import type { RecurringSchedules } from './classes'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type ExpireCondition = {
  type: 'day_after_booking' | 'certain_date'
  daysAfterBooking: number
  certainExpireDate: string
}

export type BookingCondition = {
  type: 'days_into_future' | 'within_date_range'
  daysIntoFuture: number
  withinDateRange: {
    startTime: string
    endTime: string
  }
}

/**
 * BookingConditionType enum for appointment booking conditions.
 */
export enum BookingConditionType {
  DAYS_INTO_FUTURE = 'days_into_future',
  WITHIN_DATE_RANGE = 'within_date_range',
  INDEFINITELY_INTO_FUTURE = 'indefinitely_into_future',
}

/**
 * BookingCondition for appointment entity.
 */
export type BookingConditionProps = {
  type: BookingConditionType
  hoursIntoFuture?: number
  withinDateRangeStartTime?: string | null // yyyy-MM-dd - yyyy-MM-dd
  withinDateRangeEndTime?: string | null // yyyy-MM-dd - yyyy-MM-dd
  indefinitelyIntoFuture?: boolean | null
}

/**
 * ConditionType enum for expire condition.
 */
export enum ConditionType {
  DAY = 'day_after_booking',
  DATE = 'certain_date',
}

/**
 * ExpireCondition for appointment entity.
 */
export type ExpireConditionProps = {
  type: ConditionType // day_after_booking | certain_date
  daysAfterBooking: number
  certainExpireDate?: string | null // yyyy-MM-dd
}

export type AvailableSchedules = {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  isEnabled: boolean
}

export type Availability = {
  id: number
  name?: string
  availableSchedules?: ReadonlyArray<AvailableSchedules>
  dateOverrides?: ReadonlyArray<DateOverrideProps>
}

/**
 * Appointment type matching the backend Appointment entity.
 */
export type Appointment = BaseModelWithTimestamps & {
  institutionId: number

  availabilityId: number
  needConfirm: boolean
  bookingCondition: BookingCondition
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  dailyLimit: number
  durationMinutes: number
  gapBetweenAppointmentsMinutes: number
  minimumNoticeMinutes: number
  expireCondition?: ExpireCondition
  availability?: Availability
  classId: number
}

export type AppointmentForm = Partial<Appointment> & {
  siteId?: number
}

export const defaultAppointment: AppointmentForm = {
  durationMinutes: 60,
  minimumNoticeMinutes: 0,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  gapBetweenAppointmentsMinutes: 15,
}

export type RecurringScheduleWithKey = RecurringSchedules & {
  key: string
}
