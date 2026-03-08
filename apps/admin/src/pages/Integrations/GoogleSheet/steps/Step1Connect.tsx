import * as React from 'react'
import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuTerminal } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
// Import shadcn components (Corrected casing)
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { GOOGLE_DRIVE_AUTH_SCOPES } from '@/constants/googleAuth'
import useAuth from '@/hooks/useAuth'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import { userState } from '@/stores/userData'
import {
  type GoogleIntegrationStatus,
  GoogleServiceType,
} from '@/types/external/googleIntegration.type'

interface Step1ConnectProps {
  initialIntegrationStatus?: GoogleIntegrationStatus // Passed from wizard for initial render
  isWizardLoading: boolean // If the wizard itself is loading initial status
  onConnectionComplete: () => void // Callback to wizard when connection is successful/confirmed
  onDisconnectionComplete: () => void // Callback to wizard when disconnection is successful
  onNavigateNext: () => void // General navigation callback, can be used by "Next" button
}

const Step1Connect: React.FC<Step1ConnectProps> = ({
  initialIntegrationStatus,
  isWizardLoading,
  onConnectionComplete,
  onDisconnectionComplete,
  onNavigateNext,
}) => {
  const { t } = useTranslation('integration')
  const {
    sheetIntegrationStatus,
    getAuthUrl,
    disconnectIntegration,
    refetchSheetIntegrationStatus,
  } = useIntegrationGoogle()

  const currentUser = useRecoilValue(userState)

  // Use local hook's status primarily, but fallback to wizard's initial status if hook is loading
  const displayIntegration = sheetIntegrationStatus.isLoading
    ? initialIntegrationStatus
    : sheetIntegrationStatus.data

  const isLoading =
    sheetIntegrationStatus.isLoading ||
    getAuthUrl.isLoading ||
    disconnectIntegration.isLoading ||
    isWizardLoading
  const error =
    sheetIntegrationStatus.error ||
    getAuthUrl.error ||
    disconnectIntegration.error

  // Local error state for this step, e.g., if auth URL redirect fails locally
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    // If the hook has successfully fetched/refetched status after an action
    if (getAuthUrl.isSuccess || disconnectIntegration.isSuccess) {
      refetchSheetIntegrationStatus() // Ensure the wizard's view is also up-to-date
    }
    if (sheetIntegrationStatus.data?.isActive && getAuthUrl.isSuccess) {
      // If we just successfully got an auth URL AND the status now shows active (after redirect and refetch)
      // then call the wizard's completion callback.
      onConnectionComplete()
    }
  }, [
    sheetIntegrationStatus.data?.isActive,
    getAuthUrl.isSuccess,
    disconnectIntegration.isSuccess,
  ])

  const handleSignIn = () => {
    setLocalError(null)
    getAuthUrl.mutate(
      {
        scopes: GOOGLE_DRIVE_AUTH_SCOPES,
        serviceType: GoogleServiceType.SHEETS,
        redirectUri: window.location.origin,
        userId: currentUser.id,
      },
      {
        onSuccess: response => {
          if (response.authUrl) {
            window.open(response.authUrl, '_blank')
            // onConnectionComplete will be called by useEffect after redirect and status refetch
          } else {
            setLocalError(t('googleSheet.step1.errorAuthUrl'))
          }
        },
      }
    )
  }

  const handleDisconnect = () => {
    setLocalError(null)
    disconnectIntegration.mutate(
      {
        serviceType: GoogleServiceType.SHEETS,
      },
      {
        onSuccess: () => {
          onDisconnectionComplete() // Notify wizard
        },
        onError: (e: Error) => {
          console.error('Error disconnecting Google Account:', e)
          setLocalError(
            e.message || t('googleSheet.step1.errorDisconnectFailed')
          )
        },
      }
    )
  }

  const effectiveError = error?.message || localError
  const isConnected = displayIntegration?.isActive === true

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('googleSheet.step1.connectTitle')}</CardTitle>
          <CardDescription>
            {t('googleSheet.step1.connectDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {effectiveError && (
            <Alert variant="destructive">
              <LuTerminal className="h-4 w-4" />
              <AlertTitle>{t('common.errorTitle')}</AlertTitle>
              <AlertDescription>{effectiveError}</AlertDescription>
            </Alert>
          )}

          {!isConnected ? (
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              variant="outline"
              loading={getAuthUrl.isLoading}
            >
              {getAuthUrl.isLoading
                ? t('googleSheet.step1.redirectingToGoogle')
                : t('googleSheet.step1.signInWithGoogle')}
            </Button>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t('googleSheet.step1.connectedAccountLabel')}
              </p>
              <div className="flex items-center justify-between rounded-md border bg-background p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {displayIntegration?.googleUserEmail
                        ?.charAt(0)
                        .toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">
                      {displayIntegration?.googleUserEmail}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnect}
                  disabled={disconnectIntegration.isLoading || isLoading}
                  variant="outline"
                  size="sm"
                  loading={disconnectIntegration.isLoading}
                >
                  {disconnectIntegration.isLoading
                    ? t('googleSheet.step1.disconnecting')
                    : t('disconnect')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onNavigateNext} disabled={!isConnected || isLoading}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}

export default Step1Connect
