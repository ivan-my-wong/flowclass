import React, { useCallback, useState } from 'react'

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

type DraggableCardMultiGroupProps = {
  id: string | number
  children: React.ReactNode
  cardStyle?: React.CSSProperties
  cardClassName?: string
  groupKeys: string[]
}

const DraggableCardMultiGroup = ({
  id,
  children,
  cardStyle,
  cardClassName,
  groupKeys,
}: DraggableCardMultiGroupProps): JSX.Element => {
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

  if (groupKeys.includes(id.toString())) return <div ref={setNodeRef} />

  return (
    <div
      key={id}
      ref={setNodeRef}
      style={{ ...style, ...cardStyle }}
      className={cn(
        'w-full min-w-[9rem] gap-1 h-fit flex flex-row content-center items-center bg-background-layer-2 p-4 rounded-lg',
        cardClassName
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'w-fit rounded-[20%] cursor-grab text-text-subtle',
          isHovering ? 'bg-text-disabled' : 'bg-background-layer-2'
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

type DraggableMultiGroupProps = {
  handleDragEnd: (newData: Record<string, any[]>) => void
  items: Record<string, any[]>
  labelField: Record<string, any>
  fieldCard: (data: { item: any; groupKey: any }) => JSX.Element
}

const DraggableMultiGroup = ({
  items,
  handleDragEnd,
  labelField = {},
  fieldCard,
}: DraggableMultiGroupProps): JSX.Element => {
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)
  const sensors = useSensors(mouseSensor, touchSensor)
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const activeContainer = Object.keys(items).find(key =>
        items[key as any].some((item: any) => item.id === active.id)
      )
      const overContainer = Object.keys(items).find(key =>
        items[key as any].some((item: any) => item.id === over.id)
      )

      if (
        activeContainer &&
        overContainer &&
        activeContainer !== overContainer
      ) {
        const activeItems = items[activeContainer as any]
        const overItems = items[overContainer as any]

        const activeItem = activeItems.find(
          (item: any) => item.id === active.id
        )

        if (activeItem?.isDefault) return

        // Move item from one group to another
        const newActiveItems = activeItems.filter(
          (item: any) => item.id !== active.id
        )
        const newOverItems = [...overItems, activeItem]

        handleDragEnd({
          ...items,
          [activeContainer]: newActiveItems,
          [overContainer]: newOverItems,
        })
      } else if (activeContainer === overContainer) {
        // Rearrange items within the same group
        const activeIndex = items[activeContainer as any].findIndex(
          (item: any) => item.id === active.id
        )
        const overIndex = items[overContainer as any].findIndex(
          (item: any) => item.id === over.id
        )

        if (activeIndex !== overIndex) {
          const updatedItems = arrayMove(
            items[activeContainer as any],
            activeIndex,
            overIndex
          )
          handleDragEnd({ ...items, [activeContainer as any]: updatedItems })
        }
      }
    },
    [items, handleDragEnd]
  )

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      {Object.keys(items).map(groupKey => (
        <SortableContext
          key={groupKey}
          items={items[groupKey as any].map((item: any) => item.id as any)}
          strategy={verticalListSortingStrategy}
        >
          {labelField[groupKey as any]}
          {items[groupKey as any].map((item: any) => (
            <DraggableCardMultiGroup
              key={item.id}
              id={item.id ?? 0}
              cardStyle={{
                padding: '0.5rem',
                border: '1px solid var(--primary)',
                borderRadius: '0.25rem',
                display: 'grid',
                gridTemplateColumns: '9% 90%',
              }}
              groupKeys={Object.keys(labelField)}
            >
              {fieldCard({ item, groupKey })}
            </DraggableCardMultiGroup>
          ))}
        </SortableContext>
      ))}
    </DndContext>
  )
}

export default DraggableMultiGroup
