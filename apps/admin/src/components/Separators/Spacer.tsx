import { styled } from '@/styles'

const Spacer = styled('div', {
  flex: 1,
  variants: {
    space: {
      y1: {
        margin: '$1 0',
      },
      y2: {
        margin: '$2 0',
      },
      y3: {
        margin: '$4 0',
      },
      y4: {
        margin: '$6 0',
      },
      y5: {
        margin: '$8 0',
      },
      y6: {
        margin: '$12 0',
      },
      x1: {
        margin: '0 $1',
      },
      x2: {
        margin: '0 $2',
      },
      x3: {
        margin: '0 $4',
      },
      x4: {
        margin: '0 $6',
      },
      x5: {
        margin: '0 $8',
      },
      x6: {
        margin: '0 $12',
      },
    },
  },
})

Spacer.displayName = 'Spacer'

export default Spacer
