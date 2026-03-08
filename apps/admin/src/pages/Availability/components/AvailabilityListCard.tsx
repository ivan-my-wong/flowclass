import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useRecoilValue } from 'recoil'

import { Card } from '@/components/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { Availability } from '@/types/availability.type'
import { cn } from '@/utils/cn'

interface IAvailabilityCardProps {
  availability: Availability
  onEdit: () => void
  onDelete: (e: React.MouseEvent) => void
}

const AvailabilityListCard = ({
  availability,
  onEdit,
  onDelete,
}: IAvailabilityCardProps): JSX.Element => {
  const { t } = useTranslation(['availability', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const userPermission = useRecoilValue(userPermissionState)

  const canDeleteAvailability = [
    UserRole.MasterAdmin,
    UserRole.SiteAdmin,
    UserRole.SchoolAdmin,
  ].includes(userPermission)

  const formatDateRange = (availability: Availability): string => {
    if (!availability.startDate && !availability.endDate) {
      return t('availability:dateRange.alwaysAvailable')
    }

    const start = availability.startDate
      ? new Date(availability.startDate).toLocaleDateString()
      : t('availability:dateRange.noStartDate')
    const end = availability.endDate
      ? new Date(availability.endDate).toLocaleDateString()
      : t('availability:dateRange.noEndDate')

    return `${start} - ${end}`
  }

  return (
    <Card
      className="overflow-hidden w-full cursor-pointer bg-background-layer-2 hover:bg-background-layer-3 availability-list-card"
      onClick={onEdit}
    >
      <div className="p-5 relative">
        {/* Dropdown Menu */}
        <div className="absolute top-3 right-3 z-dropdown">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="p-1 rounded-full">
              <GiHamburgerMenu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                <FaEdit className="mr-2" />
                {t('availability:actions.edit')}
              </DropdownMenuItem>
              {canDeleteAvailability && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <FaTrash className="mr-2" />
                  {t('availability:actions.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Card Content */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">{availability.name}</h3>
          {/* <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 mr-2">
              {formatDateRange(availability)}
            </span>
          </div> */}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                !availability.endDate ||
                  new Date(availability.endDate) > new Date()
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {!availability.endDate ||
              new Date(availability.endDate) > new Date()
                ? t('availability:status.active')
                : t('availability:status.inactive')}
            </span>
          </div>
          {/* 
            Do this part after google calendar integration is completed
            <div>
            {availability.integrationCalendarId ? (
              <span className="flex items-center text-green-600 text-sm">
                <FaCalendarAlt className="mr-1" />
                {t('availability:calendar.connected')}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">
                {t('availability:calendar.notConnected')}
              </span>
            )}
          </div> */}
        </div>
      </div>
    </Card>
  )
}

export default AvailabilityListCard
