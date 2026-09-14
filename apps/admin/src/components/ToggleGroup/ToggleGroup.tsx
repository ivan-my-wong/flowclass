import { forwardRef, useMemo } from 'react'

import { Root } from '@radix-ui/react-toggle-group'

import { DataTestId } from '@/types/common'

import { styled } from '../../styles'
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
            <ToggleGroupRoot
              ref={ref}
              type="single"
              css={{ width: '100%' }}
              direction={direction}
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
                    cardStyle={{
                      padding: '$1',
                      outline:
                        currentItem === item.value
                          ? '3px solid $colors$primary'
                          : undefined,
                      '&:hover': {
                        outline: '3px solid $colors$primarySubtle',
                      },
                    }}
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
            </ToggleGroupRoot>
          ) : (
            // The component when the toggle group is NOT draggable.
            <ToggleGroupRoot
              ref={ref}
              type="single"
              css={{ width: '100%' }}
              direction={direction}
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
            </ToggleGroupRoot>
          )
        }
      </>
    )
  }
)

const ToggleGroupRoot = styled(Root, {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  borderRadius: 4,
  gap: '$2',
  variants: {
    direction: {
      row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
      },
      column: {
        flexDirection: 'column',
      },
    },
  },
})

export default ToggleGroup
