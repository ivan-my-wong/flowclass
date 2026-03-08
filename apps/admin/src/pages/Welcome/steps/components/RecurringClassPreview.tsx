import React from 'react'

import { useTranslation } from 'react-i18next'
import { LuClock, LuRepeat } from 'react-icons/lu'

import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

type RecurringClassPreviewProps = {
  courseName: string
  coursePath: string
  timeSlots: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    duration: number
    repeatFormat: string
    deleted: boolean
  }>
  numberOfLessons?: number
}

const RecurringClassPreview: React.FC<RecurringClassPreviewProps> = ({
  courseName,
  coursePath,
  timeSlots,
  numberOfLessons = 8,
}) => {
  const { t } = useTranslation('onboarding')

  const getDayName = (dayOfWeek: number) => {
    const days = [
      t('newUserSetup.recurringClassPreview.daysOfWeek.sunday'),
      t('newUserSetup.recurringClassPreview.daysOfWeek.monday'),
      t('newUserSetup.recurringClassPreview.daysOfWeek.tuesday'),
      t('newUserSetup.recurringClassPreview.daysOfWeek.wednesday'),
      t('newUserSetup.recurringClassPreview.daysOfWeek.thursday'),
      t('newUserSetup.recurringClassPreview.daysOfWeek.friday'),
      t('newUserSetup.recurringClassPreview.daysOfWeek.saturday'),
    ]
    return days[dayOfWeek]
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-left">
        <Heading size="large" className="mb-2">
          {t('newUserSetup.recurringClassPreview.title')}
        </Heading>
        <Text className="text-gray-600">
          {t('newUserSetup.recurringClassPreview.subtitle')}
        </Text>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <LuRepeat className="w-5 h-5 text-purple-500" />
            <Heading size="medium">
              {t('newUserSetup.recurringClassPreview.courseInformation')}
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm font-medium text-gray-500">
                {t('newUserSetup.recurringClassPreview.courseName')}
              </Text>
              <Text className="text-lg">{courseName}</Text>
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-500">
                {t('newUserSetup.recurringClassPreview.coursePath')}
              </Text>
              <Text className="text-lg font-mono">{coursePath}</Text>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <LuClock className="w-5 h-5 text-orange-500" />
              <Heading size="medium">
                {t('newUserSetup.recurringClassPreview.weeklySchedule')}
              </Heading>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <Text className="text-sm font-medium text-blue-800">
                {t('newUserSetup.recurringClassPreview.numberOfLessons')}:{' '}
                {numberOfLessons}
              </Text>
            </div>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div
                  key={`recurring-slot-${slot.dayOfWeek}-${slot.startTime}-${index}`}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Text className="font-medium">
                      {t('newUserSetup.recurringClassPreview.weeklySchedule')}
                    </Text>
                    <Badge variant="outline" className="text-sm">
                      {slot.repeatFormat}
                    </Badge>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {getDayName(slot.dayOfWeek)}
                        </Badge>
                        <Text className="font-mono text-lg font-semibold">
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </div>
                      <Text className="text-sm text-gray-500">
                        {slot.duration}{' '}
                        {t('newUserSetup.recurringClassPreview.minutes')}
                      </Text>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>📅 {getDayName(slot.dayOfWeek)}</span>
                        <span>
                          ⏰ {slot.startTime} - {slot.endTime}
                        </span>
                        <span>⏱️ {slot.duration} min</span>
                        <span>🔄 {slot.repeatFormat}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RecurringClassPreview
