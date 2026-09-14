import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import GoogleIcon from '@/assets/svgs/GoogleIcon'
import FacebookIcon from '@/assets/svgs/socialMedia/FacebookIcon'
import useAuth from '@/hooks/useAuth'
import { styled } from '@/styles'

import SvgIcon from '../Images/SvgIcon'
import { Spinner } from '../Loaders/Spinner'
import Text from '../Texts/Text'
import Box from '../ui/Box'
import { Button } from '../ui/Button'

const SocialLogin = ({
  onSuccess = () => {},
  isFacebookEnabled = false,
}: {
  onSuccess?: (...args: any[]) => any
  isFacebookEnabled?: boolean
}): JSX.Element => {
  const {
    isLoadingFacebook,
    isLoadingGoogle,
    signInWithGoogle,
    signInWithFacebook,
    errorMessages,
  } = useAuth()
  const { t } = useTranslation(['login'])

  const handleGoogleSignIn = useCallback(async () => {
    const user = await signInWithGoogle()
    if (onSuccess !== null) {
      onSuccess(user)
    }
  }, [signInWithGoogle, onSuccess])

  const handleFacebookSignIn = useCallback(async () => {
    const user = await signInWithFacebook()
    if (onSuccess !== null) {
      onSuccess(user)
    }
  }, [signInWithFacebook, onSuccess])

  return (
    <Box direction="col" padding="0">
      <Button
        onClick={handleGoogleSignIn}
        size="md"
        variant="outline"
        className="w-full text-text border-text-subtle hover:bg-background-layer-2"
      >
        {isLoadingGoogle ? (
          <Spinner size="small" />
        ) : (
          <>
            <SvgIcon>
              <GoogleIcon />
            </SvgIcon>
            <LoginText>{t('socialLogin.loginWithGoogle')}</LoginText>
          </>
        )}
      </Button>
      {isFacebookEnabled && (
        <Button
          onClick={handleFacebookSignIn}
          size="md"
          variant="outline"
          className="w-full text-text border-text-subtle hover:bg-background-layer-2"
        >
          {isLoadingFacebook ? (
            <Spinner size="small" />
          ) : (
            <>
              <SvgIcon>
                <FacebookIcon />
              </SvgIcon>
              <LoginText> {t('socialLogin.loginWithFacebook')}</LoginText>
            </>
          )}
        </Button>
      )}
      <ErrorText style={{ textAlign: 'center' }}>{errorMessages}</ErrorText>
    </Box>
  )
}
export default SocialLogin

const ErrorText = styled(Text, {
  marginTop: '$2',
  textAlign: 'center',
  color: '$primary',
  fontSize: '$2',
  fontWeight: 700,
})

const LoginText = styled(Text, {
  marginLeft: '$2',
  fontWeight: 500,
  letterSpacing: '0.3px',
})
