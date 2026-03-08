import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuAlignJustify, LuEye, LuTrash } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import useConfirm from '@/hooks/useGlobalConfirm'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { UpcomingClasses } from '@/types/user'
import { cn } from '@/utils/cn'

type ActionButtonProps = {
  classData: UpcomingClasses
}

export function ClassActionButton({
  classData,
}: ActionButtonProps): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { useDeleteLesson } = useLessonDateTimeData()
  const { mutate: deleteLesson, isLoading } = useDeleteLesson()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const actions = useMemo(() => {
    // convert to url safe string
    const back = encodeURIComponent(`${pathname}?${params.toString()}`)
    return [
      {
        label: t('lessonDateTime:action.viewDetail'),
        icon: LuEye,
        isDanger: false,
        onClick: () => {
          navigate(
            `/settings/users/profile/lesson/${
              classData.id
            }?${params.toString()}&back=${back}`
          )
        },
      },
      {
        label: t('common:action.delete'),
        icon: LuTrash,
        isDanger: true,
        onClick: () => {
          setConfirm({
            title: t('lessonDateTime:dialog.titleDeleteDialog').toString(),
            description: t(
              'lessonDateTime:dialog:descriptionDeleteLesson'
            ).toString(),
            alertType: AlertTypes.WARN,
            cancelText: t('common:action.cancel').toString(),
            confirmText: t('common:action.confirm').toString(),
            onConfirm: () => {
              deleteLesson(classData.id)
              closeConfirm()
            },
          }).open()
        },
      },
    ]
  }, [classData, navigate])
  const isDisabled = useMemo(() => {
    return dayjs(classData.startTime).isBefore(dayjs())
  }, [classData])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={isDisabled}
          data-testid="location-action-button"
        >
          <LuAlignJustify className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {actions.map(action => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className={cn(
              'flex items-center gap-2 cursor-pointer hover:bg-primary/10 hover:text-primary',
              action.isDanger && 'text-red-500'
            )}
          >
            <action.icon className="w-4 h-4" /> {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
