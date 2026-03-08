import useTranslation from 'next-translate/useTranslation'

import Box from '@/components/Containters/Box'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'

const ProvideCourseNotFound = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Box direction="col" className="min-h-[30rem]">
      <Heading align="center">{t('school:heading.providedCourse')}</Heading>
      <Text align="center">{t('school:noClass')}</Text>
    </Box>
  )
}

export default ProvideCourseNotFound
