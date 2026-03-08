import { addDays, addMinutes, addMonths } from 'date-fns'
import { TFunction } from 'i18next'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import {
  DATE_LOCAL_FORMAT,
  DATE_TIME_AM_FORMAT,
  DATE_TIME_FORMAT,
  SORT_TIME_FORMAT,
  TIME_AM_FORMAT,
} from '@/constants/dateTimeFormat'

import dayjs from './dayjs'

export const formatTs = (
  ts: string | Date | undefined | null,
  format?: string
): string => {
  if (!ts) {
    return ''
  }
  return dayjs(ts).format(format || DATE_TIME_FORMAT)
}

export const formatTime = (
  date: Date | string | undefined | null,
  format?: string
) => {
  if (!date) return ''
  return dayjs(date).format(format || TIME_AM_FORMAT)
}

export const getFormatDate = (
  date: string | Date | undefined | null,
  format?: string
): string => {
  if (!date) return ''
  return dayjs(date).format(format || DATE_LOCAL_FORMAT)
}

export const addMinutesToDate = (date: string, minutes: number): string => {
  return addMinutes(new Date(date), minutes).toISOString()
}

export const addDaysToDate = (date: string, days: number): string => {
  return addDays(new Date(date), days).toISOString()
}

export const addMonthsToDate = (date: string, days: number): string => {
  return addMonths(new Date(date), days).toISOString()
}

export const addRepeatTypeToDate = (
  startDate: string,
  repeatFormats: string,
  every: number
): string => {
  let newStartDate = addDaysToDate(startDate, 1 * every)
  if (repeatFormats === 'weeks') {
    newStartDate = addDaysToDate(startDate, 7 * every)
  } else if (repeatFormats === 'months') {
    newStartDate = addMonthsToDate(startDate, 1 * every)
  }

  return newStartDate
}

export const getLessonFrequency = (unit: string): string => {
  switch (unit) {
    case 'days':
      return 'daily'
    case 'weeks':
      return 'weekly'
    case 'months':
      return 'monthly'
    // case 'years':
    //   options.freq = RRule.YEARLY
    //   break
    default:
      break
  }
  return ''
}

export const getDateFuture = (month: number): dayjs.Dayjs => {
  const currentDate = dayjs()
  return currentDate.add(month, 'month')
}
export const getCurrentWeek = (start: boolean): Date => {
  const today = dayjs()
  if (start) {
    return today.startOf('week').toDate()
  }
  return today.endOf('week').toDate()
}

export const rangeTime = (): SimpleSelectorItemProps[] => {
  return Array.from({ length: 24 * 4 }, (_, index) => {
    const time = dayjs()
      .startOf('day')
      .add(index * 15, 'minute')

    const timeLabel = time.format(SORT_TIME_FORMAT)
    const timeValue = time.format(SORT_TIME_FORMAT)

    return { label: timeLabel, value: timeValue }
  })
}

export const calculateDurationLesson = (
  start: Date | string,
  end: Date | string
): [string, number] => {
  const durationMinutes = dayjs(end).diff(dayjs(start), 'minutes')
  const startDate = getFormatDate(start)
  const endDate = getFormatDate(end)
  const lessonDate =
    startDate === endDate // check if they are
      ? `${startDate} ${formatTime(start)} - ${formatTime(end)}`
      : `${formatTs(start, DATE_TIME_AM_FORMAT)} - ${formatTs(
          end,
          DATE_TIME_AM_FORMAT
        )}`
  return [lessonDate, durationMinutes]
}

export const getLessonDateTime = (
  start: string,
  end: string,
  t: TFunction
): string => {
  if (!start || !end || start === '' || end === '') return ''
  if (
    Number.isNaN(new Date(start).getTime()) ||
    Number.isNaN(new Date(end).getTime())
  ) {
    return ''
  }
  const [lessonDate, durationMinutes] = calculateDurationLesson(start, end)
  return `${lessonDate} (${durationMinutes} ${t('common:unit.min')})`
}

// format  ISO 8601 to unix timestamp
// example input: '2024-02-18T08:45:00.000Z 2024-02-18T09:45:00.000Z'
// expected output:1708245900-1708249500
export const formatUnixTime = (timeStampPair: string): string => {
  const dateStrings = timeStampPair.split(' ')
  const timestamp1 = dateStrings[0]
  const timestamp2 = dateStrings[1]

  const dateTime1 = dayjs(timestamp1).unix()
  const dateTime2 = dayjs(timestamp2).unix()
  const formatedTimeRange = `${dateTime1}-${dateTime2}`

  return formatedTimeRange
}

export const formatDuration = (minutes: number): string => {
  const duration = dayjs.duration(minutes, 'minutes')
  return duration.humanize()
}
