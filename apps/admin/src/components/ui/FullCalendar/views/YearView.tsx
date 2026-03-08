import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { MONTHS } from '@/constants/fullCalendar'

import { useCalendar } from '../CalendarProvider'
import { EventPopover } from '../EventPopover'
import { useEvents } from '../EventProvider'

const YearView = (): JSX.Element => {
  const { currentDate } = useCalendar()
  const { events } = useEvents()
  const currentYear = currentDate.getFullYear()
  const { t } = useTranslation('calendar')

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getEventsForDay = useMemo(
    () => (year: number, month: number, day: number) => {
      const date = new Date(year, month, day)
      return events.filter(
        event => event.start.toDateString() === date.toDateString()
      )
    },
    [events]
  )

  return (
    <div
      className="grid grid-cols-4 gap-4 p-4"
      data-testid="year-view"
      aria-label="Year View"
    >
      {MONTHS.map((month, monthIndex) => (
        <div key={month} className="rounded-lg border p-4">
          <h3 className="mb-2 text-sm font-medium">{t(`months.${month}`)}</h3>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({
              length: getDaysInMonth(currentYear, monthIndex),
            }).map((_, dayIndex) => {
              const day = dayIndex + 1
              const date = new Date(currentYear, monthIndex, day)
              const eventsForDay = getEventsForDay(currentYear, monthIndex, day)
              return (
                <EventPopover key={dayIndex} date={date} events={eventsForDay}>
                  <div
                    className={`aspect-square rounded text-center text-xs leading-6 ${
                      eventsForDay.length > 0
                        ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                        : 'text-muted-foreground hover:bg-muted'
                    } relative`}
                  >
                    {day}
                    {eventsForDay.length > 0 && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </EventPopover>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default YearView
