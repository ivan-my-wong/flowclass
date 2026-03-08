import { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

const typeClasses = {
  plain: '',
  error: 'mt-2 text-warn text-sm font-bold',
  primary: 'text-primary',
  disabled: 'text-text-disabled pointer-events-none opacity-50',
  subtle: 'text-text-subtle',
}

const sizeClasses = {
  extraSmall: 'text-xs',
  small: 'text-sm',
  medium: 'text-base',
  mediumLarge: 'text-lg',
  large: 'text-xl',
  extraLarge: 'text-2xl',
}

type TextProps = {
  children?: React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  type?: keyof typeof typeClasses
  bold?: boolean
  noFlexShrink?: boolean
  size?: keyof typeof sizeClasses
  noWrap?: boolean
  className?: string
} & ComponentProps<'p'>

const Text = ({
  children,
  align = 'left',
  width,
  type = 'plain',
  bold,
  noFlexShrink,
  size,
  noWrap,
  className,
  style,
  ...props
}: TextProps): React.ReactElement => {
  return (
    <p
      className={cn(
        'm-0 p-0 text-sm leading-5',
        typeClasses[type],
        bold && 'font-bold',
        noFlexShrink && 'shrink-0',
        size && sizeClasses[size],
        noWrap && 'whitespace-nowrap',
        className
      )}
      style={{ textAlign: align, width, ...style }}
      {...props}
    >
      {children}
    </p>
  )
}

export default Text
