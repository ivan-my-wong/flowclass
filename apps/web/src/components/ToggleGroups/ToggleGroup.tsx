import { forwardRef } from 'react'

import { Item, Root } from '@radix-ui/react-toggle-group'

type SelectItemValuesProps = { label: string; value: string }

export type ToggleGroupProps = {
  defaultValue: string
  items: SelectItemValuesProps[]
  onChange: (value: any) => void
}

const toggleGroupItemClasses =
  'hover:bg-primary-subtle cusor-pointer flex h-8 shadow-sm py-2 px-4 items-center justify-center my-2 leading-4 text-textContrast data-[state=on]:bg-primary data-[state=on]:text-background flex h-[35px] w-[35px] items-center justify-center bg-backgroundLayer2 text-base leading-4 first:rounded-l last:rounded-r focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-shadowColor focus:outline-none'

const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ defaultValue, items, onChange, ...rest }, ref) => {
    return (
      <Root
        ref={ref}
        type="single"
        {...rest}
        value={defaultValue}
        className="flex w-full flex-col flex-wrap rounded-sm"
      >
        {items.map((item: SelectItemValuesProps) => (
          <Item
            className={toggleGroupItemClasses}
            key={item.value}
            value={item.value}
            aria-label={item.value}
            onClick={() => {
              onChange({ value: item.value, label: item.label })
            }}
          >
            <div>{item.label}</div>
          </Item>
        ))}
      </Root>
    )
  }
)

export default ToggleGroup

ToggleGroup.displayName = 'ToggleGroup'
