import { forwardRef, useImperativeHandle, useState } from 'react'

import dayjs from 'dayjs'
import { Control, FieldValues, useForm, ValidateResult } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import useSiteData from '@/hooks/useSiteData'
import {
  Availability,
  SingleRecurringSchedule,
} from '@/types/availability.type'

type AddTimeModalProps = {
  currentAvailability: Availability
  append: (value: SingleRecurringSchedule) => void
}

export type AddAvailabilityModalHandle = {
  handleOpenChange: () => void
  handleWeekdayChange: (index: number) => void
}

const AddTimeModal = forwardRef<AddAvailabilityModalHandle, AddTimeModalProps>(
  ({ currentAvailability, append }, ref) => {
    const { t } = useTranslation()

    const { convertDateToCurrentTimeZoneUTCString } = useSiteData()

    const [open, setOpen] = useState(false)
    const [startDateTime, setStartDateTime] = useState<Date>(
      new Date(new Date().setHours(9, 0, 0, 0))
    )
    const [endDateTime, setEndDateTime] = useState<Date>(
      new Date(new Date().setHours(18, 0, 0, 0))
    )
    const [currentWeekday, setCurrentWeekday] = useState<number>(0)

    const {
      control,
      setValue,
      reset,
      formState: { errors, isValid },
      handleSubmit,
    } = useForm<{ startTime: string; endTime: string }>({
      defaultValues: {
        startTime: dayjs(startDateTime).format('HH:mm'),
        endTime: dayjs(endDateTime).format('HH:mm'),
      },
    })

    const handleOpenChange = () => {
      setOpen(!open)
      reset()
      setCurrentWeekday(0)
      setStartDateTime(new Date(new Date().setHours(9, 0, 0, 0)))
      setEndDateTime(new Date(new Date().setHours(18, 0, 0, 0)))
    }

    const handleWeekdayChange = (index: number) => {
      setCurrentWeekday(index)
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
      handleWeekdayChange,
    }))

    const handleConfirm = (data: { startTime: string; endTime: string }) => {
      const newData: SingleRecurringSchedule = {
        ...data,
        dayOfWeek: currentWeekday,
        isEnabled: true,
      }
      append(newData)
      handleOpenChange()
    }

    return (
      <ModalDialog
        open={open}
        onOpenChange={handleOpenChange}
        className="overflow-visible max-w-lg"
        title={t(`teachingService:recurringClass.createTimeslot`) as string}
        footer={
          <Button
            size="md"
            className="w-fit"
            onClick={handleSubmit(handleConfirm)}
            disabled={!isValid}
          >
            {t(`teachingService:class.confirm`)}
          </Button>
        }
      >
        <Box justify="start">
          <Text className="w-[100px]">{`${t(`lessonDateTime:start`)}`}</Text>
          <CustomDatePicker
            dateFormat="h:mm aa"
            showTimeSelectOnly
            timeIntervals={5}
            selectedDate={convertDateToCurrentTimeZoneUTCString(startDateTime)}
            onChange={date => {
              const value = date ?? new Date()
              setStartDateTime(value)
              setValue('startTime', dayjs(value).format('HH:mm'))
            }}
            validation={{
              control: control as unknown as Control<FieldValues>,
              name: 'startTime',
              errors,
              rules: {
                required: {
                  value: true,
                  message: t('login:required'),
                },
                validate: {
                  startTime: () => {
                    if (startDateTime >= endDateTime) {
                      return t(
                        'availability:errorStartTimeOverlap'
                      ) as ValidateResult
                    }
                    return true
                  },
                },
              },
            }}
          />
        </Box>
        <Box justify="start">
          <Text className="w-[100px]">{`${t(`lessonDateTime:end`)}`}</Text>
          <CustomDatePicker
            dateFormat="h:mm aa"
            showTimeSelectOnly
            timeIntervals={5}
            selectedDate={convertDateToCurrentTimeZoneUTCString(endDateTime)}
            onChange={date => {
              const value = date ?? new Date()
              setEndDateTime(value)
              setValue('endTime', dayjs(value).format('HH:mm'))
            }}
            validation={{
              control: control as unknown as Control<FieldValues>,
              name: 'endTime',
              errors,
              rules: {
                required: {
                  value: true,
                  message: t('login:required'),
                },
                validate: {
                  endTime: () => {
                    if (startDateTime >= endDateTime) {
                      return t(
                        'availability:errorEndTimeOverlap'
                      ) as ValidateResult
                    }
                    return true
                  },
                },
              },
            }}
          />
        </Box>
      </ModalDialog>
    )
  }
)

export default AddTimeModal
