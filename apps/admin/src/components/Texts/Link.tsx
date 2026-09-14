import { styled } from '../../styles'

const StyledLink = styled('a', {
  margin: 0,
  padding: 0,
  fontSize: '$medium',
  width: '100%',
  color: '$primaryHighlight',
  '&:visited': {
    color: '$textHighlight',
  },
  overflowWrap: 'break-word',
  variants: {
    styled: {
      true: {
        cursor: 'pointer',
        textDecoration: 'underline',
      },
    },
    inline: {
      true: {
        width: 'unset',
      },
    },
  },
})

type LinkProps = {
  href: string
  align?: 'left' | 'center' | 'right'
  children?: React.ReactNode
} & React.ComponentProps<typeof StyledLink>

const Link = ({ href, children, align, ...rest }: LinkProps): JSX.Element => {
  return (
    <StyledLink css={{ textAlign: align }} {...rest} href={href} {...rest}>
      {children}
    </StyledLink>
  )
}
Link.displayName = 'Link'
export default Link
