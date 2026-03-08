import { DateOverride } from './appointment'
import { RepeatFormat, RepeatUnit } from './class'

export enum ClassRegularPeriodsSelectionMode {
  MUST_SELECT_ENTIRE_PERIOD = 'MUST_SELECT_ENTIRE_PERIOD',
  MUST_SELECT_UNTIL_END = 'MUST_SELECT_UNTIL_END',
  ALLOW_CUSTOM_SELECTION = 'ALLOW_CUSTOM_SELECTION',
}

export interface RegularScheduleLessonPreview {
  id: number
  date: string
  period: number
  lessonNumber: number
  startTime: string
  endTime: string
  isOverride: boolean
  isBlocked: boolean
}

export type RegularScheduleLessonPreviewPeriodGroup = {
  period: number
  lessons: RegularScheduleLessonPreview[]
}

export interface RegularSchedulePreview {
  scheduleId: number
  scheduleStartTime: string
  scheduleUnit: string
  scheduleEvery: number
  schedules: { startDate: string; endDate: string }[]
  hasNextPeriod: boolean
  lessons: RegularScheduleLessonPreview[]
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

export type ClassRegularPeriodsV2 = {
  id?: number
  classId: number

  startTime: Date
  endTime: Date

  lessonRepeatFormatId: number
  lessonRepeatFormat: RepeatFormat

  regularScheduleId: number
  regularScheduleV2: RegularScheduleV2
}

export type RegularSchedulePeriodRepeatFormat = {
  every: number
  unit: RepeatUnit
  startTime?: string
}
