import { differenceInDays, format, parseISO, sub } from 'date-fns'
import { TFunction } from 'i18next'

import dayjs from '@/utils/dayjs'
import { calculateDurationLesson } from '@/utils/timeFormat'

import { PeriodLessons, RecurringSchedules } from '../types/classes'

export const getWeekdaysArray = (t: TFunction): string[] => {
  const Weekdays = {
    sun: t('teachingService:feeNTime.weekName.Sun'),
    mon: t('teachingService:feeNTime.weekName.Mon'),
    tue: t('teachingService:feeNTime.weekName.Tue'),
    wed: t('teachingService:feeNTime.weekName.Wed'),
    thur: t('teachingService:feeNTime.weekName.Thu'),
    fri: t('teachingService:feeNTime.weekName.Fri'),
    sat: t('teachingService:feeNTime.weekName.Sat'),
  }

  return [
    Weekdays.sun,
    Weekdays.mon,
    Weekdays.tue,
    Weekdays.wed,
    Weekdays.thur,
    Weekdays.fri,
    Weekdays.sat,
  ]
}

export const checkTimeAfterStartTime = (
  currentDate: Date,
  startDate: string
): boolean => {
  if (
    currentDate.getDate() === new Date(startDate).getDate() &&
    currentDate <= new Date(startDate)
  ) {
    return false
  }
  return true
}

export const formatDateRelativeToToday = (days: number): string => {
  return format(sub(new Date(), { days }), 'yyyy-MM-dd')
}

export const formatChartDate = (date: Date | undefined): string => {
  if (!date) {
    return ''
  }
  return format(date, 'yyyy-MM-dd')
}

export const formatChartDateInWords = (date: Date | undefined): string => {
  if (!date) {
    return ''
  }
  const formattedDate = dayjs(date).format('MMMM D, YYYY')
  return formattedDate
}
export const calculateDaysFromToday = (dateString: string): number => {
  const date = parseISO(dateString)
  return differenceInDays(new Date(), date)
}

export const roundTimeToNearestQuarterHour = (date: Date): Date => {
  const minutes = date.getMinutes()
  const roundedMinutes = Math.round(minutes / 15) * 15
  date.setMinutes(roundedMinutes)
  date.setSeconds(0)
  return date
}

export const regenerateLocalTimeZoneInUTC = (date: Date): Date => {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )

  return utcDate
}

// string = "17:20"
export const getDateStringByTimeString = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':')
  const dateObject = new Date()

  dateObject.setHours(parseInt(hours, 10))
  dateObject.setMinutes(parseInt(minutes, 10))

  // const dateObjectTZ = zonedTimeToUtc(dateObject, timeZone)
  return dateObject
}

export const convertHHmmStringByDate = (date: Date): string | null => {
  if (date === undefined || date === null) return null
  return dayjs(date).format('HH:mm')
}
export const convertDDMMYYYYStringByDate = (date: Date): string | null => {
  if (date === undefined || date === null) return null
  const year = dayjs(date).format('YYYY')
  const month = dayjs(date).format('MM')
  const day = dayjs(date).format('DD')

  return `${year}/${month}/${day}`
}

export const getWeekdayAndTimeString = (
  date: Date | string | null,
  t: TFunction
): string => {
  if (!date) return ''

  const weekday = dayjs(date).day()
  const hours = dayjs(date).format('hh:mm a')
  return `${getWeekdaysArray(t)[weekday]} ${hours}`
}

export const isTimeslotOverlap = (
  newDate: RecurringSchedules,
  recurringSchedules: RecurringSchedules[]
): boolean => {
  return recurringSchedules
    .filter(lesson => lesson.weekDay === newDate.weekDay)
    .some(existingDate => {
      const newStartTime = dayjs(newDate.startTime, 'HH:mm').utc()
      const newEndTime = dayjs(newDate.endTime, 'HH:mm').utc()
      const currentStartTime = dayjs(existingDate.startTime, 'HH:mm').utc()
      const currentEndTime = dayjs(existingDate.endTime, 'HH:mm').utc()

      const hasOverlap =
        newStartTime.isBetween(currentStartTime, currentEndTime, null, '()') ||
        newEndTime.isBetween(currentStartTime, currentEndTime, null, '()') ||
        currentStartTime.isBetween(newStartTime, newEndTime, null, '()') ||
        currentEndTime.isBetween(newStartTime, newEndTime, null, '()')

      return existingDate.id !== newDate.id && hasOverlap
    })
}

export const isEndDateAfterStartDate = (
  startTime: string | null,
  endTime: string
): boolean => {
  const startTimeUtc = dayjs(startTime, 'YYYY-MM-DD').utc()
  const entTimeUtc = dayjs(endTime, 'YYYY-MM-DD').utc()

  return entTimeUtc.isSameOrAfter(startTimeUtc)
}

export const isEndTimeAfterStartTime = (
  startTime: string | null,
  endTime: string
): boolean => {
  const startTimeUtc = dayjs(startTime, 'HH:mm').utc()
  const entTimeUtc = dayjs(endTime, 'HH:mm').utc()
  return entTimeUtc.isAfter(startTimeUtc, 'minute')
}

export const isSessionTimeslotValid = (
  newLesson: PeriodLessons,
  allLessons: PeriodLessons[]
): boolean => {
  if (!newLesson || !allLessons || allLessons.length === 0) {
    return true
  }

  return allLessons.every((lesson, index) => {
    const newStartTime = dayjs(newLesson.startTime).utc()
    const newEndTime = dayjs(newLesson.endTime).utc()
    const sessionStartTime = dayjs(lesson.startTime).utc()
    const sessionEndTime = dayjs(lesson.endTime).utc()

    if (!sessionEndTime.isAfter(sessionStartTime)) {
      return false
    }

    if (index !== allLessons.indexOf(newLesson)) {
      const hasOverlap =
        newStartTime.isBetween(
          sessionStartTime,
          sessionEndTime,
          'minute',
          '[)'
        ) ||
        newEndTime.isBetween(
          sessionStartTime,
          sessionEndTime,
          'minute',
          '(]'
        ) ||
        sessionStartTime.isBetween(newStartTime, newEndTime, 'minute', '[)') ||
        sessionEndTime.isBetween(newStartTime, newEndTime, 'minute', '(]')

      if (hasOverlap) {
        return false
      }
    }

    return true
  })
}

export const lessonObjectToStringArray = (
  lessonArray?: PeriodLessons[]
): string[] => {
  if (!lessonArray) return []
  const lessons: string[] = []
  lessonArray?.forEach(lesson =>
    lessons.push(`${lesson.startTime} ${lesson.endTime}`)
  )
  return lessons
}

export const calculateLessonFormatAndDuration = (
  start: string,
  end: string
): [string, number] => {
  if (
    Number.isNaN(new Date(start).getTime()) ||
    Number.isNaN(new Date(end).getTime())
  ) {
    return ['', 0]
  }

  return calculateDurationLesson(start, end)
}
