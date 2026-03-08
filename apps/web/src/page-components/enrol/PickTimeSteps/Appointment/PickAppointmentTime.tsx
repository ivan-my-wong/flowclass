import { useCallback, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { DayPicker } from 'react-day-picker'
import { useQuery } from 'react-query'
import { toast } from 'sonner'

import { checkQuota } from '@/api/enrolApi'
import Button from '@/components/Buttons/Button'
import { enrolState } from '@/stores/enrol'
import { PeriodLesson, RecurringSchedule } from '@/types'
import { CheckQuotaResponse, Tuition } from '@/types/enrol'
import { calculateClassPrice } from '@/utils/calculateCourse'
import { generateTimeslots, getDatesForWeekdays, parseTimeToDate } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { updateCurrentSelectedClass } from '@/utils/courseDisplay'
import dayjs from '@/utils/dayjs'

import { classNameDayPicker, modifiersClassNames } from '../Recurring/PickRecurringLesson'

import TimeSlotActionButton from './TimeslotActionButton'

import 'react-day-picker/style.css'

type RecurringScheduleWithKey = RecurringSchedule & { key?: string; start?: string; end?: string }

const PickAppointmentTime = (): JSX.Element => {
  const { t } = useTranslation()

  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)

  const selectedClass = useMemo(() => {
    return enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]?.selectedClass
  }, [enrolForm])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState(dayjs().month())
  const [year, setYear] = useState(dayjs().year())
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Date[]>([])
  const [listTimeSlots, setListTimeSlots] = useState<RecurringScheduleWithKey[]>([])

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    if (isOverrideDay(date)) {
      setSelectedDate(date)
    } else {
      setSelectedDate(isWithinAp(dayjs(date)) ? date : undefined)
    }
  }

  const recurringFormat = useMemo(() => {
    return selectedClass?.recurringFormat || undefined
  }, [selectedClass?.recurringFormat])

  const isMaxTimeSlotSelected = useMemo(() => {
    return listTimeSlots.length >= (recurringFormat?.times || 0)
  }, [listTimeSlots, recurringFormat])

  const apStart = useMemo(
    () =>
      selectedClass?.applicationPeriod?.startDatetime
        ? dayjs(selectedClass.applicationPeriod.startDatetime)
        : undefined,
    [selectedClass?.applicationPeriod?.startDatetime]
  )
  const apEnd = useMemo(
    () =>
      selectedClass?.applicationPeriod?.endDatetime
        ? dayjs(selectedClass.applicationPeriod.endDatetime)
        : undefined,
    [selectedClass?.applicationPeriod?.endDatetime]
  )
  const isWithinAp = useCallback(
    (d: dayjs.Dayjs) =>
      (!apStart || d.isSameOrAfter(apStart, 'day')) && (!apEnd || d.isSameOrBefore(apEnd, 'day')),
    [apStart?.toString(), apEnd?.toString()]
  )

  const availableDays: Date[] = useMemo(() => {
    const availableSchedules = selectedClass?.appointment?.availability?.availableSchedules

    let schedules: Date[] = []
    if (availableSchedules) {
      schedules = getDatesForWeekdays(
        availableSchedules.map(schedule => schedule.dayOfWeek) || [],
        year,
        month
      )
      // weekly days must be within AP
      schedules = schedules.filter(d => isWithinAp(dayjs(d)))
    }

    const dateOverrides = selectedClass?.appointment?.availability?.dateOverrides
    let overrides: Date[] = []
    if (dateOverrides) {
      overrides = dateOverrides
        .filter(o => o.isAvailable)
        .map(o => {
          if (!o.startTime) {
            schedules = schedules.filter(p => !dayjs(p).isSame(o.date, 'd'))
          }
          return parseTimeToDate(o.startTime || '', new Date(o.date))
        })
        .filter(Date)
    }

    return [...schedules, ...overrides].filter(date => dayjs(date).isAfter(dayjs(), 'day'))
  }, [selectedClass, year, month, isWithinAp])

  const overrideList = useMemo(
    () =>
      (selectedClass?.appointment?.availability?.dateOverrides || []).filter(o => o.isAvailable),
    [selectedClass?.appointment?.availability?.dateOverrides]
  )
  const isOverrideDay = useCallback(
    (d?: Date) => !!d && overrideList.some(o => dayjs(o.date).isSame(dayjs(d), 'day')),
    [overrideList]
  )

  const opts = generateTimeslots(selectedDate, selectedClass?.appointment)

  const timeSlotsOptions: RecurringScheduleWithKey[] = opts
    .map((timeSlot, index) => {
      const startTime = dayjs(timeSlot.start).format('HH:mm')
      const endTime = dayjs(timeSlot.end).format('HH:mm')
      const weekDay = selectedDate?.getDay() || 0
      const key = `${startTime}-${endTime}-${index}`

      return {
        ...timeSlot,
        startTime,
        endTime,
        weekDay,
        classId: selectedClass?.id || 0,
        id: new Date(timeSlot.start).getTime() + index,
        key,
      }
    })
    .filter(ts => {
      if (isOverrideDay(selectedDate)) return true
      const s = dayjs(ts.start)
      const e = dayjs(ts.end)
      return (!apStart || s.isSameOrAfter(apStart)) && (!apEnd || e.isSameOrBefore(apEnd))
    })

  const { data: quotaData, isLoading: isLoadingQuota } = useQuery<CheckQuotaResponse[]>(
    ['check-quota', selectedDate],
    () =>
      checkQuota({
        lessonIds: timeSlotsOptions.map(t => t.id),
        date: selectedDate as Date,
        classId: selectedClass?.id,
        timeslots: timeSlotsOptions.map(t => `${t.start} ${t.end}`),
      }),
    {
      enabled: (timeSlotsOptions || []).length > 0 && !!selectedDate,
      onError: (error: unknown) => {
        toast.error(`Failed to fetch quota information: ${error}`)
      },
    }
  )

  const isSelectedTimeSlot = (timeSlot: RecurringScheduleWithKey, selectedDate?: Date) => {
    if (!selectedDate) return false
    return selectedTimeSlots.some(t => t.toISOString() === timeSlot.start)
  }

  const updateFormWithSelectedTimeSlots = (slots: RecurringScheduleWithKey[]) => {
    const updatedSelectedClassData = updateCurrentSelectedClass(
      enrolForm.selectedClassData,
      enrolForm.currentSelectedClassIndex,
      {
        selectedRecurSchedules: timeSlotsOptions,
        selectedLessons: slots
          .map(
            o =>
              ({
                id: o.id,
                classId: o.classId,
                periodId: o.id,
                startTime: o.start,
                endTime: o.end,
              } as PeriodLesson)
          )
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }
    )

    setEnrolForm(prev => ({
      ...prev,
      selectedClassData: updatedSelectedClassData,
      tuition: [
        {
          paymentAmount: calculateClassPrice(
            selectedClass,
            slots.length,
            slots.length,
            enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]?.selectedPriceOption
          ),
        },
      ] as Tuition[],
    }))
  }

  const handleSelectTimeSlot = (timeSlot: RecurringScheduleWithKey) => {
    if (isMaxTimeSlotSelected) return

    const selected = timeSlotsOptions.find(slot => slot.key === timeSlot.key)
    if (!selected?.start) return

    const newSelectedTimeSlots = [...selectedTimeSlots, new Date(selected.start)]
    setSelectedTimeSlots(newSelectedTimeSlots)
    const newlistTimeSlots = [...listTimeSlots, selected]
    setListTimeSlots(newlistTimeSlots)

    updateFormWithSelectedTimeSlots(newlistTimeSlots)
  }

  const handleRemoveTimeSlot = (timeSlot: RecurringScheduleWithKey) => {
    const newSelected = selectedTimeSlots.filter(t => t.toISOString() !== timeSlot.start)
    setSelectedTimeSlots(newSelected)

    const newlistTimeSlots = listTimeSlots.filter(t => t.start !== timeSlot.start)
    setListTimeSlots(newlistTimeSlots)

    updateFormWithSelectedTimeSlots(newlistTimeSlots)
  }

  const isDisabledNextStep = useMemo(() => {
    if (!recurringFormat) return false
    return selectedTimeSlots.length < (recurringFormat?.times || 1)
  }, [selectedTimeSlots])

  const handleNextStep = useCallback(() => {
    setEnrolForm(prev => {
      return {
        ...prev,
        currentStep: enrolForm.currentStep + 1,
      }
    })
  }, [setEnrolForm, enrolForm])

  const renderTimeSlotOptions = () => {
    if (!selectedDate)
      return (
        <span className="rounded-md border px-2 py-1">
          {t('enrol:pickPeriodStep.selectTimeSlot.noTimeSlots')}
        </span>
      )
    if (timeSlotsOptions.length > 0) {
      return timeSlotsOptions.map(timeSlot => {
        const isOverlapping = timeSlotsOptions.some(t => {
          const { start, end } = timeSlot
          const startOverlap = dayjs(t.start).isBetween(start, end, 'minute', '()')
          const endOverlap = dayjs(t.end).isBetween(start, end, 'minute', '()')
          return (startOverlap || endOverlap) && isSelectedTimeSlot(t, selectedDate)
        })
        return (
          <TimeSlotActionButton
            key={timeSlot.key}
            timeSlot={timeSlot}
            quotaData={quotaData || []}
            isLoadingQuota={isLoadingQuota}
            isSelected={isSelectedTimeSlot(timeSlot, selectedDate)}
            isMaxTimeSlotSelected={isMaxTimeSlotSelected}
            handleSelectTimeSlot={handleSelectTimeSlot}
            handleRemoveTimeSlot={handleRemoveTimeSlot}
            isOverlapping={isOverlapping}
          />
        )
      })
    }
    return (
      <span className="rounded-md border px-2 py-1">
        {t('enrol:pickPeriodStep.selectTimeSlot.thisDateHasNoTimeSlots')}
      </span>
    )
  }

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
        <DayPicker
          animate
          onMonthChange={date => {
            setMonth(date.getMonth())
            setYear(date.getFullYear())
          }}
          mode="single"
          modifiers={{ availableDays, selectedTimeSlots }}
          modifiersClassNames={modifiersClassNames}
          selected={selectedDate}
          onSelect={handleSelectDate}
          classNames={classNameDayPicker}
          required
        />
        <div className="flex w-full flex-col gap-4 lg:max-w-[420px]">
          <div className="flex flex-col items-center space-y-2">
            <span>
              {selectedTimeSlots.length} / {recurringFormat?.times || 1}{' '}
              {t('enrol:pickPeriodStep.selectTimeSlot.lessonsChosen')}
            </span>
            <div className="flex flex-row gap-x-2">
              {[...Array(recurringFormat?.times || 1)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex h-2 w-2 flex-row rounded-full bg-gray-500',
                    index <= selectedTimeSlots.length - 1 && 'bg-primary'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {selectedDate && (
              <span className="text-lg font-medium">
                {dayjs(selectedDate).format('dddd, MMMM D')}
              </span>
            )}
            {renderTimeSlotOptions()}
          </div>
        </div>
      </div>

      <Button
        className="mt-6 w-full"
        disabled={isDisabledNextStep}
        onClick={handleNextStep}
        data-testid={'next-step-btn'}
      >
        {t('enrol:customFieldStep.nextStep')}
      </Button>
    </>
  )
}
export default PickAppointmentTime
