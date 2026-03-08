import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

import Text from '../Texts/Text'

import Box from './Box'

const ComingSoonBox = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box direction="column" className="opacity-50 pointer-events-none">
      <Text
        className={cn(
          'absolute left-[40%] top-4 p-4 rounded bg-tertiary text-2xl z-[999]'
        )}
      >
        {t('common:description.comingSoon')}
      </Text>
      {children}
    </Box>
  )
}

export default ComingSoonBox
