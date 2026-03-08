import React, { useEffect } from 'react'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { v4 as uuidv4 } from 'uuid'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { generateDefaultPriceOptionName } from '@/utils/price-option-name-generator'

import PriceOptionCard from './PriceOptionCard'

interface PriceOption {
  id: string
  name: string
  amount: number | null
  numberOfLessons: number
  isFreeOfCharge?: boolean
}

interface PriceOptionsManagerProps {
  currency: string
  form: UseFormReturn<any>
  fieldName?: string
  maxOptions?: number
  disabled?: boolean
}

const PriceOptionsManager: React.FC<PriceOptionsManagerProps> = ({
  currency,
  form,
  fieldName = 'priceOptions',
  maxOptions = 5,
  disabled = false,
}) => {
  const { t } = useTranslation()

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: fieldName,
  })

  useEffect(() => {
    fields.forEach((field, index) => {
      const currentAmount = form.getValues(`${fieldName}.${index}.amount`)
      const currentIsFree = form.getValues(
        `${fieldName}.${index}.isFreeOfCharge`
      )

      if (currentAmount === 0 && !currentIsFree) {
        form.setValue(`${fieldName}.${index}.isFreeOfCharge`, true, {
          shouldDirty: true,
          shouldTouch: true,
        })
      } else if (currentAmount > 0 && currentIsFree) {
        form.setValue(`${fieldName}.${index}.isFreeOfCharge`, false, {
          shouldDirty: true,
          shouldTouch: true,
        })
      }
    })
  }, [fields, form, fieldName])

  const addOption = () => {
    const newOption: PriceOption = {
      id: uuidv4(),
      // name: generateDefaultPriceOptionName(t, 1, 0, currency),
      name: `${t('teachingService:class.priceOption.defaultPriceOptionName')} ${
        fields.length + 1
      }`,
      amount: null,
      numberOfLessons: 1,
      isFreeOfCharge: false,
    }

    append(newOption)
  }
  const updateOption = (index: number, updatedOption: Partial<PriceOption>) => {
    const currentFormValues = form.getValues(`${fieldName}.${index}`)
    const updatedField = { ...currentFormValues, ...updatedOption }
    update(index, updatedField)
  }
  const deleteOption = (index: number) => {
    remove(index)
  }

  return (
    <Box direction="col" gap="sm" className="w-full">
      {fields.map((field, index) => (
        <PriceOptionCard
          key={field.id}
          option={field as unknown as PriceOption}
          index={index}
          currency={currency}
          form={form}
          fieldName={fieldName}
          onUpdate={updateOption}
          onDelete={fields.length > 1 ? deleteOption : undefined}
          disabled={disabled}
        />
      ))}

      {fields.length < maxOptions && !disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          className="w-full border-dashed"
        >
          <LuPlus className="mr-2 h-4 w-4" />
          {t('teachingService:class.priceOption.addOption')}
        </Button>
      )}
    </Box>
  )
}

export default PriceOptionsManager
