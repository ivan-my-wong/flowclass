import { LocationRoom, RegularScheduleV2 } from './classes'
import { PriceType } from './course'
import { BaseUser } from './user'

export type Course = {
  id: number
  name: string
}

export type LessonRepeatFormat = {
  id: number
  createdAt: string
  updatedAt: string
  createdBy: number | null
  updatedBy: number | null
  institutionId: number
  repeat: boolean
  every: number
  unit: string
  times: number
  startTime: string | null
  weekdayOccurrence: string | null
  weekday: string | null
}

export type PeriodV2 = {
  id: number
  lessonRepeatFormatId: number
  startTime: string
  endTime: string
  lessonRepeatFormat: LessonRepeatFormat
}

export type PeriodRepeatFormat = {
  unit: string
  every: number
}

export type GapBetweenPeriods = {
  unit: string
  every: number
}

export type PriceOption = {
  id?: number | string
  createdAt?: string
  updatedAt?: string
  createdBy?: number
  updatedBy?: number
  classId: number
  priceType: PriceType
  amount: string
  numberOfLessons?: number
  name: string
  isFreeOfCharge?: boolean
}

export type RegularClassV2 = {
  id: number
  siteId: number
  locationRoom?: LocationRoom
  instructor?: BaseUser
  institutionId: number
  name: string
  type: string
  course: Course
  regularScheduleV2: RegularScheduleV2
  priceOptions: PriceOption[]
}

export type LessonPreview = {
  id: number
  date: string
  period?: number
  lessonNumber: number
  startTime: string
  endTime: string
  isOverride: boolean
  isBlocked: boolean
}

export type RegularV2SchedulePreview = {
  scheduleId: number
  scheduleStartTime: string
  scheduleUnit: string
  scheduleEvery: number
  lessons: LessonPreview[]
}
