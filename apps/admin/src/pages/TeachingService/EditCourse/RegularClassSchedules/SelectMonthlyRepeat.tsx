import { useState } from 'react'

import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormControl, FormField, FormItem } from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import Text from '@/components/ui/Text'
import { ClassesForm } from '@/types/classes'
import dayjs from '@/utils/dayjs'
import { getWeekdaysArray } from '@/utils/timeString'

const ORDINAL_NUMBERS = [
  { value: 1, label: 'first' },
  { value: 2, label: 'second' },
  { value: 3, label: 'third' },
  { value: 4, label: 'fourth' },
  { value: -1, label: 'last' },
] as const

enum MonthlyType {
  ON_DAY = 'onDay',
  ON_WEEKDAY = 'onWeekday',
}

const SelectMonthlyRepeat = ({
  form,
  index,
}: {
  form: UseFormReturn<ClassesForm>
  index: number
}) => {
  const { control } = form
  const { t } = useTranslation(['teachingService'])
  const weekdays = getWeekdaysArray(t)

  const [selectedMonthlyType, setSelectedMonthlyType] = useState<MonthlyType>(
    MonthlyType.ON_DAY
  )

  return (
    <div className="mt-4">
      <Text className="mb-2">
        {t('teachingService:regularV2.selectMonthPattern')}
      </Text>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <FormField
            name={`regularScheduleV2.periodsV2.${index}.lessonRepeatFormat`}
            control={control}
            render={() => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={value => {
                      setSelectedMonthlyType(value as MonthlyType)
                    }}
                    className="flex flex-col space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={MonthlyType.ON_DAY} id="onDay" />
                      <Label htmlFor="onDay">
                        {t('teachingService:regularV2.monthlyOnDay')}
                      </Label>
                      <FormField
                        name={`regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.startTime`}
                        control={control}
                        render={({ field: dayField }) => (
                          <FormItem className="w-24 ml-2">
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={31}
                                {...dayField}
                                onChange={e => {
                                  const value = Number(e.target.value)
                                  if (value >= 1 && value <= 31) {
                                    dayField.onChange(value)
                                    // Update the startTime to match the selected day
                                    const currentDate = dayjs(
                                      form.getValues(
                                        `regularScheduleV2.periodsV2.${index}.startTime`
                                      )
                                    )
                                    const newDate = currentDate.date(value)
                                    form.setValue(
                                      `regularScheduleV2.periodsV2.${index}.startTime`,
                                      newDate.toDate()
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={MonthlyType.ON_WEEKDAY}
                        id="onWeekday"
                      />
                      <Label htmlFor="onWeekday">
                        {t('teachingService:regularV2.monthlyOnWeekday')}
                      </Label>

                      <div className="flex gap-4 ml-2">
                        <Select
                          value={String(
                            form.getValues(
                              `regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.weekdayOccurrence`
                            ) || ''
                          )}
                          onValueChange={value => {
                            form.setValue(
                              `regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.weekdayOccurrence`,
                              Number.parseInt(value, 10)
                            )
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue
                              placeholder={t(
                                'teachingService:regularV2.selectOrdinal'
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDINAL_NUMBERS.map(number => (
                              <SelectItem
                                key={number.value}
                                value={number.value.toString()}
                              >
                                {t(`teachingService:regularV2.${number.label}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={String(
                            form.getValues(
                              `regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.weekDay`
                            ) || ''
                          )}
                          onValueChange={value => {
                            form.setValue(
                              `regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.weekDay`,
                              Number.parseInt(value, 10)
                            )
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue
                              placeholder={t(
                                'teachingService:regularV2.selectWeekday'
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {weekdays.map((label, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default SelectMonthlyRepeat
