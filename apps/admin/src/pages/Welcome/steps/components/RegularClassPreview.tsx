import React from 'react'

import { useTranslation } from 'react-i18next'
import { LuCalendar, LuCalendarDays, LuRepeat } from 'react-icons/lu'

import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

type RegularClassPreviewProps = {
  courseName: string
  coursePath: string
  timeSlots: Array<{
    courseId: number
    lessons: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
    }>
    duration: number
    repeatFormat: string
  }>
  isWorkshop?: boolean
}

const RegularClassPreview: React.FC<RegularClassPreviewProps> = ({
  courseName,
  coursePath,
  timeSlots,
  isWorkshop = false,
}) => {
  const { t } = useTranslation('onboarding')

  const getDayName = (dayOfWeek: number) => {
    const days = [
      t('newUserSetup.regularClassPreview.daysOfWeek.sunday'),
      t('newUserSetup.regularClassPreview.daysOfWeek.monday'),
      t('newUserSetup.regularClassPreview.daysOfWeek.tuesday'),
      t('newUserSetup.regularClassPreview.daysOfWeek.wednesday'),
      t('newUserSetup.regularClassPreview.daysOfWeek.thursday'),
      t('newUserSetup.regularClassPreview.daysOfWeek.friday'),
      t('newUserSetup.regularClassPreview.daysOfWeek.saturday'),
    ]
    return days[dayOfWeek]
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-left">
        <Heading size="large" className="mb-2">
          {isWorkshop
            ? t('newUserSetup.regularClassPreview.eventTitle')
            : t('newUserSetup.regularClassPreview.title')}
        </Heading>
        <Text className="text-gray-600">
          {isWorkshop
            ? t('newUserSetup.regularClassPreview.eventSubtitle')
            : t('newUserSetup.regularClassPreview.subtitle')}
        </Text>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <LuCalendar className="w-5 h-5 text-blue-500" />
            <Heading size="medium">
              {t('newUserSetup.regularClassPreview.courseInformation')}
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm font-medium text-gray-500">
                {t('newUserSetup.regularClassPreview.courseName')}
              </Text>
              <Text className="text-lg">{courseName}</Text>
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-500">
                {t('newUserSetup.regularClassPreview.coursePath')}
              </Text>
              <Text className="text-lg font-mono">{coursePath}</Text>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              {isWorkshop ? (
                <LuCalendarDays className="w-5 h-5 text-orange-500" />
              ) : (
                <LuRepeat className="w-5 h-5 text-green-500" />
              )}
              <Heading size="medium">
                {isWorkshop
                  ? t('newUserSetup.regularClassPreview.eventSchedule')
                  : t('newUserSetup.regularClassPreview.schedulePattern')}
              </Heading>
            </div>

            {timeSlots.map((slot, index) => (
              <div
                key={`regular-slot-${slot.courseId}-${index}`}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <Text className="font-medium">
                    {isWorkshop
                      ? t('newUserSetup.regularClassPreview.eventDetails')
                      : `${t(
                          'newUserSetup.regularClassPreview.recurrencePattern'
                        )} ${index + 1}`}
                  </Text>
                  <Badge variant="outline" className="text-sm">
                    {slot.repeatFormat}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {slot.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={`lesson-${lesson.dayOfWeek}-${lesson.startTime}-${lessonIndex}`}
                      className="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {getDayName(lesson.dayOfWeek)}
                          </Badge>
                          <Text className="font-mono text-lg font-semibold">
                            {lesson.startTime} - {lesson.endTime}
                          </Text>
                        </div>
                        <Text className="text-sm text-gray-500">
                          {slot.duration}{' '}
                          {t('newUserSetup.regularClassPreview.minutes')}
                        </Text>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>📅 {getDayName(lesson.dayOfWeek)}</span>
                          <span>
                            ⏰ {lesson.startTime} - {lesson.endTime}
                          </span>
                          <span>⏱️ {slot.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {timeSlots.length === 0 && (
              <Text className="text-sm text-gray-500">
                No schedule configured
              </Text>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RegularClassPreview
