import React, { ComponentPropsWithoutRef, useCallback, useState } from 'react'

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MdOutlineDragIndicator } from 'react-icons/md'

import { cn } from '@/utils/cn'

type DraggableCardProps = {
  id: string | number
  children: React.ReactNode
  cardStyle?: React.CSSProperties
  cardClassName?: string
} & ComponentPropsWithoutRef<'div'>

const DraggableCard = ({
  id,
  children,
  cardStyle,
  cardClassName,
  className,
  style,
  ...props
}: DraggableCardProps): JSX.Element => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const transformStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => setIsHovering(false)

  return (
    <div
      key={id}
      ref={setNodeRef}
      style={{ ...transformStyle, ...style, ...cardStyle }}
      className={cn(
        'w-full min-w-36 gap-1 h-fit flex flex-row items-center bg-background-layer-2 p-4 rounded-md',
        cardClassName,
        className
      )}
      {...props}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'w-fit rounded-[20%] cursor-grab text-text-subtle',
          isHovering && 'bg-text-disabled'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MdOutlineDragIndicator size="2rem" />
      </div>

      {children}
    </div>
  )
}

type DraggableContainerProps = {
  handleDragEnd: (newData: any[]) => void
  items: any[]
  children: React.ReactNode
}

const DraggableContainer = ({
  items,
  children,
  handleDragEnd,
}: DraggableContainerProps): JSX.Element => {
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)
  const sensors = useSensors(mouseSensor, touchSensor)
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (active.id === over?.id || event.over === null) return

      const activeIndex = items.findIndex(
        item => String(item.id) === String(active.id)
      )
      const overIndex = items.findIndex(
        item => String(item.id) === String(over?.id)
      )

      if (activeIndex === -1 || overIndex === -1) return

      const newArray = arrayMove(items, activeIndex, overIndex)
      handleDragEnd(newArray)
    },
    [items, handleDragEnd]
  )

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={(items ?? []).map(item => String(item.id ?? 0))}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  )
}

export { DraggableCard, DraggableContainer }
