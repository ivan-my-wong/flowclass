import useTranslation from 'next-translate/useTranslation'
import { FaGoogle } from 'react-icons/fa'
import { ImFacebook } from 'react-icons/im'

import Button from '../Buttons/Button'
import Box from '../Containters/Box'
import Text from '../Texts/Text'

const SocialLogin = ({ onSuccess }: { onSuccess?: (...args: any[]) => any }) => {
  // const { signInWithGoogle, signInWithFacebook, errorMessages } = useAuth()
  const { t } = useTranslation('login')

  // const handleGoogleSignIn = useCallback(async () => {
  //   const user = await signInWithGoogle()
  //   if (onSuccess !== undefined) {
  //     onSuccess(user)
  //   }
  // }, [signInWithGoogle, onSuccess])
  // const handleFacebookSignIn = useCallback(async () => {
  //   const user = await signInWithFacebook()
  //   if (onSuccess !== undefined) {
  //     onSuccess(user)
  //   }
  // }, [signInWithFacebook, onSuccess])

  return (
    <Box direction="col">
      <Button
        // onClick={handleGoogleSignIn}
        variant="outlined"
        className="text-text shadow-shadowColor w-full shadow-sm"
      >
        <div className="w-6">
          <FaGoogle />
        </div>
        <Text className="ml-2">{t('socialLogin.loginWithGoogle')}</Text>
      </Button>
      <Button
        //  onClick={handleFacebookSignIn}
        variant="outlined"
        className="text-text shadow-shadowColor w-full shadow-sm"
      >
        <div className="w-6">
          <ImFacebook />
        </div>
        <Text className="ml-2"> {t('socialLogin.loginWithFacebook')}</Text>
      </Button>
      {/* <Text className="text-primary mt-2 text-center text-sm font-bold">{errorMessages}</Text> */}
    </Box>
  )
}
export default SocialLogin
