import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuTerminal } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { GOOGLE_DRIVE_AUTH_SCOPES } from '@/constants/googleAuth'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import ContentLayout from '@/layouts/ContentLayout'
import { API_BASE_URL } from '@/lib/config'
import { userState } from '@/stores/userData'
import { GoogleServiceType } from '@/types/external/googleIntegration.type'

import { ConnectSection } from './components/ConnectSection'
import { RootFolderSection } from './components/RootFolderSection'

const GoogleDriveIntegration = (): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()
  const [localError, setLocalError] = useState<string | null>(null)
  const { t } = useTranslation(['integration'])
  const currentUser = useRecoilValue(userState)

  // ✅ Prevent multiple callback processing
  const callbackProcessed = useRef(false)

  const {
    driveIntegrationStatus,
    getAuthUrl,
    disconnectIntegration,
    useDriveFolders,
    fetchDriveFolderByParent,
    createDriveFolder,
    setRootDriveFolder,
    useDriveQuota,
    validateFolderAccess,
  } = useIntegrationGoogle()

  const displayIntegration = driveIntegrationStatus.data

  const isLoading =
    driveIntegrationStatus.isLoading ||
    getAuthUrl.isLoading ||
    disconnectIntegration.isLoading

  const error =
    driveIntegrationStatus.error ||
    getAuthUrl.error ||
    disconnectIntegration.error

  // ✅ FIX: Handle OAuth callback with proper dependencies
  useEffect(() => {
    // Skip if already processed
    if (callbackProcessed.current) return

    const params = new URLSearchParams(location.search)
    const status = params.get('status')
    const error = params.get('error')

    // Success callback
    if (status === 'connected') {
      callbackProcessed.current = true

      console.log('✅ OAuth callback success detected')
      toast.success(
        t('googleDrive.connected', 'Google Drive connected successfully')
      )

      // Refetch integration status
      driveIntegrationStatus.refetch()

      // Clean URL
      navigate('/integrations/google-drive', { replace: true })
    }

    // Error callback
    if (error) {
      callbackProcessed.current = true

      console.error('❌ OAuth callback error:', error)

      const errorMessages: Record<string, string> = {
        oauth_failed: t(
          'googleDrive.error.oauthFailed',
          'OAuth authorization failed'
        ),
        no_code: t(
          'googleDrive.error.noCode',
          'No authorization code received'
        ),
        invalid_state: t(
          'googleDrive.error.invalidState',
          'Invalid state parameter'
        ),
        unknown_error: t(
          'googleDrive.error.unknown',
          'An unknown error occurred'
        ),
      }

      const errorMsg = errorMessages[error] || errorMessages.unknown_error
      toast.error(errorMsg)
      setLocalError(errorMsg)

      // Clean URL
      navigate('/integrations/google-drive', { replace: true })
    }
  }, [location.search, navigate, t]) // ✅ Only depend on location.search, navigate, and t

  // ✅ Reset callbackProcessed when location changes
  useEffect(() => {
    return () => {
      callbackProcessed.current = false
    }
  }, [location.pathname])

  const handleConnect = () => {
    if (!currentUser?.id) {
      const errorMsg = t('common.userNotLoaded', 'User not loaded')
      setLocalError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // ✅ CRITICAL: redirectUri must point to BACKEND callback endpoint
    const redirectUri = `${API_BASE_URL}/admin/integrations/google/google-drive-callback`

    console.log('🚀 Initiating Google OAuth with redirectUri:', redirectUri)
    console.log('👤 Current userId:', currentUser.id)

    setLocalError(null)

    getAuthUrl.mutate(
      {
        scopes: GOOGLE_DRIVE_AUTH_SCOPES,
        serviceType: GoogleServiceType.DRIVE,
        redirectUri,
        userId: currentUser.id, // ✅ Pass userId explicitly
      },
      {
        onSuccess: response => {
          console.log('✅ Received authUrl:', response.authUrl)
          console.log('✅ State:', response.state)

          if (response.authUrl) {
            // ✅ CRITICAL: Use window.location.href for OAuth redirect
            console.log('🔄 Redirecting to Google OAuth...')
            window.location.href = response.authUrl
          } else {
            const errorMsg = t(
              'googleDrive.step1.errorAuthUrl',
              'Failed to get authorization URL'
            )
            setLocalError(errorMsg)
            toast.error(errorMsg)
          }
          getAuthUrl.reset()
        },
        onError: (e: Error) => {
          console.error('❌ Error getting auth URL:', e)
          const errorMsg =
            e.message ||
            t(
              'googleDrive.step1.errorAuthUrl',
              'Failed to get authorization URL'
            )
          setLocalError(errorMsg)
          toast.error(errorMsg)
          getAuthUrl.reset()
        },
      }
    )
  }

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting Google Drive...')
    setLocalError(null)

    disconnectIntegration.mutate(
      {
        serviceType: GoogleServiceType.DRIVE,
      },
      {
        onSuccess: () => {
          console.log('✅ Disconnected successfully')
          toast.success(
            t('googleDrive.disconnected', 'Google Drive disconnected')
          )
          driveIntegrationStatus.refetch()
          disconnectIntegration.reset()
        },

        onError: (e: Error) => {
          console.error('❌ Error disconnecting Google Account:', e)
          const errorMsg =
            e.message ||
            t('googleDrive.step1.errorDisconnectFailed', 'Failed to disconnect')
          setLocalError(errorMsg)
          toast.error(errorMsg)
          disconnectIntegration.reset()
        },
      }
    )
  }

  // User check
  if (!currentUser?.id) {
    return (
      <ContentLayout
        headerBackButton={{ title: t('integration:title'), mode: 'add' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{t('common.userNotLoaded')}</AlertDescription>
          </Alert>
        </div>
      </ContentLayout>
    )
  }

  const effectiveError = error?.message || localError
  const isConnected = displayIntegration?.isConnected === true

  return (
    <ContentLayout
      headerBackButton={{ title: t('integration:title'), mode: 'add' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {effectiveError && (
          <Alert variant="destructive" className="mb-6">
            <LuTerminal className="h-4 w-4" />
            <AlertTitle>{t('common.errorTitle')}</AlertTitle>
            <AlertDescription>{effectiveError}</AlertDescription>
          </Alert>
        )}

        <ConnectSection
          isConnected={isConnected}
          userEmail={displayIntegration?.userEmail}
          connectDrive={handleConnect}
          disconnectDrive={handleDisconnect}
          isWizardLoading={isLoading}
        />

        {isConnected && displayIntegration && (
          <div className="mt-12">
            <RootFolderSection
              isConnected={isConnected}
              userEmail={displayIntegration.userEmail}
              useDriveFolders={useDriveFolders}
              fetchDriveFolderByParent={fetchDriveFolderByParent}
              createDriveFolder={createDriveFolder}
              setRootDriveFolder={setRootDriveFolder}
              driveIntegrationStatus={displayIntegration}
              driveQuota={useDriveQuota}
              validateFolderAccess={validateFolderAccess}
            />
          </div>
        )}

        {driveIntegrationStatus.error && (
          <div className="mt-6 text-center">
            <button
              onClick={() => driveIntegrationStatus.refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={driveIntegrationStatus.isRefetching}
              type="button"
            >
              {driveIntegrationStatus.isRefetching ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}
      </div>
    </ContentLayout>
  )
}

export default GoogleDriveIntegration
