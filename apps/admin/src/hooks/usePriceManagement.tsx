import { useEffect } from 'react'

import { UseFormReturn } from 'react-hook-form'

import { ClassesForm } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'

const usePriceManagement = (
  type: ClassTypeEnum,
  priceType: PriceType,
  localForm: UseFormReturn<ClassesForm>
) => {
  const isMultiplePriceType = priceType === PriceType.MULTIPLE_OPTIONS
  const isRecurringOrAppointment =
    type === ClassTypeEnum.recurring || type === ClassTypeEnum.appointment

  const showTuitionField = !isMultiplePriceType

  const showPriceOptions = isRecurringOrAppointment && isMultiplePriceType

  useEffect(() => {
    const subscription = localForm.watch((value, { name }) => {
      if (
        name === 'priceOptions' &&
        showPriceOptions &&
        value.priceOptions?.length &&
        value.priceOptions.length > 0
      ) {
        const currentTuition = localForm.getValues('tuition')
        const firstOptionAmount = value.priceOptions[0]?.amount

        if (
          firstOptionAmount &&
          Number(currentTuition) !== Number(firstOptionAmount)
        ) {
          localForm.setValue('tuition', Number(firstOptionAmount), {
            shouldDirty: false,
          })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [showPriceOptions, localForm])

  return {
    showTuitionField,
    showPriceOptions,
    isMultiplePriceType,
    isRecurringOrAppointment,
  }
}

export default usePriceManagement
