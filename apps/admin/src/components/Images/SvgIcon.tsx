import React from 'react'

import { DataTestId } from '@/types/common'
import { cn } from '@/utils/cn'

export interface ISvgIconType {
  fill?: string
  size?: string
  stroke?: string
}

const sizeClasses: Record<string, string> = {
  extraSmall: 'w-2 h-2',
  small: 'w-3 h-3',
  smallMedium: 'w-4 h-4',
  medium: 'w-6 h-6',
  mediumLarge: 'w-8 h-8',
  large: 'w-10 h-10',
  extraLarge: 'w-12 h-12',
  fullScreen: 'w-full h-full',
}

type SvgIconProps = {
  active?: boolean
  activeColor?: string
  baseColor?: string
  size?: keyof typeof sizeClasses | string
  children: React.ReactNode
  stroke?: string
  className?: string
} & DataTestId

const SvgIcon: React.FC<SvgIconProps> = ({
  children,
  active,
  activeColor,
  baseColor,
  dataTestId,
  size = 'medium',
  className,
  ...props
}) => {
  const getIconColor = () => {
    if (activeColor) return activeColor
    if (baseColor) return baseColor
    return 'currentColor'
  }

  const colorClass = active ? 'text-text-contrast' : 'text-text-subtle'
  const sizeClass =
    typeof size === 'string' && size in sizeClasses
      ? sizeClasses[size]
      : sizeClasses.medium

  return (
    <span
      data-testid={dataTestId}
      className={cn(
        'flex items-center justify-center',
        sizeClass,
        !activeColor && !baseColor && colorClass,
        className
      )}
    >
      {children &&
        React.cloneElement(children as React.ReactElement<ISvgIconType>, {
          fill:
            React.isValidElement(children) && children.props.fill !== undefined
              ? children.props.fill
              : getIconColor(),
          size: '100%',
          stroke: props.stroke,
        })}
    </span>
  )
}

export default SvgIcon
