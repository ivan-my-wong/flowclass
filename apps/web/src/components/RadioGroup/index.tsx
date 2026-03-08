import { ComponentProps } from 'react'

import { Indicator, Item, Root } from '@radix-ui/react-radio-group'

export type RadioItemProps = {
  value: string
  label: string
}

export type RadioGroupProps = {
  defaultValue?: string
  ariaLabel?: string
  itemValues: RadioItemProps[]
  onChange: (value: string) => any
} & ComponentProps<typeof Root>

export const radioItemClasses =
  'shadow-shadowColor hover:bg-primary-subtle bg-background focus:shadow-shadowColor h-[25px] w-[25px] cursor-default rounded-full shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px]'

export const radioIndicatorClasses =
  "after:bg-primary relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:content-['']"

const RadioGroup = ({
  defaultValue,
  itemValues,
  ariaLabel,
  onChange,
  ...props
}: RadioGroupProps) => (
  <Root
    className="flex flex-col gap-2.5"
    defaultValue={defaultValue}
    aria-label={ariaLabel}
    onValueChange={onChange}
    {...props}
  >
    {itemValues.map((item: RadioItemProps) => {
      return (
        <div className="flex flex-row justify-center" key={item.value}>
          <Item className={radioItemClasses} value={item.value} id={item.value}>
            <Indicator className={radioIndicatorClasses} />
          </Item>
          <p className="input-label">{item.label}</p>
        </div>
      )
    })}
  </Root>
)

export default RadioGroup
