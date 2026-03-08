import React from 'react'

import { useTranslation } from 'react-i18next'
import { LuCalendar, LuClock, LuUser } from 'react-icons/lu'

import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

type AppointmentClassPreviewProps = {
  courseName: string
  coursePath: string
  timeSlots?: Array<{
    startTime: string
    endTime: string
    duration: number
    repeatFormat: string
  }>
}

const AppointmentClassPreview: React.FC<AppointmentClassPreviewProps> = ({
  courseName,
  coursePath,
  timeSlots = [],
}) => {
  const { t } = useTranslation('onboarding')

  return (
    <div className="space-y-6 p-4">
      <div className="text-left">
        <Heading size="large" className="mb-2">
          {t('newUserSetup.appointmentClassPreview.title')}
        </Heading>
        <Text className="text-gray-600">
          {t('newUserSetup.appointmentClassPreview.subtitle')}
        </Text>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <LuCalendar className="w-5 h-5 text-green-500" />
            <Heading size="medium">
              {t('newUserSetup.appointmentClassPreview.courseInformation')}
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm font-medium text-gray-500">
                {t('newUserSetup.appointmentClassPreview.courseName')}
              </Text>
              <Text className="text-lg">{courseName}</Text>
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-500">
                {t('newUserSetup.appointmentClassPreview.coursePath')}
              </Text>
              <Text className="text-lg font-mono">{coursePath}</Text>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <LuClock className="w-5 h-5 text-indigo-500" />
              <Heading size="medium">
                {t('newUserSetup.appointmentClassPreview.availabilitySettings')}
              </Heading>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <LuUser className="w-4 h-4 text-green-600" />
                <Text className="text-sm font-medium text-green-800">
                  {t(
                    'newUserSetup.appointmentClassPreview.flexibleBookingSystem'
                  )}
                </Text>
              </div>
              <Text className="text-sm text-green-700 mt-1">
                {t(
                  'newUserSetup.appointmentClassPreview.flexibleBookingDescription'
                )}
              </Text>
            </div>

            {timeSlots.length > 0 && (
              <div className="mb-4">
                <Text className="font-medium mb-3">
                  {t('newUserSetup.appointmentClassPreview.generatedTimeSlots')}
                </Text>
                <div className="space-y-2">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={`appointment-slot-${slot.startTime}-${slot.endTime}-${index}`}
                      className="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {t(
                              'newUserSetup.appointmentClassPreview.available'
                            )}
                          </Badge>
                          <Text className="font-mono text-lg font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </Text>
                        </div>
                        <Text className="text-sm text-gray-500">
                          {slot.duration}{' '}
                          {t('newUserSetup.appointmentClassPreview.minutes')}
                        </Text>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-4">
                          <span>
                            ⏰ {slot.startTime} - {slot.endTime}
                          </span>
                          <span>⏱️ {slot.duration} min</span>
                          <span>🔄 {slot.repeatFormat}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <Text className="font-medium mb-2">
                  {t('newUserSetup.appointmentClassPreview.workingHours')}
                </Text>
                <Text className="text-sm text-gray-600">
                  {t(
                    'newUserSetup.appointmentClassPreview.workingHoursDescription'
                  )}
                </Text>
                <Badge variant="outline" className="mt-2">
                  {t(
                    'newUserSetup.appointmentClassPreview.configureInAvailabilitySettings'
                  )}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <Text className="font-medium mb-2">
                  {t('newUserSetup.appointmentClassPreview.dateOverrides')}
                </Text>
                <Text className="text-sm text-gray-600">
                  {t(
                    'newUserSetup.appointmentClassPreview.dateOverridesDescription'
                  )}
                </Text>
                <Badge variant="outline" className="mt-2">
                  {t(
                    'newUserSetup.appointmentClassPreview.configureInAvailabilitySettings'
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AppointmentClassPreview
