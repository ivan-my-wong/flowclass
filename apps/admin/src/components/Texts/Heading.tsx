import { ComponentProps } from 'react'

import { styled } from '../../styles'

const StyledHeading = styled('h2', {
  width: '100%',
  margin: '$small auto',
  padding: 0,
  fontWeight: 'bold',
  lineHeight: '1.75rem',
  fontSize: '$large',

  variants: {
    size: {
      small: {
        fontSize: '$medium',
        lineHeight: '$5',
      },
      smallMedium: {
        fontSize: '$mediumLarge',
      },
      medium: {
        fontSize: '$large',
      },
      large: {
        fontSize: '$extraLarge',
        lineHeight: '2.5rem',
      },
    },
    bold: {
      true: {
        fontWeight: 'bold',
      },
    },
    align: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
    },
    noGutter: {
      true: {
        marginBottom: '-$1',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

type HeadingProps = {
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  align?: 'left' | 'center' | 'right'
} & ComponentProps<typeof StyledHeading>

const Heading = ({
  children,
  as = 'h2',
  align,
  css,
  ...props
}: HeadingProps): JSX.Element => {
  return (
    <StyledHeading as={as} css={{ textAlign: align, ...css }} {...props}>
      {children}
    </StyledHeading>
  )
}
export default Heading
