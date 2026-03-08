import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuLogOut } from 'react-icons/lu'

import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'

const SessionExist = (): JSX.Element => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Box gap="base" direction="col">
      <Text bold>{t('setting:userManagement.pleaseLogout')}</Text>
      <Button
        variant="destructive-outline"
        onClick={async () => {
          await logout()
          navigate('/login')
          window.location.reload()
        }}
      >
        <LuLogOut />
        <Text>{t(`component:menubar.logout`)}</Text>
      </Button>
    </Box>
  )
}

export default SessionExist
