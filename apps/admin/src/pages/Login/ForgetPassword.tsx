import { useNavigate } from 'react-router-dom'

import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'

import { forgotPassword } from '@/api/auth'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Form, { FormMessage } from '@/components/ui/Form'
import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import FormItem from '@/components/ui/FormItem'
import FormLabel from '@/components/ui/FormLabel'
import { Input } from '@/components/ui/Inputs/Input'
import LoginLayout from '@/layouts/LoginLayout'

type ForgetPasswordDto = {
  email: string
}

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const formInstance = useForm<ForgetPasswordDto>({
    defaultValues: {
      email: '',
    },
  })

  const converErrorMessage = (errorMessage: string) => {
    if (errorMessage === 'ACCOUNT_NOT_FOUND') {
      return t('common:errors.ACCOUNT_NOT_FOUND')
    }
    if (errorMessage === 'INVALID_EMAIL') {
      return t('common:errors.INVALID_EMAIL')
    }

    return t('common:errors.UNKNOWN_ERROR')
  }

  const {
    mutateAsync,
    isLoading: isSubmitting,
    isSuccess,
  } = useMutation({
    mutationFn: (variables: ForgetPasswordDto) => forgotPassword(variables),
    onError: (error: AxiosError) => {
      formInstance.setError('email', {
        message: converErrorMessage(error?.message),
        type: 'validate',
      })
    },
  })

  const handleSubmit: SubmitHandler<ForgetPasswordDto> = async data => {
    await mutateAsync(data)
  }

  return (
    <LoginLayout>
      <Box direction="col" justify="center" gap="lg">
        {isSuccess ? (
          <>
            <Text>{t('login:sendSuccess')}</Text>
            <Button onClick={() => navigate('/login')}>
              {t('login:back')}
            </Button>
          </>
        ) : (
          <Box direction="col" align="start">
            <Heading>{t('login:loginModal.title.forgetPassword')}</Heading>
            <Form {...formInstance}>
              <form
                onSubmit={formInstance.handleSubmit(handleSubmit)}
                className="w-full space-y-4"
              >
                <FormField
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('login:forgetPasswordHint')}
                      </FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="items-center w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('login:submitting') : t('login:submit')}
                </Button>
              </form>
            </Form>
          </Box>
        )}
      </Box>
    </LoginLayout>
  )
}

export default ForgotPasswordPage
