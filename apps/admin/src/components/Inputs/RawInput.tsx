import { styled } from '../../styles'

const RawInput = styled('input', {
  padding: '$small',
  width: '100%',
  borderRadius: '$medium',
  outline: 'none',
  backgroundColor: '$background',
  border: `1px solid $colors$borderColor`,
  color: '$text',
  caretColor: '$text',
  '&:hover:enabled, &:focus:enabled': {
    borderColor: '$borderColor',
  },
  '&:focus:enabled': {
    focusOutline: '$primary',
  },
  '&::placeholder': {
    color: '$textSubtle',
  },
  '&:disabled': {
    backgroundColor: '$backgroundDisabled',
  },

  '&[type=password]': {
    fontFamily: 'Verdana',
    letterSpacing: '0.125rem',
  },

  variants: {
    variants: {
      line: {
        border: 'unset',
        borderRadius: 'unset',
        backgroundColor: 'unset',
        borderBottom: '1px solid $colors$text',
      },
      border: {
        border: '1px solid $backgroundLayer4',
        borderRadius: '$small',
        backgroundColor: 'unset',
        height: '38px',
      },
    },
    error: {
      true: {
        borderColor: '$secondary',
        '&:hover:enabled, &:focus:enabled': {
          borderColor: '$secondary',
        },
      },
    },
  },
})

export default RawInput
