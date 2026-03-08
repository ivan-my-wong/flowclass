import getSymbolFromCurrency from 'currency-symbol-map'
import dayjs from 'dayjs'
import { findLast } from 'lodash'

import { PriceOption } from '@/page-components/enrol/PickTimeSteps/PickPriceOptionStep'
import { SelectedClassDataState } from '@/stores/enrol'
import { Class, ClassType, Course, PeriodLesson, TuitionMode } from '@/types'
import { BundleTable } from '@/types/bundleDiscount'
import { StudentLesson } from '@/types/enrol'
import { RegularScheduleLessonPreviewPeriodGroup } from '@/types/regularSchedule'
import { ClassTriaLessonResponse } from '@/types/trial-lesson'
import { getPriceWithCurrency } from '@/utils/string.utils'

export const getPriceRangeFromCourse = (
  course: Course
): { priceRange: number[]; cheapestClass?: Class } => {
  if (!course?.classes?.length) {
    return { priceRange: [], cheapestClass: undefined }
  }

  const allPrices = course.classes.flatMap(cls => {
    const prices: number[] = []

    // Untuk class dengan MULTIPLE_OPTIONS, hanya ambil dari priceOptions
    if (cls.priceType === TuitionMode.MULTIPLE_OPTIONS) {
      if (cls.priceOptions?.length) {
        cls.priceOptions.forEach(option => {
          const amount = Number(option.amount)
          if (!isNaN(amount) && amount >= 0) {
            prices.push(amount)
          }
        })
      }
    } else {
      // Untuk class biasa, ambil dari tuition atau priceOptions[0]
      const tuition = Number(cls.tuition)
      if (!isNaN(tuition) && tuition >= 0) {
        prices.push(tuition)
      }

      // Fallback ke priceOptions jika tuition tidak ada
      if ((!cls.tuition || cls.tuition === 0) && cls.priceOptions?.length) {
        cls.priceOptions.forEach(option => {
          const amount = Number(option.amount)
          if (!isNaN(amount) && amount >= 0) {
            prices.push(amount)
          }
        })
      }
    }

    return prices
  })

  if (!allPrices.length) {
    return { priceRange: [], cheapestClass: undefined }
  }

  const uniqueSortedPrices = [...new Set(allPrices)].sort((a, b) => a - b)
  const minPrice = uniqueSortedPrices[0]

  // Cari cheapestClass yang mengandung minPrice
  const cheapestClass = course.classes.find(cls => {
    // Untuk MULTIPLE_OPTIONS, cek di priceOptions saja
    if (cls.priceType === TuitionMode.MULTIPLE_OPTIONS) {
      return cls.priceOptions?.some(option => Number(option.amount) === minPrice)
    }
    // Untuk class biasa, cek tuition atau priceOptions
    return (
      Number(cls.tuition) === minPrice ||
      cls.priceOptions?.some(option => Number(option.amount) === minPrice)
    )
  })

  return {
    priceRange: [uniqueSortedPrices[0], uniqueSortedPrices[uniqueSortedPrices.length - 1]],
    cheapestClass,
  }
}

export const getShortestDurationFromCourse = (course: Course): string | null => {
  if (!course) return null

  const classes = course.classes

  if (classes && classes.length > 0) {
    const duration =
      classes
        .map(classItem => {
          if (classItem.type === ClassType.regular || classItem.type === ClassType.workshop) {
            return classItem.regularPeriods.map(item => item.duration ?? 60)
          }
          return 999
        })
        .flat() ?? []

    //edit later for Date.parse(i[0]))
    return Math.min(...duration).toString()
  }

  return null
}

const quota = (quotaValues: number[]) => {
  const minQuota = quotaValues.reduce(
    (min, quota) => Math.min(min ?? 0, quota ?? Infinity),
    Infinity
  )
  const maxQuota = quotaValues.reduce(
    (max, quota) => Math.max(max ?? -Infinity, quota ?? 0),
    -Infinity
  )

  if (minQuota === Infinity && maxQuota === -Infinity) return null
  if (minQuota != maxQuota) return `${minQuota} -  ${maxQuota}`
  else return `${minQuota}`
}

export const getCourseQuota = (course: Course) => {
  if (!course) return null

  const classes = course.classes

  if (course.classes != null) {
    const quotaValues = classes
      .map(classes => classes.quota)
      .filter(value => value !== undefined) as number[]
    return quota(quotaValues)
  }

  return null
}

// export const getCourseTotalFee = (course: Course) => {
//   if (!course) return null
//   if (course.type === 'workshop') {
//     const { sessions: sessions } = course
//     if (sessions && sessions.length > 0) {
//       const feeValues = sessions.map((session) => session.totalFee)
//       const minFee = feeValues.reduce((min, fee) => Math.min(min ?? 0, fee ?? Infinity), Infinity)
//       const maxFee = feeValues.reduce((max, fee) => Math.max(max ?? -Infinity, fee ?? 0), -Infinity)
//       if (minFee === 0) return `${maxFee}`
//       if (minFee != maxFee) return `${minFee} -  ${maxFee}`
//       else return `${minFee}`
//     }
//   } else if (course.type === ClassType.regular) {
//     const { classes: classes } = course
//     if (classes && classes.length > 0) {
//       const lessonNumber = classes
//         .map((classItem) => classItem.schedule.map((item) => item.period.lessons.length))
//         .flat()
//
//       const lowestPrice = getPriceRangeFromCourse(course)
//       const lowestLesson = Math.min(...lessonNumber)
//
//       if (lowestPrice && lowestLesson !== Infinity && lowestLesson > 0)
//         return lowestPrice * lowestLesson
//     }
//   }
//
//   return null
// }

export const getDuration = (course: Course): [number, number] | null => {
  if (!course) return null
  let minDuration: number | undefined
  let maxDuration: number | undefined
  course.classes.forEach(cls => {
    cls.regularPeriods.forEach(period => {
      const duration = period?.duration ?? 0

      if (minDuration === undefined || duration < minDuration) {
        minDuration = period.duration
      }

      if (maxDuration === undefined || duration > maxDuration) {
        maxDuration = period.duration
      }
    })
  })

  if (minDuration !== undefined && maxDuration !== undefined) {
    return [minDuration, maxDuration]
  }

  return null
}

export const calculateDiscountfromBundleTable = (
  bundleTable: BundleTable,
  amount: number,
  numOfLessons: number
): number => {
  const discount = findLast(bundleTable, bundle => bundle.amount <= amount)?.discount

  if (discount) {
    return discount * numOfLessons
  }
  return 0
}

export const getLessonQuantityBooked = (
  selectedClass: SelectedClassDataState,
  lessonIndex?: number
): number => {
  const selectedLesson = selectedClass?.selectedLessons
  const selectedRegularPeriod = selectedClass?.selectedRegularPeriod
  if (selectedLesson && selectedRegularPeriod) {
    if (!!lessonIndex && lessonIndex > 0 && selectedClass?.selectedRegularPeriod) {
      return selectedClass?.selectedRegularPeriod?.lessons?.length - lessonIndex
    }
    // return (
    //   selectedClass?.selectedRegularPeriod?.lessons?.filter(
    //     (lesson) => new Date(lesson.startTime) >= new Date(selectedLesson?.split(' ')[0] ?? '')
    //   )?.length ?? 0
    // )
    return selectedClass?.selectedRegularPeriod?.lessons?.length ?? 0
  }
  return 0
}

export const getMultiSelectLessonQuantityBooked = (
  selectedData: SelectedClassDataState[]
): number => {
  return (
    selectedData.reduce((acc, data) => {
      // if (data.selectedClassData) {
      //   return acc + (getLessonQuantityBooked(data.selectedClassData) ?? 0)
      // }
      // return 0
      return acc + (getLessonQuantityBooked(data) ?? 0)
    }, 0) ?? 0
  )
}

export const calculateClassPrice = (
  selectedClass: Class | undefined,
  numOfSelectedLessons: number,
  totalLesson: number,
  selectedPriceOption?: PriceOption
): number => {
  if (!selectedClass) return 0
  if (selectedPriceOption) {
    const amount = Number(selectedPriceOption.amount)
    if (!Number.isFinite(amount)) return 0
    if (selectedClass.priceType === TuitionMode.PER_LESSON) {
      return amount * numOfSelectedLessons
    } else {
      const numberOfLessons = selectedPriceOption.numberOfLessons
      if (!numberOfLessons || !Number.isFinite(numberOfLessons) || numberOfLessons <= 0) return 0
      return Number(((amount * numOfSelectedLessons) / numberOfLessons).toFixed(2))
    }
  }
  return selectedClass.tuition
}

/**
+ * Calculates the class price for all types of classes including regular, recurring, 
+ * subscription, and trial lessons.
+ * 
+ * @param item - The selected class data containing class details and selected lessons
+ * @param classTrialLesson - Optional trial lesson data with specific pricing
+ * @returns The calculated price as a number, or 0 if calculation is not possible
+ */

export const calculateClassPriceForAllTypes = ({
  item,
  classTrialLesson,
}: {
  item: SelectedClassDataState
  classTrialLesson?: ClassTriaLessonResponse
}): number => {
  if (!item || !item.selectedClass) return 0

  if (item.selectedLessons) {
    let thisTuition = 0
    if (classTrialLesson) {
      thisTuition = Number(classTrialLesson.price) || 0
    } else {
      thisTuition = calculateClassPrice(
        item.selectedClass,
        item.selectedLessons.length,
        item.selectedRegularPeriod?.lessons?.length ?? item.selectedLessons.length,
        item.selectedPriceOption
      )
    }
    return thisTuition
  }
  const recurringLessons = item.selectedRecurLessons ?? item.selectedIndividualRecurLessons
  // For recurring lessons and appointment lessons
  if (!!recurringLessons && recurringLessons.length > 0) {
    const thisTuition = calculateClassPrice(
      item.selectedClass,
      recurringLessons.length,
      recurringLessons.length,
      item.selectedPriceOption
    )

    return thisTuition
  }

  if (item.selectedClass?.type === ClassType.subscription) {
    return Number(item.selectedClass.tuition) || 0
  }

  return 0
}

export const calculatePriceDetails = ({
  periodPrice,
  numberOfApplicant,
  periodLessonNumber,
  totalLesson,
  siteSetting,
  classTrialLesson,
  selectedClass,
  t,
}: {
  periodPrice: number
  numberOfApplicant: number
  periodLessonNumber: number
  totalLesson: number
  siteSetting: { currency: string }
  classTrialLesson?: { price?: string | number }
  selectedClass: { priceType: TuitionMode }
  t: (key: string) => string
}): { totalPrice: number; priceExplanation: string; priceTrialExplanation: string } => {
  const totalPrice = periodPrice * numberOfApplicant
  const lessonPriceText = `x ${periodLessonNumber} (${t('enrol:pickTuitionStep.numOfLesson')})`
  const lessonTrialPriceText = `x 1 (${t('enrol:pickTuitionStep.numOfLesson')})`

  let classPriceText = t('enrol:pickPeriodStep.perClass')

  if (periodLessonNumber !== totalLesson) {
    classPriceText = `${t('enrol:pickPeriodStep.forBuying')} ${periodLessonNumber} `
    classPriceText += t('enrol:pickPeriodStep.lessonsInClass')
  }

  const pricePerLesson = getPriceWithCurrency(
    siteSetting?.currency,
    periodPrice / periodLessonNumber
  )
  const periodPriceWithCurrency = getPriceWithCurrency(siteSetting?.currency, periodPrice)
  const trialPrice = getPriceWithCurrency(siteSetting?.currency, +(classTrialLesson?.price || '0'))

  let priceExplanation =
    selectedClass.priceType === TuitionMode.PER_CLASS
      ? `${periodPriceWithCurrency} (${t('enrol:pickTuitionStep.pricePerClass')}) ${classPriceText}`
      : `${pricePerLesson} (${t('enrol:pickTuitionStep.pricePerLesson')}) ${lessonPriceText}`

  priceExplanation += ` x ${numberOfApplicant} (${t('enrol:pickTuitionStep.numberOfApplicant')})`

  const priceTrialExplanation = `${trialPrice} (${t(
    'enrol:pickTuitionStep.pricePerLesson'
  )}) ${lessonTrialPriceText} x ${numberOfApplicant} (${t(
    'enrol:pickTuitionStep.numberOfApplicant'
  )})`

  return { totalPrice, priceExplanation, priceTrialExplanation }
}

export const getLessonFinalStartAndEndTime = (
  lesson: StudentLesson
): {
  startTime: Date
  endTime: Date
} => {
  return {
    startTime: lesson.changeStartTime ?? lesson.startTime,
    endTime: lesson.changeEndTime ?? lesson.endTime,
  }
}

export const generateTotalLessons = ({
  selectedClass,
  selectedRecurLessons,
  selectedRegularLesson,
  selectedRegularScheduleV2,
  currentSelectedClassData,
}: {
  selectedClass: Class
  selectedRecurLessons: string[] | undefined
  selectedRegularLesson: PeriodLesson[] | undefined
  selectedRegularScheduleV2: RegularScheduleLessonPreviewPeriodGroup[] | undefined
  currentSelectedClassData: {
    selectedRegularPeriod?: { lessons: any[] }
    selectedIndividualRecurLessons?: string[]
  }
}): { allLessonDates: string[]; periodLessonNumber: number; totalLesson: number } => {
  let allLessonDates: string[] = []
  let periodLessonNumber = 0
  let totalLesson = 1

  if (selectedClass?.type === ClassType.recurring) {
    const lessons =
      selectedRecurLessons || currentSelectedClassData.selectedIndividualRecurLessons || []
    allLessonDates = lessons
    periodLessonNumber = lessons.length
    totalLesson = lessons.length
  } else if (selectedClass?.type === ClassType.regularV2) {
    allLessonDates = selectedRecurLessons || []
    periodLessonNumber = selectedRecurLessons?.length ?? 0
    totalLesson =
      selectedRegularScheduleV2?.reduce((acc, group) => acc + group.lessons.length, 0) ?? 0
  } else if (
    selectedClass?.type === ClassType.regular ||
    selectedClass?.type === ClassType.workshop
  ) {
    allLessonDates =
      selectedRegularLesson?.map(
        lesson =>
          `${dayjs(lesson.startTime).format('YYYY/MM/DD hh:mm a')} - ${dayjs(lesson.endTime).format(
            'YYYY/MM/DD hh:mm a'
          )}`
      ) ?? []
    periodLessonNumber = selectedRegularLesson?.length ?? 0
    totalLesson = currentSelectedClassData.selectedRegularPeriod?.lessons.length ?? 1
  }
  return { allLessonDates, periodLessonNumber, totalLesson }
}

export const getMultipleOptionsPriceDisplay = (classItem: Class, currency: string) => {
  if (classItem.priceType !== TuitionMode.MULTIPLE_OPTIONS || !classItem.priceOptions?.length) {
    return null
  }

  const prices = classItem.priceOptions.map(option => option.amount).sort((a, b) => a - b)
  const minPrice = prices[0]
  const maxPrice = prices[prices.length - 1]

  if (minPrice === maxPrice) {
    return `${currency}${getSymbolFromCurrency(currency)} ${minPrice}`
  }

  return `${currency}${getSymbolFromCurrency(currency)} ${minPrice} - ${maxPrice}`
}

export const availableTimeslotsCount = (classItem: Class): number => {
  let totalLessonsLength = 0

  if (classItem.type === ClassType.regular || classItem.type === ClassType.workshop) {
    const numberOfLessonsInEachPeriod: number[] = []

    classItem.regularPeriods.forEach(period => {
      if (period.lessons) {
        const filterLesson = period.lessons?.filter(
          lesson => new Date(lesson.startTime) > new Date()
        )
        numberOfLessonsInEachPeriod.push(filterLesson.length)
      }
    })

    totalLessonsLength = Math.min(...numberOfLessonsInEachPeriod)
  } else if (classItem.type === ClassType.recurring) {
    totalLessonsLength = classItem.recurringSchedules.length
  }

  return totalLessonsLength
}

export const getLessonsOrOptionsCount = (classItem: Class, t: (key: string) => string): string => {
  if (classItem.priceType === TuitionMode.MULTIPLE_OPTIONS && classItem.priceOptions?.length) {
    const lessonCounts = classItem.priceOptions
      .map(option => option.numberOfLessons)
      .filter(count => count && count > 0)
      .sort((a, b) => a - b)

    const availableSlots = availableTimeslotsCount(classItem)
    let lessonsDisplay = ''

    if (lessonCounts.length > 0) {
      const minLessons = lessonCounts[0]
      const maxLessons = lessonCounts[lessonCounts.length - 1]

      if (minLessons === maxLessons) {
        lessonsDisplay = `${minLessons} ${t('enrol:pickPeriodStep.lessons')}`
      } else {
        lessonsDisplay = `${minLessons} - ${maxLessons} ${t('enrol:pickPeriodStep.lessons')}`
      }
    } else {
      lessonsDisplay = `${classItem.priceOptions.length} ${t('enrol:pickPeriodStep.options')}`
    }

    return `${lessonsDisplay} / ${availableSlots} ${t('enrol:pickPeriodStep.timeslotsAvailable')}`
  }
  return availableTimeslotsCount(classItem).toString()
}
