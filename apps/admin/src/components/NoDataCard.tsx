import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import {
  LuBookOpen,
  LuDownload,
  LuFileX,
  LuUpload,
  LuUsers,
} from 'react-icons/lu'

interface NoDataCardProps {
  message?: string
  icon?: React.ReactNode
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'students' | 'materials' | 'downloads' | 'uploads'
}

const NoDataCard: FC<NoDataCardProps> = ({
  message,
  icon,
  className = '',
  showIcon = true,
  variant = 'default',
}) => {
  const { t } = useTranslation()
  const getVariantConfig = () => {
    switch (variant) {
      case 'students':
        return {
          message:
            message ||
            t('common:noDataCard.noStudents', {
              defaultValue: 'No students found',
            }),
          icon: icon || <LuUsers size={48} />,
        }
      case 'materials':
        return {
          message:
            message ||
            t('common:noDataCard.noMaterials', {
              defaultValue: 'No materials available',
            }),
          icon: icon || <LuBookOpen size={48} />,
        }
      case 'downloads':
        return {
          message:
            message ||
            t('common:noDataCard.noDownloads', {
              defaultValue: 'No downloads available',
            }),
          icon: icon || <LuDownload size={48} />,
        }
      case 'uploads':
        return {
          message:
            message ||
            t('common:noDataCard.noUploads', {
              defaultValue: 'No uploads found',
            }),
          icon: icon || <LuUpload size={48} />,
        }
      default:
        return {
          message:
            message ||
            t('common:noDataCard.noData', {
              defaultValue: 'No data',
            }),
          icon: icon || <LuFileX size={48} />,
        }
    }
  }

  const config = getVariantConfig()

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-8 shadow-sm ${className}`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {showIcon && <div className="mb-4 text-gray-400">{config.icon}</div>}
        <div className="text-gray-500 text-sm font-medium">
          {config.message}
        </div>
      </div>
    </div>
  )
}

export default NoDataCard
