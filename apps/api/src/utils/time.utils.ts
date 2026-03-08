import * as dayjs from 'dayjs'

import { DateOverride } from '@/models/availability.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { WeekDayEnum } from '@/models/enums'
import { RepeatFormats } from '@/models/repeat-formats.entity'

export const getCurrentTimeStamp = () => {
  const date = new Date()
  const isoString = date.toISOString()

  const dateComponent = isoString.slice(0, 10)
  const timeComponent = isoString.slice(11, 19)
  const sqlTimestamp = `${dateComponent} ${timeComponent}`
  return sqlTimestamp
}

export const sortASC = (arr: LessonString[] | string[]) => {
  if (!arr) {
    return
  }

  if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object') {
    const lessons = arr as LessonString[]
    for (let i = 0; i < lessons.length; i++) {
      for (let j = 0; j < lessons.length - i - 1; j++) {
        const d1 = lessons[j].getStartDate()
        const d2 = lessons[j + 1].getStartDate()
        if (d1.getTime() > d2.getTime()) {
          const tmp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = tmp
        }
      }
    }
  } else {
    const lessons = arr as string[]
    for (let i = 0; i < lessons.length; i++) {
      for (let j = 0; j < lessons.length - i - 1; j++) {
        const d1 = new Date(lessons[j].split(' ')[0])
        const d2 = new Date(lessons[j + 1].split(' ')[0])
        if (d1.getTime() > d2.getTime()) {
          const tmp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = tmp
        }
      }
    }
  }
}

export const dateOverrideToLessonString = (dateOverride: DateOverride, timezoneOffset: number) => {
  if (!dateOverride.isAvailable) {
    return dateOverride.startTime.split('T')[0]
  }
  const startStr = dateOverride.startTime
  const endStr = dateOverride.endTime
  const startDate = new Date(startStr)
  const endDate = new Date(endStr)
  const localStartDate = translateTimeZone(startDate, timezoneOffset)
  const localEndDate = translateTimeZone(endDate, timezoneOffset)
  return new LessonString(localStartDate + ' ' + localEndDate)
}

export const dateOverrideToTimeRange = (dateOverride: DateOverride, timezoneOffset: number) => {
  if (!dateOverride.isAvailable) {
    return (
      dateOverride.startTime +
      ' ' +
      dateOverride.startTime.split('T')[0] +
      '23:59:00' +
      offsetToISO(timezoneOffset)
    )
  }
  const startStr = dateOverride.startTime
  const endStr = dateOverride.endTime
  const startDate = new Date(startStr)
  const endDate = new Date(endStr)
  const localStartDate = translateTimeZone(startDate, timezoneOffset)
  const localEndDate = translateTimeZone(endDate, timezoneOffset)
  return localStartDate + ' ' + localEndDate
}

export const studentLessonToUtc = (date, startTime, endTime) => {
  const startDate = new Date(date)
  const startTimeObj = new Date(startTime)
  const endDate = new Date(date)
  const endTimeObj = new Date(endTime)

  startDate.setHours(
    startTimeObj.getHours(),
    startTimeObj.getMinutes(),
    startTimeObj.getSeconds(),
    startTimeObj.getMilliseconds()
  )
  endDate.setHours(
    endTimeObj.getHours(),
    endTimeObj.getMinutes(),
    endTimeObj.getSeconds(),
    endTimeObj.getMilliseconds()
  )

  // format using dayjs to the format of 2024-03-18T13:45:00.000Z
  const start = dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
  const end = dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')

  return `${start} ${end}`
}

export const translateTimeZone = (dateUTC: Date, offset: number): string => {
  const localDate = new Date(dateUTC.getTime() + offset * 60_000)
  const timeZone = minutesToHHMM(offset)
  return localDate.toISOString().replace('Z', timeZone)
}

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
export const weekDayToDate = (
  weekDay: WeekDayEnum,
  now: Date,
  time: string,
  startDate: Date | null = null
) => {
  const weekdayIndex = weekdays.indexOf(weekDay)

  const dateObj = new Date(now)
  dateObj.setDate(now.getDate() + ((weekdayIndex + 7 - now.getDay()) % 7))
  if (dateObj < now) {
    dateObj.setDate(dateObj.getDate() + 7)
  }
  if (startDate != null && dateObj < startDate) {
    dateObj.setDate(dateObj.getDate() + 7)
  }
  // set time
  const timeString = time + ':00'
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  dateObj.setUTCHours(hours)
  dateObj.setUTCMinutes(minutes)
  dateObj.setUTCSeconds(seconds)
  dateObj.setUTCMilliseconds(0)
  return dateObj
}

export const minutesToHHMM = (minutes) => {
  const sign = minutes > 0 ? '+' : minutes < 0 ? '-' : ''
  const absMinutes = Math.abs(minutes)
  const hours = Math.floor(absMinutes / 60)
    .toString()
    .padStart(2, '0')
  const minutesPart = (absMinutes % 60).toString().padStart(2, '0')
  return `${sign}${hours}:${minutesPart}`
}

export const offsetToISO = (offset: number) => {
  let tz
  if (offset % 1 == 0) {
    tz = String(Math.trunc(offset)).padStart(2, '0') + ':00'
  } else {
    const hours = Math.floor(offset)
    const minutes = (offset % 1) * 60
    tz = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
  }
  return tz
}

export const timeslotFormat = (date: Date) => {
  return dayjs(date).format('YYYY/MM/DD hh:mm A')
}

export const checkDateInBlockTimeRange = (
  startDate: Date,
  endDate: Date,
  blockTime: string[]
): boolean => {
  for (const item of blockTime) {
    const [start, end] = item.split(' ')
    const startDateTime = dayjs(start)
    const endDateTime = dayjs(end)
    if (
      dayjs(startDate).isBetween(startDateTime, endDateTime, null, '[]') ||
      dayjs(endDate).isBetween(startDateTime, endDateTime, null, '[]')
    ) {
      return true
    }
  }

  return false
}
export const getWeekDayName = (weekDay: number) => {
  switch (weekDay) {
    case 0:
      return 'Sunday'
    case 1:
      return 'Monday'
    case 2:
      return 'Tuesday'
    case 3:
      return 'WednesDay'
    case 4:
      return 'Thursday'
    case 5:
      return 'Friday'
    case 6:
      return 'Saturday'
  }
}

export const calculateBillingEndDate = (startDate: Date, repeatType: RepeatFormats) => {
  const thisStartDate = dayjs(startDate) // Today's date

  const billingCycleDuration = repeatType.every
  const numberOfCycles = repeatType.times

  const total = billingCycleDuration * numberOfCycles
  const endDate = thisStartDate.add(total, repeatType.unit as dayjs.ManipulateType)

  return endDate.toDate()
}

export const calculateBillingNextDate = (startDate: Date, repeatType: RepeatFormats) => {
  const thisStartDate = dayjs(startDate) // Today's date

  const billingCycleDuration = repeatType.every

  const nextDate = thisStartDate.add(billingCycleDuration, repeatType.unit as dayjs.ManipulateType)

  return nextDate.toDate()
}

export const generateIntervalUnit = (interval: string): [number, dayjs.ManipulateType] => {
  const [number, unit] = interval.split(' ')
  return [Number(number), unit as dayjs.ManipulateType]
}
export const sleep = (times: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, times)
  })
}

export const toISOStringFromExcelOrString = (value: number | string): string | null => {
  if (typeof value === 'number') {
    // Excel serial date to JS Date
    const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000))
    return !isNaN(jsDate.getTime()) ? jsDate.toISOString() : null
  }
  const parsed = Date.parse(value)
  return !isNaN(parsed) ? new Date(parsed).toISOString() : null
}

export const isTimeslotWithinPeriod = (
  slotStart: Date,
  slotEnd: Date,
  periodStart?: Date | null,
  periodEnd?: Date | null
): boolean => {
  if (periodStart && slotStart < periodStart) return false
  if (periodEnd && slotEnd > periodEnd) return false
  return true
}

export const filterTimeslotStringsWithinPeriod = (
  slots: string[], // each: "2024-09-04T12:00:00.000Z 2024-09-04T13:00:00.000Z"
  periodStart?: Date | null,
  periodEnd?: Date | null
) => {
  return slots.filter((s) => {
    const [startStr, endStr] = s.split(' ')
    return isTimeslotWithinPeriod(new Date(startStr), new Date(endStr), periodStart, periodEnd)
  })
}
