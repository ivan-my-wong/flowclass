import { forwardRef, HTMLAttributes } from 'react'

type BoxProps = {
  justify?: 'center' | 'between' | 'around' | 'start' | 'end'
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'center' | 'baseline' | 'stretch' | 'start' | 'end'
  gap?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'unset' | `${number}`
  padding?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | `${number}`
  responsive?: boolean
  children: React.ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>

const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      justify = 'center',
      direction = 'row',
      align = 'center',
      gap = '2',
      padding = '2',
      className = '',
      responsive,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`flex flex-${direction} w-full gap-${gap} p-${padding} justify-${justify} items-${align} ${
          responsive ? 'flex-col lg:flex-row' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Box.displayName = 'Box'

export default Box
