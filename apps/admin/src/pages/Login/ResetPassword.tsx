import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { resetPassword } from '@/api/auth'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import Back from '@/components/Buttons/Back'
import TextInput from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import LoginLayout from '@/layouts/LoginLayout'
import { validatePassword } from '@/utils/validate'

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = new URLSearchParams(window.location.search).get('token')
  const email = new URLSearchParams(window.location.search).get('email')

  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()
  const watchAllFields = watch()
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ({
      password,
      token,
      email,
    }: {
      password: string
      token: string
      email: string
    }) => resetPassword({ password, token, email }),
    onSuccess: (result: boolean) => {
      if (result) {
        toast.success(t(`account:successMessage.updatePassword`))
        setIsSubmitted(true)
      } else {
        throw new Error()
      }
    },
    onError: (error: ApiError) => {
      if (error.statusCode === 422) {
        toast.error(
          `${t('account:errMessage.updatePassword')}: ${handleApiError({
            error,
            t,
          })}`
        )
      } else {
        toast.error(`${t('account:errMessage.updatePassword')}`)
      }
    },
  })

  if (!token || !email) {
    return (
      <LoginLayout>
        <Box direction="col" padding="lg">
          <Heading align="center">{t('login:errors.notAllowReset')}</Heading>
          <Back />
        </Box>
      </LoginLayout>
    )
  }

  const submitResetPassword = async (event: FieldValues) => {
    mutateAsync({
      password: event.password,
      token: decodeURI(token),
      email: decodeURI(email),
    })
  }

  return (
    <LoginLayout>
      <Box direction="col" justify="center" gap="lg">
        {isSubmitted ? (
          <>
            <Text>{t('login:resetSuccess')}</Text>
            <Button onClick={() => navigate('/login')}>
              {t('login:back')}
            </Button>
          </>
        ) : (
          <Box direction="col" align="start">
            <Heading>{t(`account:changePassword`)}</Heading>
            <Text>{t(`account:errMessage.notStrongPassword`)}</Text>
            <ul>
              {/* <li>{t(`account:strongPassword.requirement1`)}</li> */}
              <li>{t(`account:strongPassword.requirement2`)}</li>
              <li>{t(`account:strongPassword.requirement3`)}</li>
              <li>{t(`account:strongPassword.requirement4`)}</li>
            </ul>
            <Box direction="col" gap="lg" className="my-4 mx-0">
              <TextInput
                type="password"
                label={t('login:loginModal.password')}
                vertical
                isError={!!errors.password}
                helperText={
                  errors?.password?.message &&
                  (errors?.password?.message as string)
                }
                boxProps={{ direction: 'column', align: 'flex-start' }}
                {...register('password', {
                  required: t('login:errors.required') as string,
                  minLength: {
                    value: 8,
                    message: t('login:errors.passwordTooShort'),
                  },
                  validate: val =>
                    validatePassword(val) ||
                    (t('login:errors.strongPassword') as string),
                })}
              />

              <TextInput
                id="confirm-password"
                type="password"
                label={t('login:register.passwordAgain')}
                vertical
                isError={!!errors.passwordAgain}
                helperText={
                  errors?.passwordAgain?.message &&
                  (errors?.passwordAgain?.message as string)
                }
                {...register('passwordAgain', {
                  required: t('login:errors.required') as string,
                  validate: val =>
                    val === watchAllFields.password ||
                    (t('login:errors.passwordNotSame') as string),
                })}
              />
            </Box>
            <Button
              disabled={isLoading}
              className="w-full my-8"
              onClick={handleSubmit(
                submitResetPassword as SubmitHandler<FieldValues>
              )}
            >
              {isLoading ? <Spinner /> : t('login:resetPassword')}
            </Button>
          </Box>
        )}
      </Box>
    </LoginLayout>
  )
}

export default ResetPasswordPage
