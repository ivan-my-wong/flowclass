// write a boilerplate of a component named comingsoon box

import { useTranslation } from 'react-i18next'

import { styled } from '@/styles'

import Text from '../Texts/Text'
import Box from '../ui/Box'

const ComingSoonText = styled(Text, {
  position: 'absolute',
  left: '40%',
  top: '$4',
  padding: '$4',
  borderRadius: '$1',
  backgroundColor: '$tertiary',
  fontSize: '$6',
  zIndex: 999,
})

const ComingSoonBox = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box direction="col" className="opacity-50 pointer-events-none">
      <ComingSoonText>{t('common:description.comingSoon')}</ComingSoonText>
      {children}
    </Box>
  )
}

export default ComingSoonBox
