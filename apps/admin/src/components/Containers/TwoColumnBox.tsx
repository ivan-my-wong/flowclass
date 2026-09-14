import { styled } from '../../styles'

import Box from './Box'

const StyledLeftBox = styled('div', {
  width: '30%',
  maxWidth: '40%',
  justifyContent: 'flex-start',
  display: 'flex',

  fontSize: '$medium',

  '@sm': {
    width: '50%',
    maxWidth: 'unset',
  },
})

const StyledRightBox = styled('div', {
  width: '70%',
  maxWidth: '60%',
  justifyContent: 'flex-start',
  display: 'flex',
  fontSize: '$medium',

  '@sm': {
    width: '50%',
    maxWidth: 'unset',
    justifyContent: 'flex-end',
  },
})

const TwoColumnBox = ({
  leftColumn,
  rightColumn,
}: {
  leftColumn: JSX.Element
  rightColumn: JSX.Element
}): JSX.Element => {
  return (
    <Box
      justify="flex-start"
      css={{
        '@sm': {
          justifyContent: 'space-between',
        },
      }}
    >
      <StyledLeftBox>{leftColumn}</StyledLeftBox>
      <StyledRightBox>{rightColumn}</StyledRightBox>
    </Box>
  )
}

export default TwoColumnBox
