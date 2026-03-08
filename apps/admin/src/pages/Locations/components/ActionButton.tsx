import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuAlignJustify, LuPencil, LuTrash } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { LocationRoom } from '@/types/classes'
import { cn } from '@/utils/cn'

type ActionButtonProps = {
  locationData: LocationRoom
}

export const ActionButton = ({
  locationData,
}: ActionButtonProps): JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { useDeleteLocationRoom } = useLocationRoom()
  const {
    mutateAsync: mutateDeleteLocationRoom,
    isLoading: isDeletingLocationRoom,
  } = useDeleteLocationRoom(locationData.id?.toString() ?? '', () => {
    closeConfirm()
  })

  const { setConfirm, closeConfirm } = useGlobalConfirm(isDeletingLocationRoom)

  const actions = useMemo(() => {
    return [
      {
        label: 'Edit',
        icon: LuPencil,
        isDanger: false,
        onClick: () => {
          navigate(`/locations/${locationData.id}/update`)
        },
      },
      {
        label: 'Delete',
        icon: LuTrash,
        isDanger: true,
        onClick: () => {
          setConfirm({
            title: t('location:confirm.deleteLocation').toString(),
            alertType: AlertTypes.WARN,
            description: t(
              'location:confirm.deleteLocationDescription'
            ).toString(),
            confirmText: t('location:confirm.deleteLocationConfirm').toString(),
            cancelText: t('location:confirm.deleteLocationCancel').toString(),
            onConfirm: () => {
              mutateDeleteLocationRoom()
            },
          }).open()
        },
      },
    ]
  }, [locationData])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
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
