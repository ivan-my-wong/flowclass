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
import { CSS as SiitchesCSS } from '@stitches/react'
import { MdOutlineDragIndicator } from 'react-icons/md'

import { styled } from '../../styles'

type DraggableCardProps = {
  id: string | number
  children: React.ReactNode
  cardStyle?: SiitchesCSS
} & ComponentPropsWithoutRef<'div'>

const DraggableCard = ({
  id,
  children,
  cardStyle,
  ...props
}: DraggableCardProps): JSX.Element => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <DraggableCardBox
      css={{ ...cardStyle }}
      key={id}
      ref={setNodeRef}
      style={{ ...style }}
      {...props}
    >
      <DraggableBoxHandler
        {...attributes}
        {...listeners}
        css={{
          backgroundColor: isHovering ? '$textDisabled' : 'transparent',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MdOutlineDragIndicator size="2rem" />
      </DraggableBoxHandler>

      {children}
    </DraggableCardBox>
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

const DraggableBoxHandler = styled('div', {
  width: 'fit-content',
  borderRadius: '20%',
  cursor: 'grab',
  color: '$textSubtle',
})

const DraggableCardBox = styled('div', {
  width: '100%',
  minWidth: '9rem',
  gap: '$1',
  height: 'fit-content',
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  // justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$backgroundLayer2',
  padding: '$4',
  borderRadius: '$medium',
})

export { DraggableCard, DraggableContainer }
