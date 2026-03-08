/* eslint-disable no-underscore-dangle */

import { BaseModelWithTimestamps } from '@/types/common'
import dayjs from '@/utils/dayjs'

import { Classes, RecurringSchedules, RegularPeriods } from '../types/classes'
import { ClassTypeEnum, Course } from '../types/course'
import { CalculatedMetrics, MetricConfig } from '../types/metrics'

import { formatCurrency } from './currency'
import { formatDuration } from './timeFormat'

export const calculatePriceMathFromCourse = (
  course: Course,
  mode: 'low' | 'high'
): number | null => {
  if (!course || !course.classes) return null

  const priceArray = course.classes.map((classEntity: Classes) => {
    return classEntity.tuition
  })

  if (priceArray && priceArray.length > 0) {
    const priceArrayFiltered = priceArray.filter(
      price => price !== null
    ) as number[]

    if (mode === 'high') {
      return Math.max(...priceArrayFiltered)
    }
    if (mode === 'low') {
      return Math.min(...priceArrayFiltered)
    }
  }

  return null
}

export const getShortestDurationFromCourse = (
  course: Course
): string | null => {
  if (!course || !course.classes) return null

  const durationArray = course.classes.map((classEntity: Classes) => {
    if (
      classEntity.type === ClassTypeEnum.regular ||
      classEntity.type === ClassTypeEnum.workshop
    ) {
      const periodArray =
        classEntity.regularPeriods?.map((period: RegularPeriods) => {
          return period.duration
        }) ?? []
      return Math.min(...periodArray)
    }

    if (classEntity.type === ClassTypeEnum.recurring) {
      const periodArray =
        classEntity.recurringSchedules?.map((schedule: RecurringSchedules) => {
          return dayjs(schedule.endTime).diff(
            dayjs(schedule.startTime),
            'minutes'
          )
        }) ?? []
      return Math.min(...periodArray)
    }
    return null
  })

  if (durationArray) {
    const durationArrayFiltered = durationArray.filter(
      duration => duration !== null
    ) as number[]
    return Math.min(...durationArrayFiltered).toString()
  }

  return null
}

export const getCourseQuota = (course: Course): string | null => {
  if (!course || !course.classes) return null

  const quotaArray = course.classes.map((classEntity: Classes) => {
    if (classEntity.quota && classEntity.quota > 0) {
      return classEntity.quota
    }
    return null
  })

  const filteredQuotaArray = quotaArray.filter(
    quota => quota !== null
  ) as number[]

  const minQuota = Math.min(...filteredQuotaArray)
  const maxQuota = Math.max(...filteredQuotaArray)

  if (minQuota !== maxQuota) return `${minQuota} - ${maxQuota}`
  return `${minQuota}`
}

export const calculateGrowthRate = (
  current: number,
  previous: number,
  isCurrencyMetric = false,
  isTimeMetric = false,
  currency?: string
): string => {
  if (previous === 0 && current === 0) return '0 (0%)'

  const change = current - previous
  const growthRate = ((current - previous) / Math.abs(previous)) * 100
  const roundedRate = Math.round(growthRate * 100) / 100

  let formattedChange = ''
  const sign = change >= 0 ? '+' : '-'

  if (!isCurrencyMetric) {
    if (isTimeMetric) {
      formattedChange = formatDuration(Math.abs(change))
    } else {
      formattedChange = Math.abs(change).toString()
    }
  } else {
    formattedChange = formatCurrency(Math.abs(change), currency ?? '')
  }

  if (!Number.isFinite(roundedRate)) {
    return `${sign}${formattedChange} (∞)`
  }

  // Handle infinite growth rate

  return `${sign}${formattedChange} (${
    roundedRate > 0 ? '+' : ''
  }${roundedRate}%)`
}

export const calculateMetrics = <T extends BaseModelWithTimestamps>(
  data: T[],
  startDate: string,
  endDate: string,
  metricConfigs: MetricConfig<T>[],
  currency: string
): CalculatedMetrics => {
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).endOf('day')

  const daysDifference = end.diff(start, 'days')
  const previousEnd = dayjs(start).subtract(1, 'days').endOf('day')
  const previousStart = dayjs(previousEnd)
    .subtract(daysDifference, 'days')
    .startOf('day')

  const metrics: CalculatedMetrics = {}

  metricConfigs.forEach(config => {
    let currentValue = 0
    let previousValue = 0

    data.forEach(item => {
      const createdDate = dayjs(item.createdAt)
      const value = config.getValue(item)
      if (value === undefined) return
      if (!item.createdAt) {
        currentValue += value
        return
      }

      if (createdDate.isBetween(start, end, 'day', '[]')) {
        currentValue += value
      } else if (
        createdDate.isBetween(previousStart, previousEnd, 'day', '[]')
      ) {
        previousValue += value
      }
    })
    metrics[config.name] = {
      name: config.name,
      isCurrency: config.isCurrency,
      current: currentValue,
      previous: previousValue,
      chart: config.getChartData?.(data) || undefined,
      growthRate: calculateGrowthRate(
        currentValue,
        previousValue,
        config.isCurrency,
        config.isTimeMetric,
        currency
      ),
    }
  })

  return metrics
}

export const availableTimeslotsCount = (classItem: Classes): number => {
  let totalLessonsLength = 0

  if (
    classItem.type === ClassTypeEnum.regular ||
    classItem.type === ClassTypeEnum.workshop
  ) {
    classItem.regularPeriods.forEach(period => {
      if (period.lessons) {
        const filterLesson = period.lessons?.filter(
          lesson => new Date(lesson.startTime) > new Date()
        )
        totalLessonsLength += filterLesson.length
      }
    })
  } else if (classItem.type === ClassTypeEnum.recurring) {
    totalLessonsLength = classItem.recurringSchedules.length
  }

  return totalLessonsLength
}

export const getLessonCountInPeriodOrRecurring = (
  classItem: Classes,
  periodId: number
): number => {
  if (
    classItem.type === ClassTypeEnum.regular ||
    classItem.type === ClassTypeEnum.workshop
  ) {
    const period = classItem.regularPeriods.find(
      period => period.id === periodId
    )
    if (period) {
      return period.lessons.length
    }
  } else if (
    classItem.type === ClassTypeEnum.recurring ||
    classItem.type === ClassTypeEnum.appointment
  ) {
    return classItem.recurringFormat?.times ?? 1
  }
  return 1
}

const areAllLessonsInFuture = (classItem: Classes): boolean => {
  const today = new Date()

  return classItem.regularPeriods.every(period =>
    period.lessons?.every(lesson => new Date(lesson.startTime) > today)
  )
}
export const isClassUnavailable = (
  classItem: Classes,
  isPassQuotaCheck?: boolean
): boolean => {
  // Enroll count exceed the class quota
  if (
    !isPassQuotaCheck &&
    classItem.quota !== 0 &&
    (classItem.classQuota?.length ?? 0) > 0 &&
    classItem.classQuota?.every(enroll => enroll.remainingQuota <= 0)
  ) {
    return true
  }
  if (
    classItem.type === ClassTypeEnum.regular ||
    classItem.type === ClassTypeEnum.workshop
  ) {
    if (classItem.dropIn) {
      // For drop-in classes, check if there are any available timeslots
      return availableTimeslotsCount(classItem) === 0
    }
    // For non-drop-in classes, check if all lessons are in the future
    return !areAllLessonsInFuture(classItem)
  }
  // For recurring class, there are no recurring schedules
  if (
    classItem.recurringSchedules?.length === 0 &&
    classItem.type === ClassTypeEnum.recurring
  ) {
    return true
  }
  return false
}
