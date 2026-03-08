import { forwardRef, HTMLAttributes, useMemo } from 'react'

import { cn } from '@/utils/cn'

export type BoxProps = {
  justify?: 'center' | 'between' | 'around' | 'start' | 'end'
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'center' | 'baseline' | 'stretch' | 'start' | 'end'
  gap?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'unset' | `${number}`
  padding?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | `${number}`
  border?: boolean
  responsive?: boolean
  children: React.ReactNode
  fitContent?: boolean
  className?: string
} & HTMLAttributes<HTMLDivElement>

const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      justify = 'center',
      direction = 'row',
      align = 'center',
      gap = '2',
      padding = '0',
      className = '',
      responsive,
      children,
      fitContent,
      border,
      ...props
    },
    ref
  ) => {
    const gapTransformation = useMemo(() => {
      const gapLookup = {
        sm: 'gap-2',
        base: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-10',
      }
      return gapLookup[gap as keyof typeof gapLookup] || `gap-${gap}`
    }, [gap])
    const paddingTransform = useMemo(() => {
      const paddingLookup = {
        sm: 'p-2',
        base: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-10',
      }
      return (
        paddingLookup[padding as keyof typeof paddingLookup] || `p-${padding}`
      )
    }, [padding])
    return (
      <div
        ref={ref}
        className={cn(
          `flex`,
          `flex-${direction}`,
          border && 'border rounded-md border-text-disabled',
          gapTransformation,
          paddingTransform,
          `justify-${justify}`,
          `items-${align}`,
          responsive && 'flex-col lg:flex-row',
          fitContent ? 'w-fit' : 'w-full',
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
