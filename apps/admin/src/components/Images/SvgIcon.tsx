import React from 'react'

import { ComponentProps } from '@stitches/react'

import { DataTestId } from '@/types/common'

import { styled, theme } from '../../styles'

// you can custom the active and inactive state icon color by passing the props

export interface ISvgIconType {
  fill?: string
  size?: string
  stroke?: string
}

const IconWrapper = styled('span', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    size: {
      extraSmall: {
        width: '0.5rem',
        height: '0.5rem',
      },
      small: {
        width: '0.75rem',
        height: '0.75rem',
      },
      smallMedium: {
        width: '1rem',
        height: '1rem',
      },
      medium: {
        width: '1.5rem',
        height: '1.5rem',
      },
      mediumLarge: {
        width: '2rem',
        height: '2rem',
      },
      large: {
        width: '2.5rem',
        height: '2.5rem',
      },
      extraLarge: {
        width: '3rem',
        height: '3rem',
      },
      fullScreen: {
        width: '100%',
        height: '100%',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

type SvgIconProps = {
  active?: boolean
  activeColor?: string
  baseColor?: string
  size?: string
  children: React.ReactNode
  stroke?: string
} & ComponentProps<typeof IconWrapper> &
  DataTestId

const SvgIcon: React.FC<SvgIconProps> = ({
  children,
  active,
  activeColor,
  baseColor,
  dataTestId,
  ...props
}) => {
  const getIconColor = () => {
    return active
      ? activeColor || theme.colors.textContrast.toString()
      : baseColor || theme.colors.textSubtle.toString()
  }
  return (
    <IconWrapper data-testid={dataTestId} {...props}>
      {children &&
        React.cloneElement(children as React.ReactElement<ISvgIconType>, {
          fill:
            React.isValidElement(children) && children.props.fill !== undefined
              ? children.props.fill
              : getIconColor(),
          size: '100%',
          stroke: props.stroke,
        })}
    </IconWrapper>
  )
}

export default SvgIcon
