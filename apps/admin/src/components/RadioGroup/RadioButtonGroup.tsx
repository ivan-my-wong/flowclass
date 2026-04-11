import React from 'react'

import { DefaultTFuncReturn } from 'i18next'

import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { cn } from '@/utils/cn'

export type RadioItemProps = {
  value: string | string[]
  label: React.ReactElement | string | DefaultTFuncReturn
}

export type RadioGroupProps = {
  defaultValue?: string
  ariaLabel?: string
  itemValues: RadioItemProps[]
  onValueChange: (value: string) => any
  className?: string
  disabled?: boolean
}

const RadioButtonGroup = ({
  defaultValue,
  itemValues,
  ariaLabel,
  onValueChange,
  className,
  ...props
}: RadioGroupProps): React.ReactElement => (
  <RadioGroup
    defaultValue={defaultValue}
    aria-label={ariaLabel}
    onValueChange={onValueChange}
    className={cn('flex flex-col gap-2.5', className)}
    {...props}
  >
    {itemValues.map(item => {
      const value = Array.isArray(item.value)
        ? item.value.join(',')
        : item.value
      return (
        <div className="flex items-center space-x-2" key={value}>
          <RadioGroupItem id={value} value={value} />
          <Label htmlFor={value}>{item.label}</Label>
        </div>
      )
    })}
  </RadioGroup>
)

export default RadioButtonGroup
