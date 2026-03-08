import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import { Dayjs } from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { ClassNames, DayPicker, ModifiersClassNames } from 'react-day-picker'
import { RiGlobalFill } from 'react-icons/ri'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { previewRecurringCourseLessons } from '@/api/courseApi'
import { checkQuota } from '@/api/enrolApi'
import Button from '@/components/Buttons/Button'
import Checkbox from '@/components/Checkboxes/Checkbox'
import { enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { IndividualRecurringSchedule, RecurringSchedule, TuitionMode } from '@/types'
import { CheckQuotaResponse } from '@/types/enrol'
import { LessonString } from '@/types/lessonString'
import { getDatesForWeekdays, getDatesForWeekdaysByStartEndTime } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { enrolCourseScrollAction, updateCurrentSelectedClass } from '@/utils/courseDisplay'
import dayjs from '@/utils/dayjs'
import { formatUnixTime } from '@/utils/format'

import TimeSlotActionButton from '../Appointment/TimeslotActionButton'

import 'react-day-picker/style.css'

export const classNameDayPicker: Partial<ClassNames> = {
  // root: 'flex flex-col items-center justify-center',
  day: 'w-10 h-10 md:w-12 md:h-12',
  week: '',
  months: 'mx-auto',
  month_grid: 'mx-auto',
  day_button:
    'text-center flex items-center justify-center w-full select-none cursor-not-allowed text-textDisabled',
  selected:
    'bg-gradient-to-t from-primarySubtle to-primaryHighlight/0 ring-primary ring-1 ring-offset-2 ring-offset-background rounded-full',
}

export const modifiersClassNames: ModifiersClassNames = {
  availableDays: 'bg-primaryHighlightSubtle/70 rounded-full text-primary available-days',
  selectedTimeSlots: '!bg-primary !text-background !rounded-full selected-time-slots',
}

type Variables = {
  lesson: string
  lessonDateId: number
  priceOptionId?: number
}
const PickRecurringLesson = (): JSX.Element => {
  const { school, course } = useEnrolState()
  const { t } = useTranslation()
  const currentTheme = useRecoilValue(currentWebsiteTheme)
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const selectedClass = useMemo(() => {
    return enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]
  }, [enrolForm])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isFixedSchedule, setIsFixedSchedule] = useState(true)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<RecurringSchedule[]>([])
  const [individualTimeSlots, setIndividualTimeSlots] = useState<IndividualRecurringSchedule[]>([])
  const [month, setMonth] = useState(dayjs().month())
  const [year, setYear] = useState(dayjs().year())
  const [dayjsWithTimeZone, setDayjsWithTimeZone] = useState<Dayjs | undefined>(undefined)
  const [firstLesson, setFirstLesson] = useState<Date | undefined>(undefined)
  const [lastLesson, setLastLesson] = useState<Date | undefined>(undefined)
  const recurringSchedules = useMemo(() => {
    return selectedClass.selectedClass?.recurringSchedules || []
  }, [selectedClass.selectedClass?.recurringSchedules])
  const recurringFormat = useMemo(() => {
    return selectedClass.selectedClass?.recurringFormat || undefined
  }, [selectedClass.selectedClass?.recurringFormat])
  const [previewedLessonsCount, setPreviewedLessonsCount] = useState(0)

  const apStart = selectedClass.selectedClass?.applicationPeriod?.startDatetime
    ? dayjs(selectedClass.selectedClass.applicationPeriod.startDatetime)
    : undefined
  const apEnd = selectedClass.selectedClass?.applicationPeriod?.endDatetime
    ? dayjs(selectedClass.selectedClass.applicationPeriod.endDatetime)
    : undefined

  const isWithinAp = (d: dayjs.Dayjs) =>
    (!apStart || d.isSameOrAfter(apStart, 'day')) && (!apEnd || d.isSameOrBefore(apEnd, 'day'))

  // const isWithinApDay = useCallback(
  //   (d: dayjs.Dayjs) =>
  //     (!apStart || d.isSameOrAfter(apStart, 'day')) && (!apEnd || d.isSameOrBefore(apEnd, 'day')),
  //   [apStart?.toString(), apEnd?.toString()]
  // )
  const { mutateAsync: previewLessons, isLoading: isLoadingPreviewLessons } = useMutation(
    ({ lesson, lessonDateId }: Variables) =>
      previewRecurringCourseLessons(
        lesson,
        lessonDateId,
        selectedClass.selectedClass?.id ?? 0,
        course?.institutionId ?? 0,
        selectedPriceOption?.id
      ),
    {
      onError: (error: Error) => {
        toast.error(error.message)
      },
    }
  )

  const availableDays = useMemo(() => {
    // Available days are the days of the week in one month
    // Get weeks on the current month

    return getDatesForWeekdays(
      recurringSchedules.map(schedule => schedule.weekDay) || [],
      year,
      month
    )
      .filter(date => dayjs(date).isAfter(dayjs(), 'day'))
      .filter(date => isWithinAp(dayjs(date)))
  }, [recurringSchedules, year, month, apStart?.toString(), apEnd?.toString()])

  const handleSelectDate = useCallback(
    (dates: Date) => {
      const availableDatesStr = availableDays
        .filter(date => dayjs(date).isAfter(dayjs(), 'day'))
        .map(d => d.toDateString())
      const validInCalendar = availableDatesStr.includes(dates.toDateString())
      const validDates = validInCalendar && isWithinAp(dayjs(dates))
      setSelectedDate(validDates ? dates : undefined)
    },
    [availableDays]
  )

  const timeZone = school?.siteSetting?.timeZone || 'UTC'
  const generateLessonString = useCallback(
    (firstLesson: Date, lessonDate: RecurringSchedule) => {
      const startDate = dayjs(firstLesson).format('YYYY-MM-DD')
      const startLesson = dayjs(`${startDate} ${lessonDate.startTime}`).tz(timeZone)
      const endLesson = dayjs(`${startDate} ${lessonDate.endTime}`).tz(timeZone)
      // With timezone
      const lessonString = new LessonString(
        `${startLesson.toISOString()} ${endLesson.toISOString()}`
      )
      return lessonString
    },
    [school?.siteSetting?.timeZone]
  )

  const timeSlotsOptions = useMemo(() => {
    const currentDate = selectedDate || new Date()
    const selectedDayOfWeek = currentDate ? dayjs(currentDate).day() : undefined

    return recurringSchedules
      .filter(schedule => schedule.weekDay === selectedDayOfWeek)
      .sort((a, b) => {
        return a.startTime < b.startTime ? -1 : 1
      })
      .map(schedule => ({
        ...schedule,
        key: generateLessonString(currentDate, schedule).toString(),
      }))
  }, [selectedDate, recurringSchedules])

  const { data: quotaData, isLoading: isLoadingQuota } = useQuery<CheckQuotaResponse[]>(
    ['check-quota', (timeSlotsOptions || []).map(t => t.key).join(',')],
    () => checkQuota({ lessonIds: timeSlotsOptions.map(t => t.id), date: selectedDate as Date }),
    {
      enabled: (timeSlotsOptions || []).length > 0 && !!selectedDate,
      onError: (error: unknown) => {
        toast.error(`Failed to fetch quota information: ${error}`)
      },
    }
  )

  const timeSlotResults = useMemo(() => {
    if (isFixedSchedule) {
      if (!firstLesson || !lastLesson) {
        return []
      }
      return getDatesForWeekdaysByStartEndTime(
        selectedTimeSlots.map(timeSlot => timeSlot.weekDay),
        firstLesson,
        lastLesson
      )
    }
    return individualTimeSlots.map(timeSlot => timeSlot.date)
  }, [selectedTimeSlots, firstLesson, lastLesson, isFixedSchedule, individualTimeSlots])

  const selectedPriceOption = useMemo(() => {
    return selectedClass.selectedPriceOption
  }, [selectedClass.selectedPriceOption])

  const effectiveLessonCount = useMemo(() => {
    return selectedPriceOption?.numberOfLessons || recurringFormat?.times || 1
  }, [selectedPriceOption?.numberOfLessons, recurringFormat?.times])

  const isMaxTimeSlotSelected = useMemo(() => {
    if (isFixedSchedule) {
      return selectedTimeSlots.length >= (effectiveLessonCount || 0)
    }
    return individualTimeSlots.length >= (effectiveLessonCount || 0)
  }, [selectedTimeSlots, individualTimeSlots, isFixedSchedule, effectiveLessonCount])

  const handleSelectTimeSlot = useCallback(
    (timeSlot: RecurringSchedule) => {
      // All available dates that have similar week day should be selecte
      if (isFixedSchedule) {
        const availableDates = recurringSchedules.filter(
          schedule =>
            schedule.weekDay === timeSlot.weekDay &&
            timeSlot.startTime === schedule.startTime &&
            timeSlot.endTime === schedule.endTime
        )
        setSelectedTimeSlots(availableDates)
        setFirstLesson(selectedDate)
        const times = effectiveLessonCount
        const computedLast = dayjs(selectedDate).add(times, 'weeks')
        const clampedLast = apEnd && computedLast.isAfter(apEnd, 'day') ? apEnd : computedLast
        setLastLesson(clampedLast.toDate())
      } else {
        if (!selectedDate || isMaxTimeSlotSelected) {
          return
        }
        const lessonString = generateLessonString(selectedDate, timeSlot)
        setIndividualTimeSlots(prev => [
          ...prev,
          { ...timeSlot, lessonString, date: selectedDate } as IndividualRecurringSchedule,
        ])
      }
    },
    [recurringSchedules, selectedDate, effectiveLessonCount, isFixedSchedule]
  )

  // This function is for removing the lsit of timeslots
  const handleRemoveTimeSlot = useCallback(
    (timeSlot: RecurringSchedule) => {
      setSelectedTimeSlots(selectedTimeSlots.filter(t => t.id !== timeSlot.id))
      setIndividualTimeSlots(prev => prev.filter(t => t.id !== timeSlot.id))
    },
    [selectedTimeSlots, individualTimeSlots]
  )

  const updateEnrollForm = (listLessons: string[], lessonDate: RecurringSchedule | undefined) => {
    const updatedSelectedClassData = updateCurrentSelectedClass(
      enrolForm.selectedClassData,
      enrolForm.currentSelectedClassIndex,
      {
        selectedRecurLessons: isFixedSchedule ? listLessons : undefined,
        selectedIndividualRecurLessons: isFixedSchedule ? undefined : listLessons,
        selectedRecurSchedules: selectedTimeSlots,
        selectedRecurSchedule: lessonDate,
      }
    )
    setEnrolForm(prev => {
      return {
        ...prev,
        selectedClassData: updatedSelectedClassData,
      }
    })
  }

  const isOptionCountMismatch = useMemo(() => {
    const expected = selectedPriceOption?.numberOfLessons || 0
    if (!expected) return false

    return previewedLessonsCount > 0 && previewedLessonsCount !== expected
  }, [selectedPriceOption?.numberOfLessons, previewedLessonsCount])

  const isDisabledNextStep = useMemo(() => {
    if (isFixedSchedule) {
      return (
        selectedTimeSlots.length === 0 ||
        isLoadingPreviewLessons ||
        timeSlotResults.length !== effectiveLessonCount
      )
    }

    return (
      individualTimeSlots.length === 0 ||
      isLoadingPreviewLessons ||
      individualTimeSlots.length !== effectiveLessonCount ||
      isOptionCountMismatch
    )
  }, [
    selectedTimeSlots,
    individualTimeSlots,
    isLoadingPreviewLessons,
    isFixedSchedule,
    effectiveLessonCount,
    isOptionCountMismatch,
    timeSlotResults.length,
  ])

  useEffect(() => {
    const hasMultiplePriceOptions =
      selectedClass.selectedClass?.priceType === TuitionMode.MULTIPLE_OPTIONS

    if (hasMultiplePriceOptions) {
      const updatedSelectedClassData = enrolForm.selectedClassData.map((item, idx) =>
        idx === enrolForm.currentSelectedClassIndex
          ? { ...item, selectedPriceOption: undefined }
          : item
      )
      setPrevSelectedOption({
        ...enrolForm,
        selectedClassData: updatedSelectedClassData,
        currentStep: enrolForm.currentStep - 1,
      })
    } else {
      setPrevSelectedOption({
        ...enrolForm,
        currentStep: enrolForm.currentStep - 1,
      })
    }
  }, [enrolForm, selectedClass.selectedClass?.priceType])

  useEffect(() => {
    const previewSelectedLessons = async () => {
      let listLessons = []
      let lessonDate = undefined
      if (isFixedSchedule) {
        lessonDate = selectedTimeSlots.at(0)
        if (!lessonDate || !firstLesson) {
          return
        }
        const lessonString = generateLessonString(firstLesson, lessonDate)
        listLessons = (await previewLessons({
          lesson: lessonString.toString(),
          lessonDateId: lessonDate.id,
          priceOptionId: selectedPriceOption?.id,
        })) as string[]
      } else {
        listLessons = individualTimeSlots.map(t => t.lessonString.toString())
        lessonDate = individualTimeSlots.at(0)
      }
      setPreviewedLessonsCount(listLessons.length)

      updateEnrollForm(listLessons, lessonDate)
    }
    previewSelectedLessons()
  }, [
    selectedTimeSlots,
    firstLesson,
    generateLessonString,
    previewLessons,
    isFixedSchedule,
    individualTimeSlots,
    selectedPriceOption?.id,
    selectedPriceOption?.numberOfLessons,
  ])

  useEffect(() => {
    if (individualTimeSlots) {
      updateEnrollForm(
        individualTimeSlots
          .sort((a, b) => {
            const aDate = dayjs(a.date)
            const bDate = dayjs(b.date)
            const aTime = dayjs(`${aDate.format('YYYY-MM-DD')} ${a.startTime}`)
            const bTime = dayjs(`${bDate.format('YYYY-MM-DD')} ${b.startTime}`)
            return aTime.isBefore(bTime) ? -1 : 1
          })
          .map(t => t.lessonString.toString()),
        undefined
      )
    }
  }, [individualTimeSlots])

  const handleNextStep = useCallback(() => {
    setEnrolForm(prev => {
      let currentStep = enrolForm.currentStep + 1

      const hasMultiplePriceOptions =
        prev.selectedClassData[prev.currentSelectedClassIndex].selectedClass?.priceType ===
        TuitionMode.MULTIPLE_OPTIONS

      const isMultipleClassSelection = prev.setMultipleClass

      // Case 1: No multiple pricing option, then it should go to the next step
      // Case 2: Multiple pricing option, then it should go back

      if (hasMultiplePriceOptions && isMultipleClassSelection) {
        currentStep = 0
      }

      return {
        ...prev,
        currentStep,
      }
    })
    enrolCourseScrollAction(currentTheme)
  }, [setEnrolForm, enrolForm])

  useEffect(() => {
    if (school?.siteSetting?.timeZone) {
      setDayjsWithTimeZone(dayjs().tz(school?.siteSetting?.timeZone))
    }
  }, [school?.siteSetting?.timeZone])
  const timezoneParts = school?.siteSetting?.timeZone?.split('/') || []
  const countryName = timezoneParts[0] || ''
  const cityName = timezoneParts.length > 1 ? timezoneParts[1]?.replace('_', ' ') : ''

  const isSelectedTimeSlot = useCallback(
    (timeSlot: RecurringSchedule, selectedDate: Date | undefined) => {
      if (!selectedDate) return false

      if (isFixedSchedule) return selectedTimeSlots.some(t => t.id === timeSlot.id)

      return individualTimeSlots.some(
        t =>
          t.startTime === timeSlot.startTime &&
          t.endTime === timeSlot.endTime &&
          t.lessonString.toString() === generateLessonString(selectedDate, timeSlot).toString()
      )
    },
    [selectedTimeSlots, individualTimeSlots, isFixedSchedule]
  )

  const offsetFormatted = useMemo(() => {
    const offsetMinutes = dayjsWithTimeZone?.utcOffset() || 0
    const offsetHours = offsetMinutes / 60
    const sign = offsetHours >= 0 ? '+' : '-'
    return `${sign}${Math.abs(offsetHours)}`
  }, [dayjsWithTimeZone])

  const router = useRouter()

  const { firstLessonDateUnix, recurLessonTimeId } = router.query

  const skipEnrolRecurrenceStep = async () => {
    if (!firstLessonDateUnix || !recurLessonTimeId) return

    const selectedRecurSchedule = selectedClass?.selectedClass?.recurringSchedules.find(
      item => item.id === Number(recurLessonTimeId)
    )

    if (!selectedRecurSchedule) return

    const selectedLesson = formatUnixTime(firstLessonDateUnix as string)

    const previewedLessons = await previewLessons({
      lesson: selectedLesson,
      lessonDateId: selectedRecurSchedule?.id ?? 0,
    })

    const newSelectedTimeSlots = previewedLessons
      .map((lesson: string) => {
        const [start, end] = lesson.split(' ')
        const lessonDate = new Date(start)
        const startTime = dayjs(start).tz(timeZone).format('HH:mm:ss')
        const endTime = dayjs(end).tz(timeZone).format('HH:mm:ss')
        const availableDates = recurringSchedules.find(schedule => {
          return (
            schedule.weekDay === lessonDate.getDay() &&
            schedule.startTime === startTime &&
            schedule.endTime === endTime
          )
        })
        if (!availableDates) return null
        return {
          ...availableDates,
          lessonString: lesson,
          date: dayjs(lessonDate).startOf('d').toDate(),
          key: lesson,
        }
      })
      .filter(item => item !== null) as RecurringSchedule[]

    if (newSelectedTimeSlots?.length === 0) return

    const times = effectiveLessonCount
    const computedLast = dayjs(selectedDate).add(times, 'weeks')
    const clampedLast = apEnd && computedLast.isAfter(apEnd, 'day') ? apEnd : computedLast
    setSelectedTimeSlots(newSelectedTimeSlots)
    setSelectedDate(newSelectedTimeSlots[0].date)

    const startDate = new Date(selectedLesson.split(' ')[0])
    const lessonDate = dayjs(startDate).startOf('d').toDate()
    setFirstLesson(lessonDate)
    setLastLesson(clampedLast.toDate())
  }

  useEffect(() => {
    if (recurringSchedules.length > 0) {
      // Check available days in the current month
      const currentMonthAvailable = getDatesForWeekdays(
        recurringSchedules.map(schedule => schedule.weekDay) || [],
        year,
        month
      ).filter(date => dayjs(date).isAfter(dayjs(), 'day'))

      if (currentMonthAvailable.length > 0) {
        // If there are available days in the current month, do nothing
        return
      }

      // Otherwise, check the next month
      const nextMonth = (month + 1) % 12
      const nextYear = month === 11 ? year + 1 : year
      const nextMonthAvailable = getDatesForWeekdays(
        recurringSchedules.map(schedule => schedule.weekDay) || [],
        nextYear,
        nextMonth
      ).filter(date => dayjs(date).isAfter(dayjs(), 'day'))

      // Always move the calendar to the next month, even if no available days
      setMonth(nextMonth)
      setYear(nextYear)

      if (nextMonthAvailable.length > 0) {
        const firstAvailable = nextMonthAvailable[0]
        setSelectedDate(firstAvailable)
      } else {
        setSelectedDate(undefined)
      }
    }
  }, [recurringSchedules])

  useEffect(() => {
    if (firstLessonDateUnix && recurLessonTimeId) {
      skipEnrolRecurrenceStep()
    }
  }, [firstLessonDateUnix, recurLessonTimeId])

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
        <DayPicker
          animate
          onMonthChange={date => {
            setMonth(date.getMonth())
            setYear(date.getFullYear())
          }}
          month={new Date(year, month)}
          mode="single"
          modifiers={{
            availableDays: availableDays.filter(date => dayjs(date).isAfter(dayjs(), 'day')),
            selectedTimeSlots: timeSlotResults,
          }}
          modifiersClassNames={modifiersClassNames}
          selected={selectedDate}
          onSelect={handleSelectDate}
          classNames={classNameDayPicker}
          required
          footer={
            <>
              <label className="mt-4 flex items-center justify-center gap-2">
                <div className="scale-125">
                  <Checkbox
                    value={isFixedSchedule}
                    onChange={() => {
                      setSelectedTimeSlots([])
                      setIndividualTimeSlots([])
                      setIsFixedSchedule(!isFixedSchedule)
                    }}
                  />
                </div>
                <span className="text-sm">
                  {t('enrol:pickPeriodStep.selectTimeSlot.fixedSchedule')}
                </span>
              </label>

              {dayjsWithTimeZone && (
                <div className="mt-8 flex items-center justify-center gap-x-2">
                  <RiGlobalFill className="fill-primary" />
                  <span className="text-sm">{`${countryName}, ${cityName} Time UTC ${offsetFormatted} | ${dayjsWithTimeZone.format(
                    'hh:mm A'
                  )}`}</span>
                </div>
              )}
            </>
          }
        />
        <div className="flex w-full flex-col gap-4 lg:max-w-[420px]">
          <div className="flex flex-col items-center space-y-2">
            <span>
              {timeSlotResults.length} / {effectiveLessonCount}{' '}
              {t('enrol:pickPeriodStep.selectTimeSlot.lessonsChosen')}
            </span>
            <div className="flex flex-row gap-x-2">
              {[...Array(effectiveLessonCount)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex h-2 w-2 flex-row rounded-full bg-gray-500',
                    index <= timeSlotResults.length - 1 && 'bg-primary'
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
            {timeSlotsOptions.length <= 0 && (
              <span className="rounded-md border px-2 py-1">
                {t('enrol:pickPeriodStep.selectTimeSlot.noTimeSlots')}
              </span>
            )}
            {selectedDate &&
              timeSlotsOptions.map(timeSlot => (
                <TimeSlotActionButton
                  key={timeSlot.key}
                  timeSlot={timeSlot}
                  quotaData={quotaData || []}
                  isLoadingQuota={isLoadingQuota}
                  isSelected={isSelectedTimeSlot(timeSlot, selectedDate)}
                  isMaxTimeSlotSelected={isMaxTimeSlotSelected}
                  handleSelectTimeSlot={handleSelectTimeSlot}
                  handleRemoveTimeSlot={handleRemoveTimeSlot}
                />
              ))}
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
export default PickRecurringLesson
