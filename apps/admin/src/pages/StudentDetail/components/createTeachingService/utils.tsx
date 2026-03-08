import { ClassTypeEnum, PriceType } from '@/types/course'

export function isInsufficientFromSelectedFirstDate(args: {
  currentClassType?: ClassTypeEnum
  priceType?: PriceType | string
  selectedPriceOption?: string | number
  numberOfLessons?: number
  dateTimePickerOpts: string[]
  classLessonDate?: string
  selectedDate?: Date | null
}): boolean {
  const {
    currentClassType,
    priceType,
    selectedPriceOption,
    numberOfLessons,
    dateTimePickerOpts,
    classLessonDate,
    selectedDate,
  } = args

  const recurringWithMultipleOptions =
    currentClassType === ClassTypeEnum.recurring &&
    priceType === PriceType.MULTIPLE_OPTIONS

  if (
    !recurringWithMultipleOptions ||
    !selectedPriceOption ||
    !Array.isArray(dateTimePickerOpts) ||
    dateTimePickerOpts.length === 0 ||
    !numberOfLessons
  ) {
    return false
  }

  let selectedIndex = -1
  if (classLessonDate) {
    const exactIdx = dateTimePickerOpts.findIndex(d => d === classLessonDate)
    if (exactIdx >= 0) {
      selectedIndex = exactIdx
    } else if (selectedDate) {
      const dayStr = selectedDate.toISOString().split('T')[0]
      selectedIndex = dateTimePickerOpts.findIndex(d => d.startsWith(dayStr))
    }
  }

  if (selectedIndex < 0) return false

  return dateTimePickerOpts.length - selectedIndex < (numberOfLessons || 0)
}
