import { useCallback, useEffect, useMemo, useState } from 'react'

import { CaretRightIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import useTranslation from 'next-translate/useTranslation'
import { FieldValues, UseFormReturn } from 'react-hook-form'

import Button from '@/components/Buttons/Button'
import { useGetTeachingServiceOpts } from '@/hooks/useProfile'
import DateField from '@/page-components/enrol/ApplicationFormSteps/DateField'
import DropdownField from '@/page-components/enrol/ApplicationFormSteps/DropdownField'
import { ClassType } from '@/types'
import { LessonString } from '@/types/lessonString'
import { RescheduleSettings, UpcomingLesson } from '@/types/profile'
import { filterFutureDatesFromLessonStringArray } from '@/utils/calculateTime'

// Initialize dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

const questionClassNames = 'raw-input-label mb-0 text-wrap'

type IProps = {
  data?: UpcomingLesson
  schoolName?: string
  formInstance: UseFormReturn<FieldValues, any, undefined>
  setIsCustomTime: (value: boolean) => void
  settings?: RescheduleSettings
}

const RequestExistingLesson = ({
  data,
  schoolName,
  formInstance,
  setIsCustomTime,
  settings,
}: IProps): React.ReactElement => {
  const { t } = useTranslation()
  const timeZone = 'Asia/Hong_Kong'

  const [periodOptions, setPeriodOptions] = useState<
    Array<{ value: number | string; label: string; data: LessonString[]; disabled?: boolean }>
  >([])

  /// The format is a date range string of ISO 8601, e.g. "2025-04-04T00:00:00.000Z 2025-04-05T00:00:00.000Z"
  const [dateOptions, setDateOptions] = useState<LessonString[]>([])
  const [selectedDate, setSelectedDate] = useState<LessonString | null>(null)

  const { watch, reset, setValue } = formInstance
  const courseId = watch('courseId')
  const classId = watch('classId')
  const periodId = watch('periodId')
  const classLessonDate = watch('classLessonDate')
  const { data: listCourses = [] } = useGetTeachingServiceOpts({
    institutionId: data?.institutionId,
    siteId: data?.siteId,
  })
  const getPeriodsArray = useCallback(
    (
      listPeriods: Record<string, string[]>
    ): {
      value: number | string
      label: string
      data: LessonString[]
      disabled: boolean
    }[] => {
      return Object.entries(listPeriods || {}).map(([recurringScheduleId, lessonDateArray]) => {
        // Filter out past dates
        const filteredDates: LessonString[] = filterFutureDatesFromLessonStringArray(
          lessonDateArray as string[]
        ).map(date => new LessonString(date))

        const startDate = filteredDates.length > 0 ? filteredDates[0]?.getStartDate() : null
        const newDate = startDate ? dayjs(startDate).tz(timeZone).format('dddd hh:mm A') : ''

        return {
          value: isNaN(Number(recurringScheduleId))
            ? recurringScheduleId
            : Number(recurringScheduleId),
          label: `${t('profile:requestTimeChange.startsAt')} ${newDate}`,
          data: filteredDates,
          disabled: filteredDates.length === 0, // Disable if no valid dates
        }
      })
    },
    [t, timeZone]
  )

  const classes = useMemo(
    () =>
      listCourses
        .find(c => c.id === courseId)
        ?.classes?.filter(classItem => {
          if (classItem.type === ClassType.subscription) return false

          const periodsArray = getPeriodsArray(classItem.periods)

          if (periodsArray.length === 0) return false
          if (periodsArray.every(period => period.disabled)) return false

          return true
        }) || [],
    [listCourses, courseId, getPeriodsArray]
  )

  const currentClass = classes.find(c => c.id === classId)

  // Handle class selection change
  useEffect(() => {
    if (currentClass) {
      setValue('classType', currentClass.type)
      if (currentClass.type === ClassType.appointment) {
        // If appointment type, set classLessonDate to the first available date
        setPeriodOptions([])
        setValue('periodId', '')
        setValue('classLessonDate', '')
        const dates = Object.values(currentClass.periods).flatMap(dateArray => dateArray)
        const availableDates = filterFutureDatesFromLessonStringArray(dates)
        setDateOptions(availableDates.map(date => new LessonString(date)))
        return
      }

      const listPeriods = currentClass.periods

      const periodsArray = getPeriodsArray(listPeriods)

      const availablePeriods = periodsArray.filter(p => !p.disabled)

      setPeriodOptions(availablePeriods)

      if (availablePeriods.length > 0) {
        setValue('periodId', availablePeriods[0].value)
      } else {
        setValue('periodId', '')
      }
    }
  }, [currentClass, classes])

  useEffect(() => {
    if (classLessonDate) {
      const thisSelectedDate = dateOptions.find(
        date =>
          dayjs(date.getStartDate()).format('YYYY/MM/DD') ===
          dayjs(classLessonDate).format('YYYY/MM/DD')
      )

      if (thisSelectedDate) {
        setSelectedDate(thisSelectedDate)
      }

      if (currentClass?.type === ClassType.appointment) {
        // set periodOptions following selected date
        const newOpts = dateOptions.filter(time =>
          dayjs(time?.getStartDate()).isSame(dayjs(classLessonDate), 'day')
        )
        const newPeriodOptions = newOpts.map(date => {
          const startDate = date ? date.getStartDate() : null
          const newDate = startDate ? dayjs(startDate).tz(timeZone).format('dddd hh:mm A') : ''
          return {
            value: date.getTime1(),
            label: `${t('profile:requestTimeChange.startsAt')} ${newDate}`,
            data: [date],
          }
        })
        setPeriodOptions(newPeriodOptions)
        setValue('periodId', '')
        if (newPeriodOptions.some(o => o.value === periodId)) {
          setValue('periodId', periodId)
        }
        return
      }
    }
  }, [classLessonDate])

  // Watch for period changes
  useEffect(() => {
    setValue('classType', currentClass?.type)
    if (currentClass?.type === ClassType.appointment) {
      if (!classLessonDate) return
      const selectedPeriod = periodOptions.find(
        p => p.value === (isNaN(Number(periodId)) ? periodId : Number(periodId))
      )
      if (!(selectedPeriod && Array.isArray(selectedPeriod.data))) return
      const date = selectedPeriod.data[0]
      if (!date) return
      setSelectedDate(date)
      setValue('classLessonDate', date.getStartDate())
      setValue('lessonStartTime', date.getStartDate())
      setValue('lessonEndTime', date.getEndDate())
      return
    }

    if (periodId) {
      const selectedPeriod = periodOptions.find(
        p => p.value === (isNaN(Number(periodId)) ? periodId : Number(periodId))
      )

      if (selectedPeriod && Array.isArray(selectedPeriod.data)) {
        const selectedPeriodData = selectedPeriod.data.map(date => date.toString())

        const filteredDates: LessonString[] = filterFutureDatesFromLessonStringArray(
          selectedPeriodData
        ).map(date => new LessonString(date))

        // If we have valid dates and none is selected, select the first one by default
        if (filteredDates.length > 0) {
          setValue('classLessonDate', filteredDates[0].getStartDate())
          setDateOptions(filteredDates)
          setSelectedDate(filteredDates[0])
          // Set the end time based on the selected start time
        }
      } else {
        setDateOptions([])
        setValue('classLessonDate', '')
        setSelectedDate(null)
      }
    }
  }, [periodOptions, periodId])

  return (
    <>
      <div className="flex items-center justify-between rounded-md border py-1 pl-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <InfoCircledIcon /> {t('profile:requestTimeChange.infoChangeTime')}
        </div>
        <Button
          variant="textPrimary"
          iconAfter={<CaretRightIcon />}
          onClick={() => {
            setIsCustomTime(true)
            reset()
          }}
        >
          {t('profile:requestTimeChange.requestCustomTimeSlot')}
        </Button>
      </div>
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{
          __html: t('profile:requestTimeChange.desc')
            .replace('\n', '<br/>')
            .replace('{schoolName}', schoolName || ''),
        }}
      />
      <div>
        <div className="space-y-3">
          <DropdownField
            form={formInstance}
            name={'courseId'}
            labelClass={questionClassNames}
            label={t('profile:requestTimeChange.chooseCourse')}
            required={true}
            options={listCourses
              .filter(c => !c.isArchived)
              .map(option => ({
                label: option.name,
                value: option.id,
              }))}
            isDisabled={settings?.selectCourse === false}
            dataTestId="course-dropdown"
          />
          <DropdownField
            form={formInstance}
            name={'classId'}
            labelClass={questionClassNames}
            label={t('profile:requestTimeChange.chooseClass')}
            required={true}
            options={classes
              .filter(c => !c.isArchived)
              .map(option => ({
                label: option.name,
                value: option.id,
              }))}
            isDisabled={
              settings?.selectClass === false && classes.find(c => c.id === classId) !== undefined
            }
            isClearable={false}
            dataTestId="class-dropdown"
          />
          {currentClass?.type === ClassType.appointment && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <DateField
                form={formInstance}
                name="classLessonDate"
                labelClass={questionClassNames + ' mt-0'}
                label={t('profile:requestTimeChange.lessonDate')}
                required={true}
                includeDates={dateOptions.map(date => date.getStartDate())}
                showTimeSelect={false}
                data-testid="date-field"
              />

              <DropdownField
                form={formInstance}
                name={'periodId'}
                labelClass={questionClassNames}
                label={t('profile:requestTimeChange.lessonStartTime')}
                required={true}
                options={periodOptions}
                isClearable={false}
                dataTestId="period-dropdown"
              />
            </div>
          )}
          {currentClass?.type !== ClassType.appointment && (
            <>
              <DropdownField
                form={formInstance}
                name={'periodId'}
                labelClass={questionClassNames}
                label={t('profile:requestTimeChange.choosePeriod')}
                required={true}
                options={periodOptions}
                isClearable={false}
                dataTestId="period-dropdown"
              />
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <DateField
                  form={formInstance}
                  name="classLessonDate"
                  labelClass={questionClassNames}
                  label={t('profile:requestTimeChange.lessonDateTime')}
                  required={true}
                  includeDates={dateOptions.map(date => date.getStartDate())}
                  includeTimes={dateOptions.map(date => date.getStartDate())}
                  showTimeSelect
                  data-testid="date-field"
                />
                <div className="pointer-events-none">
                  <DateField
                    form={formInstance}
                    name="endTime"
                    labelClass={questionClassNames}
                    label={t('profile:requestTimeChange.lessonEndTime')}
                    required={false}
                    selected={selectedDate ? selectedDate.getEndDate() : null}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd h:mm aa"
                    timeFormat="h:mm aa"
                    isDisabled={true}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default RequestExistingLesson
