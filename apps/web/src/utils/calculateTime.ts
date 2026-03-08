import { parseISO } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import dayjs from 'dayjs'
import moment, { duration, utc } from 'moment'

import {
  AvailableTimeW,
  Class,
  ClassType,
  Course,
  DateOverride,
  PeriodLesson,
  RecruitPeriodStatus,
  RegularPeriod,
  RepeatType,
  Weekday,
} from '@/types'
import { LessonString } from '@/types/lessonString'

import { courseContainTimeNotNeededClass } from './courseDisplay'
import { isValidTime } from './validate'

/**
 * Applies the given date overrides to the list of available times and returns
 * a new list of available times that have been modified based on the overrides.
 *
 * If `dayOff` is `true`, generates a list of timeslots that fit exactly within the
 * start and end times of the `DateOverride` object based on the provided `duration`.
 *
 * If `dayOff` is `false`, removes all timeslots that overlap with the date override.
 *
 * @param availableTimes - The original list of available times
 * @param dateOverrides - The list of date overrides to apply
 * @param duration - The duration of each timeslot in minutes (default: 30 minutes)
 * @returns A new list of available times modified based on the overrides
 */
export const getAvailableTimeslots = (
  availableTimes: AvailableTimeW[],
  dateOverrides: DateOverride[] | null,
  durationNumber: number // default duration is 30 minutes
): AvailableTimeW[] => {
  if (!dateOverrides || dateOverrides.length === 0) {
    return availableTimes
  }

  const newAvailableTimes: AvailableTimeW[] = [...availableTimes]

  for (const dateOverride of dateOverrides) {
    if (dateOverride.dayOff) {
      // Generate a list of timeslots that fit exactly in the DateOverride object
      const start = utc(dateOverride.start)
      const end = utc(dateOverride.end)
      const diffInMinutes = Math.floor(duration(end.diff(start)).asMinutes())
      const numSlots = Math.floor(diffInMinutes / durationNumber)

      // Add each timeslot to the new list of available times
      for (let i = 0; i < numSlots; i++) {
        const slotStart = utc(start)
          .add(i * durationNumber, 'minutes')
          .toISOString()
        newAvailableTimes.push({
          start: slotStart,
          duration: durationNumber,
        })
      }
    } else {
      // Remove all timeslots that overlap with the date override
      let i = 0
      while (i < newAvailableTimes.length) {
        const availableTime = newAvailableTimes[i]
        const start = utc(availableTime.start)
        const end = utc(start).add(availableTime.duration, 'minutes')
        const overrideStart = utc(dateOverride.start)
        const overrideEnd = utc(dateOverride.end)

        // Check if the available time overlaps with the date override
        if (start.isBefore(overrideEnd) && overrideStart.isBefore(end)) {
          // Remove the overlapping timeslot from the new list of available times
          newAvailableTimes.splice(i, 1)
        } else {
          // Move to the next timeslot in the list
          i++
        }
      }
    }
  }

  // Return the new list of available times modified based on the overrides
  return newAvailableTimes
}

export function groupByWeekdays(
  timeslots: AvailableTimeW[],
  currentDate: Date
): Record<string, Record<Weekday, string[]>> {
  const weeks: Record<string, Record<string, string[]>> = {}

  // Get the start day of the current week (Monday)
  const startOfWeek = moment(currentDate).startOf('week').isoWeekday(Weekday.MON)

  // Assign each timeslot into the corresponding weekday and week object
  timeslots.forEach(timeslot => {
    const start = moment(timeslot.start)
    const end = moment(timeslot.start).add(timeslot.duration, 'minutes')

    // Find the corresponding week object for this timeslot
    let week = weeks[start.format('YYYY-WW')]
    if (!week) {
      week = {
        [Weekday.MON]: [],
        [Weekday.TUE]: [],
        [Weekday.WED]: [],
        [Weekday.THU]: [],
        [Weekday.FRI]: [],
        [Weekday.SAT]: [],
        [Weekday.SUN]: [],
      }
      weeks[start.format('YYYY-WW')] = week
    }

    // Assign the timeslot into the corresponding weekday array
    for (let i = 0; i < 7; i++) {
      const weekday = Object.values(Weekday)[i]
      if (start.isoWeekday() === i + 1 || end.isoWeekday() === i + 1) {
        week[weekday].push(start.format())
      }
    }
  })

  return weeks
}

export const getDateTimeByAmPm = (date: string): string => {
  return moment(date).format('YYYY/MM/DD hh:mm a')
}

export const getFormatDate = (date: string): string => {
  return moment(date).format('YYYY/MM/DD')
}

export const calculateLessonFormatAndDuration = (start: string, end: string): [string, number] => {
  if (isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
    return ['', 0]
  }
  const durationMinutes = moment(end).diff(moment(start), 'minutes')
  const startDate = moment(start).format('YYYY/MM/DD')
  const endDate = moment(end).format('YYYY/MM/DD')
  const lessonDate =
    startDate === endDate //check if they are
      ? `${startDate} ${moment(start).format('hh:mm a')} - ${moment(end).format('hh:mm a')}`
      : `${moment(start).format('YYYY/MM/DD hh:mm a')} - ${moment(end).format(
          'YYYY/MM/DD hh:mm a'
        )}`
  return [lessonDate, durationMinutes]
}

export const checkIsBetweenRecruitPeriod = (course: Course): boolean => {
  if (course && course.recruitStart && course.recruitEnd) {
    const isBetween = moment().isBetween(
      moment(course.recruitStart),
      moment(course.recruitEnd),
      null,
      '[]'
    )
    return isBetween
  }
  // if recruitStart or recruitEnd is null, means the course is always available
  return true
}

export const checkRecruitPeriodStatus = (course: Course): RecruitPeriodStatus => {
  if (course && course.recruitStart && course.recruitEnd) {
    const now = moment()
    const recruitStart = moment(course.recruitStart)
    const recruitEnd = moment(course.recruitEnd)

    if (now.isBefore(recruitStart)) {
      return RecruitPeriodStatus.notStarted
    } else if (now.isBetween(recruitStart, recruitEnd, null, '[]')) {
      return RecruitPeriodStatus.inProgress
    } else {
      return RecruitPeriodStatus.ended
    }
  }

  // if recruitStart or recruitEnd is null, means the course is always available
  return RecruitPeriodStatus.inProgress
}

// get the schedule of all type of course
export const checkCourseScheduleAfterToday = (course: Course): boolean => {
  let regularClassesAfterToday: PeriodLesson[] = []
  let recuringClassExist = false

  const today = new Date()
  const classes = course?.classes ?? []

  classes.forEach(cls => {
    if ([ClassType.recurring, ClassType.appointment].includes(cls.type as ClassType)) {
      recuringClassExist = true
    } else if (cls.type === ClassType.regular || cls.type === ClassType.workshop) {
      cls.regularPeriods.forEach(rp => {
        if (!rp.lessons) {
          regularClassesAfterToday = []
        } else {
          const lessonsAfterToday = rp.lessons.filter(lesson => new Date(lesson.startTime) > today)
          regularClassesAfterToday.push(...lessonsAfterToday)
        }
      })
    }
  })

  return regularClassesAfterToday.length !== 0 || recuringClassExist
  // return { openEnroll, regularClassesAfterToday }
}

// check if course schedule all the timeslot is after today
export const getRegularScheduleAfterTodayOnly = (selectedClass: Class): RegularPeriod[] => {
  const today = new Date()

  // Filter the schedule to only include lessons after today
  const scheduleAllLessonAfterTodayOnly = selectedClass?.regularPeriods
    .filter(period => {
      const lessonsSplit = period.lessons?.map(lesson => lesson.startTime)

      const noPeriodBeforeToday = lessonsSplit?.some(lesson => new Date(lesson) < today)

      return !noPeriodBeforeToday
    })
    .sort((a, b) => {
      const aMinDate = Math.min(...a.lessons.map(lesson => new Date(lesson.startTime).getTime()))
      const bMinDate = Math.min(...b.lessons.map(lesson => new Date(lesson.startTime).getTime()))
      return aMinDate - bMinDate
    })

  return scheduleAllLessonAfterTodayOnly
}

// check if all classes in a course are unavailable due to quota constraints
export const isAnyClassesAvailable = (
  course: Course
): {
  available: boolean
  error: RecruitPeriodStatus | null
} => {
  if (!course?.classes || course.classes.length === 0) {
    return { available: false, error: RecruitPeriodStatus.noQuota }
  }

  const classesStillWithQuota = course.classes.filter(cls => {
    // Check quota availability for classes with quota data
    const classWithQuota = cls as Class & {
      classQuota?: { remainingQuota: number; quota: number }[]
    }

    if (
      cls.quota !== 0 &&
      classWithQuota.classQuota &&
      classWithQuota.classQuota.length > 0 &&
      classWithQuota.classQuota.some(enroll => enroll.remainingQuota > 0)
    ) {
      return true
    }

    if (classWithQuota.classQuota?.length === 0) {
      return true
    }

    // If no quota data or quota is 0, consider the class available
    return false
  })

  if (classesStillWithQuota.length === 0) {
    return { available: false, error: RecruitPeriodStatus.noQuota }
  }

  if (courseContainTimeNotNeededClass(course)) {
    return { available: true, error: null }
  }

  if (!checkIsBetweenRecruitPeriod(course)) {
    return { available: false, error: RecruitPeriodStatus.ended }
  } else if (!checkCourseScheduleAfterToday(course)) {
    return { available: false, error: RecruitPeriodStatus.noSuitableTimeslot }
  }

  return { available: true, error: null }
}

export const convertUTCToCurrentSiteTime = (
  date: string | null,
  timeZone: string | undefined
): string => {
  if (!date) return ''
  if (!timeZone || !isValidTime(date)) return date
  return utcToZonedTime(parseISO(date), timeZone).toISOString()
}

// return date string in utc format
export const convertCurrentSiteTimeToUTC = (date: string | null, timeZone: string): string => {
  if (!date) return ''
  if (!timeZone || !isValidTime(date)) return date
  // the date returned from date picker is still in our local timezone
  // you can't use date.toISOString() to convert it to utc since it will convert it to our local timezone
  // so we need to use date-fns-tz to convert it to utc based on our current site timezone
  return zonedTimeToUtc(parseISO(date), timeZone).toISOString()
}

export const getClosestRecurDateByDatetime = (weekDay: number, time: string, date?: Date): Date => {
  if (!date) date = new Date()
  const current = moment(date)
  const target = moment(date)
    .day(weekDay)
    .hour(parseInt(time.split(':')[0]))
    .minute(parseInt(time.split(':')[1]))

  // If the target date is in the past, add 1 week to get the next occurrence
  if (target.isBefore(current)) {
    target.add(1, 'week')
  }

  return target.toDate()
}

export const getCourseTimeslots = (course: Course): string[] | null => {
  if (!course) return null
  let earliestStartTime: Date | undefined
  let latestEndTime: Date | undefined

  course.classes.forEach(cls => {
    if (cls.type && (cls.type === ClassType.regular || cls.type === ClassType.workshop)) {
      cls.regularPeriods.forEach(period => {
        period.lessons?.forEach(lesson => {
          if (!lesson.startTime || !lesson.endTime) return
          const startTime = new Date(lesson.startTime)
          const endTime = new Date(lesson.endTime)

          if (earliestStartTime === undefined || startTime < earliestStartTime) {
            earliestStartTime = startTime
          }

          if (latestEndTime === undefined || endTime > latestEndTime) {
            latestEndTime = endTime
          }
        })
      })
    }
  })

  if (earliestStartTime !== undefined && latestEndTime !== undefined) {
    return [earliestStartTime.toISOString(), latestEndTime.toISOString()]
  }

  return null
}

export const calculateBillingEndDate = (repeatType: RepeatType): string => {
  const startDate = moment() // Today's date

  const billingCycleDuration = repeatType.every
  const numberOfCycles = repeatType.times

  const total = billingCycleDuration * numberOfCycles
  const endDate = startDate.add(total, repeatType.unit as moment.unitOfTime.DurationConstructor)

  return endDate.format('YYYY/MM/DD')
}

export const calculateBillingNextDate = (repeatType: RepeatType): string => {
  const startDate = moment() // Today's date

  const billingCycleDuration = repeatType.every

  const endDate = startDate.add(
    billingCycleDuration,
    repeatType.unit as moment.unitOfTime.DurationConstructor
  )

  return endDate.format('YYYY/MM/DD')
}

// Filter out dates that are before today
export const filterFutureDatesFromLessonStringArray = (lessonDateArray: string[]): string[] => {
  const now = dayjs().startOf('day')
  return lessonDateArray.filter(dateTime => {
    const thisDate = new LessonString(dateTime)
    const lessonDate = dayjs(thisDate.getStartDate())
    return lessonDate.isSame(now) || lessonDate.isAfter(now)
  })
}
