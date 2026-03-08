import React, { ComponentProps, forwardRef, useMemo } from 'react'

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

const triggerBaseClasses =
  '[all:unset] inline-flex items-center justify-center rounded px-4 text-base leading-none h-12 gap-1.5 bg-background border-2 border-background-layer-3 text-text shadow-sm whitespace-normal hover:bg-background-layer-3 hover:cursor-pointer focus:shadow-[0_0_0_2px_hsl(var(--border))] data-[placeholder]:text-text'

const triggerVariantClasses = {
  compact:
    'h-7 text-[0.9rem] shadow-none border-2 border-background-layer-3 focus:shadow-none',
  disabled:
    'bg-background-disabled text-text-subtle shadow-none hover:bg-background-disabled hover:text-text-subtle hover:cursor-not-allowed hover:shadow-none',
}

// selectItems format: [{label: string, values: [number | string]}]
export type SelectItemValuesProps = {
  label: JSX.Element | string
  value: string | number
  status?: string
  disabled?: boolean
  image?: string
}

export type SimpleSelectorItemProps = {
  label: string
  value: string | number
}

export type DynamicTypeSelectorItemProps<T> = {
  label: string
  value: T
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

type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
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
        className={cn(
          'text-base leading-none text-text rounded-sm flex justify-start items-center h-auto min-h-8 py-2 px-4 relative select-none cursor-pointer',
          'data-[disabled]:text-text-subtle data-[disabled]:pointer-events-none',
          'data-[highlighted]:outline-none data-[highlighted]:text-primary-subtle',
          className
        )}
      >
        <SelectPrimitive.ItemText ref={forwardedRef}>
          {children}
        </SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute left-0 w-4 inline-flex items-center justify-center">
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>
    )
  }
)

SelectItem.displayName = 'SelectItem'

const SelectDefault: React.FC<SelectInputProps> = ({
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
  const getTextColor = (label: string, status?: string) => {
    if (status === 'error') {
      return <Text className="text-warn">{label}</Text>
    }
    if (status === 'highlight') {
      return <Text type="primary">{label}</Text>
    }

    return label
  }

  const DraggableSelectItems = (): JSX.Element => {
    const draggableItems = useMemo(() => {
      return selectItems.map(item => {
        return {
          ...item,
          itemValues: item.itemValues.map(itemValue => {
            return {
              ...itemValue,
              id: uuidv4(),
            }
          }),
        }
      })
    }, [])

    return (
      <>
        {draggableItems.map(item => {
          if (item?.group) {
            return (
              <SelectPrimitive.Group key={item.group}>
                <SelectPrimitive.Label className="py-0 px-6 text-xs leading-[25px] text-text">
                  {item.group}
                </SelectPrimitive.Label>
                <DraggableContainer
                  items={item.itemValues}
                  handleDragEnd={handleDragEnd!}
                >
                  {item.itemValues.map(itemValue => {
                    return (
                      <DraggableCard
                        id={itemValue.id.toString()}
                        key={itemValue.value}
                        className="p-1"
                      >
                        <SelectItem
                          key={itemValue.value}
                          value={itemValue.value.toString()}
                          disabled={itemValue.disabled}
                        >
                          {typeof itemValue.label === 'string'
                            ? getTextColor(itemValue.label, itemValue.status)
                            : itemValue.label}
                        </SelectItem>
                      </DraggableCard>
                    )
                  })}
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
                  id={itemValue.id.toString()}
                  key={itemValue.value}
                  className="p-1"
                >
                  <SelectItem
                    key={itemValue.value}
                    value={itemValue.value.toString()}
                  >
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

  const NonDraggableSelectItems = (): JSX.Element => {
    return (
      <>
        {selectItems.map((item, index) => {
          if (item.group !== null) {
            return (
              <SelectPrimitive.Group key={`${item.group}${index - 1}`}>
                <SelectPrimitive.Label className="py-0 px-6 text-xs leading-[25px] text-text">
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
            <React.Fragment key={uuidv4()}>
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
  }

  const triggerVariantKey = disabled ? 'disabled' : triggerVariant

  return (
    <SelectPrimitive.Root
      onValueChange={onValueChange}
      value={currentSelect.toString()}
    >
      <SelectPrimitive.Trigger
        id={id ?? 'select-trigger'}
        disabled={disabled}
        className={cn(
          triggerBaseClasses,
          triggerVariantKey && triggerVariantClasses[triggerVariantKey],
          fullWidth && 'w-full p-0'
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="text-text">
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'overflow-hidden bg-background rounded-md z-[1100]',
            'border border-border rounded-md'
          )}
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-background text-primary cursor-default">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1.5">
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

export default SelectDefault
