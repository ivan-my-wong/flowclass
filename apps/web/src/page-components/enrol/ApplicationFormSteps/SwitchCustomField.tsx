'use client'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import * as SwitchPrimitives from '@radix-ui/react-switch'
import clsx from 'clsx'

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitives.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & { label?: string; labelAfter?: string }
>(({ className, label, labelAfter, ...props }, ref) => (
  <div className="flex items-center justify-center">
    {label && <p className="input-label">{label}</p>}
    <SwitchPrimitives.Root
      className={clsx(
        'bg-backgroundLayer3 focus:shadow-shadowColor data-[state=checked]:bg-primary relative h-[25px] w-[42px] cursor-default rounded-full shadow-sm outline-none focus:shadow-[0_0_0_2px]',
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={clsx(
          'bg-background shadow-shadowColor block h-[21px] w-[21px] translate-x-0.5 rounded-full shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]'
        )}
      />
    </SwitchPrimitives.Root>
    {labelAfter && <p className="input-label">{labelAfter}</p>}
  </div>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch as SwitchCustomField }
