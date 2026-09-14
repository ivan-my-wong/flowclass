import { ComponentProps } from 'react'

import { styled } from '../../styles'

export const StyledText = styled('p', {
  margin: 0,
  padding: 0,
  fontSize: '$normal',
  lineHeight: '1.25rem',
  variants: {
    type: {
      plain: {},
      error: {
        marginTop: '$2 0',
        color: '$warn',
        fontSize: '$3',
        fontWeight: 700,
      },
      primary: {
        color: '$primary',
      },
      disabled: {
        color: '$textDisabled',
        pointerEvents: 'none',
        opacity: '0.5',
      },
      subtle: {
        color: '$textSubtle',
      },
    },
    bold: {
      true: {
        fontWeight: 700,
      },
    },
    noFlexShrink: {
      true: {
        flexShrink: 0,
      },
    },
    size: {
      extraSmall: {
        fontSize: '$extraSmall',
      },
      small: {
        fontSize: '$small',
      },
      medium: {
        fontSize: '$medium',
      },
      mediumLarge: {
        fontSize: '$mediumLarge',
      },
      large: {
        fontSize: '$large',
      },
      extraLarge: {
        fontSize: '$extraLarge',
      },
    },
    noWrap: {
      true: {
        whiteSpace: 'nowrap',
        // overflow: 'hidden',
        // textOverflow: 'ellipsis',
      },
    },
  },
})

type TextProps = {
  children?: React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  css?: ComponentProps<typeof StyledText>['css']
} & ComponentProps<typeof StyledText>

const Text = ({
  children,
  align = 'left',
  width,
  css,
  ...props
}: TextProps): React.ReactElement => {
  return (
    <StyledText css={{ textAlign: align, width, ...css }} {...props}>
      {children}
    </StyledText>
  )
}

export default Text
