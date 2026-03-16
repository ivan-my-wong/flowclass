import React, { useCallback, useMemo } from 'react'

import { v4 as uuidv4 } from 'uuid'

import {
  Select as UiSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/utils/cn'

import { DraggableCard, DraggableContainer } from '../Containers/Draggable'
import Text from '../Texts/Text'

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
  onValueChange: (value: string) => void
  handleDragEnd?: (newData: unknown[]) => void
  draggable?: boolean
  disabled?: boolean
}

const touchHandler = {
  onTouchStart: (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  },
}

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
  const getTextColor = useCallback((label: string, status?: string) => {
    if (status === 'error') {
      return <Text className="text-warn">{label}</Text>
    }
    if (status === 'highlight') {
      return <Text type="primary">{label}</Text>
    }
    return label
  }, [])

  const DraggableSelectItems = (): JSX.Element => {
    const draggableItems = useMemo(() => {
      return selectItems.map(item => ({
        ...item,
        itemValues: item.itemValues.map(itemValue => ({
          ...itemValue,
          id: uuidv4(),
        })),
      }))
    }, [selectItems])

    return (
      <>
        {draggableItems.map((item, index) => {
          if (item?.group) {
            return (
              <SelectGroup key={item.group}>
                <SelectLabel className="py-0 px-6 text-xs leading-[25px] text-text">
                  {item.group}
                </SelectLabel>
                <DraggableContainer
                  items={item.itemValues}
                  handleDragEnd={handleDragEnd!}
                >
                  {item.itemValues.map(itemValue => (
                    <DraggableCard
                      id={(
                        itemValue as SelectItemValuesProps & { id: string }
                      ).id.toString()}
                      key={itemValue.value}
                      cardClassName="p-1"
                    >
                      <SelectItem
                        {...touchHandler}
                        value={itemValue.value.toString()}
                        disabled={itemValue.disabled}
                        className={cn(
                          'text-base leading-none text-text min-h-8 py-2 px-4',
                          'data-[disabled]:text-text-subtle',
                          'data-[highlighted]:text-primary-subtle'
                        )}
                      >
                        {typeof itemValue.label === 'string'
                          ? getTextColor(itemValue.label, itemValue.status)
                          : itemValue.label}
                      </SelectItem>
                    </DraggableCard>
                  ))}
                </DraggableContainer>
                <SelectSeparator className="h-px bg-background-disabled my-1.5" />
              </SelectGroup>
            )
          }
          return (
            <DraggableContainer
              key={`draggable-no-group-${index}`}
              items={item.itemValues}
              handleDragEnd={handleDragEnd!}
            >
              {item.itemValues.map(itemValue => (
                <DraggableCard
                  id={(
                    itemValue as SelectItemValuesProps & { id: string }
                  ).id.toString()}
                  key={itemValue.value}
                  cardClassName="p-1"
                >
                  <SelectItem
                    {...touchHandler}
                    value={itemValue.value.toString()}
                    className={cn(
                      'text-base leading-none text-text min-h-8 py-2 px-4',
                      'data-[highlighted]:text-primary-subtle'
                    )}
                  >
                    {typeof itemValue.label === 'string'
                      ? getTextColor(itemValue.label, itemValue.status)
                      : itemValue.label}
                  </SelectItem>
                </DraggableCard>
              ))}
              <SelectSeparator className="h-px bg-background-disabled my-1.5" />
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
          if (item.group !== null && item.group !== undefined) {
            return (
              <SelectGroup key={`${item.group}${index}`}>
                <SelectLabel className="py-0 px-6 text-xs leading-[25px] text-text">
                  {item.group}
                </SelectLabel>
                {item.itemValues.map((itemValue, idx) => (
                  <SelectItem
                    key={`${itemValue.value}${idx}`}
                    value={itemValue.value.toString()}
                    disabled={itemValue.disabled}
                    {...touchHandler}
                    className={cn(
                      'text-base leading-none text-text min-h-8 py-2 px-4',
                      'data-[disabled]:text-text-subtle',
                      'data-[highlighted]:text-primary-subtle'
                    )}
                  >
                    {typeof itemValue.label === 'string'
                      ? getTextColor(itemValue.label, itemValue.status)
                      : itemValue.label}
                  </SelectItem>
                ))}
                <SelectSeparator className="h-px bg-background-disabled my-1.5" />
              </SelectGroup>
            )
          }

          return (
            <React.Fragment key={`no-group-${index}`}>
              {item.itemValues.map((itemValue, idx) => (
                <SelectItem
                  key={`${itemValue.value}${idx}`}
                  value={itemValue.value.toString()}
                  {...touchHandler}
                  className={cn(
                    'text-base leading-none text-text min-h-8 py-2 px-4',
                    'data-[highlighted]:text-primary-subtle'
                  )}
                >
                  {typeof itemValue.label === 'string'
                    ? getTextColor(itemValue.label, itemValue.status)
                    : itemValue.label}
                </SelectItem>
              ))}
              <SelectSeparator className="h-px bg-background-disabled my-1.5" />
            </React.Fragment>
          )
        })}
      </>
    )
  }

  const triggerVariantKey = disabled ? 'disabled' : triggerVariant

  return (
    <UiSelect value={currentSelect.toString()} onValueChange={onValueChange}>
      <SelectTrigger
        id={id ?? 'select-trigger'}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded px-4 text-base leading-none h-12 gap-1.5 bg-background border-2 border-background-layer-3 text-text shadow-sm whitespace-normal hover:bg-background-layer-3 hover:cursor-pointer focus:outline-none focus:shadow-[0_0_0_2px_hsl(var(--border))] data-[placeholder]:text-text disabled:cursor-not-allowed disabled:opacity-50',
          triggerVariantKey && triggerVariantClasses[triggerVariantKey],
          fullWidth && 'w-full'
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn(
          'overflow-hidden bg-background z-[1100]',
          'border border-border'
        )}
      >
        {draggable && handleDragEnd ? (
          <DraggableSelectItems />
        ) : (
          <NonDraggableSelectItems />
        )}
      </SelectContent>
    </UiSelect>
  )
}

export default SelectDefault
