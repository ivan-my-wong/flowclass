import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'

const InvalidInvitation = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Box className="h-full" direction="col">
      <Heading align="center">
        {t('onboarding:acceptInvite.errorToken')}
      </Heading>
      <Button
        className="my-8"
        onClick={() => {
          navigate('/login')
        }}
        variant="outline"
      >
        {t('onboarding:acceptInvite.backToLogin')}
      </Button>
    </Box>
  )
}

export default InvalidInvitation
