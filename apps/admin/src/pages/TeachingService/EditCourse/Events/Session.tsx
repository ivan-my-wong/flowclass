import { useEffect, useMemo, useState } from 'react'

import {
  Control,
  FieldValues,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgPlayListRemove } from 'react-icons/cg'

import IconButton from '@/components/Buttons/IconButton'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Separator from '@/components/Separators/Separator'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import ShadowBox from '@/components/ui/ShadowBox'
import { defaultRepeatFormat } from '@/constants/course'
import useSiteData from '@/hooks/useSiteData'
import { ClassesForm, PeriodLessons, RegularPeriods } from '@/types/classes'
import dayjs from '@/utils/dayjs'
import { addRepeatTypeToDate } from '@/utils/timeFormat'
import {
  convertDDMMYYYYStringByDate,
  isEndDateAfterStartDate,
  isSessionTimeslotValid,
} from '@/utils/timeString'

import ValidateSessionModal from '../ValidateSessionModal'

const SessionPage = (): JSX.Element => {
  const { t } = useTranslation()
  const form = useFormContext<ClassesForm>()
  const classToBeEdited = form.getValues()
  const defaultRegularPeriods: RegularPeriods = useMemo(
    () => ({
      siteId: classToBeEdited?.siteId,
      institutionId: classToBeEdited?.institutionId,
      courseId: classToBeEdited?.courseId,
      classId: classToBeEdited?.id,
      duration: 60,
      name: 'session 1',
      lessons: [],
      repeatFormat: defaultRepeatFormat,
    }),
    [classToBeEdited]
  )

  const eventPeriod = useMemo(() => {
    if (!classToBeEdited) return null
    return classToBeEdited?.regularPeriods &&
      classToBeEdited?.regularPeriods?.length > 0
      ? classToBeEdited.regularPeriods[0]
      : defaultRegularPeriods
  }, [classToBeEdited, defaultRegularPeriods])
  const localForm = useForm<{
    lessons: PeriodLessons[]
  }>({
    defaultValues: {
      lessons: eventPeriod?.lessons ?? [],
    },
  })

  const { fields, update, append, remove } = useFieldArray({
    control: localForm.control,
    keyName: 'uid',
    name: 'lessons',
  })

  const { errors } = form.formState

  const { unit, every } = eventPeriod?.repeatFormat ?? defaultRepeatFormat

  useEffect(() => {
    if (fields) {
      form.setValue('regularPeriods.0.lessons', fields)
    }
  }, [fields])

  const { convertDateToCurrentTimeZoneUTCString } = useSiteData()

  const [isOverlap, setIsOverlap] = useState(false)

  const handleStartDateChange = (date: Date | null, index: number): void => {
    if (date === null) return
    const endDate = new Date(date) // Create a new Date object based on the original date
    endDate.setHours(endDate.getHours() + 1) // Add 1 hour
    const startDateIsoString = convertDateToCurrentTimeZoneUTCString(date)
    const endDateIsoString = convertDateToCurrentTimeZoneUTCString(endDate)
    if (startDateIsoString === null || endDateIsoString === null) return
    update(index, { startTime: startDateIsoString, endTime: endDateIsoString })
  }

  const handleEndDateChange = (date: Date | null, index: number): void => {
    const isoString = convertDateToCurrentTimeZoneUTCString(date)
    if (isoString === null) return
    const startDate = fields?.[index]?.startTime
    if (startDate === null) return
    update(index, { startTime: startDate, endTime: isoString })
  }

  const getLatestDate = (type: 'start' | 'end'): Date => {
    if (fields && fields.length !== 0) {
      const { length } = fields

      if (type === 'start') {
        return dayjs(fields[length - 1].startTime).toDate()
      }
      return dayjs(fields[length - 1].endTime).toDate()
    }
    return dayjs().toDate()
  }

  const handleAddDate = (): void => {
    const startDate = addRepeatTypeToDate(
      getLatestDate('end').toISOString(),
      unit,
      every
    )

    // Add 1 hour to the start time to calculate the end time
    const endDate = dayjs(startDate).add(7, 'days').toISOString()

    append({
      startTime: startDate,
      endTime: endDate,
    })
  }
  const handleDeleteDate = (index: number): void => {
    remove(index)
  }

  const SessionDateCard = (): JSX.Element => {
    return fields && fields?.length !== 0 ? (
      <Box direction="col">
        {fields
          .sort((a, b) => {
            const dateA = new Date(a.startTime)
            const dateB = new Date(b.startTime)
            return dateA.getTime() - dateB.getTime()
          })
          ?.map((date, index) => {
            if (!date.deleted) {
              const id = index.toString()
              // setValue(`startTime-${date.id}`, getValues(`startTime-${date.id}`))
              return (
                <Box direction="col" key={id} gap="lg">
                  <ShadowBox>
                    <Box responsive>
                      <CustomDatePicker
                        id="startTime"
                        showTimeSelect
                        timeIntervals={5}
                        // label={t('teachingService:session.startTime') as string}
                        selectedDate={date.startTime}
                        onChange={async dateTime => {
                          handleStartDateChange(dateTime, index)
                        }}
                        validation={{
                          control:
                            form.control as unknown as Control<FieldValues>,
                          name: `regularPeriods.0.lessons.${index}.startTime`,
                          rules: {},
                          errors,
                        }}
                      />
                      <Text>-</Text>
                      <CustomDatePicker
                        id="endTime"
                        showTimeSelect
                        timeIntervals={5}
                        // label={t('teachingService:session.endTime') as string}
                        selectedDate={date.endTime}
                        onChange={async dateTime => {
                          handleEndDateChange(dateTime, index)
                          // await setValue(`endTime-${date.id}`, dateTime)
                          // trigger(`endTime-${date.id}`)
                        }}
                        filterDate={filterDate => {
                          const convertedDDMMYYYYDate =
                            convertDDMMYYYYStringByDate(
                              new Date(date.startTime)
                            )
                          return isEndDateAfterStartDate(
                            convertedDDMMYYYYDate,
                            convertDDMMYYYYStringByDate(filterDate) ?? ''
                          )
                        }}
                        validation={{
                          control:
                            localForm.control as unknown as Control<FieldValues>,
                          name: `regularPeriods.0.lessons.${index}.endTime`,
                          rules: {
                            validate: () => {
                              const isOverlapWithPrevious =
                                isSessionTimeslotValid(date, fields ?? [])

                              if (isOverlapWithPrevious) {
                                setIsOverlap(false)
                              } else {
                                setIsOverlap(true)
                              }

                              return (
                                isOverlapWithPrevious ||
                                t('teachingService:session.invalidEndTime') ||
                                undefined
                              )
                            },
                          },

                          errors,
                        }}
                      />
                    </Box>
                    <IconButton
                      data-testid="delete-session-btn"
                      id="delete-session"
                      plain
                      size="medium"
                      color="warn"
                      className="cursor-pointer pointer-events-auto opacity-100 ml-auto"
                      onClick={() => handleDeleteDate(index)}
                      icon={<CgPlayListRemove />}
                    />
                  </ShadowBox>
                </Box>
              )
            }
            return <></>
          })}
      </Box>
    ) : (
      <ShadowBox className="mt-4">
        <Text data-testid="noSessionYet-txt">
          {t('teachingService:session.noSessionYet')}
        </Text>
      </ShadowBox>
    )
  }

  return (
    <Box direction="col">
      <div className="flex justify-between items-center w-full">
        <Heading id="eventSessionHeading">
          {t('teachingService:class.schedule')}
        </Heading>
        <ValidateSessionModal />
      </div>

      <p id="classScheduleTips" className="text-left">
        {t('teachingService:class.minimumPurchaseLesson')}
      </p>
      <Box
        direction="col"
        className="border-1 border-solid border-text-disabled"
        padding="2"
      >
        <SessionDateCard />

        <Text
          className="text-primary cursor-pointer font-bold self-center my-4 shrink-0 hover:underline hover:text-primary-highlight disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            handleAddDate()
          }}
          data-testid="add-session-btn"
          style={
            isOverlap ? { pointerEvents: 'none', opacity: 0.5 } : undefined
          }
        >
          + {t('teachingService:session.addSession')}
        </Text>

        {/* {classToBeEdited?.lessons.length !== 0 && ( */}
        {/*  <AddDateButtonGroup /> */}
        {/* )} */}
      </Box>
    </Box>
  )
}

export default SessionPage
