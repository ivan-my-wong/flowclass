import { forwardRef } from 'react'

import { cn } from '@/utils/cn'

const sizeClasses = {
  small: 'p-2 text-sm',
  medium: 'p-2 text-lg',
  large: 'p-2 text-xl',
}

type IconButtonProps = {
  icon: React.ReactNode
  asChild?: boolean
  dataTestId?: string
  hidden?: boolean
  size?: keyof typeof sizeClasses
  color?: 'warn' | 'primary'
  plain?: boolean
  className?: string
} & React.ComponentProps<'button'>

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      type = 'button',
      icon,
      asChild,
      dataTestId,
      hidden,
      size = 'medium',
      color,
      plain,
      className,
      ...rest
    },
    ref
  ) =>
    asChild ? (
      <>{icon}</>
    ) : (
      <button
        type={type === 'submit' ? 'submit' : 'button'}
        ref={ref}
        data-testid={dataTestId}
        className={cn(
          'box-border flex justify-center items-center relative font-bold rounded-full leading-none min-w-0 cursor-pointer border-0',
          'hover:enabled:brightness-90 active:enabled:brightness-[0.8]',
          'focus:outline focus:outline-2 focus:outline-border-primary',
          'disabled:text-text-disabled disabled:bg-background-disabled disabled:pointer-events-none',
          !plain && 'text-background bg-primary',
          plain && 'bg-transparent text-text',
          color === 'warn' && '!text-warn',
          color === 'primary' && '!text-primary',
          sizeClasses[size],
          hidden && 'hidden',
          className
        )}
        {...rest}
      >
        {icon}
      </button>
    )
)

IconButton.displayName = 'IconButton'

export default IconButton
