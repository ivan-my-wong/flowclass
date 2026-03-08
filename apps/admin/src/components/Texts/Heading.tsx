import { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

const sizeClasses = {
  small: 'text-base leading-5',
  smallMedium: 'text-lg',
  medium: 'text-xl',
  large: 'text-2xl leading-10',
}

type HeadingProps = {
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  align?: 'left' | 'center' | 'right'
  size?: keyof typeof sizeClasses
  bold?: boolean
  noGutter?: boolean
} & Omit<ComponentProps<'h2'>, 'size'>

const Heading = ({
  children,
  as: Component = 'h2',
  align,
  size = 'medium',
  bold = true,
  noGutter,
  className,
  ...props
}: HeadingProps): JSX.Element => {
  return (
    <Component
      className={cn(
        'w-full my-2 mx-auto p-0 font-bold leading-7 text-xl',
        sizeClasses[size],
        bold && 'font-bold',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        noGutter && '-mb-1',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
export default Heading
