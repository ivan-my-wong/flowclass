import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuLoader2 } from 'react-icons/lu'
import { toast } from 'sonner'

import Text from '@/components/ui/Text'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import useSchoolData from '@/hooks/useSchoolData'
import { GoogleServiceType } from '@/types/external/googleIntegration.type'

const GoogleDriveCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['integration'])
  const { handleGoogleAuthCallback } = useIntegrationGoogle()
  const { currentSchool } = useSchoolData()

  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Prevent multiple processing attempts
  const hasProcessed = useRef(false)
  const processingRef = useRef(false)

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple simultaneous processing
      if (hasProcessed.current || processingRef.current) {
        console.log('Callback already processed or in progress, skipping...')
        return
      }

      processingRef.current = true

      try {
        // Parse URL parameters from location.search
        const urlParams = new URLSearchParams(location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const oauthError = urlParams.get('error')

        // Handle OAuth errors
        if (oauthError) {
          console.error('OAuth error:', oauthError)
          setError(`OAuth error: ${oauthError}`)
          hasProcessed.current = true
          setTimeout(() => {
            navigate('/integrations/google-drive?error=oauth_failed', {
              replace: true,
            })
          }, 2000)
          return
        }

        // Check if we have authorization code
        if (!code) {
          console.error('No authorization code received')
          setError('No authorization code received from Google')
          hasProcessed.current = true
          setTimeout(() => {
            navigate('/integrations/google-drive?error=no_code', {
              replace: true,
            })
          }, 2000)
          return
        }

        // Check if we have institution ID
        if (!currentSchool?.id) {
          console.error('No institution ID available')
          setError('Institution information not available')
          hasProcessed.current = true
          setTimeout(() => {
            navigate('/integrations/google-drive?error=no_institution', {
              replace: true,
            })
          }, 2000)
          return
        }

        // Clear URL parameters immediately to prevent reuse
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )

        // Mark as processed before making the API call
        hasProcessed.current = true

        // Call the callback handler
        const result = await handleGoogleAuthCallback.mutateAsync({
          authCode: code,
          serviceType: GoogleServiceType.DRIVE,
          redirectUri: `${window.location.origin}/integrations/google-drive-callback`,
        })

        toast.success(t('googleDrive.callback.success'))

        setTimeout(() => {
          navigate('/integrations/google-drive?success=true', { replace: true })
        }, 1500)
      } catch (error: any) {
        console.error('Callback processing error:', error)

        const errorMessage =
          error?.message || 'Failed to process Google Drive connection'
        setError(errorMessage)

        // Show toast error
        toast.error(t('googleDrive.callback.error', { error: errorMessage }))

        setTimeout(() => {
          navigate('/integrations/google-drive?error=callback_failed', {
            replace: true,
          })
        }, 3000)
      } finally {
        setIsProcessing(false)
        processingRef.current = false
      }
    }

    // Only process if we haven't already processed
    if (!hasProcessed.current && currentSchool?.id) {
      processCallback()
    } else if (!currentSchool?.id) {
      // Wait for school data to load
      console.log('Waiting for school data to load...')
    }
  }, [
    location.search,
    currentSchool?.id,
    handleGoogleAuthCallback,
    navigate,
    t,
  ])

  // Handle case where school data is still loading
  if (!currentSchool?.id && isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <LuLoader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('googleDrive.callback.loading', 'Loading...')}
          </h2>
          <Text className="text-gray-600">
            {t(
              'googleDrive.callback.preparing',
              'Preparing your integration...'
            )}
          </Text>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (isProcessing) {
      return (
        <>
          <LuLoader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('googleDrive.callback.processing')}
          </h2>
          <Text className="text-gray-600">
            {t('googleDrive.callback.processingDescription')}
          </Text>
        </>
      )
    }

    if (error) {
      return (
        <>
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">✕</span>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            {t('googleDrive.callback.errorTitle')}
          </h2>
          <Text className="text-red-600 mb-4">{error}</Text>
          <Text className="text-gray-500 text-sm">
            {t('googleDrive.callback.redirecting')}
          </Text>
        </>
      )
    }

    return (
      <>
        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-green-900 mb-2">
          {t('googleDrive.callback.successTitle')}
        </h2>
        <Text className="text-green-600 mb-4">
          {t('googleDrive.callback.successDescription')}
        </Text>
        <Text className="text-gray-500 text-sm">
          {t('googleDrive.callback.redirecting')}
        </Text>
      </>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        {renderContent()}
      </div>
    </div>
  )
}

export default GoogleDriveCallback
