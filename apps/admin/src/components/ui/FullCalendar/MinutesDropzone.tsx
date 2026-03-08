import { useDrop } from 'react-dnd'

import { DRAG_TYPE } from '@/constants/fullCalendar'
import { CalendarEvent } from '@/types/fullCalendar.type'
import { cn } from '@/utils/cn'

import { useEvents } from './EventProvider'

type MinutesDropzoneProps = {
  date: Date
  hour: number
  minute: number
  isHighlighted?: boolean
  onMouseDown?: () => void
  onMouseMove?: () => void
  onClick?: () => void
}

export function MinutesDropzone({
  date,
  hour,
  minute,
  isHighlighted,
  onMouseDown,
  onMouseMove,
  onClick,
}: MinutesDropzoneProps): JSX.Element {
  const { updateEvent } = useEvents()

  const handleDrop = (hour: number, minute: number, event: CalendarEvent) => {
    const startTime = new Date(date)
    startTime.setHours(hour)
    startTime.setMinutes(minute)

    const endTime = new Date(startTime)
    endTime.setTime(
      endTime.getTime() + (event.end.getTime() - event.start.getTime())
    )

    const updatedEvent = {
      ...event,
      start: startTime,
      end: endTime,
    }
    updateEvent(updatedEvent)
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: DRAG_TYPE,
    drop: (item: CalendarEvent) => handleDrop(hour, minute, item),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      role="button"
      tabIndex={0}
      aria-label={`Select time slot at ${hour}:${minute
        .toString()
        .padStart(2, '0')}`}
      className={cn('absolute z-[5] h-[12%] w-full cursor-pointer', {
        'bg-background-layer-3': isOver || isHighlighted,
      })}
      style={{
        top: `${(minute * 100) / 60}%`,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    />
  )
}
