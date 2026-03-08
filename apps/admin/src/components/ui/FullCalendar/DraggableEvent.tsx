import type React from 'react'
import { useDrag } from 'react-dnd'

import { DRAG_TYPE } from '@/constants/fullCalendar'
import type { CalendarEvent } from '@/types/fullCalendar.type'
import { cn } from '@/utils/cn'

import { useCalendar } from './CalendarProvider'

interface DraggableEventProps {
  event: CalendarEvent
  className?: string
  style?: React.CSSProperties
  children: ({ isDragging }: { isDragging: boolean }) => React.ReactElement
}

export const DraggableEvent: React.FC<DraggableEventProps> = ({
  event,
  className,
  style,
  children,
}) => {
  const { enableDragAndDrop: isEnableDragAndDrop } = useCalendar()
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPE,
    item: event,
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <button
      ref={isEnableDragAndDrop ? drag : null}
      className={cn('z-[5]', isDragging ? 'opacity-50 !z-[0]' : '', className)}
      style={style}
      type="button"
      data-testid="draggable-event-item"
    >
      {children({ isDragging })}
    </button>
  )
}
