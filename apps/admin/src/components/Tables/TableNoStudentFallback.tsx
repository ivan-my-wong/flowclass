import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import studentFallback from '@/assets/backgrounds/default_schema_education_centre.png'
import studentFallbackDark from '@/assets/backgrounds/default_schema_education_centre_dark.png'
import { darkModeState } from '@/stores/darkMode'

import ImageAspect from '../Images/ImageAspect'
import Text from '../Texts/Text'
import Box from '../ui/Box'
import { Button } from '../ui/Button'
// import { result } from "lodash-es";

const TableNoStudentFallback = () => {
  const { t } = useTranslation()
  const isDarkMode = useRecoilValue(darkModeState)
  const navigate = useNavigate()
  return (
    <Box direction="col">
      <ImageAspect
        ratio={4 / 3}
        width="50%"
        src={isDarkMode ? studentFallbackDark : studentFallback}
        alt="Flowclass"
      />
      <Text align="center">{t('student:noStudent')}</Text>
      <Button
        variant="outline"
        onClick={() => {
          navigate('/teaching-service/edit-course')
        }}
        className="mt-2"
      >
        {t('student:visitCourse')}
      </Button>
    </Box>
  )
}

export default TableNoStudentFallback
