import { useState } from 'react'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CiWarning } from 'react-icons/ci'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import useClassData from '@/hooks/useClassData'
import { Classes, ClassesForm, ResValidateTimeslot } from '@/types/classes'

import ValidationItem from './ValidationItem'

const ValidateSessionModal = () => {
  const { t } = useTranslation()

  const { useValidateTimeslots } = useClassData()

  const [open, setOpen] = useState<boolean>(false)

  const form = useFormContext<ClassesForm>()
  const classToBeEdited = form.getValues()

  const { mutateAsync: handleValidate, isLoading: loadValidate } =
    useValidateTimeslots()

  const handleOpenChange = () => {
    setOpen(!open)
  }

  const { setError, clearErrors } = form

  const [classConflicts, setClassConflicts] = useState<ResValidateTimeslot>()

  const processConflicts = (res: ResValidateTimeslot, setError: any) => {
    const regularPeriods = classToBeEdited.regularPeriods.map(
      period => period.lessons
    )
    const lessonsSameStart: Record<string, Record<string, any[]>> = {}
    const lessonsSameEnd: Record<string, Record<string, any[]>> = {}

    const processEntity = (
      entity: ResValidateTimeslot['classroom'],
      type: 'classroom' | 'teacher'
    ) => {
      entity.forEach(o => {
        o.lessonsSameIds.forEach(({ lessonId, isSameStart, isSameEnd }) => {
          if (isSameStart) {
            lessonsSameStart[lessonId] = lessonsSameStart[lessonId] || {
              classroom: [],
              teacher: [],
            }
            lessonsSameStart[lessonId][type].push(o.name)
          }
          if (isSameEnd) {
            lessonsSameEnd[lessonId] = lessonsSameEnd[lessonId] || {
              classroom: [],
              teacher: [],
            }
            lessonsSameEnd[lessonId][type].push(o.name)
          }
        })
      })
    }

    processEntity(res.classroom || [], 'classroom')
    processEntity(res.teacher || [], 'teacher')

    const setErrors = (
      conflicts: Record<string, Record<string, any[]>>,
      timeKey: 'startTime' | 'endTime'
    ) => {
      Object.entries(conflicts).forEach(([lessonId, o]) => {
        const periodsIndex = regularPeriods.findIndex(lesson =>
          lesson.some((l: any) => `${l.id || l.uid}` === lessonId)
        )
        if (periodsIndex === -1) return

        const lessonIndex = regularPeriods[periodsIndex].findIndex(
          (lesson: any) => `${lesson.id || lesson.uid}` === lessonId
        )
        if (lessonIndex === -1) return

        const messages = [
          o.classroom.length && `Classroom conflict: ${o.classroom.join(', ')}`,
          o.teacher.length && `Teacher conflict: ${o.teacher.join(', ')}`,
        ].filter(Boolean)

        if (messages.length) {
          setError(
            `regularPeriods.${periodsIndex}.lessons.${lessonIndex}.${timeKey}`,
            { message: messages.join('; ') }
          )
        }
      })
    }

    setErrors(lessonsSameStart, 'startTime')
    setErrors(lessonsSameEnd, 'endTime')
  }

  const handleValidateTimeslot = () => {
    if (!classToBeEdited.regularPeriods?.length) {
      return
    }

    const lessons = classToBeEdited.regularPeriods
      .map(period => period.lessons)
      .flat()

    handleValidate({ classId: classToBeEdited.dataId, lessons }).then(res => {
      clearErrors()
      setClassConflicts(res)
      processConflicts(res, setError)
    })
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>
        <Button onClick={handleValidateTimeslot} className="py-3">
          {t(`teachingService:validate.title`)}
        </Button>
      </Trigger>
      <Portal>
        <StyledOverlay />

        <StyledContent>
          <Title>{t(`teachingService:validate.conflictsDetection`)}</Title>
          <div className="text-sm text-gray-500">
            {t(`teachingService:validate.conflictsDetectionDesc`)}
          </div>
          <Separator />

          {loadValidate && (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin h-6 w-6 border-4 border-t-transparent rounded-full border-primary" />
            </div>
          )}

          {!!classConflicts?.classroom?.length && (
            <div>
              <div className="flex gap-2 items-center text-tertiary mb-4">
                <CiWarning size={24} />
                {t(`teachingService:validate.classConflict`)}
              </div>
              <div className="space-y-4 pl-2">
                {classConflicts?.classroom.map((classes, key) => {
                  return (
                    <ValidationItem
                      key={classes.id}
                      classes={classes}
                      index={key}
                      isClassroom
                    />
                  )
                })}
              </div>
            </div>
          )}

          {!!classConflicts?.teacher?.length && (
            <div className="mt-4">
              <div className="flex gap-2 items-center text-tertiary mb-4">
                <CiWarning size={24} />
                {t(`teachingService:validate.teacherConflict`)}
              </div>
              <div className="space-y-4 pl-2">
                {classConflicts?.teacher?.map((classes: Classes, key) => {
                  return (
                    <ValidationItem
                      key={classes.id}
                      classes={classes}
                      index={key}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {!classConflicts?.classroom?.length &&
            !classConflicts?.teacher?.length && (
              <div className="flex justify-center items-center h-[200px]">
                <div className="text-success">
                  {t(`teachingService:validate.noConflict`)}
                </div>
              </div>
            )}

          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
}

export default ValidateSessionModal
