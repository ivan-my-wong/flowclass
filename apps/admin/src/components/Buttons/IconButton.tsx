import { forwardRef } from 'react'

import { ComponentProps } from '@stitches/react'

import { styled } from '../../styles'

const StyledButton = styled('button', {
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  fontSize: '$medium',
  fontWeight: 'bold',
  borderRadius: '$round',
  color: '$background',
  backgroundColor: '$primary',
  lineHeight: 0,
  width: 'min-content',
  cursor: 'pointer',
  border: 'unset',

  '&:hover:enabled': {
    filter: 'brightness(0.9)',
  },
  '&:active:enabled': {
    filter: 'brightness(0.8)',
  },
  '&:focus': {
    focusOutline: '$borderColorPrimary',
  },
  '&:disabled': {
    color: '$textDisabled',
    backgroundColor: '$backgroundDisabled',
    pointerEvents: 'none',
  },

  variants: {
    hidden: {
      true: {
        display: 'none',
      },
    },
    size: {
      small: {
        padding: '$small',
        fontSize: '$small',
      },
      medium: {
        padding: '$small',
        fontSize: '$mediumLarge',
      },
      large: {
        padding: '$small',
        fontSize: '$large',
      },
    },
    color: {
      warn: {
        color: '$warn!important',
      },
      primary: {
        color: '$primary!important',
      },
    },
    plain: {
      true: {
        backgroundColor: 'unset',
        color: '$text',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

type IconButtonProps = {
  icon: React.ReactNode
  asChild?: boolean
  dataTestId?: string
} & ComponentProps<typeof StyledButton>

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ type = 'button', icon, asChild, dataTestId, ...rest }, ref) =>
    asChild ? (
      <>{icon}</>
    ) : (
      <StyledButton data-testid={dataTestId} {...rest} {...{ type, ref }}>
        {icon}
      </StyledButton>
    )
)

IconButton.displayName = 'IconButton'

export default IconButton
