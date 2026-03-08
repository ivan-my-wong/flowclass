import { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/utils/cn'

type TextProps = {
  id?: string
  children?: React.ReactNode
  noWrap?: boolean
  align?: 'left' | 'center' | 'right'
  lineHeight?: `${number}`
  fontSize?: string
  bold?: boolean
  className?: string
  variant?: 'plain' | 'error' | 'primary' | 'disabled'
} & ComponentPropsWithoutRef<'p'>

const Text = ({
  id,
  children,
  lineHeight = '5',
  align,
  variant,
  className,
  noWrap,
  bold,
  ...props
}: TextProps) => {
  let variantClasses = ''

  if (variant) {
    if (variant === 'error') {
      variantClasses = 'text-warn mt-2 text-bold text-3'
    } else if (variant === 'primary') {
      variantClasses = 'text-primary'
    } else if (variant === 'disabled') {
      variantClasses = 'text-textDisabled'
    }
  }

  return (
    <p
      id={id}
      className={cn(
        `m-0 p-0 leading-${lineHeight} text-${align}`,
        className,
        variantClasses,
        bold ? 'font-bold' : '',
        noWrap ? 'whitespace-nowrap' : ''
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export default Text
