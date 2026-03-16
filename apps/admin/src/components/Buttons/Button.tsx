import { forwardRef } from 'react'

import { cn } from '@/utils/cn'

const variantClasses: Record<string, string> = {
  link: 'bg-transparent text-primary underline',
  text: 'bg-transparent text-text underline',
  outlined:
    'bg-transparent border-2 border-primary text-primary hover:bg-background-layer-2',
  outline:
    'bg-transparent border-2 border-border text-text hover:bg-background-layer-2',
  plain: 'bg-transparent text-primary',
  subtle: 'bg-transparent text-text-subtle font-normal hover:bg-background',
  ghost: 'bg-transparent text-text hover:bg-background-layer-2',
  reset:
    'bg-transparent text-text-subtle font-normal h-[38px] border border-background-layer-4 hover:bg-background',
  warn: 'bg-transparent border-2 border-warn text-warn',
  confirm: 'bg-success border-2 border-success text-white cursor-not-allowed',
  cancel:
    'bg-transparent border-transparent text-text hover:bg-background-layer-2',
  default: 'bg-transparent text-primary hover:bg-background',
  'primary-outline':
    'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
  'destructive-outline':
    'bg-transparent border-2 border-warn text-warn hover:bg-warn/10',
  destructive: 'bg-warn text-white hover:bg-warn/90',
}

const alignClasses: Record<string, string> = {
  left: 'mr-auto',
  center: 'm-auto',
  right: 'ml-auto',
}

const sizeClasses: Record<string, string> = {
  xs: 'h-8 px-2 rounded-sm text-sm',
  small: 'px-2 py-1',
  sm: 'h-9 px-3 rounded-md',
  medium: 'px-2 py-4',
  large: 'text-xl px-4 py-6',
}

export type ButtonProps = {
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  children?: React.ReactNode
  align?: 'left' | 'center' | 'right'
  variant?: keyof typeof variantClasses
  variants?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
  width?: 'full' | 'half'
  unsetHeight?: boolean
  convex?: boolean
  shadow?: boolean
  color?: 'secondary' | 'warn' | 'success'
  hidden?: boolean
  className?: string
} & React.ComponentProps<'button'>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      iconBefore,
      children,
      iconAfter,
      variant,
      variants: variantsProp,
      size = 'medium',
      align,
      width,
      unsetHeight,
      convex,
      shadow,
      color,
      hidden,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const variants = variant ?? variantsProp ?? 'default'
    const isDefaultVariant = !variants || variants === 'default'
    const baseStyles =
      isDefaultVariant && !color
        ? 'bg-primary text-background'
        : variantClasses[variants] || variantClasses.default

    return (
      <button
        ref={ref}
        type={type === 'submit' ? 'submit' : 'button'}
        className={cn(
          'box-border relative text-base font-bold rounded-md min-w-fit text-center leading-none cursor-pointer border-0',
          'flex items-center justify-center',
          'hover:enabled:brightness-90 active:enabled:brightness-[0.7]',
          'disabled:hover:bg-background-disabled disabled:text-background disabled:bg-background-disabled disabled:cursor-default disabled:border-0',
          baseStyles,
          color === 'secondary' && 'bg-secondary',
          color === 'warn' && 'bg-warn',
          color === 'success' && 'bg-success',
          align && alignClasses[align],
          size && sizeClasses[size],
          width === 'full' && 'w-full',
          width === 'half' && 'w-1/2',
          unsetHeight && 'h-auto',
          convex && 'border border-border border-b-[3px]',
          shadow && 'shadow-md',
          hidden && 'hidden',
          (iconBefore || iconAfter) && 'gap-1',
          className
        )}
        {...rest}
      >
        {iconBefore}
        {children}
        {iconAfter}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
