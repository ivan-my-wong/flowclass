import { forwardRef } from 'react'

import { Root, SwitchProps, Thumb } from '@radix-ui/react-switch'
import { ComponentProps } from '@stitches/react'
import { DefaultTFuncReturn } from 'i18next'

import { styled } from '@/styles'
import { cn } from '@/utils/cn'

import Box from '../ui/Box'

const SwitchRoot = styled(Root, {
  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: '$backgroundLayer3',
  border: '2px solid $colors$background',
  borderRadius: '9999px',
  position: 'relative',
  boxShadow: `$2`,
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': { boxShadow: `0 0 0 2px $colors$primary` },
  '&[data-state="checked"]': { backgroundColor: '$primary' },
  '&[data-disabled]': {
    backgroundColor: '$backgroundLayer3',
    borderColor: '$backgroundLayer2',
  },
})

const SwitchThumb = styled(Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: 'white',
  borderRadius: '9999px',
  boxShadow: `0 2px 2px $colors$shadowColor`,
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
})

type ThisSwitchProps = {
  checked: boolean
  dataTestId?: string
  onCheckedChange: (value: boolean) => void
  label?: string | DefaultTFuncReturn
  disabled?: boolean
  className?: string
  textClassName?: string
} & SwitchProps &
  Omit<ComponentProps<typeof Box>, 'children'>

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
        {...props}
        {...ref}
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
        <SwitchRoot
          checked={checked}
          disabled={disabled}
          data-testid={dataTestId}
          onCheckedChange={onCheckedChange}
        >
          <SwitchThumb />
        </SwitchRoot>
      </div>
    )
  }
)

export default Switch
