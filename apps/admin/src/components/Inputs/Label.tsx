import { styled } from '../../styles'

export const Label = styled('p', {
  backgroundColor: 'transparent',
  color: '$text',
  fontWeight: 'bold',
  fontSize: '$normal',
  variants: {
    marginBottom: {
      medium: {
        marginBottom: '$medium',
      },
    },
  },
})

export default Label
