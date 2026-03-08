import { useMemo } from 'react'

import { useInvoiceEditorContext } from '@/pages/TemplateManagement/InvoiceTemplates/Editor/InvoiceEditorContext'
import { PriceType } from '@/types/course'
import { calculateClassPrice } from '@/utils/class-price-calculation.utils'

import useSiteData from './useSiteData'

const useInvoiceSummary = () => {
  const {
    currentClass,
    selectedSessions,
    manuallySelectedPrice,
    setManuallySelectedPrice,
  } = useInvoiceEditorContext()
  const { currency } = useSiteData()

  const recurringFormat = useMemo(() => {
    return currentClass?.recurringFormat ?? null
  }, [currentClass?.recurringFormat])

  const priceOptions = useMemo(() => {
    return currentClass?.priceOptions ?? []
  }, [currentClass?.priceOptions])

  const sortedPriceOptions = useMemo(() => {
    return [...priceOptions].sort(
      (a, b) => (a.numberOfLessons ?? 0) - (b.numberOfLessons ?? 0)
    )
  }, [priceOptions])

  const selectedPrice = useMemo(() => {
    // If user has manually selected a price, use that
    if (manuallySelectedPrice) {
      return manuallySelectedPrice
    }

    // Otherwise, use automatic calculation
    if (currentClass?.priceType !== PriceType.MULTIPLE_OPTIONS) {
      return sortedPriceOptions.at(0) ?? null
    }
    const lessonsLength = selectedSessions.length
    for (let i = 0; i < sortedPriceOptions.length; i++) {
      const current = sortedPriceOptions[i]
      // eslint-disable-next-line no-continue
      if (!current.numberOfLessons) continue
      if (
        (lessonsLength > 0 && lessonsLength <= current.numberOfLessons) ||
        i === sortedPriceOptions.length - 1
      ) {
        return current
      }
    }
    return null
  }, [
    manuallySelectedPrice,
    selectedSessions,
    sortedPriceOptions,
    currentClass?.priceType,
  ])

  const pricePerLesson = useMemo(() => {
    if (!selectedPrice) return 0
    let amountNum = Number(selectedPrice.amount)
    if (selectedPrice.priceType !== PriceType.PER_LESSON) {
      amountNum =
        Number(selectedPrice.amount) / (selectedPrice?.numberOfLessons || 1)
    }
    return Number.isFinite(amountNum) ? amountNum : 0
  }, [selectedPrice])

  const priceType = useMemo(() => {
    if (!selectedPrice) return null
    return selectedPrice?.priceType ?? null
  }, [selectedPrice])

  const totalPrice = useMemo(() => {
    if (!selectedPrice || !currentClass) return 0
    if (selectedPrice.priceType !== PriceType.PER_LESSON) {
      return calculateClassPrice(
        currentClass,
        selectedSessions.length,
        selectedPrice
      )
    }
    return pricePerLesson * selectedSessions.length
  }, [selectedPrice, currentClass, pricePerLesson, selectedSessions.length])

  const recurringCount = useMemo(() => {
    if (
      currentClass?.priceType === PriceType.MULTIPLE_OPTIONS &&
      selectedPrice
    ) {
      return selectedPrice.numberOfLessons ?? 1
    }
    return recurringFormat?.times ?? 1
  }, [recurringFormat, currentClass?.priceType, selectedPrice])

  const maxRecurringCount = useMemo(() => {
    if (currentClass?.priceType === PriceType.MULTIPLE_OPTIONS) {
      const maxPositive = [...sortedPriceOptions]
        .reverse()
        .find(o => (o.numberOfLessons ?? 0) > 0)?.numberOfLessons
      return maxPositive ?? 1
    }
    return recurringFormat?.times ?? 1
  }, [recurringFormat, currentClass?.priceType, sortedPriceOptions])

  const minRecurringCount = useMemo(() => {
    if (currentClass?.priceType === PriceType.MULTIPLE_OPTIONS) {
      const firstPositive = sortedPriceOptions.find(
        o => (o.numberOfLessons ?? 0) > 0
      )?.numberOfLessons
      return firstPositive ?? 1
    }
    return recurringFormat?.times ?? 1
  }, [recurringFormat, currentClass?.priceType, sortedPriceOptions])

  const nextRecurringCount = useMemo(() => {
    if (currentClass?.priceType === PriceType.MULTIPLE_OPTIONS) {
      if (selectedPrice && selectedPrice.numberOfLessons) {
        return sortedPriceOptions.find(
          option =>
            option.numberOfLessons &&
            option.numberOfLessons > (selectedPrice.numberOfLessons ?? 0)
        )?.numberOfLessons
      }
      return minRecurringCount
    }
    return recurringFormat?.times ?? 1
  }, [recurringFormat, sortedPriceOptions, selectedPrice, minRecurringCount])

  return {
    priceType,
    pricePerLesson,
    selectedPrice,
    totalPrice,
    countLessons: selectedSessions.length,
    currency,
    recurringCount,
    recurringFormat,
    priceOptions,
    maxRecurringCount,
    minRecurringCount,
    nextRecurringCount,
    manuallySelectedPrice,
    setManuallySelectedPrice,
  }
}
export default useInvoiceSummary
