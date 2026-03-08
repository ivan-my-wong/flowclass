import { useMemo, useRef, useState } from 'react'

import { dateFormatOptions, HOURS } from '@/constants/fullCalendar'
import { useLanguage } from '@/hooks/useLanguage'
import type { CalendarViewProps } from '@/types/fullCalendar.type'
import {
  getHighlightedMinutesForHour,
  handleClick,
  handleDragEnd,
  handleDragMove,
  handleDragStart,
} from '@/utils/calendar-drag.utils'

import { useCalendar } from '../CalendarProvider'
import { DayViewGridItem } from '../DayViewDropzone'
import { DraggableEvent } from '../DraggableEvent'
import { useEvents } from '../EventProvider'

import ColumnViewWrapper from './ColumnViewWrapper'
import { EventItemWithErrorBoundary } from './EventItemWithError'
import Hour from './Hour'
import { TimeCursor } from './TimeCursor'

const DayView = ({
  onTimeSlotSelect,
  customItemFn,
}: CalendarViewProps): JSX.Element => {
  const { currentDate } = useCalendar()
  const {
    events,
    getEventsForDay,
    calculateEventWidth,
    calculateEventPosition,
    onEventClick,
  } = useEvents()
  const { language } = useLanguage()

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null)
  const [dragEndTime, setDragEndTime] = useState<Date | null>(null)
  const isMouseDownRef = useRef(false)

  const dragState = {
    isDragging,
    dragStartTime,
    dragEndTime,
    isMouseDownRef,
    setIsDragging,
    setDragStartTime,
    setDragEndTime,
  }

  const eventsForDay = useMemo(() => {
    return getEventsForDay(currentDate, events)
  }, [events, currentDate])

  const sortedEvents = useMemo(() => {
    return [...eventsForDay].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
  }, [eventsForDay])

  return (
    <ColumnViewWrapper data-testid="day-view" aria-label="Day View">
      <div className="text-center py-2 border-b">
        <div className="font-semibold">
          {currentDate.toLocaleDateString(
            language,
            dateFormatOptions.longDayName
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentDate.toLocaleDateString(
            language,
            dateFormatOptions.dateMonthName
          )}
        </div>
      </div>
      <div
        className="flex flex-1 overflow-y-auto"
        onMouseUp={() => handleDragEnd(onTimeSlotSelect, dragState)}
        onMouseLeave={() => handleDragEnd(onTimeSlotSelect, dragState)}
        role="presentation"
        aria-label="Day View"
      >
        <Hour />
        <div className="relative flex-1">
          <div className="absolute inset-0">
            {HOURS.map(hour => (
              <DayViewGridItem
                key={hour}
                hour={hour}
                date={currentDate}
                highlightedMinutes={getHighlightedMinutesForHour(
                  hour,
                  currentDate,
                  dragState
                )}
                onDragStart={(h, m) =>
                  handleDragStart(h, m, currentDate, dragState)
                }
                onDragMove={(h, m) =>
                  handleDragMove(h, m, currentDate, dragState)
                }
                onClick={(h, m) =>
                  handleClick(h, m, currentDate, onTimeSlotSelect, dragState)
                }
              />
            ))}
          </div>
          <TimeCursor />
          <div className="absolute inset-0">
            {sortedEvents.map((event, index) => (
              <DraggableEvent
                key={event.id}
                event={event}
                className="absolute hover:z-10"
                style={{
                  ...calculateEventPosition(event, currentDate),
                  ...calculateEventWidth(event, eventsForDay),
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
        </div>
      </div>
    </ColumnViewWrapper>
  )
}

export default DayView
