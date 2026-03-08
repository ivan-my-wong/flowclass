/* eslint-disable simple-import-sort/imports */
import { useMemo } from 'react'

import { CustomItemFn } from '@/types/fullCalendar.type'
import { DraggableEvent } from './DraggableEvent'
import { useEvents } from './EventProvider'
import { EventItemWithErrorBoundary } from './views/EventItemWithError'

type WeekViewDropzoneProps = {
  date: Date
  customItemFn?: CustomItemFn
}
const WeekViewEvents = ({
  date,
  customItemFn,
}: WeekViewDropzoneProps): JSX.Element => {
  const {
    getEventsForDay,
    events,
    calculateEventPosition,
    calculateEventWidth,
    onEventClick,
  } = useEvents()
  const eventsForDay = useMemo(() => {
    return getEventsForDay(date, events)
  }, [date, events])
  return (
    <div key={`${date.toISOString()}-events`} className="relative flex-1">
      {eventsForDay.map(event => (
        <DraggableEvent
          key={event.id}
          event={event}
          className="absolute hover:z-10"
          style={{
            ...calculateEventPosition(event, date),
            ...calculateEventWidth(event, eventsForDay, 80),
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
      ))}
    </div>
  )
}

export default WeekViewEvents
