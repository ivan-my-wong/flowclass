import { PriceOption } from '@/page-components/enrol/PickTimeSteps/PickPriceOptionStep'
import { ClassType } from '@/types/course'

import { AppointmentForm } from './appointment'
import { LessonString } from './lessonString'
import { RegularScheduleV2 } from './regularSchedule'

export type RepeatType = {
  unit: string
  every: number
  times: number
  repeat: boolean
}

export type Period = {
  lessons: string[]
  repeatType: RepeatType
  duration: number
}

export type Schedule = {
  id: number | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  siteId?: number
  institutionId?: number
  courseId?: number
  classId?: number
  name?: string
  orderIndex?: number
  period: Period
}

export type RecurringSchedule = {
  id: number
  date?: Date
  classId: number
  weekDay: number
  startTime: string
  endTime: string
  enrollCount?: number
}

export type IndividualRecurringSchedule = RecurringSchedule & {
  date: Date
  lessonString: LessonString
}

export type Class = {
  id: number
  type?: ClassType
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string

  siteId?: number
  institutionId?: number
  courseId?: number
  name: string
  quota: number
  tuition: number
  tuitionMode: TuitionMode
  dropIn?: boolean
  enrollmentOffset?: number
  discountedPrice?: number
  teachingLanguage?: string
  locality?: string
  detailAddress?: string
  classDescription?: string
  classMeetingUrl?: string
  classRemark?: string
  defaultPriceId?: null | number

  regularScheduleId?: number
  regularScheduleV2?: RegularScheduleV2

  // schedule: Schedule[]
  setMultipleClass: boolean
  setMultipleApplicant: boolean

  recurringPeriod?: RecurringPeriod
  applicationPeriod?: {
    startDatetime?: string | null
    endDatetime?: string | null
  }
  studentSchedule?: any[]
  enrollCourses?: any[]

  recurringFormatId?: number
  recurringFormat: RepeatType

  regularPeriods: RegularPeriod[]
  recurringSchedules: RecurringSchedule[]
  // tags?: string

  appointment?: AppointmentForm

  priceType: TuitionMode
  priceOptions?: PriceOption[]

  instructorId?: number
  instructor?: {
    id: number
    firstName: string
  }

  locationId?: number
  locationRoom?: LocationRoom

  isArchived?: boolean
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

export type RecurringPeriod = {
  every: number
  unit: RepeatUnit
  times: number
}

export type RepeatFormat = {
  id: number
  institutionId: number
  repeat: boolean
  every?: number
  unit: string
  times?: number
  weekDay?: number
  weekdayOccurence?: number
}

export type PeriodLesson = {
  id: number
  classId: number
  periodId: number
  startTime: string
  endTime: string
}

export type RegularPeriod = {
  id: number
  siteId: number
  institutionId: number
  courseId: number
  classId: number
  repeatFormatId: number
  repeatFormat: RepeatFormat
  name: string
  duration?: number
  orderIndex: number
  lessons: PeriodLesson[]
}

export enum RepeatUnit {
  days = 'days',
  weeks = 'weeks',
  month = 'months',
}

export enum TuitionMode {
  PER_LESSON = 'PER_LESSON',
  PER_CLASS = 'PER_CLASS',
  MULTIPLE_OPTIONS = 'MULTIPLE_OPTIONS',
}
