import React from 'react'

import { useTranslation } from 'react-i18next'
import { FaCopy, FaGoogle, FaSync } from 'react-icons/fa'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import ContentLayout from '@/layouts/ContentLayout'
import dayjs from '@/utils/dayjs'

const GoogleMeetIntegration: React.FC = () => {
  const { t } = useTranslation('integration')
  const {
    connectMeet,
    meetConnections,
    selectedMeetIntegration,
    googleMeetEvents,
    toggleMeetStatus,
    deleteMeetMeeting,
  } = useIntegrationGoogle()

  // Copy meeting link to clipboard
  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link)
    toast.success(t('onlineMeeting.linkCopied'))
  }

  return (
    <ContentLayout
      headerBackButton={{
        title: t('title'),
        mode: 'add',
      }}
    >
      <div className="box-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => connectMeet.mutate()}
              className="bg-green-100 text-green-700 hover:bg-green-200"
              loading={connectMeet.isLoading}
              type="button"
            >
              <FaGoogle className="mr-2" />
              {t('onlineMeeting.connectGoogleMeet')}
            </Button>
            <Button
              onClick={() => meetConnections.refetch()}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              loading={meetConnections.isLoading}
            >
              <FaSync className="mr-2" />
              {t('onlineMeeting.refresh')}
            </Button>
          </div>
        </div>

        {/* Google Meet Connection Status */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaGoogle className="text-blue-500 mr-3 text-xl" />
                <div>
                  <Text className="font-medium text-lg">
                    {t('onlineMeeting.googleMeetStatus')}
                  </Text>
                  <Text className="text-gray-600">
                    {(() => {
                      if (
                        !meetConnections.data ||
                        meetConnections.data.length === 0
                      ) {
                        return t('onlineMeeting.notConnected')
                      }
                      return selectedMeetIntegration?.isEnabled
                        ? t('onlineMeeting.connected')
                        : t('onlineMeeting.disabled')
                    })()}
                  </Text>
                </div>
              </div>
              {meetConnections.data && meetConnections.data.length > 0 && (
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedMeetIntegration?.isEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {(() => {
                    if (selectedMeetIntegration?.isEnabled) {
                      return t('onlineMeeting.active')
                    }
                    return t('onlineMeeting.inactive')
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meeting List */}
        {meetConnections.data && meetConnections.data.length > 0 ? (
          <div className="mb-6">
            <Text className="text-xl font-semibold mb-4">
              {t('onlineMeeting.name')}
            </Text>

            <div className="space-y-4">
              {googleMeetEvents.data &&
                googleMeetEvents.data.map(meeting => (
                  <div
                    key={meeting.meetingUri}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{meeting.name}</h3>
                        {meeting.meetingCode && (
                          <p className="text-gray-600 mt-1">
                            {meeting.meetingCode}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            {t('onlineMeeting.startTime')}{' '}
                            {dayjs(meeting.config.entryPointAccess).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                          </p>
                          <p>
                            {t('onlineMeeting.endTime')}{' '}
                            {dayjs(meeting.config.entryPointAccess).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                          </p>
                        </div>
                      </div>
                      {meeting.config.entryPointAccess && (
                        <Button
                          onClick={() =>
                            copyToClipboard(meeting.config.entryPointAccess)
                          }
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <FaCopy className="mr-2" />
                          {t('onlineMeeting.copyLink')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <Text className="text-yellow-700">
              {t('onlineMeeting.noIntegrationMeetings')}
            </Text>
          </div>
        )}
      </div>
    </ContentLayout>
  )
}

export default GoogleMeetIntegration
