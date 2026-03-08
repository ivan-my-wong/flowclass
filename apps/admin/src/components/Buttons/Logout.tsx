import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuLogOut } from 'react-icons/lu'

import useAuth from '@/hooks/useAuth'

import Text from '../Texts/Text'
import { Button, ButtonProps } from '../ui/Button'

const Logout = ({
  iconOnly,
  ...props
}: {
  iconOnly?: boolean
} & ButtonProps): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <Button
      variant="destructive-outline"
      onClick={async () => {
        await logout()
        navigate('/login')
        window.location.reload()
      }}
      className="justify-center"
      {...props}
    >
      {iconOnly ? (
        <LuLogOut />
      ) : (
        <>
          <LuLogOut />
          <Text>{t(`component:menubar.logout`)}</Text>
        </>
      )}
    </Button>
  )
}

export default Logout
