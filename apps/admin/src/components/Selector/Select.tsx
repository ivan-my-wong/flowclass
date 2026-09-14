import { ComponentProps, forwardRef, useMemo } from 'react'

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'
// eslint-disable-next-line no-restricted-syntax
import * as SelectPrimitive from '@radix-ui/react-select'
import { styled } from '@stitches/react'
import { v4 as uuidv4 } from 'uuid'

import { DraggableCard, DraggableContainer } from '../Containers/Draggable'
import Text from '../Texts/Text'

const SelectTrigger = styled(SelectPrimitive.SelectTrigger, {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  padding: '0 $4',
  fontSize: '1rem',
  lineHeight: 1,
  height: '$12',
  gap: 5,
  backgroundColor: '$background',
  border: '2px solid $backgroundLayer3',
  color: '$text',
  boxShadow: '$1',
  whiteSpace: 'normal',
  '&:hover': { backgroundColor: '$backgroundLayer3', cursor: 'pointer' },
  '&:focus': { boxShadow: `0 0 0 2px $colors$borderColor` },
  '&[data-placeholder]': { color: '$text' },

  variants: {
    variant: {
      compact: {
        height: '$7',
        fontSize: '0.9rem',
        boxShadow: 'none',
        border: '2px solid $backgroundLayer3',
        '&:focus': { boxShadow: 'none' },
      },
      disabled: {
        backgroundColor: '$textDisabled',
        color: '$textSubtle',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: '$textDisabled',
          color: '$textSubtle',
          cursor: 'not-allowed!important',
          boxShadow: 'none',
        },
      },
    },
    fullWidth: {
      true: {
        width: '100%',
        padding: 'unset',
      },
    },
  },
})

const SelectIcon = styled(SelectPrimitive.SelectIcon, {
  color: '$text',
})

const SelectContent = styled(SelectPrimitive.Content, {
  overflow: 'hidden',
  backgroundColor: '$background',
  borderRadius: 6,
  zIndex: '$selectPopup',
})

const SelectViewport = styled(SelectPrimitive.Viewport, {
  padding: 5,
})

type SelectSingleProps = {} & ComponentProps<typeof StyledItem>

const SelectItem = forwardRef<HTMLDivElement, SelectSingleProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <StyledItem {...props} ref={forwardedRef}>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <StyledItemIndicator>
          <CheckIcon />
        </StyledItemIndicator>
      </StyledItem>
    )
  }
)

const StyledItem = styled(SelectPrimitive.Item, {
  fontSize: '1rem',
  lineHeight: 1,
  color: '$text',
  borderRadius: 3,
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: 'auto',
  minHeight: '2rem',
  padding: '$2 $4',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  '&[data-disabled]': {
    color: '$textSubtle',
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    outline: 'none',
    color: '$primarySubtle',
  },
})

const SelectLabel = styled(SelectPrimitive.Label, {
  padding: '0 25px',
  fontSize: 12,
  lineHeight: '25px',
  color: '$text',
})

const SelectSeparator = styled(SelectPrimitive.Separator, {
  height: 1,
  backgroundColor: '$backgroundDisabled',
  margin: 5,
})

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator, {
  position: 'absolute',
  left: 0,
  width: '$4',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const scrollButtonStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 25,
  backgroundColor: '$background',
  color: '$primary',
  cursor: 'default',
}

const SelectScrollUpButton = styled(
  SelectPrimitive.ScrollUpButton,
  scrollButtonStyles
)

const SelectScrollDownButton = styled(
  SelectPrimitive.ScrollDownButton,
  scrollButtonStyles
)

const StyledPortal = styled(SelectPrimitive.Portal, {
  zIndex: '$selectPopup',
  borderRadius: '$medium',
  border: `1px solid $colors$borderColor`,
})

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
      return <Text css={{ color: '$warn' }}>{label}</Text>
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
              // this is only for dnd kit
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
                <SelectLabel>{item.group}</SelectLabel>
                <DraggableContainer
                  items={item.itemValues}
                  handleDragEnd={handleDragEnd!}
                >
                  {item.itemValues.map(itemValue => {
                    return (
                      <DraggableCard
                        id={itemValue.id.toString()}
                        key={itemValue.value}
                        cardStyle={{
                          padding: '$1',
                        }}
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
                <SelectSeparator />
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
                  cardStyle={{
                    padding: '$1',
                  }}
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
              <SelectSeparator />
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
                <SelectLabel>{item.group}</SelectLabel>
                {item.itemValues.map((itemValue, index) => (
                  <SelectItem
                    key={`${itemValue.value}${index - 1}`}
                    value={itemValue.value.toString()}
                    disabled={itemValue.disabled}
                  >
                    {typeof itemValue.label === 'string'
                      ? getTextColor(itemValue.label, itemValue.status)
                      : itemValue.label}
                  </SelectItem>
                ))}
                <SelectSeparator />
              </SelectPrimitive.Group>
            )
          }

          return (
            <>
              {item.itemValues.map((itemValue, index) => (
                <SelectItem
                  key={`${itemValue.value}${index - 1}`}
                  value={itemValue.value.toString()}
                >
                  {typeof itemValue.label === 'string'
                    ? getTextColor(itemValue.label, itemValue.status)
                    : itemValue.label}
                </SelectItem>
              ))}
              <SelectSeparator />
            </>
          )
        })}
      </>
    )
  }

  const handleValueChange = (value: string) => {
    document.body.style.pointerEvents = 'auto'
    if (onValueChange) {
      onValueChange(value)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      document.body.style.pointerEvents = 'auto'
    }
  }

  return (
    <SelectPrimitive.Root
      onValueChange={handleValueChange}
      onOpenChange={handleOpenChange}
      value={currentSelect.toString()}
    >
      <SelectTrigger
        id={id ?? 'select-trigger'}
        variant={disabled ? 'disabled' : triggerVariant}
        fullWidth={fullWidth}
        disabled={disabled}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectIcon>
          <ChevronDownIcon />
        </SelectIcon>
      </SelectTrigger>
      <StyledPortal>
        <SelectContent>
          <SelectScrollUpButton>
            <ChevronUpIcon />
          </SelectScrollUpButton>
          <SelectViewport>
            {draggable && handleDragEnd ? (
              <DraggableSelectItems />
            ) : (
              <NonDraggableSelectItems />
            )}
          </SelectViewport>
          <SelectScrollDownButton>
            <ChevronDownIcon />
          </SelectScrollDownButton>
        </SelectContent>
      </StyledPortal>
    </SelectPrimitive.Root>
  )
}

export default SelectDefault
