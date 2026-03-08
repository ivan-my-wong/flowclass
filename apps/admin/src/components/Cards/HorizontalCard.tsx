import React from 'react'

import { cn } from '@/utils/cn'

type HorizontalBaseCardProps = {
  children: JSX.Element
  width?: string
  height?: string
  cursor?: string
  opacity?: string
  direction?: 'column' | 'row'
  columns?: 1 | 2 | 3 | 'default'
  className?: string
  style?: React.CSSProperties
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onClick?: () => void
}

const HorizontalBaseCard = ({
  children,
  width,
  height,
  cursor,
  opacity,
  direction = 'row',
  columns = 'default',
  className,
  style,
  ...props
}: HorizontalBaseCardProps): JSX.Element => {
  const getColumnClass = () => {
    switch (columns) {
      case 1:
        return 'w-full'
      case 2:
        return 'w-[48%] lg:w-[48%] md:w-full'
      case 3:
        return 'w-[32%] lg:w-[48%] md:w-full'
      default:
        return 'w-[48%] lg:w-[48%] md:w-full'
    }
  }

  const getDirectionClass = () => {
    if (direction === 'column' && columns === 2) {
      return 'w-full'
    }
    return ''
  }

  return (
    <div
      className={cn(
        'rounded-lg flex p-4 flex-col justify-between cursor-pointer relative',

        'transition-transform duration-300 ease-in-out',

        'hover:scale-[1.02] hover:cursor-pointer',

        // pseudo-element style - using before: to achieve gradient effect
        'before:content-[""] before:absolute before:inset-0',
        'before:bg-gradient-to-br before:from-white/80 before:to-transparent',
        'before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100',

        // responsive style
        'md:flex-col md:p-4',

        // columns width
        getColumnClass(),

        getDirectionClass(),
        className
      )}
      style={{ width, height, cursor, opacity, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

export default HorizontalBaseCard
