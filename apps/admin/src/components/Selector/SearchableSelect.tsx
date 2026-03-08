import React, {
  ComponentProps,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'
// eslint-disable-next-line no-restricted-syntax
import * as SelectPrimitive from '@radix-ui/react-select'
import { v4 as uuidv4 } from 'uuid'

import { cn } from '@/utils/cn'

import { DraggableCard, DraggableContainer } from '../Containers/Draggable'
import Text from '../Texts/Text'

const triggerBase =
  'outline-none inline-flex items-center justify-center rounded px-4 text-base leading-none h-12 gap-1.5 bg-background border-2 border-background-layer-3 text-text shadow-sm whitespace-normal hover:bg-background-layer-3 hover:cursor-pointer focus:ring-2 focus:ring-border focus:ring-offset-0 data-[placeholder]:text-text'

const SelectItem = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof SelectPrimitive.Item>
>(({ children, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    {...props}
    ref={ref => {
      const itemRef = ref
      if (!itemRef) return
      itemRef.ontouchstart = e => {
        e.preventDefault()
        e.stopPropagation()
      }
    }}
    className="text-base leading-none text-text rounded flex items-center h-6 py-4 px-8 relative select-none cursor-pointer data-[disabled]:text-text-subtle data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:text-primary-subtle"
  >
    <SelectPrimitive.ItemText ref={forwardedRef}>
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
      <CheckIcon />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))

SelectItem.displayName = 'SelectItem'

export type SelectItemValuesProps = {
  label: JSX.Element | string
  value: string | number
  status?: string
  disabled?: boolean
  image?: string
}

export type SimpleSelectorItemProps = {
  label: string
  value: string
}

export type SelectItemsProps = {
  group?: string
  itemValues: SelectItemValuesProps[]
}

export type SelectInputProps = {
  id?: string
  placeholder: string
  selectItems: SelectItemsProps[]
  triggerVariant?: 'compact'
  currentSelect: string | number
  fullWidth?: boolean
  onValueChange: (value: any) => void
  handleDragEnd?: (newData: any[]) => void
  draggable?: boolean
  disabled?: boolean
}

const SearchableSelect: React.FC<SelectInputProps> = ({
  id,
  placeholder,
  triggerVariant,
  selectItems,
  currentSelect,
  fullWidth = false,
  onValueChange,
  handleDragEnd,
  draggable,
  disabled,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const getTextColor = (label: string, status?: string) => {
    if (status === 'error') {
      return <Text type="error">{label}</Text>
    }
    if (status === 'highlight') {
      return <Text type="primary">{label}</Text>
    }
    return label
  }

  const filteredItems = useMemo(() => {
    if (!searchTerm) return selectItems
    return selectItems
      .map(group => ({
        ...group,
        itemValues: group.itemValues.filter(item => {
          const label = typeof item.label === 'string' ? item.label : ''
          return label.toLowerCase().includes(searchTerm.toLowerCase())
        }),
      }))
      .filter(group => group.itemValues.length > 0)
  }, [selectItems, searchTerm])

  const DraggableSelectItems = (): JSX.Element => {
    const draggableItems = useMemo(
      () =>
        filteredItems.map(item => ({
          ...item,
          itemValues: item.itemValues.map(itemValue => ({
            ...itemValue,
            id: uuidv4(),
          })),
        })),
      []
    )

    return (
      <>
        {draggableItems.map(item => {
          if (item?.group) {
            return (
              <SelectPrimitive.Group key={item.group}>
                <SelectPrimitive.Label className="py-0 px-6 text-xs leading-6 text-text">
                  {item.group}
                </SelectPrimitive.Label>
                <DraggableContainer
                  items={item.itemValues}
                  handleDragEnd={handleDragEnd!}
                >
                  {item.itemValues.map(itemValue => (
                    <DraggableCard
                      key={itemValue.value}
                      id={itemValue.id.toString()}
                      cardStyle={{ padding: '0.25rem' }}
                    >
                      <SelectItem
                        value={itemValue.value.toString()}
                        disabled={itemValue.disabled}
                      >
                        {typeof itemValue.label === 'string'
                          ? getTextColor(itemValue.label, itemValue.status)
                          : itemValue.label}
                      </SelectItem>
                    </DraggableCard>
                  ))}
                </DraggableContainer>
                <SelectPrimitive.Separator className="h-px bg-background-disabled my-1.5" />
              </SelectPrimitive.Group>
            )
          }
          return (
            <DraggableContainer
              key={uuidv4()}
              items={item.itemValues}
              handleDragEnd={handleDragEnd!}
            >
              {item.itemValues.map(itemValue => (
                <DraggableCard
                  key={itemValue.value}
                  id={itemValue.id.toString()}
                  cardStyle={{ padding: '0.25rem' }}
                >
                  <SelectItem value={itemValue.value.toString()}>
                    {typeof itemValue.label === 'string'
                      ? getTextColor(itemValue.label, itemValue.status)
                      : itemValue.label}
                  </SelectItem>
                </DraggableCard>
              ))}
              <SelectPrimitive.Separator className="h-px bg-background-disabled my-1.5" />
            </DraggableContainer>
          )
        })}
      </>
    )
  }

  const NonDraggableSelectItems = (): JSX.Element => (
    <>
      {filteredItems.map((item, index) => {
        if (item.group !== null) {
          return (
            <SelectPrimitive.Group key={`${item.group}${index - 1}`}>
              <SelectPrimitive.Label className="py-0 px-6 text-xs leading-6 text-text">
                {item.group}
              </SelectPrimitive.Label>
              {item.itemValues.map((itemValue, idx) => (
                <SelectItem
                  key={`${itemValue.value}${idx - 1}`}
                  value={itemValue.value.toString()}
                  disabled={itemValue.disabled}
                >
                  {typeof itemValue.label === 'string'
                    ? getTextColor(itemValue.label, itemValue.status)
                    : itemValue.label}
                </SelectItem>
              ))}
              <SelectPrimitive.Separator className="h-px bg-background-disabled my-1.5" />
            </SelectPrimitive.Group>
          )
        }
        return (
          <React.Fragment key={index}>
            {item.itemValues.map((itemValue, idx) => (
              <SelectItem
                key={`${itemValue.value}${idx - 1}`}
                value={itemValue.value.toString()}
              >
                {typeof itemValue.label === 'string'
                  ? getTextColor(itemValue.label, itemValue.status)
                  : itemValue.label}
              </SelectItem>
            ))}
            <SelectPrimitive.Separator className="h-px bg-background-disabled my-1.5" />
          </React.Fragment>
        )
      })}
    </>
  )

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <SelectPrimitive.Root
      onValueChange={onValueChange}
      value={currentSelect.toString()}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectPrimitive.SelectTrigger
        id={id ?? 'select-trigger'}
        disabled={disabled}
        className={cn(
          triggerBase,
          triggerVariant === 'compact' &&
            'h-7 text-sm shadow-none border-2 border-background-layer-3 focus:ring-0',
          disabled &&
            'bg-text-disabled text-text-subtle shadow-none hover:bg-text-disabled hover:text-text-subtle hover:cursor-not-allowed hover:shadow-none',
          fullWidth && 'w-full p-0'
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.SelectIcon className="text-text">
          <ChevronDownIcon />
        </SelectPrimitive.SelectIcon>
      </SelectPrimitive.SelectTrigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="overflow-hidden bg-background rounded-md border border-border z-[1060]"
          position="popper"
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-background text-primary cursor-default">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>
          <div className="p-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <SelectPrimitive.Viewport className="p-1">
            {draggable && handleDragEnd ? (
              <DraggableSelectItems />
            ) : (
              <NonDraggableSelectItems />
            )}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-background text-primary cursor-default">
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export default SearchableSelect
