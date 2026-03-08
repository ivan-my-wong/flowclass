import { useEffect, useState } from 'react'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuClock } from 'react-icons/lu'

import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
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
import { RepeatUnit } from '@/constants/course'
import { ClassesForm } from '@/types/classes'
import dayjs from '@/utils/dayjs'

enum PeriodConfigurationType {
  FIXED = 'fixed',
  INFINITE = 'infinite',
}

export const PeriodConfigurationSection = (): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  const form = useFormContext<ClassesForm>()
  const { getValues } = form

  const fieldPath = 'regularScheduleV2.periodRepeatCount' as const

  const [periodConfigurationType, setPeriodConfigurationType] =
    useState<PeriodConfigurationType>(PeriodConfigurationType.FIXED)

  const periodUnitOptions = [
    { label: t('teachingService:regularV2.months'), value: RepeatUnit.months },
    { label: t('teachingService:regularV2.weeks'), value: RepeatUnit.weeks },
  ]

  const gapUnitOptions = [
    { label: t('teachingService:regularV2.days'), value: RepeatUnit.days },
    { label: t('teachingService:regularV2.weeks'), value: RepeatUnit.weeks },
    { label: t('teachingService:regularV2.months'), value: RepeatUnit.months },
  ]

  // Update periodRepeatCount when configurationType changes
  useEffect(() => {
    if (periodConfigurationType === PeriodConfigurationType.INFINITE) {
      form.setValue(fieldPath as any, -1 as any)
    }
  }, [periodConfigurationType])

  const periodRepeatCount = form.watch('regularScheduleV2.periodRepeatCount')

  useEffect(() => {
    if (periodRepeatCount === -1) {
      setPeriodConfigurationType(PeriodConfigurationType.INFINITE)
    }
  }, [periodRepeatCount])

  return (
    <Card className="p-4 gap-4 box-col-full items-start">
      <div className="box-row-full justify-start items-center">
        <LuClock />
        <Text className="text-xl font-semibold">
          {t('teachingService:regularV2.periodConfiguration')}
        </Text>
      </div>

      {/* Length of Each Period */}
      <div className="box-col-full items-start">
        <Label className="font-semibold">
          {t('teachingService:regularV2.lengthOfEachPeriod')}
        </Label>
        <div className="flex gap-2">
          <FormField
            name="regularScheduleV2.periodRepeatFormat.every"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="number" min="1" className="w-20" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="regularScheduleV2.periodRepeatFormat.unit"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodUnitOptions.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="box-col-full items-start">
        <Label className="font-semibold">
          {t('teachingService:regularV2.startTime')}
        </Label>
        <FormField
          name="regularScheduleV2.periodRepeatFormat.startTime"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <CustomDatePicker
                  showTimeSelect={false}
                  selectedDate={dayjs(field.value).toISOString()}
                  dateFormat="YYYY-MM-dd"
                  timeIntervals={5}
                  onChange={date => {
                    field.onChange(
                      dayjs(date).startOf('day').toISOString() ?? ''
                    )
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Badge variant="outline">
          {(() => {
            const startTime = form.getValues(
              'regularScheduleV2.periodRepeatFormat.startTime'
            )
            return dayjs(startTime).format('dddd')
          })()}
        </Badge>
      </div>

      {/* Gap Between Periods */}
      <div className="box-col-full items-start">
        <Label className="font-semibold">
          {t('teachingService:regularV2.gapBetweenPeriods')}
        </Label>
        <div className="flex gap-2">
          <FormField
            name="regularScheduleV2.gapBetweenPeriods.every"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="number" min="0" className="w-20" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="regularScheduleV2.gapBetweenPeriods.unit"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gapUnitOptions.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Number of Periods */}
      <div className="box-col-full justify-start items-start">
        <Label className="font-semibold">
          {t('teachingService:regularV2.numberOfPeriods')}
        </Label>
        <RadioGroup
          value={periodConfigurationType}
          onValueChange={(value: PeriodConfigurationType) => {
            setPeriodConfigurationType(value)

            if (value === PeriodConfigurationType.FIXED) {
              form.setValue(
                'regularScheduleV2.periodRepeatCount' as any,
                1 as any
              )
            }
          }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PeriodConfigurationType.FIXED} id="fixed" />
            <div className="flex items-center gap-2">
              <FormLabel
                htmlFor="fixed"
                className="flex items-center gap-2 font-normal"
              >
                {t('teachingService:regularV2.fixedNumber')}:
              </FormLabel>
              <FormField
                name="regularScheduleV2.periodRepeatCount"
                control={form.control}
                disabled={
                  periodConfigurationType === PeriodConfigurationType.INFINITE
                }
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="w-20"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <span>{t('teachingService:regularV2.periods')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value={PeriodConfigurationType.INFINITE}
              id="infinite"
            />
            <FormLabel
              htmlFor="infinite"
              className="flex items-center gap-2 font-normal"
            >
              {t('teachingService:regularV2.infinitePeriods')}
            </FormLabel>
          </div>
        </RadioGroup>
      </div>
    </Card>
  )
}
