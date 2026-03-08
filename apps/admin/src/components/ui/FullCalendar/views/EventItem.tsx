import { useRecoilValue } from 'recoil'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import { dateFormatOptions } from '@/constants/fullCalendar'
import { displayLanguageState } from '@/stores/displayLanguage'
import type { CalendarEvent } from '@/types/fullCalendar.type'
import { cn } from '@/utils/cn'

import { DailyEventTime } from './DailyEventTime'
import { DailyEventView } from './DailyEventView'
import QuotaAttendance from './QuotaAttendance'
import { WeeklyEventView } from './WeeklyEventView'

type EventItemProps = {
  event: CalendarEvent
  isDragging: boolean
  withTime?: boolean
  onClick?: (event: CalendarEvent) => void
}
export function EventItem({
  event,
  isDragging,
  withTime,
  onClick,
}: EventItemProps): JSX.Element {
  const language = useRecoilValue(displayLanguageState)
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'left-0 right-0 rounded h-full bg-white px-1 py-0.5 text-xs border-l-2 w-full text-left pl-2',
            event.color || 'border-blue-500',
            isDragging ? '!-z-10' : '!z-[2]',
            'text-black overflow-hidden cursor-pointer shadow-sm hover:!z-50 hover:shadow-md transition-all duration-100'
          )}
          role="button"
          tabIndex={0}
          onClick={() => onClick?.(event)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick?.(event)
            }
          }}
        >
          <h1 className="font-medium truncate">{event.title}</h1>
          {event.subtitle && (
            <p className="text-sm text-gray-500 truncate" role="contentinfo">
              {event.subtitle}
            </p>
          )}
          {event?.locationId && (
            <p className="text-sm text-gray-500 truncate" role="contentinfo">
              {event.locationName}
            </p>
          )}
          {event?.instructorId && (
            <p className="text-sm text-gray-500 truncate" role="contentinfo">
              {event.instructorName} - {event.instructorEmail}
            </p>
          )}
          {withTime && (
            <div className="truncate">
              <span className="sr-only">Event time: </span>
              {event.start.toLocaleTimeString(
                language,
                dateFormatOptions.clock
              )}{' '}
              <span aria-hidden="true">-</span>{' '}
              {event.end.toLocaleTimeString(language, dateFormatOptions.clock)}
            </div>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right">
        <div className="flex justify-between space-x-4 !z-dropdown">
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-semibold">{event.title}</h4>
            {event.subtitle && (
              <p className="text-sm text-gray-500 truncate" role="contentinfo">
                {event.subtitle}
              </p>
            )}
            {event?.locationId && (
              <p className="text-sm text-gray-500 truncate" role="contentinfo">
                {event.locationName}
              </p>
            )}
            {event?.instructorId && (
              <p className="text-sm text-gray-500 truncate" role="contentinfo">
                {event.instructorName} - {event.instructorEmail}
              </p>
            )}
            <div className="flex items-center">
              {event.isMultipleDays ? (
                <WeeklyEventView event={event} />
              ) : (
                <DailyEventView event={event} />
              )}
            </div>
            {!event.isMultipleDays && <DailyEventTime event={event} />}
            {FEATURE_FLAG.SHOW_QUOTA_ATTENDANCE_IN_CALENDAR && (
              <QuotaAttendance event={event} />
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
