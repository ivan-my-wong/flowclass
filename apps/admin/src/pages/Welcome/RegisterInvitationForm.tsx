import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuChevronRight } from 'react-icons/lu'

import brandImage from '@/assets/logos/flowclass.png'
import ImageAspect from '@/components/Images/ImageAspect'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import useUsersManagement from '@/hooks/useUsersManagement'
import {
  AcceptInviteFormData,
  InviteMemberResponse,
} from '@/types/userManagement'
import { validatePassword } from '@/utils/validate'

type RegisterInvitationProps = {
  token: string
  invitationData: InviteMemberResponse
}

const RegisterInvitationForm = ({
  token,
  invitationData,
}: RegisterInvitationProps): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useAcceptInvite } = useUsersManagement()

  const { mutateAsync: acceptInvite, isLoading: isRegisterLoading } =
    useAcceptInvite(() => {
      navigate('/login', {
        replace: true,
      })
    })
  const formData = useForm<AcceptInviteFormData>()
  const password = formData.watch('password')

  useEffect(() => {
    if (invitationData) {
      formData.reset({
        email: invitationData.email,
        firstName: invitationData.name,
        password: '',
        confirmPassword: '',
      })
    }
  }, [invitationData])

  const submitRegister: SubmitHandler<AcceptInviteFormData> = (
    data: AcceptInviteFormData
  ): void => {
    // Additional validation before submission
    if (!validatePassword(data.password)) {
      return
    }

    if (token) {
      acceptInvite({
        token,
        email: invitationData?.email ?? '',
        firstName: data.firstName,
        phone: invitationData?.phone ?? '',
        password: data.password,
      })
    }
  }

  return (
    <Form {...formData}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
        <Box padding="base">
          <ImageAspect
            width="50%"
            className="mx-auto"
            height="60px"
            src={brandImage}
            alt="Flowclass invite image"
            objectFit="contain"
          />
        </Box>
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('login:acceptInvite.title')}
            </h1>
            <p className="text-text-subtle">
              {t('login:acceptInvite.description')}
            </p>
          </div>

          <form className="space-y-5">
            <div className="bg-background-layer-2 rounded-lg p-3 mb-6">
              <div className="text-sm text-gray-600 mb-1">
                {t('login:acceptInvite.emailAddressWillBeUsed')}
              </div>
              <div className="font-medium text-gray-800">
                {invitationData?.email}
              </div>
            </div>

            <FormField
              control={formData.control}
              name="firstName"
              rules={{
                required: t('login:acceptInvite.nameLabel').toString(),
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('login:acceptInvite.nameLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('login:acceptInvite.nameLabel').toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-background-layer-2 rounded-lg p-3 mb-6">
              <p className="text-text-subtle text-sm">
                {t(`account:errMessage.notStrongPassword`)}
              </p>
              <ul className="flex flex-col gap-2 mt-2">
                <li>{t(`account:strongPassword.requirement0`)}</li>
                <li>{t(`account:strongPassword.requirement2`)}</li>
                <li>{t(`account:strongPassword.requirement3`)}</li>
                <li>{t(`account:strongPassword.requirement4`)}</li>
              </ul>
            </div>

            <FormField
              control={formData.control}
              name="password"
              rules={{
                required: t('login:acceptInvite.passwordLabel').toString(),
                validate: {
                  strongPassword: (value: string) => {
                    if (!validatePassword(value)) {
                      return t('login:errors.strongPassword').toString()
                    }
                    return true
                  },
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('login:acceptInvite.passwordLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t(
                        'login:acceptInvite.passwordLabel'
                      ).toString()}
                      showPasswordToggler
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">
                    Password strength:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      validatePassword(password)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {validatePassword(password) ? 'Strong' : 'Weak'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      validatePassword(password) ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: validatePassword(password)
                        ? '100%'
                        : `${Math.min((password.length / 8) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <FormField
              control={formData.control}
              name="confirmPassword"
              rules={{
                required: t('login:acceptInvite.passwordAgainLabel').toString(),
                validate: {
                  passwordMatch: (value: string | undefined) => {
                    if (!value || value !== password) {
                      return t('login:acceptInvite.passwordNotMatch').toString()
                    }
                    return true
                  },
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('login:acceptInvite.passwordAgainLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t(
                        'login:acceptInvite.passwordAgainLabel'
                      ).toString()}
                      showPasswordToggler
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="default"
              loading={isRegisterLoading}
              onClick={formData.handleSubmit(submitRegister)}
              className="w-full gap-2 mt-6"
            >
              {t('login:register.continue')}
              <LuChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Flowclass.{' '}
          {t('component:footer.copyright')}.
        </p>
      </div>
    </Form>
  )
}

export default RegisterInvitationForm
