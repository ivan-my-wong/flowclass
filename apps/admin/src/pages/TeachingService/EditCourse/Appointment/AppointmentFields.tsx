import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuExternalLink } from 'react-icons/lu'
import Select from 'react-select'

import { selectCustomStyles } from '@/components/Selector/LabelSelector'
import Separator from '@/components/Separators/Separator'
import Box from '@/components/ui/Box'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import useAvailability from '@/hooks/useAvailability'
import { ClassesForm } from '@/types/classes'
import { PriceType } from '@/types/course'

const AppointmentFields = ({
  priceType,
}: {
  priceType: PriceType
}): React.ReactElement => {
  const form = useFormContext<ClassesForm>()
  const { control } = form

  const { t } = useTranslation()

  const { availabilities } = useAvailability()

  const optsAvailability = useMemo(() => {
    if (!availabilities) return []
    return availabilities.map(availability => ({
      value: availability.id,
      label: availability.name,
    }))
  }, [availabilities])

  return (
    <>
      <FormField
        name="appointment.availabilityId"
        control={control}
        render={({ field }) => (
          <FormItem
            id="appointment.availabilityId"
            className="flex gap-x-4 w-full items-center leading-5"
          >
            <FormLabel className="w-[45%] font-bold">
              {t('teachingService:appointment.availability')}
            </FormLabel>
            <div className="w-full flex flex-col gap-2">
              <FormControl>
                <Select
                  value={
                    optsAvailability.find(o => o.value === field.value) as any
                  }
                  options={optsAvailability}
                  styles={selectCustomStyles('100%')}
                  onChange={(opt: any) => {
                    field.onChange(opt.value)
                  }}
                  name="availability-selector"
                  inputId="availability-selector"
                />
              </FormControl>
              {field.value && (
                <Link
                  className="text-sm text-primary cursor-pointer"
                  to={`/availability/edit/${field.value}`}
                >
                  {t('teachingService:appointment.visitAvailabilityPage')}
                  <LuExternalLink className="inline ml-2" />
                </Link>
              )}
              {optsAvailability.length === 0 && (
                <Link
                  className="text-sm text-primary cursor-pointer"
                  to="/availability"
                >
                  {t('teachingService:appointment.tryCreateAvailability')}
                  <LuExternalLink className="inline ml-2" />
                </Link>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {PriceType.MULTIPLE_OPTIONS !== priceType && (
        <FormField
          control={form.control}
          name="recurringFormat.times"
          rules={{
            required: t('login:errors.required') as string,
            validate: (val: number) => {
              if (val <= 0) {
                return t('embed:configuration.negative') as string
              }
              if (val > 99) {
                return t('teachingService:recurringClass.maxLesson') as string
              }
              return true
            },
          }}
          render={({ field }) => (
            <FormItem className="flex gap-x-4 w-full items-center leading-5">
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:class.numOfLessons')}
              </FormLabel>
              <FormControl>
                <Input min={1} max={99} id="times" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <Box align="start">
        <FormField
          name="appointment.durationMinutes"
          control={control}
          render={({ field }) => (
            <FormItem
              id="appointment.durationMinutes"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%]">
                <span className="font-bold">
                  {t('teachingService:appointment.duration')}
                </span>
                <br />
                <br />
                <span className="font-normal">
                  {t('teachingService:appointment.durationDescription')}
                </span>
              </FormLabel>
              <FormControl>
                <Input min={5} max={1440} type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Box>

      <Separator />

      <Box align="start">
        <FormField
          name="appointment.gapBetweenAppointmentsMinutes"
          control={control}
          render={({ field }) => (
            <FormItem
              id="gapBetweenAppointmentsMinutes"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%]">
                <span className="font-bold">
                  {t('teachingService:appointment.gapBetweenMeetings')}
                </span>
                <br />
                <br />
                <span className="font-normal">
                  {t(
                    'teachingService:appointment.gapBetweenMeetingsDescription'
                  )}
                </span>
              </FormLabel>
              <FormControl>
                <Input type="number" min={5} max={1440} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Box>
      {FEATURE_FLAG.ENABLE_MINIMUM_NOTICE_AND_BUFFER_TIME && (
        <>
          <Box align="start">
            <FormField
              name="appointment.minimumNoticeMinutes"
              control={control}
              render={({ field }) => (
                <FormItem
                  id="appointment.minimumNoticeMinutes"
                  className="flex gap-x-4 w-full items-center leading-5"
                >
                  <FormLabel className="w-[45%]">
                    <span className="font-bold">
                      {t('teachingService:appointment.minimumNoticeMinutes')}
                    </span>
                    <br />
                    <br />
                    <span className="font-normal">
                      {t(
                        'teachingService:appointment.minimumNoticeDescription'
                      )}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input min={0} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Box>

          <Box align="start">
            <FormField
              name="appointment.bufferBeforeMinutes"
              control={control}
              render={({ field }) => (
                <FormItem
                  id="appointment.bufferBeforeMinutes"
                  className="flex gap-x-4 w-full items-center leading-5"
                >
                  <FormLabel className="w-[45%]">
                    <span className="font-bold">
                      {t('teachingService:appointment.bufferBeforeMinutes')}
                    </span>
                    <br />
                    <br />
                    <span className="font-normal">
                      {t('teachingService:appointment.bufferBeforeDescription')}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Box>
          <Box align="start">
            <FormField
              name="appointment.bufferAfterMinutes"
              control={control}
              render={({ field }) => (
                <FormItem
                  id="appointment.bufferAfterMinutes"
                  className="flex gap-x-4 w-full items-center leading-5"
                >
                  <FormLabel className="w-[45%]">
                    <span className="font-bold">
                      {t('teachingService:appointment.bufferAfterMinutes')}
                    </span>
                    <br />
                    <br />
                    <span className="font-normal">
                      {t('teachingService:appointment.bufferAfterDescription')}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Box>
        </>
      )}
    </>
  )
}

export default AppointmentFields
