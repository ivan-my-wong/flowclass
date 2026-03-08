import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaCog, FaRegCheckCircle } from 'react-icons/fa'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'

interface ConnectSectionProps {
  isConnected?: boolean
  userEmail?: string
  connectDrive?: () => void | Promise<void>
  disconnectDrive?: () => void | Promise<void>
  isWizardLoading?: boolean
  onConnectionComplete?: () => void
  onDisconnectionComplete?: () => void
}

const PermissionList = () => {
  const { t } = useTranslation('integration')
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        {t('googleDrive.permissions.title')}
      </h3>
      <ul className="space-y-3 text-blue-800">
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Text className="font-medium">
            https://www.googleapis.com/auth/drive.file
          </Text>
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Text>{t('googleDrive.permissions.createFolder')}</Text>
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Text>{t('googleDrive.permissions.upload')}</Text>
        </li>
      </ul>
    </div>
  )
}

const SuccessMessage = () => {
  const { t } = useTranslation('integration')
  return (
    <div
      className="w-full bg-green-50 border border-green-200 rounded-lg p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center mb-2">
        <FaRegCheckCircle className="text-green-600 mr-3" />
        <Text className="text-green-800 font-semibold text-lg">
          {t('googleDrive.account.connectSuccess')}
        </Text>
      </div>
    </div>
  )
}

const ConnectedAccount = ({
  email,
  onDisconnect,
  isDisconnecting,
}: {
  email?: string
  onDisconnect?: () => void | Promise<void>
  isDisconnecting?: boolean
}) => {
  const { t } = useTranslation('integration')

  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-2">
        {t('googleDrive.account.title')}
      </p>
      <div className="flex items-center justify-between rounded-md border bg-background p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium">
              {email || t('googleDrive.account.noAccount')}
            </div>
          </div>
        </div>
        <Button
          onClick={onDisconnect}
          disabled={isDisconnecting}
          variant="destructive"
          size="sm"
          loading={isDisconnecting}
        >
          {isDisconnecting ? t('googleDrive.account.button') : t('disconnect')}
        </Button>
      </div>
    </div>
  )
}

export const ConnectSection: React.FC<ConnectSectionProps> = ({
  isConnected = false,
  userEmail,
  connectDrive,
  disconnectDrive,
  isWizardLoading = false,
  onConnectionComplete,
  onDisconnectionComplete,
}) => {
  const { t } = useTranslation('integration')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connectDrive?.()
      onConnectionComplete?.()
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await disconnectDrive?.()
      onDisconnectionComplete?.()
    } finally {
      setIsDisconnecting(false)
    }
  }

  const isLoading = isWizardLoading || isConnecting || isDisconnecting

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('googleDrive.title')}
        </h1>
        <Text className="text-xl text-gray-600">
          {t('googleDrive.description')}
        </Text>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        {/* Section Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-4">
            <FaCog className="text-gray-600 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('googleDrive.account.title')}
            </h2>
            <Text className="text-gray-600 mt-1">
              {t('googleDrive.account.description')}
            </Text>
          </div>
        </div>

        {!isConnected ? (
          <>
            <PermissionList />
            <div className="flex justify-center w-full">
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                type="button"
                loading={isConnecting}
              >
                {isConnecting
                  ? t('googleDrive.step1.redirectingToGoogle')
                  : t('googleDrive.account.button')}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-6 w-full">
            <SuccessMessage />
            <ConnectedAccount
              email={userEmail}
              onDisconnect={handleDisconnect}
              isDisconnecting={isDisconnecting}
            />
          </div>
        )}
      </div>

      {/* Additional Info */}
      {/* {!isConnected && (
        <div className="mt-8 text-center">
          <Text className="text-gray-500">{t('googleDrive.disclaimer')}</Text>
        </div>
      )} */}
    </div>
  )
}
