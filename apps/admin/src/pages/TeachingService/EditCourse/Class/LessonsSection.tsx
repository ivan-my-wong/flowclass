import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaUndo } from 'react-icons/fa'
import { FiCheckSquare, FiEdit } from 'react-icons/fi'
import { MdDelete } from 'react-icons/md'

import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { FormControl, FormField, FormItem } from '@/components/ui/Form'
import { TextInput } from '@/components/ui/Inputs/TextInput'
import ShadowBox from '@/components/ui/ShadowBox'
import { RepeatUnit } from '@/constants/course'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { ClassesForm, RegularPeriods } from '@/types/classes'
import { cn } from '@/utils/cn'
import { addMinutesToDate, addRepeatTypeToDate } from '@/utils/timeFormat'

import RepeatPeriod from './RepeatPeriod'
import SingleDate from './SingleDate'

type LessonSectionProps = {
  scheduleIndex: number
  schedule: RegularPeriods
  update: (index: number, value: RegularPeriods) => void
  remove: (index: number) => void
  currentPage: number
  setCurrentPage: Dispatch<SetStateAction<number>>
}

const LessonSection = ({
  scheduleIndex,
  schedule,
  update,
  remove: removePeriod,
  currentPage,
  setCurrentPage,
}: LessonSectionProps): JSX.Element => {
  const { t } = useTranslation()
  const namePeriodRef = useRef<HTMLInputElement>(null)
  const form = useFormContext<ClassesForm>()

  const [isEditMode, setIsEditMode] = useState(false)
  const {
    append,
    fields,
    remove,
    update: updateLesson,
  } = useFieldArray({
    control: form.control,
    keyName: `uid`,
    name: `regularPeriods.${scheduleIndex}.lessons`,
  })

  useEffect(() => {
    if (isEditMode) {
      // Wait for the input to be rendered
      setTimeout(() => {
        namePeriodRef.current?.focus()
      }, 100)
    }
  }, [isEditMode])

  const [showDeleteLessonPhasePopup, setShowDeleteLessonPhasePopup] =
    useState(false)

  const addLesson = () => {
    // Use fields from the form's field array instead of regularPeriods
    const startDate =
      fields.length > 0
        ? fields[fields.length - 1].startTime
        : new Date().toISOString()

    const repeatFormats = schedule.repeatFormat?.unit ?? RepeatUnit.days
    const every = schedule.repeatFormat?.every ?? 1

    const newStartDate = addRepeatTypeToDate(startDate, repeatFormats, every)

    append({
      classId: schedule.classId ?? 0,
      periodId: schedule.id ?? 0,
      startTime: newStartDate,
      endTime: addMinutesToDate(newStartDate, schedule.duration),
    })
  }

  const handleUpdatePeriod = (
    scheduleIndex: number,
    { duration, repeatFormat }
  ) => {
    update(scheduleIndex, {
      ...schedule,
      duration,
      repeatFormat,
      lessons: fields,
    })
  }

  const handleDeletePeriod = async (scheduleIndex: number) => {
    removePeriod(scheduleIndex)
    setShowDeleteLessonPhasePopup(false)
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else {
      setCurrentPage(0)
    }
  }

  const setPeriodName = (
    name: string,
    scheduleIndex: number,
    singleSchedule: RegularPeriods
  ) => {
    update(scheduleIndex, {
      ...singleSchedule,
      name,
    })
  }

  const applyDurationNRepeat = (duration: number) => {
    fields.forEach((lesson, index) => {
      updateLesson(index, {
        ...lesson,
        endTime: addMinutesToDate(lesson.startTime, duration),
      })
    })
  }
  return (
    <Box
      direction="col"
      className={cn([
        schedule.deleted ? 'opacity-50' : 'opacity-100',
        schedule.deleted && 'pointer-events-none',
        'rounded-md',
        'border border-text-disabled',
      ])}
      padding="2"
    >
      <Box justify="between" padding="0">
        <Box direction="col" padding="0">
          <div className="box-col items-center justify-center">
            <div className="box-responsive-full items-center justify-between">
              <div className="box-row-full justify-start w-fit">
                {!isEditMode ? (
                  <Text bold size="mediumLarge">
                    {schedule.name}
                  </Text>
                ) : (
                  <FormField
                    name={`regularPeriods.${scheduleIndex}.name`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <TextInput
                            {...field}
                            ref={namePeriodRef}
                            variant="line"
                          />
                        </FormControl>
                        <Button
                          id="savePeriodName"
                          data-testid="savePeriodName"
                          type="button"
                          variant="outline"
                          iconBefore={<FiCheckSquare />}
                          onClick={() => {
                            setPeriodName(
                              field.value ?? '',
                              scheduleIndex,
                              schedule
                            )
                            setIsEditMode(!isEditMode)
                          }}
                        >
                          {t('common:action.save')}
                        </Button>
                      </FormItem>
                    )}
                  />
                )}

                {!isEditMode && (
                  <FiEdit
                    id="editPeriodName"
                    data-testid="editPeriodName"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setIsEditMode(!isEditMode)
                    }}
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="pointer-events-auto opacity-100 text-warn p-0 font-normal"
                onClick={() => {
                  setShowDeleteLessonPhasePopup(true)
                }}
                iconBefore={!schedule.deleted ? <MdDelete /> : <FaUndo />}
              >
                {t('teachingService:class.deletePhase')}
              </Button>
            </div>
            <div className="box-col-full">
              <RepeatPeriod
                key={scheduleIndex}
                scheduleIndex={scheduleIndex}
                schedule={schedule}
                update={handleUpdatePeriod}
                onApplyDurationNRepeat={applyDurationNRepeat}
                addLesson={addLesson}
              />
            </div>
            <CustomedAlertDialog
              open={showDeleteLessonPhasePopup}
              setOpen={setShowDeleteLessonPhasePopup}
              alertType={AlertTypes.CONFIRM}
              description={`${t(
                'teachingService:class.phases.deletePhaseDescription'
              )}`}
              title={t('teachingService:class.phases.title') as string}
              cancelText={t('subscription:subscriptionPopup.cancel') as string}
              actionText={t('subscription:subscriptionPopup.confirm') as string}
              onActionClick={() => {
                handleDeletePeriod(scheduleIndex)
              }}
            />
          </div>
        </Box>
      </Box>
      <Box direction="col">
        {fields.map((item, index) => (
          <ShadowBox key={index}>
            <SingleDate
              scheduleIndex={scheduleIndex}
              lessonIndex={index}
              lesson={item}
              update={updateLesson}
              remove={remove}
            />
          </ShadowBox>
        ))}
      </Box>
    </Box>
  )
}

export default LessonSection
