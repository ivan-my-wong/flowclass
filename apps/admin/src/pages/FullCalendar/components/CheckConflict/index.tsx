import { useMemo, useState } from 'react'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { LuFileWarning } from 'react-icons/lu'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { CheckConflictClassLesson } from '@/types/fullCalendar.type'

import ConflictItem from './ConflictItem'

const groupByConflictId = (data?: CheckConflictClassLesson['classroom']) => {
  if (!data?.length) return {}
  const grouped: Record<string, typeof data> = {}

  data.forEach(item => {
    if (!item.conflictGroupId) return
    if (!grouped[item.conflictGroupId]) {
      grouped[item.conflictGroupId] = []
    }
    grouped[item.conflictGroupId].push(item)
  })

  return grouped
}

const CheckConflict = () => {
  const { t } = useTranslation()

  const { useCheckConflict } = useLessonDateTimeData()

  const [open, setOpen] = useState<boolean>(false)

  const { mutateAsync: handleValidate, isLoading: loadValidate } =
    useCheckConflict()

  const handleOpenChange = () => {
    setOpen(!open)
  }

  const [classConflicts, setClassConflicts] =
    useState<CheckConflictClassLesson>()

  const handleValidateTimeslot = () => {
    handleValidate({}).then(res => {
      setClassConflicts(res as unknown as CheckConflictClassLesson)
    })
  }

  const classroom = useMemo(
    () => groupByConflictId(classConflicts?.classroom),
    [classConflicts?.classroom]
  )
  const teacher = useMemo(
    () => groupByConflictId(classConflicts?.teacher),
    [classConflicts?.teacher]
  )

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>
        <Button
          onClick={handleValidateTimeslot}
          variant="outline"
          iconAfter={<LuFileWarning />}
          className="py-3 w-full"
          loading={loadValidate}
        >
          {t(`calendar:checkConflict.title`)}
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
              <div className="flex gap-2 items-center text-warn mb-4">
                <LuFileWarning size={24} />
                {t(`teachingService:validate.classConflict`)}
              </div>
              <div className="space-y-4">
                {Object.keys(classroom)
                  .sort()
                  .map(group => {
                    return (
                      <div
                        className="space-y-4 pl-2 py-3 rounded-lg border border-primary"
                        key={group}
                      >
                        {classroom[group].map((classes, key) => {
                          return (
                            <ConflictItem
                              key={classes.id}
                              classes={classes}
                              index={key}
                              isClassroom
                            />
                          )
                        })}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {!!classConflicts?.teacher?.length && (
            <div className="mt-4">
              <div className="flex gap-2 items-center text-warn mb-4">
                <LuFileWarning size={24} />
                {t(`teachingService:validate.teacherConflict`)}
              </div>
              <div className="space-y-4">
                {Object.keys(teacher)
                  .sort()
                  .map(group => {
                    return (
                      <div
                        className="space-y-4 pl-2 py-3 rounded-lg border border-primary"
                        key={group}
                      >
                        {teacher[group].map((classes, key) => {
                          return (
                            <ConflictItem
                              key={classes.id}
                              classes={classes}
                              index={key}
                            />
                          )
                        })}
                      </div>
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

export default CheckConflict
