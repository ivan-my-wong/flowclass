import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { useTranslation } from 'react-i18next'
import { LuPencil, LuTrash2 } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import useConfirm from '@/hooks/useGlobalConfirm'
import useTrialLessonData from '@/hooks/useTrialLessonData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Course } from '@/types/course'
import { TrialLessonResponse } from '@/types/trialLesson.type'

type PropType = {
  data: TrialLessonResponse
  currency: string
  courses?: Course[]
}
const TrialLessonCard = ({
  courses,
  data,
  currency,
}: PropType): JSX.Element => {
  const { useUpdateTrialLesson, useDeleteTrialLesson } = useTrialLessonData()
  const [isEnabled, setIsEnabled] = useState<boolean>(data.enabled)

  const { t } = useTranslation()
  const navigate = useNavigate()
  // Use debounce to prevent multiple state changes for the switch in a short time
  const isEnabledDebounce = useDebounce(isEnabled, 1000)

  const { mutateAsync, isLoading } = useUpdateTrialLesson(data.id as number)

  const { isLoading: isLoadingDelete, mutateAsync: onDeleteTrialLesson } =
    useDeleteTrialLesson(data.id as number, () => {
      closeConfirm()
    })

  const { setConfirm, closeConfirm, setLoading } = useConfirm(isLoadingDelete)
  useEffect(() => {
    const onSwitchEnable = async () => {
      if (isEnabledDebounce !== data.enabled) {
        await mutateAsync({
          ...data,
          classes: data.classes.map(d => ({
            classId: d.classId,
          })),
          enabled: isEnabledDebounce,
        })
      }
    }
    onSwitchEnable()
  }, [isEnabledDebounce])

  const classes = useMemo(() => {
    return data.classes.map(d => {
      const course = (courses || []).find(
        course => course.id === d.classEntity?.courseId
      )
      return {
        ...d,
        course,
      }
    })
  }, [data.classes, courses])
  const onTriggerDelete = () => {
    setConfirm({
      title: t('promotion:trialLesson.deleteAction.title').toString(),
      description: t(
        'promotion:trialLesson.deleteAction.description'
      ).toString(),
      onConfirm: async () => {
        try {
          await onDeleteTrialLesson()
          setLoading(false)
        } catch (error) {
          console.error(error)
        }
      },
      alertType: AlertTypes.WARN,
      confirmText: t('common:action.yes').toString(),
      cancelText: t('common:action.no').toString(),
    }).open()
  }
  return (
    <Box
      data-testid="trial-lesson-card"
      className="flex flex-col justify-between items-stretch shadow-md p-6 rounded-lg"
    >
      <div className="flex gap-x-8 justify-between">
        <div className="flex flex-col gap-2">
          <h1>
            {data.price <= 0
              ? t('promotion:trialLesson.free')
              : [currency, data.price].join(' ')}
          </h1>
          <div className="flex flex-wrap gap-1">
            {classes.map(classItem => (
              <Badge
                key={`${classItem.id}-${classItem.classId}`}
                variant="outline"
              >
                {classItem.course?.name || ''} / {classItem.classEntity?.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-end gap-y-2">
          <Switch
            className="self-end"
            disabled={isLoading}
            onCheckedChange={setIsEnabled}
            checked={data.enabled}
          />
          <div className="flex gap-x-2">
            <Button
              variant="link"
              size="icon"
              onClick={() =>
                navigate(`/promotion/trial-lesson/${data.id}/update`)
              }
            >
              <LuPencil />
            </Button>
            <Button
              variant="link"
              className="text-warn"
              size="icon"
              onClick={onTriggerDelete}
              data-testid="delete-trial-lesson-btn"
            >
              <LuTrash2 />
            </Button>
          </div>
        </div>
      </div>
    </Box>
  )
}
export default TrialLessonCard
