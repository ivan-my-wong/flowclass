import type { CustomItemFn } from '@/types/fullCalendar.type'

import { EventItemWithErrorBoundary } from './views/EventItemWithError'
import { DraggableEvent } from './DraggableEvent'
import { useEvents } from './EventProvider'

type NDayDropzoneProps = {
  date: Date
  hour: number
  customItemFn?: CustomItemFn
}
export function NDayDropzone({
  date,
  hour,
  customItemFn,
}: NDayDropzoneProps): JSX.Element {
  const {
    events,
    getEventsForDay,
    filterEventMultipleDays,
    calculateEventWidth,
    calculateEventPosition,
    onEventClick,
  } = useEvents()
  const eventsForDay = getEventsForDay(date, events)

  return (
    <>
      {eventsForDay
        .filter(event => filterEventMultipleDays(event, date, hour))
        .map(event => {
          const { height, top, width, left } = {
            ...calculateEventPosition(event, date),
            ...calculateEventWidth(event, eventsForDay, 100),
          }
          return (
            <DraggableEvent
              key={event.id}
              event={event}
              className="absolute hover:z-10"
              style={{
                width,
                left,
                top,
                height,
              }}
            >
              {({ isDragging }) => (
                <EventItemWithErrorBoundary
                  event={event}
                  isDragging={isDragging}
                  withTime
                  customItemFn={customItemFn}
                  onClick={onEventClick}
                />
              )}
            </DraggableEvent>
          )
        })}
    </>
  )
}
