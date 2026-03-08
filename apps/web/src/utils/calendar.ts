import dayjs from 'dayjs'

import { AppointmentForm } from '@/types'
import { ClassType, Course } from '@/types/course'

import { getClosestRecurDateByDatetime } from './calculateTime'

type CalendarDateType = {
  title: string
  start?: Date
  end?: Date
  url: string

  //  Following for recurring dates
  startTime?: string
  endTime?: string
  daysOfWeek?: number[]
}

export const generateRecurringEvents = ({
  courses,
  baseUrl,
}: {
  courses: Course[]
  baseUrl: string
}): { events: CalendarDateType[]; earliest: Date } => {
  const events: CalendarDateType[] = []
  let earliest: Date = new Date()

  courses?.forEach(course => {
    course.classes?.forEach(_class => {
      if (_class.type === ClassType.regular || _class.type === ClassType.workshop) {
        _class.regularPeriods.forEach(schedule => {
          if (!schedule.lessons || schedule.lessons.length === 0) {
            return
          }

          schedule.lessons.forEach(lesson => {
            const startDate = new Date(lesson.startTime)
            const endDate = new Date(lesson.endTime)

            if (earliest === null) {
              earliest = startDate
            }
            // Update earliest if it's null or the current start date is after today
            if ((!earliest || startDate < earliest) && startDate > new Date()) {
              earliest = startDate
            }

            const event = {
              title: course.name,
              start: startDate,
              end: endDate,
              url: `${baseUrl}/${course.path}`,
            }
            events.push(event)
          })
        })
      } else if (_class.type === ClassType.recurring) {
        _class.recurringSchedules.forEach(lessonDate => {
          const startDate = getClosestRecurDateByDatetime(lessonDate.weekDay, lessonDate.startTime)

          if (earliest === null) {
            earliest = startDate
          }
          // Update earliest if it's null or the current start date is after today
          if ((!earliest || startDate < earliest) && startDate > new Date()) {
            earliest = startDate
          }

          const event = {
            title: course.name,
            startTime: lessonDate.startTime,
            endTime: lessonDate.endTime,
            daysOfWeek: [lessonDate.weekDay],
            url: `${baseUrl}/${course.path}`,
          }
          events.push(event)
        })
      }
    })
  })

  events.sort((a, b) => {
    if (!a || !b || !a.start || !b.start) {
      return 0
    }

    if (a.start < b.start) {
      return -1
    }
    if (a.start > b.start) {
      return 1
    }
    return 0
  })

  return { events, earliest }
}

/**
 * Get all dates for a given month that fall on a specific weekday
 * @param daysOfWeek - Array of weekdays (0-6, where 0 is Sunday)
 * @param year - The year to check
 * @param month - The month to check (1-12)
 * @returns Array of Date objects
 */
export function getDatesForWeekdays(daysOfWeek: number[], year: number, month: number): Date[] {
  const result: Date[] = []
  const daysOfWeekSet = new Set(daysOfWeek.map(d => d % 7))
  // Get the first day of the month
  const startDate = dayjs().year(year).month(month).date(1)
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
/**
 * Get all dates for a given month that fall on a specific weekday
 * between a start and end time
 * @param daysOfWeek - Array of weekdays (0-6, where 0 is Sunday)
 * @param startTime - The start time
 * @param endTime - The end time
 * @returns Array of Date objects
 */
export function getDatesForWeekdaysByStartEndTime(
  daysOfWeek: number[],
  startTime: Date,
  endTime: Date
): Date[] {
  const result: Date[] = []
  const daysOfWeekSet = new Set(daysOfWeek.map(d => d % 7))
  const startDate = dayjs(startTime)
  const endDate = dayjs(endTime)
  let currentDate = startDate
  while (currentDate < endDate) {
    if (daysOfWeekSet.has(currentDate.day())) {
      result.push(currentDate.toDate())
    }
    currentDate = currentDate.add(1, 'day')
  }
  return result
}

type Timeslot = {
  start: string
  end: string
}

export const parseTimeToDate = (timeStr: string, date = new Date()): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export const generateTimeslots = (date?: Date, scheduleData?: AppointmentForm): Timeslot[] => {
  if (!scheduleData || !date) return []

  const {
    durationMinutes = 60,
    gapBetweenAppointmentsMinutes = 15,
    bufferBeforeMinutes = 0,
    bufferAfterMinutes = 0,
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

  const matchedSchedules = availableSchedules.filter(s => s.dayOfWeek === dayOfWeek && s.isEnabled)

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

      current = new Date(current.getTime() + safeGapBetweenAppointmentsMinutes * 60000)
    }
  }

  if (dateOverride) {
    if (!dateOverride.startTime || !dateOverride.endTime) {
      return []
    }
    const windowStart = parseTimeToDate(dateOverride.startTime, date)
    const windowEnd = parseTimeToDate(dateOverride.endTime, date)

    generateSlotsForWindow(windowStart, windowEnd)
  } else {
    for (const schedule of matchedSchedules) {
      const windowStart = parseTimeToDate(schedule.startTime, date)
      const windowEnd = parseTimeToDate(schedule.endTime, date)

      generateSlotsForWindow(windowStart, windowEnd)
    }
  }

  return slots
}
