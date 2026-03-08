import { useRef } from 'react'

import {
  Control,
  FieldValues,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgPlayListRemove } from 'react-icons/cg'
import { IoMdAdd } from 'react-icons/io'

import IconButton from '@/components/Buttons/IconButton'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { ClassesForm, RecurringSchedules } from '@/types/classes'
import dayjs from '@/utils/dayjs'
import {
  convertHHmmStringByDate,
  getDateStringByTimeString,
  getWeekdaysArray,
  isEndTimeAfterStartTime,
  isTimeslotOverlap,
} from '@/utils/timeString'

import AddRecurringClassModal, {
  AddRecurringModalHandle,
} from './CreateRecurringClassModal'

type RecurringSchedulesWithUid = RecurringSchedules & { uid: string }

const WeekdayList = (): JSX.Element => {
  const form = useFormContext<ClassesForm>()
  const {
    clearErrors,
    control,
    formState: { errors },
  } = form
  const currentClass = form.getValues()
  const recurringSchedules = form.watch(`recurringSchedules`)
  const { fields, append, update } = useFieldArray({
    control: form.control,
    keyName: `uid`,
    name: `recurringSchedules`,
  })
  const classId = form.watch(`id`)
  const addRecurringModalHandle = useRef<AddRecurringModalHandle>(null)
  const { t } = useTranslation()

  const openModal = () => {
    addRecurringModalHandle.current?.handleOpenChange?.()
  }
  const findIndexSchedule = (date: RecurringSchedulesWithUid) => {
    return fields.findIndex(field => field.uid === date.uid)
  }
  const handleDeleteLessonDate = (date: RecurringSchedulesWithUid) => {
    const findIndex = findIndexSchedule(date)
    update(findIndex, {
      ...fields[findIndex],
      deleted: true,
    })
  }

  const updateLessonDateStartTime = (
    date: RecurringSchedulesWithUid,
    newStartTime: string
  ) => {
    const startTime = dayjs(newStartTime, 'HH:mm')
    const findIndex = findIndexSchedule(date)
    update(findIndex, {
      ...fields[findIndex],
      startTime: newStartTime,
      endTime: startTime.add(1, 'hour').format('HH:mm'),
    })
  }

  const updateLessonDateEndTime = (
    date: RecurringSchedulesWithUid,
    newEndTime: string
  ) => {
    const findIndex = findIndexSchedule(date)

    update(findIndex, {
      ...fields[findIndex],
      endTime: newEndTime,
    })
  }

  // const lessonDateTime = lessonDateTimeSorting(currentClass.recurringSchedules)
  const sortedLessonDateTime = [...fields].sort((a, b) => {
    if (a.weekDay !== b.weekDay) return a.weekDay - b.weekDay
    return (
      dayjs(a.startTime, 'HH:mm').utc().toDate().getTime() -
      dayjs(b.startTime, 'HH:mm').utc().toDate().getTime()
    )
  })
  return (
    <>
      {getWeekdaysArray(t).map((obj, index) => (
        <Box
          padding="base"
          className="border-b border-b-text-disabled"
          key={obj?.toString() ?? index}
          responsive
        >
          <Box justify="start" className="flex-1">
            <Text className="w-[80px]">{obj}</Text>
          </Box>
          <Box justify="between">
            <Box justify="start" direction="col" gap="3">
              {sortedLessonDateTime.some(
                date => date.weekDay === index && !date.deleted
              ) ? (
                sortedLessonDateTime
                  ?.filter(date => date.weekDay === index && !date.deleted)
                  .map((date, dateIndex) => {
                    return (
                      <Box key={`${dateIndex}-${date.weekDay}`}>
                        <CustomDatePicker
                          dateFormat="h:mm aa"
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={5}
                          noConvertTimeZone
                          selectedDate={(() => {
                            return getDateStringByTimeString(
                              date.startTime
                            ).toISOString()
                          })()}
                          onChange={val => {
                            const formattedTime = dayjs(val).format('HH:mm')

                            updateLessonDateStartTime(date, formattedTime)
                          }}
                          validation={{
                            control: control as unknown as Control<FieldValues>,
                            name: `recurringSchedules.${dateIndex}.startTime`,
                            rules: {
                              validate: () => {
                                const newObj = {
                                  id: date.id,
                                  classId,
                                  weekDay: date.weekDay,
                                  startTime: date.startTime
                                    ? dayjs(date.startTime).format('HH:mm')
                                    : date.startTime,
                                  endTime: date.endTime,
                                }

                                if (
                                  isTimeslotOverlap(
                                    newObj,
                                    recurringSchedules.filter(
                                      lesson => lesson.deleted !== true
                                    )
                                  )
                                ) {
                                  return t(
                                    'teachingService:session.timeslotOverlap'
                                  ) as string
                                }
                                if (
                                  !isEndTimeAfterStartTime(
                                    date.startTime,
                                    date.endTime
                                  )
                                ) {
                                  return t(
                                    'teachingService:session.invalidEndTime'
                                  ) as string
                                }
                                return true
                              },
                            },
                            errors,
                          }}
                        />
                        -
                        <CustomDatePicker
                          strictParsing
                          dateFormat="h:mm aa"
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={5}
                          noConvertTimeZone
                          selectedDate={(() => {
                            return getDateStringByTimeString(
                              date.endTime
                            ).toISOString()
                          })()}
                          onChange={val => {
                            const endTime = dayjs(val).format('HH:mm')
                            updateLessonDateEndTime(date, endTime)
                          }}
                          filterTime={time => {
                            return isEndTimeAfterStartTime(
                              date.startTime,
                              convertHHmmStringByDate(time) ?? ''
                            )
                          }}
                          readOnly
                          validation={{
                            control: control as unknown as Control<FieldValues>,
                            name: `recurringSchedules.${dateIndex}.endTime`,
                            rules: {
                              validate: () => {
                                const newObj = {
                                  id: date.id,
                                  classId,
                                  weekDay: date.weekDay,
                                  startTime: date.startTime,
                                  endTime: date.endTime,
                                }

                                if (
                                  isTimeslotOverlap(
                                    newObj,
                                    currentClass.recurringSchedules.filter(
                                      lesson => lesson.deleted !== true
                                    )
                                  )
                                ) {
                                  return t(
                                    'teachingService:session.timeslotOverlap'
                                  ) as string
                                }
                                if (
                                  !isEndTimeAfterStartTime(
                                    date.startTime,
                                    date.endTime
                                  )
                                ) {
                                  return t(
                                    'teachingService:session.invalidEndTime'
                                  ) as string
                                }
                                return true
                              },
                            },
                            errors,
                          }}
                        />
                        <IconButton
                          plain
                          size="medium"
                          color="warn"
                          css={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            opacity: 1,
                            marginLeft: 'auto',
                          }}
                          onClick={() => {
                            handleDeleteLessonDate(date)
                            clearErrors(
                              `recurringSchedules.${dateIndex}.startTime`
                            )
                            clearErrors(
                              `recurringSchedules.${dateIndex}.endTime`
                            )
                          }}
                          icon={<CgPlayListRemove />}
                        />
                      </Box>
                    )
                  })
              ) : (
                <div className="bg-background-layer-3 rounded-md w-full p-3 text-sm">
                  {t('teachingService:class.notHaveTimeslot')}
                </div>
              )}
            </Box>
            <IconButton
              id={obj}
              onClick={() => {
                openModal()
                addRecurringModalHandle.current?.handleWeekdayChange(index)
              }}
              plain
              icon={<IoMdAdd />}
              color="primary"
            />
          </Box>
          <AddRecurringClassModal
            ref={addRecurringModalHandle}
            currentClass={currentClass}
            append={append}
          />
        </Box>
      ))}
    </>
  )
}

export default WeekdayList
