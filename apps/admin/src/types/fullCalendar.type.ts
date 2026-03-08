import { ReactNode } from 'react'

import { OptionProps } from '@/types/courseSelector.type'

import { AvailableSchedules } from './appointment'
import { ClassTypeEnum } from './course'
import { ClassLesson } from './student'

export type CalendarViewType =
  | 'day'
  | 'week'
  | 'month'
  | 'year'
  | 'schedule'
  | 'nDays'

export type CalendarEvent = {
  id: string
  type: ClassTypeEnum
  appointmentSchedule?: AvailableSchedules
  title: string
  subtitle?: string
  start: Date
  end: Date
  color?: string
  blockTime?: boolean
  isMultipleDays?: boolean
  instructorEmail?: string
  instructorId?: number
  instructorName?: string
  locationId?: number
  locationName?: string
  classId?: number // For showing all classes in course
  courseId?: number // For showing all classes in course
  className?: string // For showing all classes in course
}

export type CalendarEventFilter = {
  student: string
  classes: OptionProps[]
  onlyWithApplications: boolean
  location: { label: string; value: string }[]
  teachers: { label: string; value: string }[]
}

export type CheckConflictClassLesson = {
  classroom: (ClassLesson & {
    conflictGroupId?: string
    lessonsSameIds: {
      lessonId: string | number
      isSameStart: boolean
      isSameEnd: boolean
    }[]
  })[]
  teacher: (ClassLesson & {
    conflictGroupId?: string
    lessonsSameIds: {
      lessonId: string | number
      isSameStart: boolean
      isSameEnd: boolean
    }[]
  })[]
}

export enum SemanticDatePreset {
  Today = 'today',
  ThisWeek = 'thisWeek',
  LastWeek = 'lastWeek',
  ThisMonth = 'thisMonth',
  LastMonth = 'lastMonth',
  Last3Months = 'last3Months',
  ThisYear = 'thisYear',
  LastYear = 'lastYear',
}

export enum RollingDatePreset {
  Latest7Days = 7,
  Latest30Days = 30,
  Latest90Days = 90,
  Latest365Days = 365,
}

export type EventItemProps = {
  event: CalendarEvent
  isDragging: boolean
  withTime?: boolean
  onClick?: (event: CalendarEvent) => void
}

export type CustomItemFn = (props: EventItemProps) => ReactNode

export type CalendarViewProps = {
  onTimeSlotSelect?: (start: Date, end: Date) => void
  customItemFn?: CustomItemFn
}
