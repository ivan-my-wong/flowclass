/* eslint-disable simple-import-sort/imports */

import { useDrop } from 'react-dnd'

import { useState } from 'react'
import { DRAG_TYPE } from '@/constants/fullCalendar'
import { CalendarEvent, CustomItemFn } from '@/types/fullCalendar.type'
import { cn } from '@/utils/cn'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '../HoverCard'

import { DraggableEvent } from './DraggableEvent'
import { useEvents } from './EventProvider'
import { EventItemWithErrorBoundary } from './views/EventItemWithError'

type MonthViewDropzoneProps = {
  date: Date
  isCurrentMonth: boolean
  customItemFn?: CustomItemFn
}
export function MonthViewDropzone({
  date,
  isCurrentMonth,
  customItemFn,
}: MonthViewDropzoneProps): JSX.Element {
  const { events, updateEvent, getEventsForDay, onEventClick } = useEvents()

  const [open, setOpen] = useState(false)

  const handleDrop = (targetDate: Date, event: CalendarEvent) => {
    const sourceDate = new Date(event.start)
    const timeDiff = targetDate.getTime() - sourceDate.getTime()

    const updatedEvent = {
      ...event,
      start: new Date(event.start.getTime() + timeDiff),
      end: new Date(event.end.getTime() + timeDiff),
    }

    updateEvent(updatedEvent)
  }
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DRAG_TYPE,
    drop: (item: CalendarEvent) => handleDrop(date, item),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString()
  }

  const eventsForDay = getEventsForDay(date, events)

  return (
    <div
      key={date.toISOString()}
      ref={drop}
      className={cn('min-h-[8rem] p-2', {
        'bg-background-layer-3/5 text-primary-foreground': !isCurrentMonth,
        'bg-background-layer-3': isOver,
      })}
    >
      <div
        className={cn(
          'text-sm',
          'text-center',
          isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        <span
          className={cn(
            isToday(date) &&
              'font-bold text-white bg-primary p-1 border rounded-full border-primary ',
            'text-center'
          )}
        >
          {date.getDate()}
        </span>
      </div>
      <div className="mt-1 space-y-1">
        {eventsForDay.slice(0, 3).map(event => (
          <DraggableEvent
            key={`main-${event.id}-${(event.start || event.end).toISOString()}`}
            event={event}
            style={{
              width: '100%',
            }}
          >
            {({ isDragging }) => (
              <EventItemWithErrorBoundary
                event={event}
                isDragging={isDragging}
                customItemFn={customItemFn}
                onClick={onEventClick}
              />
            )}
          </DraggableEvent>
        ))}
        {eventsForDay.length > 3 && (
          <HoverCard
            openDelay={0}
            closeDelay={0}
            open={open}
            onOpenChange={setOpen}
          >
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="text-xs text-muted-foreground cursor-pointer hover:border p-1 hover:rounded"
                onClick={() => setOpen(true)}
              >
                +{eventsForDay.length - 3} more
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="box-col-full overflow-y-auto max-h-[15rem] justify-start w-[11vw] min-w-[120px]">
              {eventsForDay.slice(3, eventsForDay.length).map(event => (
                <EventItemWithErrorBoundary
                  key={`more-${event.id}-${event.start.toISOString()}`}
                  event={event}
                  isDragging={false}
                  onClick={onEventClick}
                  customItemFn={customItemFn}
                />
              ))}
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
    </div>
  )
}
