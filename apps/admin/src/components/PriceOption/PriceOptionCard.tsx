import React, { useRef, useState } from 'react'

import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuPencil, LuTrash2, LuX } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import Text from '@/components/ui/Text'
import { cn } from '@/utils/cn'
import { getCurrencySymbol } from '@/utils/currency'

export interface PriceOption {
  id: string
  name: string
  amount: number | null
  numberOfLessons: number
  isFreeOfCharge?: boolean
}

interface PriceOptionCardProps {
  option: PriceOption
  index: number
  currency: string
  form: UseFormReturn<any>
  onDelete?: (index: number) => void
  onUpdate?: (index: number, updatedOption: Partial<PriceOption>) => void
  fieldName: string
  disabled?: boolean
}

const PriceOptionCard: React.FC<PriceOptionCardProps> = ({
  option,
  index,
  currency,
  form,
  onDelete,
  onUpdate,
  fieldName,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const currencySymbol = getCurrencySymbol(currency)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(option.name)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const handleNameEdit = () => {
    setTempName(option.name)
    setIsEditingName(true)
    setTimeout(() => {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }, 0)
  }

  const handleNameSave = () => {
    if (tempName.trim() && tempName !== option.name) {
      onUpdate?.(index, { name: tempName.trim() })
    }
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setTempName(option.name)
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNameSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleNameCancel()
    }
  }

  return (
    <Card
      className={cn(
        'relative border border-gray-200 w-full',
        disabled && 'opacity-50'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {isEditingName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              ref={nameInputRef}
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm font-medium"
              placeholder={
                t('teachingService:class.priceOption.defaultName', {
                  index: index + 1,
                }) as string
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNameSave}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            >
              <LuCheck className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNameCancel}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <LuX className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <CardTitle
              className="text-sm font-medium cursor-pointer hover:text-blue-600 flex-1"
              onClick={!disabled ? handleNameEdit : undefined}
            >
              {option.name ||
                t('teachingService:class.priceOption.defaultName', {
                  index: index + 1,
                })}
            </CardTitle>
            {!disabled && (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleNameEdit}
                  className="h-6 w-6 p-0"
                >
                  <LuPencil className="h-3 w-3" />
                </Button>
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <LuTrash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={`${fieldName}.${index}.name`}
          render={({ field }) => <input type="hidden" {...field} />}
        />

        {/* Price Field */}
        <FormField
          control={form.control}
          name={`${fieldName}.${index}.amount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t('teachingService:class.priceOption.price')}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="1"
                    disabled={
                      disabled ||
                      form.watch(`${fieldName}.${index}.isFreeOfCharge`)
                    }
                    className="pr-12"
                    data-testid={`price-option-${index}-amount`}
                    placeholder="0"
                    onChange={e => {
                      const value = Number(e.target.value)
                      field.onChange(e)

                      if (value === 0) {
                        form.setValue(
                          `${fieldName}.${index}.isFreeOfCharge`,
                          true
                        )
                      } else if (value > 0) {
                        form.setValue(
                          `${fieldName}.${index}.isFreeOfCharge`,
                          false
                        )
                      }
                    }}
                    onBlur={() => {
                      const amount = form.getValues(
                        `${fieldName}.${index}.amount`
                      )
                      const isFreeOfCharge = form.getValues(
                        `${fieldName}.${index}.isFreeOfCharge`
                      )

                      if (
                        !isFreeOfCharge &&
                        (amount === null ||
                          amount === '' ||
                          amount === undefined)
                      ) {
                        form.setError(`${fieldName}.${index}.amount`, {
                          type: 'required',
                          message: t(
                            'teachingService:errors.priceRequired'
                          ) as string,
                        })
                      } else {
                        form.clearErrors(`${fieldName}.${index}.amount`)
                      }
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currencySymbol}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Free of Charge Checkbox */}
        <FormField
          control={form.control}
          name={`${fieldName}.${index}.isFreeOfCharge`}
          render={({ field }) => {
            return (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={checked => {
                      field.onChange(checked)
                      if (checked) {
                        form.setValue(`${fieldName}.${index}.amount`, 0)
                      }
                    }}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    {t('teachingService:class.priceOption.freeOfCharge')}
                  </FormLabel>
                </div>
              </FormItem>
            )
          }}
        />

        {/* Number of Lessons */}
        <FormField
          control={form.control}
          name={`${fieldName}.${index}.numberOfLessons`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t('teachingService:class.priceOption.numberOfLessons')}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    data-testid={`price-option-${index}-numberOfLessons`}
                    type="number"
                    min="1"
                    disabled={disabled}
                    className="pr-16"
                    placeholder="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {t('teachingService:class.priceOption.lessonUnit')}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price per lesson calculation */}
        {form.watch(`${fieldName}.${index}.amount`) > 0 &&
          form.watch(`${fieldName}.${index}.numberOfLessons`) > 1 && (
            <Text className="text-xs text-muted-foreground">
              {currencySymbol}{' '}
              {(
                form.watch(`${fieldName}.${index}.amount`) /
                form.watch(`${fieldName}.${index}.numberOfLessons`)
              ).toFixed(2)}{' '}
              / {t('teachingService:class.priceOption.perLesson')}
            </Text>
          )}
      </CardContent>
    </Card>
  )
}

export default PriceOptionCard
