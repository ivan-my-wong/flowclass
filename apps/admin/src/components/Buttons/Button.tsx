import { forwardRef } from 'react'

import { ComponentProps } from '@stitches/react'

import { styled, theme } from '@/styles'
import { cn } from '@/utils/cn'

const StyledButton = styled('button', {
  boxSizing: 'border-box',
  position: 'relative',
  fontSize: '$medium',
  fontWeight: 'bold',
  borderRadius: '$medium',
  color: '$background',
  backgroundColor: '$primary',
  minWidth: 'fit-content',
  textAlign: 'center',
  lineHeight: 1,
  cursor: 'pointer',
  flexRowCenter: 'center',
  border: 'unset',

  '&:hover:enabled': {
    filter: 'brightness(0.9)',
  },
  '&:active:enabled': {
    filter: 'brightness(0.7)',
  },
  // '&:focus': {
  //   focusOutline: '$borderColorPrimary',
  // },
  '&:disabled': {
    '&:hover': {
      backgroundColor: '$backgroundDisabled',
    },
    color: '$background',
    backgroundColor: '$backgroundDisabled',
    cursor: 'unset',
    border: 'unset',
  },

  variants: {
    align: {
      left: {
        marginRight: 'auto',
      },
      center: {
        margin: 'auto',
      },
      right: {
        marginLeft: 'auto',
      },
    },
    variants: {
      link: {
        backgroundColor: 'transparent',
        color: '$primary',
        textDecoration: 'underline',
      },

      text: {
        backgroundColor: 'transparent',
        color: '$text',
        textDecoration: 'underline',
      },

      outlined: {
        backgroundColor: 'transparent',
        border: `2px solid $colors$primary`,
        color: '$primary',

        '&:hover': {
          backgroundColor: '$backgroundLayer2',
        },
      },

      plain: {
        backgroundColor: 'transparent',
        color: '$primary',
      },

      subtle: {
        backgroundColor: 'transparent',
        color: '$textSubtle',
        fontWeight: 'normal',
        '&:hover': {
          backgroundColor: '$background',
        },
      },

      reset: {
        backgroundColor: 'transparent',
        color: '$textSubtle',
        fontWeight: 'normal',
        height: '38px',
        border: '1px solid $backgroundLayer4',
        '&:hover': {
          backgroundColor: '$background',
        },
      },

      warn: {
        backgroundColor: 'transparent',
        border: '2px solid',
        borderColor: '$warn',
        color: '$warn',
      },

      confirm: {
        backgroundColor: '$success',
        border: '2px solid',
        borderColor: '$success',
        color: 'white',
        cursor: 'not-allowed',
      },

      cancel: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: '$text',
        '&:hover': {
          backgroundColor: '$backgroundLayer2',
        },
      },

      default: {
        backgroundColor: 'transparent',
        color: '$primary',
        '&:hover': {
          backgroundColor: '$background',
        },
      },
    },

    width: {
      full: {
        width: '100%',
      },
      half: {
        width: '50%',
      },
    },

    size: {
      small: {
        padding: '$min $small',
      },
      medium: {
        padding: '$small $medium',
      },
      large: {
        fontSize: '1.2rem',
        padding: '$normal $large',
      },
    },

    unsetHeight: {
      true: {
        height: 'unset',
      },
    },

    convex: {
      true: {
        borderStyle: 'solid',
        borderColor: '$borderColor',
        borderWidth: '1px 1px 3px',
      },
    },
    shadow: {
      true: {
        boxShadow: `${theme.shadows[1]} !important`,
      },
    },
    color: {
      secondary: {
        backgroundColor: '$secondary',
      },
      warn: {
        backgroundColor: '$warn',
      },
      success: {
        backgroundColor: '$success',
      },
    },
    hidden: {
      true: {
        display: 'none',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
    convex: false,
  },
})

export type ButtonProps = {
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  children?: React.ReactNode
  align?: 'left' | 'center' | 'right'
} & ComponentProps<typeof StyledButton>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ iconBefore, children, iconAfter, ...rest }, ref) => {
    return iconBefore || iconAfter ? (
      <StyledButton className={cn('flex gap-x-1')} {...rest} {...ref}>
        {iconBefore}
        {children} {iconAfter}
      </StyledButton>
    ) : (
      <StyledButton {...rest} {...ref}>
        {children}
      </StyledButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
