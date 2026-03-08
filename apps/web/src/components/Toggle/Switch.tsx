import { ComponentPropsWithRef, forwardRef } from 'react'

import { Root, Thumb } from '@radix-ui/react-switch'

import { cn } from '@/utils/cn'

type ThisSwitchProps = {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  label?: string
  labelAfter?: string
} & ComponentPropsWithRef<'div'>

export const Switch = forwardRef<HTMLDivElement, ThisSwitchProps>(
  ({ checked, onCheckedChange, label, labelAfter, className, ...props }, ref) => {
    return (
      <div className={cn('flex items-center justify-center', className)} {...props} {...ref}>
        {label && <p className="input-label">{label}</p>}
        <Root
          className="bg-backgroundLayer3 focus:shadow-shadowColor data-[state=checked]:bg-primary relative h-[25px] w-[42px] cursor-default rounded-full shadow-[0_2px_10px] shadow-sm outline-none focus:shadow-[0_0_0_2px]"
          checked={checked}
          onCheckedChange={onCheckedChange}
        >
          <Thumb className="bg-background shadow-shadowColor block h-[21px] w-[21px] translate-x-0.5 rounded-full shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
        </Root>
        {labelAfter && <p className="input-label mb-0">{labelAfter}</p>}
      </div>
    )
  }
)

export default Switch

Switch.displayName = 'Switch'
