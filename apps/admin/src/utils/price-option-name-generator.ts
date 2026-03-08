import { Classes } from '@/types/classes'
import { PriceType } from '@/types/course'

import { formatCurrency, getCurrencySymbol } from './currency'

export const generateDefaultPriceOptionName = (
  t: (key: string, options?: any) => string,
  numberOfLessons = 1,
  amount = 0,
  currency = 'HKD'
): string => {
  if (numberOfLessons === 1) {
    return t('teachingService:class.priceOption.singleLessonName', {
      amount,
      currency: getCurrencySymbol(currency),
    })
  }
  if (numberOfLessons <= 5) {
    return t('teachingService:class.priceOption.smallPackageName', {
      lessons: numberOfLessons,
      amount,
      currency: getCurrencySymbol(currency),
    })
  }
  return t('teachingService:class.priceOption.largePackageName', {
    lessons: numberOfLessons,
    amount,
    currency: getCurrencySymbol(currency),
  })
}

export const getClassDisplayPrice = (classItem: Classes): number => {
  if (classItem.priceType === PriceType.MULTIPLE_OPTIONS) {
    if (classItem.priceOptions && classItem.priceOptions.length > 0) {
      const firstOption = classItem.priceOptions[0]
      return Number(firstOption.amount)
    }

    return 0
  }

  return classItem.tuition || 0
}

export const getClassPriceDisplayText = (
  classItem: Classes,
  currency: string,
  lessonText: string
): string => {
  if (
    classItem.priceType === PriceType.MULTIPLE_OPTIONS &&
    classItem.priceOptions &&
    classItem.priceOptions.length > 1
  ) {
    const { min, max } = getClassPriceRange(classItem)

    if (min === max) {
      return `${currency} ${formatCurrency(min, currency)} / ${lessonText}`
    }
    return `${currency} ${formatCurrency(min, currency)} - ${formatCurrency(
      max,
      currency
    )} / ${lessonText}`
  }

  const displayPrice = getClassDisplayPrice(classItem)
  return `${currency} ${formatCurrency(displayPrice, currency)} / ${lessonText}`
}

export const getClassPriceRange = (
  classItem: Classes
): { min: number; max: number } => {
  if (
    classItem.priceType === PriceType.MULTIPLE_OPTIONS &&
    classItem.priceOptions &&
    classItem.priceOptions.length > 0
  ) {
    const prices = classItem.priceOptions.map(option => option.amount)
    return {
      min: Math.min(...prices.map(Number)),
      max: Math.max(...prices.map(Number)),
    }
  }

  const price = classItem.tuition || 0
  return { min: price, max: price }
}
