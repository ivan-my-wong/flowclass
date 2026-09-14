import { Root } from '@radix-ui/react-separator'
import { ComponentProps, styled } from '@stitches/react'

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  margin?: 'small' | 'medium' | 'large'
  thickness?: 'small' | 'medium' | 'large'
} & ComponentProps<typeof SeparatorRoot>

const Separator = (props: SeparatorProps) => <SeparatorRoot {...props} />

const SeparatorRoot = styled(Root, {
  backgroundColor: '$textDisabled',
  '&[data-orientation=horizontal]': { height: 1, width: '100%' },
  '&[data-orientation=vertical]': { height: '100%', width: 1 },
  variants: {
    margin: {
      small: { margin: '$1 0' },
      medium: { margin: '$2 0' },
      large: { margin: '$4 0' },
    },
    thickness: {
      small: { padding: '0.5px 0' },
      medium: { padding: '1px 0' },
      large: { padding: '2px 0' },
    },
  },
})

export default Separator
