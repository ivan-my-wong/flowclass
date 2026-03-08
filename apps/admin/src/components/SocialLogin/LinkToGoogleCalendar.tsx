import React, { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { FaCalendarAlt } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

// import { deleteIntegrationCalendar } from '@/api/integrationCalendar' // No longer directly used
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import useAuth from '@/hooks/useAuth'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import useSchoolData from '@/hooks/useSchoolData'
import { availabilityState } from '@/stores/availabilityStore'
import { GoogleServiceType } from '@/types/external/googleIntegration.type' // Corrected import

// We don't need these interfaces anymore since we're using the API

const LinkToGoogleCalendar = (): React.ReactElement => {
  const auth = useAuth()
  const { currentSchool } = useSchoolData()
  // const institutionId = currentSchool?.id // institutionId is used by the hook internally
  const { t } = useTranslation(['availability', 'integrations']) // Added 'integrations' for toast messages from hook

  const [, setAvailabilityStateData] = useRecoilState(availabilityState)
  const {
    calendarConnections,
    connectCalendar,
    disconnectIntegration,
    // isAuthLoading, // This is for internal auth steps in the hook, mutations have their own isLoading
  } = useIntegrationGoogle()

  const actualIntegrationCalendars = calendarConnections.data || []

  useEffect(() => {
    // Update global availability loading state based on current operation status
    const isLoading =
      connectCalendar.isLoading || disconnectIntegration.isLoading
    setAvailabilityStateData(prev => ({
      ...prev,
      isCalendarAuthLoading: isLoading,
    }))
  }, [
    connectCalendar.isLoading,
    disconnectIntegration.isLoading,
    setAvailabilityStateData,
  ])

  const handleConnectCalendar = async () => {
    if (!auth.isLogin) {
      // This toast can remain as it's a pre-condition check before calling the hook's mutation
      toast.error(t('integrations:common.errors.mustBeLoggedInToConnect'))
      return
    }
    // The hook's mutation (connectCalendar) will handle its own toasts and query invalidation (refetch)
    await connectCalendar.mutateAsync()
  }

  // Handle disconnect button click
  const handleDisconnectCalendar = async () => {
    // The hook's mutation (disconnectIntegration) will handle its own toasts and query invalidation (refetch)
    await disconnectIntegration.mutateAsync({
      serviceType: GoogleServiceType.CALENDAR, // Corrected usage
    })
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          <FaCalendarAlt className="text-blue-500 text-xl" />
        </div>
        <div>
          <Text className="font-semibold text-lg">
            {t('availability:googleCalendar')}
          </Text>
          <Text className="text-gray-600">
            {t('availability:googleCalendarSync')}
          </Text>
        </div>
        <div className="ml-auto">
          {actualIntegrationCalendars.length > 0 ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {t('availability:connected')}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {t('availability:notConnected')}
            </span>
          )}
        </div>
      </div>
      {actualIntegrationCalendars.length > 0 ? ( // Corrected logic: show disconnect if any integration exists
        <Button
          className="bg-red-500 hover:bg-red-600 text-white w-fit"
          onClick={handleDisconnectCalendar}
          loading={disconnectIntegration.isLoading}
        >
          <span className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            {disconnectIntegration.isLoading
              ? t('availability:disconnecting')
              : t('availability:disconnectAccount')}
          </span>
        </Button>
      ) : (
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white w-fit"
          onClick={handleConnectCalendar}
          loading={connectCalendar.isLoading}
        >
          <span className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            {connectCalendar.isLoading
              ? t('availability:connecting')
              : t('availability:connectAccount')}
          </span>
        </Button>
      )}
    </div>
  )
}

export default LinkToGoogleCalendar
