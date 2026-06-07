import { useEffect } from 'react'

import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCalendar, LuPlus, LuRepeat, LuTrash } from 'react-icons/lu'

import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FormControl, FormField, FormItem } from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import Text from '@/components/ui/Text'
import { RepeatUnit } from '@/constants/course'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import {
  ClassesForm,
  ClassRegularPeriodsV2Form,
  RepeatFormats,
} from '@/types/classes'
import dayjs from '@/utils/dayjs'
import {
  buildDefaultRegularV2LessonRepeatFormat,
  buildDefaultRegularV2Period,
} from '@/utils/regular-class-schedule.utils'

export const RegularClassSchedulePeriods = (): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  // const form = useFormContext<ClassesForm>()
  const { control, getValues, setValue } = useFormContext<ClassesForm>()

  // const fieldArrays = useFieldArray<ClassesForm, 'regularScheduleV2.periodsV2'>(
  //   {
  //     control,
  //     name: 'regularScheduleV2.periodsV2',
  //   }
  // )
  // const { fields, append, remove, replace } = fieldArrays
  const { fields, append, remove, replace } = useFieldArray<
    ClassesForm,
    'regularScheduleV2.periodsV2',
    'id'
  >({
    control,
    name: 'regularScheduleV2.periodsV2',
  })

  const defaultLessonRepeatFormat =
    buildDefaultRegularV2LessonRepeatFormat() as RepeatFormats

  const defaultPeriod: Partial<ClassRegularPeriodsV2Form> =
    buildDefaultRegularV2Period()

  useEffect(() => {
    if (fields.length === 0) {
      replace([defaultPeriod])
    } else {
      fields.forEach((f, index) => {
        type PeriodField = FieldArrayWithId<
          ClassesForm,
          'regularScheduleV2.periodsV2',
          'id'
        > &
          Partial<ClassRegularPeriodsV2Form>

        const field = f as PeriodField
        if (!field.lessonRepeatFormat) {
          setValue(
            `regularScheduleV2.periodsV2.${index}.lessonRepeatFormat`,
            defaultLessonRepeatFormat
          )
        }
      })
    }
  }, [fields, replace, setValue])

  const handleAddPattern = () => {
    append(defaultPeriod)
  }

  const classNameForSinglePeriod =
    FEATURE_FLAG.ENABLE_MORE_THAN_ONE_PERIOD_IN_REGULAR_CLASS
      ? 'p-4 gap-4 box-col-full items-start bg-background-layer-2 rounded-lg'
      : 'box-col-full items-start'

  return (
    <Card className="box-col-full items-start p-4">
      <div className="box-row-full justify-between items-center">
        <div className="box-row-full items-center gap-2 justify-start">
          <LuCalendar />
          <Text className="text-xl font-semibold">
            {t('teachingService:regularV2.configureRegularClasses')}
          </Text>
        </div>
      </div>

      {fields.map((field, index) => {
        const fieldStartTime = getValues(
          `regularScheduleV2.periodsV2.${index}.startTime`
        )
        const fieldEndTime = getValues(
          `regularScheduleV2.periodsV2.${index}.endTime`
        )

        return (
          <div key={field.id} className={classNameForSinglePeriod}>
            {FEATURE_FLAG.ENABLE_MORE_THAN_ONE_PERIOD_IN_REGULAR_CLASS && (
              <div className="box-row-full justify-between items-center">
                <div className="box-row-full items-center gap-2 justify-start">
                  <LuRepeat />
                  <Text className="text-md font-semibold">
                    {t('teachingService:regularV2.recurrencePattern')}{' '}
                    {index + 1}
                  </Text>
                </div>
                {index > 0 && (
                  <LuTrash
                    size={20}
                    onClick={() => remove(index)}
                    className="text-warn cursor-pointer"
                  />
                )}
              </div>
            )}

            {/* Repeat Pattern */}
            <div className="box-col-full items-start">
              <Label className="font-semibold">
                {t('teachingService:regularV2.repeatEvery')}
              </Label>
              <div className="box-row-full justify-start gap-2">
                <FormField
                  name={`regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.every`}
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name={`regularScheduleV2.periodsV2.${index}.lessonRepeatFormat.unit`}
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-40">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {field.value
                                ? t(`teachingService:regularV2.${field.value}`)
                                : t('teachingService:regularV2.selectType')}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(RepeatUnit)
                              .filter(type => type !== RepeatUnit.minutes)
                              .map(type => (
                                <SelectItem key={type} value={type}>
                                  {t(`teachingService:regularV2.${type}`)}
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

            {/* Time Selection */}
            <div className="box-col-full gap-4">
              <div className="box-col-full items-start">
                <Label className="font-semibold">
                  {t('teachingService:regularV2.startTime')}
                </Label>
                <FormField
                  name={`regularScheduleV2.periodsV2.${index}.startTime`}
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <CustomDatePicker
                          selectedDate={dayjs(field.value).toISOString()}
                          dateFormat="YYYY-MM-dd HH:mm"
                          timeIntervals={5}
                          onChange={date => {
                            field.onChange(dayjs(date).toISOString() ?? '')
                            setValue(
                              `regularScheduleV2.periodsV2.${index}.endTime`,
                              new Date(dayjs(date).add(1, 'hour').toDate()),
                              {
                                shouldDirty: true,
                              }
                            )
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Badge variant="outline">
                  {dayjs(fieldStartTime).format('dddd')}
                </Badge>
              </div>
              <div className="box-col-full items-start">
                <Label className="font-semibold">
                  {t('teachingService:regularV2.endTime')}
                </Label>
                <FormField
                  name={`regularScheduleV2.periodsV2.${index}.endTime`}
                  control={control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <CustomDatePicker
                          selectedDate={dayjs(field.value).toISOString()}
                          dateFormat="YYYY-MM-dd HH:mm"
                          timeIntervals={5}
                          onChange={date => {
                            field.onChange(dayjs(date).toISOString() ?? '')
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Badge variant="outline">
                  {dayjs(fieldEndTime).format('dddd')}
                </Badge>
              </div>
            </div>
          </div>
        )
      })}

      {FEATURE_FLAG.ENABLE_MORE_THAN_ONE_PERIOD_IN_REGULAR_CLASS && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddPattern}
          iconBefore={<LuPlus />}
        >
          {t('teachingService:regularV2.addAnotherPattern')}
        </Button>
      )}
    </Card>
  )
}
