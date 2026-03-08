import { addDays, parseISO, startOfDay } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

import { dateFormatOptions } from '@/constants/fullCalendar'
import i18n from '@/i18n'
import type { AppointmentForm } from '@/types/appointment'
import type { ChartDate } from '@/types/chartDate.type'
import type { CalendarViewType } from '@/types/fullCalendar.type'

import dayjs from './dayjs'

export type Timeslot = {
  start: string
  end: string
}

export const getTimeZoneDate = (
  date: string | null,
  timeZone: string
): Date | null => {
  if (!date) return null
  return utcToZonedTime(parseISO(date), timeZone)
}

// return date string in utc format
export const convertDateToCurrentTimeZone = (
  date: Date | null,
  timeZone: string
): string | null => {
  if (!date) return null
  // the date returned from date picker is still in our local timezone
  // you can't use date.toISOString() to convert it to utc since it will convert it to our local timezone
  // so we need to use date-fns-tz to convert it to utc based on our current site timezone
  return zonedTimeToUtc(date, timeZone).toISOString()
}

export const formatHourCalendar = (hour: number): string => {
  if (hour === 0) return `12 ${i18n.t('calendar:time.AM')}`
  if (hour < 12) return `${hour} ${i18n.t('calendar:time.AM')}`
  if (hour === 12) return `12 ${i18n.t('calendar:time.PM')}`
  return `${hour - 12} ${i18n.t('calendar:time.PM')}`
}

export const generateDayToShow = (currentDate: Date, numDays: number) => {
  return Array.from({ length: numDays }, (_, i) =>
    addDays(startOfDay(currentDate), i)
  )
}

export const formatCalendarDate = (
  date: Date,
  view: CalendarViewType,
  language: string
) => {
  const startOfWeek = dayjs(date).startOf('week').toDate()
  const endOfWeek = dayjs(date).endOf('week').toDate()
  switch (view) {
    case 'day':
      return date.toLocaleDateString(language, {
        ...dateFormatOptions.dateMonthName,
        weekday: 'long',
      })
    case 'week':
      return `${startOfWeek.toLocaleDateString(
        language,
        dateFormatOptions.longMonthDay
      )} - ${endOfWeek.toLocaleDateString(
        language,
        dateFormatOptions.dateMonthName
      )}`
    case 'month':
      return date.toLocaleDateString(language, dateFormatOptions.longMonthYear)
    case 'year':
      return date.getFullYear().toString()
    case 'schedule':
    case 'nDays':
      return date.toLocaleDateString(language, dateFormatOptions.dateMonthName)
    default:
      return date.toLocaleDateString(language, dateFormatOptions.dateMonthName)
  }
}

export const getNextEndDateFromCalendarView = (
  date: Date,
  view: CalendarViewType
): Date => {
  if (view === 'day' || view === 'schedule' || view === 'nDays') {
    return new Date(date.getTime() + 86400000)
  }
  if (view === 'week') {
    return new Date(date.getTime() + 906400000)
  }
  if (view === 'month') {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1)
  }
  if (view === 'year') {
    return new Date(date.getFullYear() + 1, 0, 1)
  }
  return date
}

export const getPreviousEndDateFromCalendarView = (
  date: Date,
  view: CalendarViewType
): Date => {
  if (view === 'day' || view === 'schedule' || view === 'nDays') {
    return new Date(date.getTime() - 86400000)
  }
  if (view === 'week') {
    return new Date(date.getTime() - 906400000)
  }
  if (view === 'month') {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1)
  }
  if (view === 'year') {
    return new Date(date.getFullYear() - 1, 0, 1)
  }
  return date
}

export const getEarliestDayOfDifferentUnit = (
  date: Date,
  view: CalendarViewType
): Date => {
  if (view === 'day' || view === 'schedule' || view === 'nDays') {
    return new Date(date.getTime() - 86400000)
  }
  if (view === 'week') {
    const day = date.getDay()
    const diff = date.getDate() - day
    const earliestSunday = new Date(date)
    earliestSunday.setDate(diff)
    return earliestSunday
  }
  if (view === 'month') {
    // get the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    return firstDay
  }
  if (view === 'year') {
    // get the first day of the year
    return new Date(date.getFullYear() - 1, 0, 1)
  }
  return date
}

export const checkDateBetween = (date: Date, chartDate: ChartDate) => {
  return dayjs(date).isBetween(
    dayjs(chartDate.startDate).startOf('day'),
    dayjs(chartDate.endDate).endOf('day')
  )
}

export const addDate = (date: Date, dayOffset: number): Date => {
  return dayjs(date).add(dayOffset, 'days').toDate()
}

/**
 * Get all dates for a given month that fall on a specific weekday
 * @param daysOfWeek - Array of weekdays (0-6, where 0 is Sunday)
 * @param year - The year to check
 * @param month - The month to check (1-12)
 * @returns Array of Date objects
 */
export function getDatesForWeekdays(
  daysOfWeek: number[],
  year: number,
  month: number
): Date[] {
  const result: Date[] = []
  const daysOfWeekSet = new Set(daysOfWeek.map(d => d % 7))
  // Get the first day of the month
  const startDate = dayjs()
    .year(year)
    .month(month - 1)
    .date(1)
  // Get the number of days in the month
  const daysInMonth = startDate.daysInMonth()
  // Iterate through all the days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Get the current date
    const currentDate = startDate.date(day)
    // Get the day of the week
    const dayOfWeek = currentDate.day()
    // Check if the day of the week is in the daysOfWeek array
    if (daysOfWeekSet.has(dayOfWeek)) {
      // Add the date to the result array
      result.push(currentDate.toDate())
    }
  }
  // Return the result array
  return result
}

export const parseTimeToDate = (timeStr: string, date = new Date()): Date => {
  const parts = timeStr.split(':')
  if (parts.length < 2) return new Date(NaN)
  const [hours, minutes] = parts.map(n => Number(n))
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return new Date(NaN)
  }

  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export const generateTimeslots = (
  date?: Date,
  scheduleData?: AppointmentForm
): Timeslot[] => {
  if (!scheduleData || !date) return []

  const {
    durationMinutes = 60,
    gapBetweenAppointmentsMinutes = 15,
    minimumNoticeMinutes = 0,
    availability,
  } = scheduleData

  if (!availability) return []

  let safeGapBetweenAppointmentsMinutes = gapBetweenAppointmentsMinutes
  if (gapBetweenAppointmentsMinutes < 5) {
    safeGapBetweenAppointmentsMinutes = 15
  }

  const { availableSchedules = [], dateOverrides = [] } = availability

  const dayOfWeek = date.getDay()
  const now = new Date()

  const noticeTime = new Date(now.getTime() + minimumNoticeMinutes * 60000)

  const totalSlotLength = durationMinutes

  if (totalSlotLength <= 0) return []

  const matchedSchedules = availableSchedules.filter(
    s => s.dayOfWeek === dayOfWeek && s.isEnabled
  )

  const formattedDate = dayjs(date).format('YYYY-MM-DD')

  const dateOverride = dateOverrides.find(
    o => dayjs(o.date).format('YYYY-MM-DD') === formattedDate && o.isAvailable
  )

  const slots: Timeslot[] = []

  // Helper function to generate slots for a given time window
  const generateSlotsForWindow = (windowStart: Date, windowEnd: Date) => {
    let current = new Date(windowStart)

    while (current.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
      const slotStart = new Date(current)
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)

      if (slotStart > noticeTime) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        })
      }

      current = new Date(
        current.getTime() + safeGapBetweenAppointmentsMinutes * 60000
      )
    }
  }

  if (dateOverride) {
    if (!dateOverride.startTime || !dateOverride.endTime) {
      return []
    }
    const windowStart = parseTimeToDate(dateOverride.startTime, date)
    const windowEnd = parseTimeToDate(dateOverride.endTime, date)
    if (
      Number.isNaN(windowStart.getTime()) ||
      Number.isNaN(windowEnd.getTime()) ||
      windowEnd <= windowStart
    ) {
      return []
    }

    generateSlotsForWindow(windowStart, windowEnd)
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const schedule of matchedSchedules) {
      // eslint-disable-next-line no-continue
      if (!schedule.startTime || !schedule.endTime) continue
      const windowStart = parseTimeToDate(schedule.startTime, date)
      const windowEnd = parseTimeToDate(schedule.endTime, date)
      if (
        Number.isNaN(windowStart.getTime()) ||
        Number.isNaN(windowEnd.getTime()) ||
        windowEnd <= windowStart
      ) {
        // eslint-disable-next-line no-continue
        continue
      }
      generateSlotsForWindow(windowStart, windowEnd)
    }
  }
  return slots
}
