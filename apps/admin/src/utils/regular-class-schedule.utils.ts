// Calculate lessons for each period

import { RepeatUnit } from '@/constants/course'
import { DateOverride } from '@/types/availability.type'
import { RegularScheduleV2 } from '@/types/classes'
import { BlockTime } from '@/types/settingBlockTime'
import dayjs from '@/utils/dayjs'

import { deepCopy } from './shallow'

const PREVIEW_MONTHS = 24

const getDefaultPeriodCount = (unit: string, every: number): number => {
  const daysPerUnit: Record<string, number> = {
    [RepeatUnit.days]: 1,
    [RepeatUnit.weeks]: 7,
    [RepeatUnit.months]: 30,
  }
  const daysPerPeriod = (daysPerUnit[unit] ?? 7) * every
  return Math.ceil((PREVIEW_MONTHS * 30) / daysPerPeriod)
}

export type PeriodDateArray = {
  startDate: string
  endDate: string
}[]

type LessonDate = {
  period: number
  startTime: string
  endTime: string
  scheduleIndex: number
  isOverride?: boolean
}

export type SinglePreviewLesson = {
  id: number
  date: string
  period: number
  lessonNumber: number
  startTime: string
  endTime: string
  isBlocked?: boolean
  isOverride?: boolean
}

export const getRegularClassSchedules = (
  regularScheduleV2: RegularScheduleV2 | undefined,
  startingScheduleIndex: number = 0
): PeriodDateArray => {
  if (!regularScheduleV2) return []

  const { periodRepeatFormat, gapBetweenPeriods, periodRepeatCount } =
    regularScheduleV2

  const {
    startTime: scheduleStartTime,
    unit: scheduleUnit,
    every: scheduleEvery,
  } = periodRepeatFormat

  // Calculate period start dates for up to the specified periodRepeatCount
  const periodDates: PeriodDateArray = []
  let currentPeriodStart = dayjs(scheduleStartTime)

  // This is to set up the currentPeriodStart to the startingScheduleIndex
  if (startingScheduleIndex > 0) {
    for (let i = 0; i < startingScheduleIndex; i++) {
      currentPeriodStart = currentPeriodStart.add(scheduleEvery, scheduleUnit)
      if (gapBetweenPeriods.every > 0) {
        currentPeriodStart = currentPeriodStart.add(
          gapBetweenPeriods.every,
          gapBetweenPeriods.unit
        )
      }
    }
  }

  // Use periodRepeatCount if available, otherwise generate enough periods to cover 24 months
  const maxPeriods =
    periodRepeatCount && periodRepeatCount > 0
      ? periodRepeatCount
      : getDefaultPeriodCount(scheduleUnit, scheduleEvery)

  for (let i = 0; i < maxPeriods; i++) {
    periodDates.push({
      startDate: currentPeriodStart.clone().toISOString(),
      endDate: currentPeriodStart.clone().toISOString(),
    })

    // Move to next period
    switch (scheduleUnit) {
      case RepeatUnit.days:
        currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'day')
        periodDates[i].endDate = currentPeriodStart.clone().toISOString()
        break
      case RepeatUnit.weeks:
        currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'week')
        periodDates[i].endDate = currentPeriodStart.clone().toISOString()
        break
      case RepeatUnit.months:
        currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'month')
        periodDates[i].endDate = currentPeriodStart.clone().toISOString()
        break
      default:
        currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'week')
        periodDates[i].endDate = currentPeriodStart.clone().toISOString()
    }

    if (gapBetweenPeriods.every > 0) {
      currentPeriodStart = currentPeriodStart.add(
        gapBetweenPeriods.every,
        gapBetweenPeriods.unit
      )
    }
  }

  return periodDates
}

export const getRegularClassLessonsFromSchedule = (
  regularScheduleV2: RegularScheduleV2 | undefined,
  blockTimes: BlockTime[],
  startingScheduleIndex: number = 0
): SinglePreviewLesson[] => {
  if (!regularScheduleV2) return []

  const { periodsV2, dateOverrides, periodRepeatFormat, gapBetweenPeriods } =
    regularScheduleV2

  const firstStageDates: LessonDate[] = []

  const periodDates = getRegularClassSchedules(
    regularScheduleV2,
    startingScheduleIndex
  )

  if (!periodDates || periodDates.length === 0) return []

  const earliestPeriodStartTime = dayjs(periodDates[0].startDate)
  const latestPeriodEndTime = dayjs(periodDates[periodDates.length - 1].endDate)

  // Calculate lessons for each period and each schedule
  periodsV2?.forEach((period, scheduleIndex) => {
    const { startTime, endTime, lessonRepeatFormat } = period
    if (!startTime || !endTime || !lessonRepeatFormat || !periodRepeatFormat)
      return

    const { unit: lessonUnit, every: lessonEvery } = lessonRepeatFormat

    let currentLessonStartTime = dayjs(startTime)
    let currentLessonEndTime = dayjs(endTime)

    if (currentLessonStartTime.isBefore(periodDates[0].startDate)) {
      // Keep adding the repeat period until the lesson start time is after the period start date
      while (currentLessonStartTime.isBefore(periodDates[0].startDate)) {
        currentLessonStartTime = currentLessonStartTime.add(
          lessonEvery,
          lessonUnit
        )
        currentLessonEndTime = currentLessonEndTime.add(lessonEvery, lessonUnit)
      }
    }

    periodDates.forEach((periodDate, periodRepeatIndex) => {
      while (
        currentLessonStartTime.isSameOrAfter(periodDate.startDate) &&
        currentLessonStartTime.isBefore(periodDate.endDate)
      ) {
        firstStageDates.push({
          period: periodRepeatIndex + startingScheduleIndex,
          startTime: currentLessonStartTime.toISOString(),
          endTime: currentLessonEndTime.toISOString(),
          scheduleIndex,
        })

        switch (lessonUnit) {
          case RepeatUnit.days:
            currentLessonStartTime = currentLessonStartTime.add(
              lessonEvery,
              'day'
            )
            currentLessonEndTime = currentLessonEndTime.add(lessonEvery, 'day')
            break
          case RepeatUnit.weeks:
            currentLessonStartTime = currentLessonStartTime.add(
              lessonEvery,
              'week'
            )
            currentLessonEndTime = currentLessonEndTime.add(lessonEvery, 'week')
            break
          case RepeatUnit.months:
            currentLessonStartTime = currentLessonStartTime.add(
              lessonEvery,
              'month'
            )
            currentLessonEndTime = currentLessonEndTime.add(
              lessonEvery,
              'month'
            )
            break
          default:
            currentLessonStartTime = currentLessonStartTime.add(1, 'week')
            currentLessonEndTime = currentLessonEndTime.add(1, 'week')
        }
      }

      if (gapBetweenPeriods.every > 0) {
        currentLessonStartTime = currentLessonStartTime.add(
          gapBetweenPeriods.every,
          gapBetweenPeriods.unit
        )
        currentLessonEndTime = currentLessonEndTime.add(
          gapBetweenPeriods.every,
          gapBetweenPeriods.unit
        )
      }
    })
  })

  // Process the isAvailable list and add them to the dates
  const overrideList = dateOverrides?.filter(
    o =>
      dayjs(o.date).isSameOrAfter(earliestPeriodStartTime, 'day') &&
      o.isAvailable &&
      dayjs(o.date).isSameOrBefore(latestPeriodEndTime, 'day')
  )

  let secondStageDates = [...firstStageDates]

  if (overrideList) {
    // add extra lessons for the same date
    overrideList.forEach(override => {
      if (
        override &&
        override.isAvailable &&
        override.startTime &&
        override.endTime
      ) {
        const { overrideStartDateTime, overrideEndDateTime } =
          parseDateOverride(override)

        // Find which period the override is in
        const periodNumber = periodDates.findIndex(
          period =>
            dayjs(override.date).isSameOrAfter(period.startDate, 'day') &&
            dayjs(override.date).isBefore(period.endDate, 'day')
        )

        // Find if the firstStageDates has the same date
        // then remove it from the secondStageDates
        const isSameDate = firstStageDates.some(date =>
          dayjs(date.startTime).isSame(overrideStartDateTime, 'day')
        )

        if (isSameDate) {
          secondStageDates = firstStageDates.map(date => {
            if (dayjs(date.startTime).isSame(overrideStartDateTime, 'day')) {
              return {
                ...date,
                isOverride: true,
              }
            }
            return date
          })
        }

        if (periodNumber !== -1) {
          secondStageDates.push({
            period: periodNumber,
            startTime: overrideStartDateTime.toISOString(),
            endTime: overrideEndDateTime.toISOString(),
            scheduleIndex: -1, // Use -1 to indicate this is an override
          })
        }
      }
    })
  }

  // Sort everything by period, date, and time
  secondStageDates.sort((a, b) => {
    if (a.period !== b.period) {
      return a.period - b.period
    }
    // If in same period, sort by date
    const dateA = dayjs(a.startTime).format('YYYY-MM-DD')
    const dateB = dayjs(b.startTime).format('YYYY-MM-DD')
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB)
    }
    // If same date, sort by time
    return dayjs(a.startTime).diff(dayjs(b.startTime))
  })

  // Group by period and assign lesson numbers within each period
  const periodGroups = secondStageDates.reduce<Record<number, LessonDate[]>>(
    (acc, date) => {
      // const newAcc = { ...acc }
      // if (!newAcc[date.period]) {
      //   newAcc[date.period] = []
      // }
      // newAcc[date.period].push(date)
      // return newAcc

      if (!acc[date.period]) acc[date.period] = []
      acc[date.period].push(date)
      return acc
    },
    {}
  )

  // Assign lesson numbers within each period
  const thirdStageDates = Object.entries(periodGroups).flatMap(
    ([_period, dates]) => {
      return dates.map((date, index) => ({
        ...date,
        lessonNumber: index + 1,
      }))
    }
  )

  return thirdStageDates.map((dateItem, index) => {
    const { startTime, endTime } = dateItem

    const lessonStartTime = startTime
    const lessonEndTime = endTime
    let isOverride = false
    let isBlocked = false

    // Check if the date collides with any date override
    const hasOverrideBlockList = dateOverrides?.some(
      override =>
        dayjs(override.date).isSame(startTime, 'day') && !override.isAvailable
    )

    if (hasOverrideBlockList) {
      isBlocked = true
    }

    if (dateItem.isOverride) {
      isOverride = true
    }

    const wholeDayBlocks = new Set(
      blockTimes
        .filter(b => b.wholeDay)
        .map(b => dayjs(b.startTime).format('YYYY-MM-DD'))
    )

    const isBlockedByBlockTime = blockTimes.some(block => {
      // date is the same
      if (block.wholeDay) {
        return wholeDayBlocks.has(dayjs(startTime).format('YYYY-MM-DD'))
      }

      // check if the lesson time is between the block time
      const blockStartTime = dayjs(block.startTime)
      const blockEndTime = dayjs(block.endTime)

      return dayjs(startTime).isBetween(
        blockStartTime,
        blockEndTime,
        null,
        '[]'
      )
    })

    if (isBlockedByBlockTime) {
      isBlocked = true
    }

    return {
      id: index + 1,
      date: dayjs(startTime).format('YYYY-MM-DD'),
      period: dateItem.period + 1,
      lessonNumber: dateItem.lessonNumber,
      startTime: lessonStartTime,
      endTime: lessonEndTime,
      isOverride,
      isBlocked,
      scheduleIndex: dateItem.scheduleIndex,
    }
  })
}

export const parseDateOverride = (override: DateOverride) => {
  let overrideStartDateTime
  let overrideEndDateTime

  // Check if startTime is a valid ISO string
  if (
    !dayjs(override.startTime).isValid() ||
    !dayjs(override.endTime).isValid()
  ) {
    overrideStartDateTime = dayjs(`${override.date} ${override.startTime}`)
    overrideEndDateTime = dayjs(`${override.date} ${override.endTime}`)
  } else {
    overrideStartDateTime = dayjs(override.startTime).set(
      'date',
      dayjs(override.date).date()
    )
    overrideEndDateTime = dayjs(override.endTime).set(
      'date',
      dayjs(override.date).date()
    )
  }

  return {
    overrideStartDateTime,
    overrideEndDateTime,
  }
}

// Write a function to generate a time round to the next hour and return ISO string from today's time
export const generateNextHour = (): string => {
  return dayjs().add(1, 'hour').startOf('hour').toISOString()
}

/**
 * Default lesson repeat format used to seed an empty `regularScheduleV2.periodsV2`
 * entry. Shared by `RegularClassSchedulePeriods` (which auto-seeds on mount when
 * the array is empty) and `Class/index.tsx`'s `setFormData` (which pre-seeds the
 * same value so the form's `defaultValues` matches the post-seed values — this
 * stops react-hook-form's `isDirty` from being `true` on mount, which would
 * otherwise show the "*Unsaved changes" banner without any user input).
 */
export const buildDefaultRegularV2LessonRepeatFormat = () => ({
  repeat: false,
  every: 1,
  times: 1,
  unit: RepeatUnit.weeks,
  monthDay: 1,
})

export const buildDefaultRegularV2Period = () => {
  const startIso = generateNextHour()
  return {
    startTime: new Date(startIso),
    endTime: new Date(dayjs(startIso).add(1, 'hour').toISOString()),
    lessonRepeatFormat: buildDefaultRegularV2LessonRepeatFormat(),
  }
}
