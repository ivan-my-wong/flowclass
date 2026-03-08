import { useEffect } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TextInput } from '@/components/Inputs/TextInput'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { RepeatUnit } from '@/constants/course'
import { RegularPeriods, RepeatFormats } from '@/types/classes'
import { getDurationArray } from '@/utils/time-picker.utils'

interface RepeatPeriodProps {
  scheduleIndex: number
  update: (
    index: number,
    {
      duration,
      repeatFormat,
    }: { duration: number; repeatFormat: RepeatFormats }
  ) => void
  schedule: RegularPeriods
  hasDuration?: boolean
  onApplyDurationNRepeat: (duration: number) => void
  addLesson: () => void
}

type RepeatPeriodForm = {
  duration: number
  repeatFormat: RepeatFormats
}

const RepeatPeriod = ({
  scheduleIndex,
  update,
  schedule,
  onApplyDurationNRepeat,
  addLesson,
  hasDuration = true,
}: RepeatPeriodProps): JSX.Element => {
  const { t } = useTranslation()

  const localForm = useForm<RepeatPeriodForm>({
    defaultValues: {
      duration: schedule.duration,
      repeatFormat: {
        ...schedule.repeatFormat,
        every: schedule.repeatFormat?.every || 1,
        unit: schedule.repeatFormat?.unit || RepeatUnit.weeks,
      },
    },
  })

  const durationArray = getDurationArray()
  const onApply: SubmitHandler<RepeatPeriodForm> = data => {
    // Keep existing lessons exactly as they are when applying changes
    const updatedSchedule = {
      ...schedule,
      duration: data.duration,
      repeatFormat: data.repeatFormat,
      // Keep the existing lessons array reference
      lessons: schedule.lessons,
    }
    update(scheduleIndex, updatedSchedule)
    onApplyDurationNRepeat(data.duration)
  }

  useEffect(() => {
    const subscription = localForm.watch((data, { name: _name }) => {
      // Only update if we have both duration and repeatFormat
      if (!data?.duration || !data?.repeatFormat) return

      // Don't trigger update if it's the same values
      if (
        data.duration === schedule.duration &&
        data.repeatFormat.every === schedule.repeatFormat.every &&
        data.repeatFormat.unit === schedule.repeatFormat.unit
      ) {
        return
      }

      update(scheduleIndex, {
        duration: data.duration,
        repeatFormat: {
          ...schedule.repeatFormat,
          ...data.repeatFormat,
        } as RepeatFormats,
      })
    })
    return () => subscription.unsubscribe()
  }, [
    localForm,
    localForm.watch,
    schedule,
    scheduleIndex,
    update,
    onApplyDurationNRepeat,
  ])

  const unitDurations = [RepeatUnit.weeks, RepeatUnit.days, RepeatUnit.months]
  return (
    <Form {...localForm}>
      <div className="box-col-full items-center justify-between">
        <div className="box-row-full justify-between">
          {hasDuration && (
            <div className="box-row-full justify-start w-fit">
              <Text className="flex-shrink-0">
                {t(`teachingService:class.durationPerLesson`)}
              </Text>
              <FormField
                control={localForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationArray.map(duration => (
                            <SelectItem
                              key={`${duration.value}-${duration.label}`}
                              value={duration.value.toString()}
                            >
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
          <Button variant="outline" onClick={localForm.handleSubmit(onApply)}>
            {t('teachingService:class.applyToExist')}
          </Button>
        </div>

        <div className="box-row-full justify-between">
          <div className="box-row-full justify-start w-fit">
            <Text css={{ flexShrink: 0 }}>
              {t(`teachingService:class.repeatEvery`)}
            </Text>
            <FormField
              control={localForm.control}
              rules={{
                required: t('login:errors.required') as string,
                validate: (value: number) =>
                  Number(value) > 0 || (t('login:errors.positive') as string),
              }}
              name="repeatFormat.every"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TextInput
                      className="w-16"
                      id="every"
                      type="number"
                      min={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={localForm.control}
              name="repeatFormat.unit"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString() || ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitDurations.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {t(`teachingService:class.${unit}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button
            variant="primary-outline"
            onClick={() => {
              addLesson()
            }}
            data-testid="add-lesson-btn"
          >
            + {t('teachingService:class.addLesson')}
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default RepeatPeriod
