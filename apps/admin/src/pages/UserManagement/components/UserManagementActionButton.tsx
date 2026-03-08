import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import {
  LuAlignJustify,
  LuClock,
  LuEye,
  LuPencil,
  LuTrash,
} from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { StaffUserType } from '@/types/user'
import { cn } from '@/utils/cn'
import { generateDataTestId } from '@/utils/data-testid.utils'

type ActionButtonProps = {
  userRoleData: StaffUserType
  setIsProfileModalOpen: (open: boolean) => void
  setSelectedUserRole: (userRole: StaffUserType) => void
  setIsHourlyRatesModalOpen: (open: boolean) => void
}

export function UserManagementActionButton({
  userRoleData,
  setIsProfileModalOpen,
  setSelectedUserRole,
  setIsHourlyRatesModalOpen,
}: ActionButtonProps): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const actions = useMemo(() => {
    const baseActions = [
      {
        label: t('common:action.edit'),
        icon: LuPencil,
        isDanger: false,
        onClick: () => {
          setIsProfileModalOpen(true)
          setSelectedUserRole(userRoleData)
          navigate(`/settings/users?userId=${userRoleData.user?.id}&view=edit`)
        },
      },
    ]

    // Add "Manage Hourly Rates" option for instructors
    if (userRoleData.isInstructor) {
      baseActions.push({
        label: t('setting:userManagement.hourlyRates.manageHourlyRates'),
        icon: LuClock,
        isDanger: false,
        onClick: () => {
          setSelectedUserRole(userRoleData)
          setIsHourlyRatesModalOpen(true)
        },
      })
    }

    baseActions.push({
      label: t('common:action.delete'),
      icon: LuTrash,
      isDanger: true,
      onClick: () => {
        setIsProfileModalOpen(true)
        setSelectedUserRole(userRoleData)
        navigate(`/settings/users?userId=${userRoleData.user?.id}&view=delete`)
      },
    })

    return baseActions
  }, [
    userRoleData,
    navigate,
    t,
    setSelectedUserRole,
    setIsHourlyRatesModalOpen,
  ])
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            data-testid={generateDataTestId(
              'action-button',
              userRoleData?.user?.firstName ?? ''
            )}
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
      {userRoleData.isInstructor && (
        <LuEye
          className="cursor-pointer text-primary"
          onClick={() => {
            navigate(
              `/settings/users/profile?userId=${userRoleData.user?.id}&view=profile`
            )
          }}
        />
      )}
    </div>
  )
}
