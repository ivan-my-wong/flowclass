import { FormType, OptionalFormType } from '@/utils/form-type'

import { RepeatUnit } from '../constants/course'

import type { Appointment } from './appointment'
import { ClassTypeEnum, PriceType } from './course'
import type { OptionType } from './options'
import type { PriceOption } from './regularClass'
import { StudentSchedule } from './student'
import type { BaseUser } from './user'

export type PickedCourse = {
  id: number
  name: string | null
  courseCode?: string
  shortDescription: string | null
  path: string | null
}

export enum ClassRegularPeriodsSelectionMode {
  MUST_SELECT_ENTIRE_PERIOD = 'MUST_SELECT_ENTIRE_PERIOD',
  MUST_SELECT_UNTIL_END = 'MUST_SELECT_UNTIL_END',
  ALLOW_CUSTOM_SELECTION = 'ALLOW_CUSTOM_SELECTION',
}

export type PeriodLessons = {
  id?: number
  periodId?: number
  classId?: number

  startTime: string
  endTime: string

  // This property is only in the frontend
  deleted?: boolean
}

export type PeriodLessonsStringId = Omit<PeriodLessons, 'id'> & {
  id: string
  // Optional: keep the original numeric identifier if needed downstream.
  lessonId?: number
}

export type RegularPeriods = {
  id?: number
  siteId?: number
  institutionId?: number
  courseId?: number
  classId?: number
  name?: string
  orderIndex?: number
  lessons: PeriodLessons[]

  duration: number
  deleted?: boolean
  repeatFormat: RepeatFormats
}

export type Classes = {
  id: number
  type: ClassTypeEnum
  siteId?: number
  institutionId?: number
  courseId?: number

  name: string
  classesCode?: string
  quota: number
  tuition: number
  priceType: PriceType
  priceOptions: PriceOption[]
  discountedPrice?: number

  dropIn?: boolean
  enrollmentOffset?: number
  teachingLanguage?: string

  locality?: string
  detailAddress?: string

  classDescription?: string
  classMeetingUrl?: string
  classRemark?: string

  defaultPriceId?: null | number

  tags?: string[]
  setMultipleClass: boolean
  setMultipleApplicant?: boolean
  autoPay?: boolean

  regularPeriods: RegularPeriods[]

  regularScheduleId?: number
  regularScheduleV2?: RegularScheduleV2

  appointmentId?: number
  appointment?: Appointment

  classRecurringId?: number
  recurringSchedules: RecurringSchedules[]
  recurringFormat?: RepeatFormats
  applicationPeriod?: {
    startDatetime: string
    endDatetime: string
  }

  classQuota?: CheckQuotaResponse[]

  locationRoom?: LocationRoom
  locationId?: number

  instructor?: BaseUser
  instructorId?: number

  course?: PickedCourse

  isArchived?: boolean
  studentSchedules?: StudentSchedule[]
}

export type RecurringSchedules = {
  deleted?: boolean
  id?: number | string
  classId: number
  weekDay: number
  startTime: string
  endTime: string
}

export type RepeatFormats = {
  id?: number
  repeat: boolean
  every: number
  unit: RepeatUnit
  times: number
  weekDay?: number // 0-6 (Sunday-Saturday)
  weekdayOccurrence?: number // 1-4 for 1st, 2nd, 3rd, 4th, -1 for last
  startTime?: string
}

// This is a simplified version of the RepeatFormats type

export type RegularSchedulePeriodRepeatFormat = {
  every: number
  unit: RepeatUnit
  startTime?: string
}

export type RegularScheduleV2 = {
  id: number
  classId: number
  weekDay: number
  startTime: string
  endTime: string
  dateOverrides: DateOverride[]
  periodsV2: ClassRegularPeriodsV2[]

  periodRepeatFormat: RegularSchedulePeriodRepeatFormat
  gapBetweenPeriods: RegularSchedulePeriodRepeatFormat

  periodRepeatCount: number

  selectionMode: ClassRegularPeriodsSelectionMode
}

export type RegularScheduleV2OptionalPeriods = RegularScheduleV2 & {
  periodsV2: Partial<ClassRegularPeriodsV2>[]
  periodRepeatCount: number
}

export type ClassRegularPeriodsV2 = {
  id?: number
  classId: number

  startTime: Date
  endTime: Date

  lessonRepeatFormatId: number
  lessonRepeatFormat: RepeatFormats

  regularScheduleId: number
  // regularScheduleV2: RegularScheduleV2
}

/**
 * @deprecated Use the new `ClassesForm` based on `RegularScheduleV2Form` instead.
 * This type creates circular references and should not be used going forward.
 */
export type ClassesFormDeprecated = Classes & {
  dataId: number
  isDirty: boolean
  isFree: boolean
  locationRoom?: OptionType
  instructor?: OptionType
  regularScheduleV2?: Partial<RegularScheduleV2OptionalPeriods>
}

export type DuplicateMultipleClassParams = {
  courseId: number
  classes: Partial<Classes>[]
}

export type CheckQuotaResponse = {
  lessonId: number
  remainingQuota: number
  quota: number
  conflict?: any[]
}

export type EnrolledClassCount = {
  classId: number
  classQuota?: CheckQuotaResponse[]
}

export type LocationRoom = {
  id?: number
  name: string
  capacity: number
  description: string
  locationGroups: string[]
  equipment: string[]
  coordinate: {
    lat: number
    lng: number
  } | null
  address?: string
  createdAt?: string
  updatedAt?: string
}

export type TagOption = {
  label: string
  value: string
}

export type LocationRoomForm = {
  id?: number
  name: string
  capacity: number
  description: string
  locationGroups: TagOption[]
  equipment: TagOption[]
  coordinate: {
    lat: number
    lng: number
  } | null
  address: string
  createdAt?: string
  updatedAt?: string
}

export type ReqValidateTimeslot = {
  classId?: number
  lessons?: PeriodLessons[]
}

export type ResValidateTimeslot = {
  classroom: (Classes & {
    lessonsSameIds: {
      lessonId: string | number
      isSameStart: boolean
      isSameEnd: boolean
    }[]
  })[]
  teacher: (Classes & {
    lessonsSameIds: {
      lessonId: string | number
      isSameStart: boolean
      isSameEnd: boolean
    }[]
  })[]
}

export enum QuotaTypeEnum {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  FULL = 'full',
}

export type TimeSlotQuota = {
  quota: number
  studentIds: number[]
  quotaUsage: number
}

export type LocationRoomWithQuota = LocationRoom & {
  timeSlotQuota: Record<string, TimeSlotQuota>
}

export type TimeSlotClassQuota = {
  locationQuota: TimeSlotQuota | null
  classQuota: TimeSlotQuota | null
}

export type ClassRegularPeriodsV2Form = Omit<
  ClassRegularPeriodsV2,
  'regularScheduleId'
> & {
  regularScheduleId?: number
}

export type RegularScheduleV2Form = Omit<RegularScheduleV2, 'periodsV2'> & {
  periodsV2: Partial<ClassRegularPeriodsV2Form>[]
}

export type ClassesForm = FormType<Classes, 'regularScheduleV2'> & {
  dataId: number
  isDirty: boolean
  isFree: boolean
  locationRoom?: OptionType
  instructor?: OptionType
  regularScheduleV2?: OptionalFormType<RegularScheduleV2OptionalPeriods>
}

export type DateOverride = {
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
}
