import { forwardRef, useMemo } from 'react'

import { Root } from '@radix-ui/react-toggle-group'

import { DataTestId } from '@/types/common'
import { cn } from '@/utils/cn'

import { DraggableCard, DraggableContainer } from '../Containers/Draggable'
import { SimpleSelectorItemProps } from '../Selector/Select'

import ToggleGroupItemComponent, {
  ToggleGroupDropdownMenuModules,
} from './ToggleGroupItem'

export type ToggleGroupLabelsProps = SimpleSelectorItemProps & {
  icon?: React.ReactNode
  status?: string
  actionButton?: React.ReactNode
  onEdit?: (label: string, newLabel: string) => boolean | Promise<boolean>
  onDelete?: (label: string) => void | Promise<void>
  onDuplicate?: (label: string) => void | Promise<void>
  onArchive?: (label: string) => void | Promise<void>
  onUnarchive?: (label: string) => void | Promise<void>
  indicators?: Record<string, any>
  isDirty?: boolean
  dropdownMenuModules?: ToggleGroupDropdownMenuModules[]
  // Example { multipleClass: true, dropIn: false }
}

type ToggleGroupProps = {
  currentItem: string
  direction?: 'row' | 'column'
  items: ToggleGroupLabelsProps[]
  onChange: (value: any) => void
  handleOrderSection?: (...args: any[]) => any
  isDraggable?: boolean
  isDuplicating?: boolean
  // new dnd kit
  handleDragEnd?: (newData: any[]) => void
  draggable?: boolean
  type?: string
  dropdownMenuModules?: ToggleGroupDropdownMenuModules[]
} & DataTestId

const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      currentItem,
      items,
      onChange,
      handleOrderSection,
      isDraggable,
      isDuplicating,
      handleDragEnd,
      draggable,
      type = '',
      dropdownMenuModules,
      direction,
      dataTestId,
    },
    ref
  ) => {
    const draggableItems = useMemo(
      () =>
        items.map(item => {
          return {
            ...item,
            // Use value as stable ID for dnd kit instead of generating new UUIDs
            id: item.value,
          }
        }),
      [items]
    )

    return (
      <>
        {
          // The component when the toggle group is draggable.
          draggable && handleDragEnd ? (
            <Root
              ref={ref}
              type="single"
              className={cn(
                'flex flex-wrap gap-2 rounded',
                direction === 'row' && 'flex-row justify-evenly',
                direction === 'column' && 'flex-col',
                'w-full'
              )}
              value={currentItem}
            >
              <DraggableContainer
                items={draggableItems}
                handleDragEnd={handleDragEnd}
              >
                {draggableItems.map((item, index) => (
                  <DraggableCard
                    id={item.id.toString()}
                    key={item.id}
                    cardClassName={cn(
                      'p-1',
                      currentItem === item.value &&
                        'outline outline-3 outline-primary',
                      'hover:outline hover:outline-3 hover:outline-primary-subtle'
                    )}
                  >
                    <ToggleGroupItemComponent
                      index={index}
                      key={item.value}
                      item={item}
                      onChange={onChange}
                      handleOrderSection={handleOrderSection}
                      isDraggable={isDraggable}
                      isDuplicating={isDuplicating}
                      type={type}
                      dataTestId={dataTestId}
                      dropdownMenuModules={dropdownMenuModules}
                    />
                  </DraggableCard>
                ))}
              </DraggableContainer>
            </Root>
          ) : (
            // The component when the toggle group is NOT draggable.
            <Root
              ref={ref}
              type="single"
              className={cn(
                'flex flex-wrap gap-2 rounded w-full',
                direction === 'row' && 'flex-row justify-evenly',
                direction === 'column' && 'flex-col'
              )}
              value={currentItem}
            >
              {items.map((item: ToggleGroupLabelsProps, index: number) => {
                return (
                  <ToggleGroupItemComponent
                    index={index}
                    key={item.value}
                    item={item}
                    onChange={onChange}
                    handleOrderSection={handleOrderSection}
                    isDraggable={isDraggable}
                    isDuplicating={isDuplicating}
                    isStandalone
                    type={type}
                    dataTestId={dataTestId}
                    dropdownMenuModules={dropdownMenuModules}
                  />
                )
              })}
            </Root>
          )
        }
      </>
    )
  }
)

export default ToggleGroup
