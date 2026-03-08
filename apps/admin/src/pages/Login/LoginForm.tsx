import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { Spinner } from '@/components/Loaders/Spinner'
import Link from '@/components/Texts/Link'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import useAuth from '@/hooks/useAuth'
import BackToHomeLogo from '@/layouts/ContentLayout/BackToHomeLogo'
import { displayLanguageState } from '@/stores/displayLanguage'

export type LoginFormProps = {
  firstName: string
  // lastName: string
  email: string
  phone?: string
  password: string
}

const LoginForm: React.FC = () => {
  const { isLoading, errorMessages, signInWithEmailAndPassword } = useAuth()
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const [lang] = useRecoilState(displayLanguageState)
  const navigate = useNavigate()

  useEffect(() => {
    // persistLocaleCookie(lang)
    i18n.changeLanguage(lang)
  }, [i18n, lang])
  const [loginForm, setLoginForm] = useState<LoginFormProps>({
    firstName: '',
    // lastName: '',
    email: '',
    phone: '',
    password: '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = event.target
    setLoginForm({
      ...loginForm,
      [id]: value,
    })
  }

  const isLoadingAnyService = useMemo(() => {
    return isLoading
  }, [isLoading])

  const isFormComplete = useMemo(() => {
    return loginForm.email && loginForm.password
  }, [loginForm.email, loginForm.password])

  return (
    <Box
      direction="col"
      className="mt-4 w-full"
      onSubmit={() => signInWithEmailAndPassword(loginForm)}
    >
      <BackToHomeLogo className="self-start" />
      <motion.h1
        // variants={gradientVariants}
        initial="initial"
        whileHover="hover"
        className="text-4xl font-bold mb-4 text-left w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent bg-[length:400%_auto]"
      >
        {t('login:loginModal.welcomeTitle')}
      </motion.h1>
      <form className="w-full flex flex-col gap-3">
        <Input
          value={loginForm.email}
          onChange={handleChange}
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('login:loginModal.email') as string}
        />
        <Input
          value={loginForm.password}
          onChange={handleChange}
          id="password"
          placeholder={t('login:loginModal.password') as string}
          type="password"
          autoComplete="current-password"
          showPasswordToggler
        />
        <Box justify="end">
          <Link className="w-fit" href="/login/forget-password" align="right">
            {t('login:forgetPassword')}
          </Link>
        </Box>
        <Text type="error">{errorMessages}</Text>
        <Button
          disabled={!isFormComplete || isLoadingAnyService}
          className="w-full mt-0 h-12"
          type="submit"
          onClick={() => signInWithEmailAndPassword(loginForm)}
        >
          {isLoadingAnyService ? <Spinner /> : t('login:loginModal.login')}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/register')}
          className="w-full"
        >
          {t('login:loginModal.registerNow')}
        </Button>
      </form>
    </Box>
  )
}

export default LoginForm
