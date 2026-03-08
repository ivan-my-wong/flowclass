/* eslint-disable jsx-a11y/label-has-associated-control */
import { forwardRef, HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

const gapClasses = {
  none: 'gap-0',
  small: 'gap-2',
  medium: 'gap-4',
  large: 'gap-8',
}

const paddingClasses = {
  none: 'p-0',
  small: 'p-2',
  medium: 'p-4',
  large: 'p-8',
}

type BoxProps = {
  justify?:
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'flex-start'
    | 'flex-end'
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  align?:
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'flex-start'
    | 'flex-end'
  children: React.ReactNode
  responsive?: boolean
  fitContent?: boolean
  rounded?: boolean
  wrap?: boolean
  gap?: keyof typeof gapClasses
  padding?: keyof typeof paddingClasses
  className?: string
} & HTMLAttributes<HTMLDivElement>

const justifyClasses: Record<string, string> = {
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
}

const directionClasses: Record<string, string> = {
  row: 'flex-row',
  column: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'column-reverse': 'flex-col-reverse',
}

const alignClasses: Record<string, string> = {
  center: 'items-center',
  'space-between': 'items-between',
  'space-around': 'items-around',
  'flex-start': 'items-start',
  'flex-end': 'items-end',
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      justify = 'center',
      direction = 'row',
      align = 'center',
      children,
      responsive,
      fitContent,
      rounded,
      wrap,
      gap = 'small',
      padding = 'none',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full',
          justifyClasses[justify] || 'justify-center',
          directionClasses[direction] || 'flex-row',
          alignClasses[align] || 'items-center',
          gapClasses[gap],
          paddingClasses[padding],
          responsive && 'flex-col md:flex-row',
          fitContent && 'w-fit',
          rounded && 'rounded-lg',
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Box.displayName = 'Box'

export default Box
