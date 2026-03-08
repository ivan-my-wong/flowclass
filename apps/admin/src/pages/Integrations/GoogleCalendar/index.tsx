import React, { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaGoogle, FaSync } from 'react-icons/fa'

import { Button } from '@/components/ui/Button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import Text from '@/components/ui/Text'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import ContentLayout from '@/layouts/ContentLayout'
import dayjs from '@/utils/dayjs'

const GoogleCalendarAvailabilities: React.FC = () => {
  const { t } = useTranslation(['integration', 'availability'])
  const {
    calendarConnections,
    connectCalendar,
    googleCalendars,
    useFetchCalendarEvents,
    updatePrimaryCalendar,
    selectedCalendarIntegration,
  } = useIntegrationGoogle()

  const [selectedGoogleCalendarId, setSelectedGoogleCalendarId] =
    useState<string>('')

  const actualIntegrationCalendars = calendarConnections.data || []
  const actualGoogleCalendars = googleCalendars.data || []

  const fetchCalendarEvents = useFetchCalendarEvents(
    selectedCalendarIntegration?.id ?? 0,
    selectedGoogleCalendarId ?? '',
    dayjs().startOf('year').toISOString(),
    dayjs().endOf('year').toISOString()
  )

  useEffect(() => {
    setSelectedGoogleCalendarId(
      actualGoogleCalendars?.find(
        c => c.id === selectedCalendarIntegration?.calendarId
      )?.id ?? ''
    )
  }, [actualGoogleCalendars, selectedCalendarIntegration])

  const handleFetchEvents = async () => {
    if (actualGoogleCalendars.length > 0) {
      await fetchCalendarEvents.refetch()
    } else {
      await googleCalendars.refetch()
    }
  }

  const handleSaveCalendarSelection = async () => {
    if (!selectedCalendarIntegration) return

    const selectedGoogleCalendar = actualGoogleCalendars.find(
      calendar => calendar.id === selectedGoogleCalendarId
    )

    if (!selectedGoogleCalendar) return

    updatePrimaryCalendar.mutate({
      integrationId: selectedCalendarIntegration.id,
      calendarId: selectedGoogleCalendarId,
      calendarName: selectedGoogleCalendar.summary,
    })
  }

  return (
    <ContentLayout
      headerBackButton={{
        title: t('integration:title'),
        mode: 'add',
      }}
    >
      <div className="box-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => connectCalendar.mutate()}
              className="bg-green-100 text-green-700 hover:bg-green-200"
              loading={connectCalendar.isLoading}
              type="button"
            >
              <FaGoogle className="mr-2" />
              {t('integration:googleCalendar.connectGoogleCalendar')}
            </Button>
            <Button
              onClick={handleFetchEvents}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              loading={
                fetchCalendarEvents.isLoading ||
                googleCalendars.isLoading ||
                calendarConnections.isLoading
              }
            >
              <FaSync className="mr-2" />
              {t('integration:googleCalendar.refresh')}
            </Button>
          </div>
        </div>
        {actualIntegrationCalendars.length > 0 ? (
          <div className="mb-6">
            <Text className="mb-2 font-medium">
              {t('integration:googleCalendar.selectCalendar')}
            </Text>
            {actualGoogleCalendars.length > 0 ? (
              <div className="mt-3">
                <RadioGroup
                  value={selectedGoogleCalendarId}
                  onValueChange={calendarId => {
                    setSelectedGoogleCalendarId(calendarId)
                  }}
                  className="space-y-3"
                >
                  {actualGoogleCalendars.map(calendar => (
                    <div
                      key={calendar.id}
                      className="flex items-center space-x-3 p-3 border rounded-md"
                      style={{
                        backgroundColor: calendar.backgroundColor || '#f3f4f6',
                        color: calendar.foregroundColor || '#000',
                        borderColor: calendar.backgroundColor || '#e5e7eb',
                      }}
                    >
                      <RadioGroupItem value={calendar.id} id={calendar.id} />
                      <label
                        htmlFor={calendar.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{calendar.summary}</div>
                        {calendar.description && (
                          <div className="text-sm opacity-75">
                            {calendar.description}
                          </div>
                        )}
                        <div className="flex items-center text-xs mt-1">
                          {selectedCalendarIntegration?.calendarId ===
                            calendar.id && (
                            <span className="inline-block bg-green-100 text-green-800 rounded px-2 py-0.5 mr-1">
                              {t('integration:googleCalendar.selected')}
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="mt-4">
                  <Button
                    onClick={handleSaveCalendarSelection}
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                    loading={updatePrimaryCalendar.isLoading}
                    disabled={!selectedGoogleCalendarId}
                  >
                    {t('integration:googleCalendar.saveSelection')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-center mt-3">
                <Text className="text-gray-500">
                  {t('integration:googleCalendar.noCalendarsFound')}
                </Text>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <Text className="text-yellow-700">
              {t('integration:googleCalendar.noIntegrationCalendars')}
            </Text>
          </div>
        )}
      </div>
    </ContentLayout>
  )
}

export default GoogleCalendarAvailabilities
