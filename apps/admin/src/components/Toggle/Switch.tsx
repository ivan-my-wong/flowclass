import { forwardRef } from 'react'

import { Root, SwitchProps, Thumb } from '@radix-ui/react-switch'
import { DefaultTFuncReturn } from 'i18next'

import { cn } from '@/utils/cn'

import Box from '../ui/Box'

type ThisSwitchProps = {
  checked: boolean
  dataTestId?: string
  onCheckedChange: (value: boolean) => void
  label?: string | DefaultTFuncReturn
  disabled?: boolean
  className?: string
  textClassName?: string
} & SwitchProps &
  Omit<React.ComponentProps<typeof Box>, 'children'>

const Switch = forwardRef<HTMLDivElement, ThisSwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      label,
      disabled,
      className,
      textClassName,
      dataTestId,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          'flex flex-row items-center justify-center gap-2 p-0 w-full',
          className
        )}
      >
        {!!label && (
          <p
            className={cn(
              'w-[40%] text-sm font-bold mr-2 shrink-0',
              textClassName
            )}
          >
            {label}
          </p>
        )}
        <Root
          checked={checked}
          disabled={disabled}
          data-testid={dataTestId}
          onCheckedChange={onCheckedChange}
          className={cn(
            'w-[42px] h-[25px] bg-background-layer-3',
            'border-2 border-background rounded-full relative shadow-md',
            '[-webkit-tap-highlight-color:rgba(0,0,0,0)]',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'data-[state=checked]:bg-primary',
            'data-[disabled]:bg-background-layer-3 data-[disabled]:border-background-layer-2'
          )}
        >
          <Thumb
            className={cn(
              'block w-[21px] h-[21px] bg-white rounded-full',
              'shadow-[0_2px_2px_hsl(var(--border))]',
              'transition-transform duration-100 translate-x-0.5',
              'data-[state=checked]:translate-x-[19px]'
            )}
          />
        </Root>
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export default Switch
