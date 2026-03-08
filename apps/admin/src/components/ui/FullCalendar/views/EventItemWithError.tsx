import type { CalendarEvent, CustomItemFn } from '@/types/fullCalendar.type'

import ErrorBoundary from '../EventErrorBoundary'

import { EventItem } from './EventItem'

type EventWrapperProps = {
  event: CalendarEvent
  isDragging: boolean
  withTime?: boolean
  customItemFn?: CustomItemFn
  onClick?: (event: CalendarEvent) => void
}

export function EventItemWithErrorBoundary({
  customItemFn,
  ...props
}: EventWrapperProps): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded h-full bg-gray-100 px-1 py-0.5 text-xs border-l-2 border-gray-400 w-full">
          Failed to load event
        </div>
      }
    >
      {customItemFn ? customItemFn(props) : <EventItem {...props} />}
    </ErrorBoundary>
  )
}
