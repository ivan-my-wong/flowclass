import { ComponentProps, forwardRef } from 'react'

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as Select from '@radix-ui/react-select'
import { clsx } from 'clsx'

import Text from '../Texts/Text'

type SelectSingleProps = ComponentProps<typeof Select.Item>

const selectItemClasses =
  'relative text-text radix-disabled:text-textSubtle radix-disabled:pointer-events-none radix-highlighted:outline-none radix-highlighted:bg-background radix-highlighted:text-primary-subtle flex cursor-pointer select-none items-center p-1 transition-colors duration-200 ease-in-out'

const SelectItem = forwardRef<HTMLDivElement, SelectSingleProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <Select.Item className={selectItemClasses} {...props} ref={forwardedRef}>
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="align-center absolute left-0 inline-flex w-6 justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    )
  }
)

SelectItem.displayName = 'SelectItem'

// selectItems format: [{label: string, values: [number | string]}]
export type SelectItemValuesProps = {
  label: string
  value: string
  highlight?: boolean
}

export type SelectItemsProps = {
  group?: string
  itemValues: SelectItemValuesProps[]
}

export type SelectInputProps = {
  placeholder: SelectItemValuesProps
  selectItems: SelectItemsProps[]
  currentSelect: SelectItemValuesProps
  fullWidth?: boolean
  className?: string
  onValueChange: (value: any) => void
}

const selectLabelClasses = 'py-5 text-3 leading-6 text-text'
const selectSeparatorClasses = 'h-0.5 bg-backgroundDisabled my-1'
const selectScrollDownButtonClasses = clsx(
  'flex',
  'align-center',
  'justify-center',
  'h-6',
  'mt-1',
  'bg-background',
  'text-primary',
  'cursor-default',
  'fill-current'
)

export const SelectDefault = forwardRef<HTMLInputElement, SelectInputProps>(
  (
    { placeholder, selectItems, currentSelect, fullWidth = false, className, onValueChange },
    ref
  ) => {
    return (
      <Select.Root onValueChange={onValueChange} value={currentSelect.value}>
        <Select.Trigger
          className={clsx(
            fullWidth ? 'w-full' : '',
            'text-text',
            'hover:bg-backgroundLayer3',
            'radix-[placeholder]:text-textSubtle',
            'bg-background',
            'shadow-shadowColor',
            'focus:shadow-shadowColorHighlight',
            'border-textDisabled',
            'inline-flex',
            'h-10',
            'items-center',
            'justify-center',
            'gap-1',
            'rounded',
            'border',
            'px-4',
            'leading-none',
            'shadow-[0_2px_10px]',
            'focus:shadow-[0_0_0_2px]'
          )}
        >
          <Select.Value placeholder={placeholder.label} className="shrink-0">
            <p className="break-keep">{currentSelect.label}</p>
          </Select.Value>
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className={`bg-background border-textDisabled rounded border shadow-sm ${className} z-30 px-2`}
            position="popper"
            sideOffset={5}
          >
            <Select.ScrollUpButton className={selectScrollDownButtonClasses}>
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport className="max-h-[50vh] p-1">
              {selectItems.map(group => {
                if (group.group !== null) {
                  return (
                    <Select.Group key={`item-${group.group}`}>
                      <Select.Label className={selectLabelClasses}>{group.group}</Select.Label>
                      {group.itemValues.map(item => (
                        <Select.Item
                          className={selectItemClasses}
                          key={`sub-item-${item.value}`}
                          value={item.value.toString()}
                          ref={ref}
                        >
                          {item.highlight ? (
                            <Text variant="primary">{item.label}</Text>
                          ) : (
                            item.label
                          )}
                        </Select.Item>
                      ))}
                      <Select.Separator className={selectSeparatorClasses} />
                    </Select.Group>
                  )
                }
                return (
                  <div key={`item-${group.itemValues[0]?.value}`}>
                    {/* <Select.Label className={selectLabelClasses}>{group.group}</Select.Label> */}
                    {group.itemValues.map(item => (
                      <SelectItem
                        key={`sub-item-${item.value}`}
                        value={item.value.toString()}
                        ref={ref}
                      >
                        {item.highlight ? <Text variant="primary">{item.label}</Text> : item.label}
                      </SelectItem>
                    ))}
                    <Select.Separator className={selectSeparatorClasses} />
                  </div>
                )
              })}
            </Select.Viewport>
            <Select.ScrollDownButton className={selectScrollDownButtonClasses}>
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    )
  }
)

export default SelectDefault

SelectDefault.displayName = 'SelectDefault'
