import { Control, FieldValues, useFormContext } from 'react-hook-form'
import { CgPlayListRemove } from 'react-icons/cg'

import IconButton from '@/components/Buttons/IconButton'
import Box from '@/components/Containers/Box'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Text from '@/components/Texts/Text'
import useSiteData from '@/hooks/useSiteData'
import { ClassesForm, PeriodLessons } from '@/types/classes'
import { addMinutesToDate } from '@/utils/timeFormat'

type SingleDateProps = {
  scheduleIndex: number
  lessonIndex: number
  lesson: PeriodLessons
  update: (index: number, value: PeriodLessons) => void
  remove: (index: number) => void
}

const SingleDate = ({
  scheduleIndex,
  lessonIndex,
  lesson,
  update,
  remove,
}: SingleDateProps): JSX.Element => {
  const { convertDateToCurrentTimeZoneUTCString } = useSiteData()
  const form = useFormContext<ClassesForm>()
  const currentSchedule = form.watch(`regularPeriods.${scheduleIndex}`)

  const { errors } = form.formState

  const handleLessonStartDateChange = (date: Date | null) => {
    // Create a new object to avoid mutating the original
    if (!date) return
    const isoString = convertDateToCurrentTimeZoneUTCString(date)
    const endDate = new Date(
      addMinutesToDate(isoString as string, currentSchedule.duration)
    )
    const endDateIsoString = convertDateToCurrentTimeZoneUTCString(endDate)
    update(lessonIndex, {
      ...lesson,
      startTime: isoString as string,
      endTime: endDateIsoString as string,
    })
  }

  const handleLessonEndDateChange = (date: Date | null) => {
    if (date === null) return
    const isoString = convertDateToCurrentTimeZoneUTCString(date)
    update(lessonIndex, {
      ...lesson,
      endTime: isoString as string,
    })
  }

  const handleDeleteLesson = () => {
    remove(lessonIndex)
  }

  return (
    <Box responsive className="singleDate">
      <CustomDatePicker
        data-testid="startDate"
        showTimeSelect
        timeIntervals={5}
        dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
        selectedDate={lesson.startTime}
        onChange={date => handleLessonStartDateChange(date)}
        validation={{
          control: form.control as unknown as Control<FieldValues>,
          name: `regularPeriods.${scheduleIndex}.lessons.${lessonIndex}.startTime`,
          rules: {},
          errors,
        }}
      />
      <Text> - </Text>
      <CustomDatePicker
        type="end"
        data-testid="endDate"
        // dateFormat="dd/MM/yy (EEE) h:mm aa"
        dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
        selectedDate={lesson.endTime}
        onChange={date => handleLessonEndDateChange(date)}
        validation={{
          control: form.control as unknown as Control<FieldValues>,
          name: `regularPeriods.${scheduleIndex}.lessons.${lessonIndex}.endTime`,
          rules: {},
          errors,
        }}
      />

      <IconButton
        data-testid="delete-single-date-btn"
        plain
        size="medium"
        color="warn"
        css={{
          cursor: 'pointer',
          pointerEvents: 'auto',
          opacity: 1,
          marginLeft: 'auto',
        }}
        onClick={handleDeleteLesson}
        icon={<CgPlayListRemove />}
      />
    </Box>
  )
}

export default SingleDate
