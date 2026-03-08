export enum Weekday {
  // Need to add the padding because the API value starts at 1
  SUN = 'SUN',
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  WEEK = 'WEEK',
}

export type AvailableTimeW = {
  start: string
  duration: number // minutes
}

export type DateOverride = {
  end: string
  start: string
  dayOff: boolean
}

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

export type Appointment = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt?: null | string

  siteId?: number
  institutionId?: number
  courseId?: number
  tuition: number
  minLesson: number
  availableTimeWs: AvailableTimeW[]
  dateOverrides?: DateOverride[] | null
  needConfirm: boolean
  bookingCondition: BookingCondition
  indefinitelyIntoFuture: boolean
  cannotScheduleWithin: number
  expireCondition: ExpireCondition
  defaultPriceId?: null | unknown
}

export enum BookingConditionType {
  DAYS_INTO_FUTURE = 'days_into_future',
  WITHIN_DATE_RANGE = 'within_date_range',
  INDEFINITELY_INTO_FUTURE = 'indefinitely_into_future',
}
export type BookingConditionProps = {
  type: BookingConditionType
  hoursIntoFuture?: number
  withinDateRangeStartTime?: string | null // yyyy-MM-dd - yyyy-MM-dd
  withinDateRangeEndTime?: string | null // yyyy-MM-dd - yyyy-MM-dd
  indefinitelyIntoFuture?: boolean | null
}

export enum ConditionType {
  DAY = 'day_after_booking',
  DATE = 'certain_date',
}

export type ExpireConditionProps = {
  type: ConditionType // day_after_booking | certain_date
  daysAfterBooking: number
  certainExpireDate?: string | null // yyyy-MM-dd
}

export type AppointmentForm = {
  id?: number
  availabilityId?: number
  bufferBeforeMinutes?: number
  bufferAfterMinutes?: number
  durationMinutes?: number
  gapBetweenAppointmentsMinutes?: number
  minimumNoticeMinutes?: number
  availability?: Availability
}

export type Availability = {
  id: number
  name?: string
  availableSchedules?: AvailableSchedules[]
  dateOverrides?: DateOverrideProps[]
}

export type AvailableSchedules = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

export type DateOverrideProps = {
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}

export type CalendarConnect = {
  id: number
  createdAt: Date
  updatedAt: Date
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

export enum CalendarProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}
