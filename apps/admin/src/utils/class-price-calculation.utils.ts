import { Classes } from '@/types/classes'
import { PriceType } from '@/types/course'
import type { PriceOption } from '@/types/regularClass'

export const calculateClassPrice = (
  selectedClass: Classes | undefined,
  numOfSelectedLessons: number,
  selectedPriceOption: PriceOption | null
) => {
  if (selectedClass && selectedPriceOption) {
    const amount = Number(selectedPriceOption.amount)
    if (!Number.isFinite(amount)) return 0
    if (selectedClass.priceType === PriceType.PER_LESSON) {
      return amount * numOfSelectedLessons
    }
    return (
      (amount * numOfSelectedLessons) /
      (selectedPriceOption.numberOfLessons ?? 1)
    )
  }
  return 0
}
