import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { Portal, Root, Title } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Checkbox from '@/components/Checkbox/Checkbox'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { TextInput } from '@/components/Inputs/TextInput'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import IntervalSelector from '@/components/Selector/IntervalSelector'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  hoursSelectItems,
  minuteSelectItems,
} from '@/constants/timeSelectItems'
import useSiteData from '@/hooks/useSiteData'
import { Classes, RecurringSchedules } from '@/types/classes'
import dayjs from '@/utils/dayjs'
import { convertHHmmStringByDate, isTimeslotOverlap } from '@/utils/timeString'

type AddRecurringClassModalProps = {
  currentClass: Classes
  append: (value: RecurringSchedules) => void
}

export type AddRecurringModalHandle = {
  handleOpenChange: () => void
  handleWeekdayChange: (index: number) => void
}

const AddRecurringClassModal = forwardRef<
  AddRecurringModalHandle,
  AddRecurringClassModalProps
>(({ currentClass, append }, ref) => {
  const { convertDateToCurrentTimeZoneUTCString } = useSiteData()
  const {
    control,
    trigger,
    reset,
    formState: { errors },
  } = useForm()
  const [open, setOpen] = useState<boolean>(false)
  const [isMultipleClass, setIsMultipleClass] = useState<boolean>(false)
  const [hourLessonDuration, setHourLessonDuration] = useState<number>(
    hoursSelectItems[1].value as number
  )
  const [minuteLessonDuration, setMinuteLessonDuration] = useState<number>(
    minuteSelectItems[0].value as number
  )
  const [hourBreakTime, setHourBreakTime] = useState<number>(
    hoursSelectItems[0].value as number
  )
  const [minuteBreakTime, setMinuteBreakTime] = useState<number>(
    minuteSelectItems[0].value as number
  )
  const [currentWeekday, setCurrentWeekday] = useState<number>(0)
  const [startDateTime, setStartDateTime] = useState<Date>(new Date())
  const [numOfLessonGenerate, setNumOfLessonGenerate] = useState<number>(2)

  const [startTime, setStartTime] = useState<string>(
    startDateTime.toLocaleTimeString()
  )

  const [endTime, setEndTime] = useState<string>(
    startDateTime.toLocaleTimeString()
  )
  const [lessonDatesValidator, setLessonDatesValidator] =
    useState<RecurringSchedules>()

  const { t } = useTranslation(['teachingService'])

  const handleOpenChange = () => {
    setOpen(!open)
    reset()
  }

  const handleWeekdayChange = (index: number) => {
    setCurrentWeekday(index)
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
    handleWeekdayChange,
  }))

  useEffect(() => {
    trigger('startTime')
  }, [trigger, lessonDatesValidator])
  useEffect(() => {
    // const roundedDate = roundTimeToNearestQuarterHour(startDateTime)
    setStartDateTime(startDateTime)
    setStartTime(convertHHmmStringByDate(startDateTime) ?? '')
  }, [startDateTime])

  const updateClassLessonDates = () => {
    if (!isMultipleClass) {
      const newLessonDate: RecurringSchedules = {
        classId: currentClass.id,
        weekDay: currentWeekday,
        startTime,
        endTime,
      }

      const calculatedEndTime = dayjs(newLessonDate.startTime, 'HH:mm')
        .utc()
        .add(hourLessonDuration, 'hours')
        .add(minuteLessonDuration, 'minutes')
        .toDate()

      newLessonDate.endTime = convertHHmmStringByDate(calculatedEndTime) ?? ''
      setLessonDatesValidator(newLessonDate)

      // We don't care about the overlap here because we are creating a new lesson
      // const filteredLessonDates = currentClass.recurringSchedules
      //   ? currentClass.recurringSchedules.filter(
      //       lesson => lesson.deleted !== true
      //     )
      //   : []

      if (
        // isTimeslotOverlap(newLessonDate, filteredLessonDates) ||
        Number(hourLessonDuration) === 0 &&
        Number(minuteLessonDuration) === 0
      ) {
        setOpen(true)
      } else {
        append(newLessonDate)
        setOpen(false)
      }
    } else {
      const first = {
        classId: currentClass.id,
        weekDay: currentWeekday ?? 0,
        startTime,
        endTime,
      }

      const newLessonDates: RecurringSchedules[] = [first]

      const calculatedEndTime = dayjs(first.startTime, 'HH:mm')
        .utc()
        .add(hourLessonDuration, 'hours')
        .add(minuteLessonDuration, 'minutes')
        .toDate()

      first.endTime = convertHHmmStringByDate(calculatedEndTime) ?? ''
      for (let i = 0; i < numOfLessonGenerate - 1; i += 1) {
        const nextStartTime = dayjs(newLessonDates[i]?.endTime, 'HH:mm')
          .utc()
          .add(hourBreakTime, 'hours')
          .add(minuteBreakTime, 'minutes')
          .toDate()
        const nextEndTime = dayjs(nextStartTime)
          .utc()
          .add(hourLessonDuration, 'hours')
          .add(minuteLessonDuration, 'minutes')
          .toDate()
        const obj = {
          classId: currentClass.id,
          weekDay: currentWeekday,
          startTime: dayjs(nextStartTime).format('HH:mm') ?? '',
          endTime: dayjs(nextEndTime).format('HH:mm') ?? '',
        }

        newLessonDates.push(obj)
      }
      const validateLessonDatesConflict: RecurringSchedules = {
        ...newLessonDates[0],
        endTime: newLessonDates[newLessonDates.length - 1]?.endTime,
      }

      setLessonDatesValidator(validateLessonDatesConflict)

      const filteredLessonDates = currentClass.recurringSchedules
        ? currentClass.recurringSchedules.filter(
            lesson => lesson.deleted !== true
          )
        : []

      if (
        isTimeslotOverlap(validateLessonDatesConflict, filteredLessonDates) ||
        (Number(hourLessonDuration) === 0 &&
          Number(minuteLessonDuration) === 0) ||
        numOfLessonGenerate < 2
      ) {
        setOpen(true)
      } else {
        newLessonDates.forEach(lesson => append(lesson))
        setOpen(false)
      }
    }
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Portal>
        <StyledOverlay />

        <StyledContent>
          <Title>{t(`teachingService:recurringClass.createTimeslot`)}</Title>
          <Separator />
          <Box direction="col">
            <Box
              padding="base"
              direction="col"
              gap="4"
              className="whitespace-nowrap"
            >
              <Box justify="start">
                <Text>{`${t(`lessonDateTime:start`)} :`}</Text>
                <CustomDatePicker
                  dateFormat="h:mm aa"
                  showTimeSelectOnly
                  timeIntervals={5}
                  selectedDate={convertDateToCurrentTimeZoneUTCString(
                    startDateTime
                  )}
                  onChange={date => {
                    setStartDateTime(date ?? new Date())
                    setStartTime(
                      date?.toLocaleTimeString() ??
                        new Date().toLocaleTimeString()
                    )
                  }}
                  // validation={{
                  //   control,
                  //   name: 'startTime',
                  //   rules: {
                  //     validate: () => {
                  //       const filteredLessonDates =
                  //         currentClass.recurringSchedules
                  //           ? currentClass.recurringSchedules.filter(
                  //               lesson => lesson.deleted !== true
                  //             )
                  //           : []

                  //       // if (
                  //       //   isTimeslotOverlap(
                  //       //     lessonDatesValidator as RecurringSchedules,
                  //       //     filteredLessonDates
                  //       //   )
                  //       // ) {
                  //       //   return `${t(
                  //       //     `teachingService:recurringClass.overlapWarning`
                  //       //   )}`
                  //       // }

                  //       return undefined
                  //     },
                  //   },
                  //   errors,
                  // }}
                />
              </Box>
              <Box justify="start">
                <Text>{`${t(
                  `teachingService:recurringClass.singleLessonDuration`
                )} :`}</Text>

                <IntervalSelector
                  currentSelectHour={hourLessonDuration}
                  currentSelectMinute={minuteLessonDuration}
                  onSelectHourChange={setHourLessonDuration}
                  onSelectMinuteChange={setMinuteLessonDuration}
                  isError={
                    Number(hourLessonDuration) === 0 &&
                    Number(minuteLessonDuration) === 0
                  }
                  helperText={
                    Number(hourLessonDuration) === 0 &&
                    Number(minuteLessonDuration) === 0
                      ? t(
                          `teachingService:recurringClass:lessonDurationWarning`
                        )
                      : null
                  }
                />
              </Box>
              <Box justify="start" id="createMultipleClass-div">
                <Checkbox
                  id="createMultipleClass"
                  label={t(
                    `teachingService:recurringClass.createMultipleClass`
                  )}
                  name="multipleClass"
                  isChecked={isMultipleClass}
                  onChange={(value: boolean) => {
                    setIsMultipleClass(value)
                  }}
                  // css={{ flexShrink: 0, fontWeight: 'bold' }}
                />
              </Box>
              {isMultipleClass && (
                <Box justify="start">
                  <Text>{`${t(
                    `teachingService:recurringClass:lessonBuffer`
                  )} :`}</Text>
                  <IntervalSelector
                    currentSelectHour={hourBreakTime}
                    currentSelectMinute={minuteBreakTime}
                    onSelectHourChange={setHourBreakTime}
                    onSelectMinuteChange={setMinuteBreakTime}
                  />
                </Box>
              )}

              {isMultipleClass && (
                <Box justify="start">
                  <Text>{`${t(
                    `teachingService:recurringClass:numOfLessonGenerate`
                  )} :`}</Text>
                  <TextInput
                    value={numOfLessonGenerate}
                    id="numOfLessonGenerate"
                    type="number"
                    isError={numOfLessonGenerate < 2}
                    helperText={
                      numOfLessonGenerate < 2
                        ? t(
                            `teachingService:recurringClass:numOfLessonsWarning`
                          )
                        : null
                    }
                    onChange={(e: any) => {
                      setNumOfLessonGenerate(e.target.value)
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Button
            size="md"
            className="w-fit self-end"
            onClick={() => {
              updateClassLessonDates()
            }}
          >
            <Text>{t(`teachingService:class.confirm`)}</Text>
          </Button>
          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default AddRecurringClassModal
