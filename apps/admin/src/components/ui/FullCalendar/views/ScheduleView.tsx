import { useMemo } from 'react'

import { addDays, startOfDay } from 'date-fns'
import { useRecoilValue } from 'recoil'

import { dateFormatOptions } from '@/constants/fullCalendar'
import { displayLanguageState } from '@/stores/displayLanguage'
import { cn } from '@/utils/cn'

import { useCalendar } from '../CalendarProvider'
import { useEvents } from '../EventProvider'

import ColumnViewWrapper from './ColumnViewWrapper'

const DAYS_TO_SHOW = 7

const ScheduleView = () => {
  const { currentDate } = useCalendar()
  const { events, getEventsForDay, onEventClick } = useEvents()
  const lang = useRecoilValue(displayLanguageState)
  const language = useMemo(() => {
    if (lang === 'en') return 'en-US'
    return 'zh-CN'
  }, [lang])

  const eventsForDay = useMemo(() => {
    return getEventsForDay(currentDate, events)
  }, [events, currentDate])

  const getDaysToShow = useMemo(
    () => () => {
      return Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
        addDays(startOfDay(currentDate), i)
      )
    },
    []
  )

  const daysToShow = useMemo(() => getDaysToShow(), [getDaysToShow])

  return (
    <ColumnViewWrapper
      className="overflow-auto"
      data-testid="schedule-view"
      aria-label="Schedule View"
    >
      {daysToShow.map((date, index) => (
        <div key={date.toISOString()} className="border-b last:border-b-0">
          <div className="sticky top-0 bg-background z-10 p-2 border-b">
            <div className="font-medium">
              {date.toLocaleDateString(language, dateFormatOptions.longDayName)}
            </div>
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString(
                language,
                dateFormatOptions.longMonthDay
              )}
            </div>
          </div>
          <div className="p-2">
            {eventsForDay.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                No events
              </div>
            ) : (
              eventsForDay.map(event => (
                <div
                  key={event.id}
                  className={cn(
                    'my-1 p-2 rounded border-l-2 bg-white dark:bg-gray-800 shadow-sm cursor-pointer',
                    event.color || 'border-blue-500'
                  )}
                  role="button"
                  onClick={() => {
                    onEventClick?.(event)
                  }}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onEventClick?.(event)
                    }
                  }}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm">
                    {event.start.toLocaleTimeString(
                      [],
                      dateFormatOptions.clock
                    )}{' '}
                    -{event.end.toLocaleTimeString([], dateFormatOptions.clock)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </ColumnViewWrapper>
  )
}

export default ScheduleView
