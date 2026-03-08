import { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import { useChangeAliasPassword } from '@/hooks/useProfile'
import { useAuth } from '@/stores/auth'
import { StudentChangeAliasPasswordDto } from '@/types/profile'

const FormAccount = (): JSX.Element => {
  const { auth } = useAuth()
  const { t } = useTranslation()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { mutateAsync: handleChangePassword, isLoading } = useChangeAliasPassword()

  const formInstance = useForm<StudentChangeAliasPasswordDto & { confirmPassword: string }>({
    defaultValues: {
      userAliasId: auth?.activeUserAliasId ?? auth?.userAliasId ?? 0,
      currentAliasPassword: '',
      newAliasPassword: '',
      confirmPassword: '',
    },
  })

  const handlePasswordChange = async (
    values: StudentChangeAliasPasswordDto & { confirmPassword: string }
  ) => {
    try {
      if (auth.activeUserAliasId) {
        await handleChangePassword({
          userAliasId: auth.activeUserAliasId,
          currentAliasPassword: values.currentAliasPassword,
          newAliasPassword: values.newAliasPassword,
        })

        toast.success(t('profile:changePassword.success') as string)
        formInstance.reset()
      } else {
        toast.error(t('profile:changePassword.networkError') as string)
      }
    } catch (error) {
      toast.error(t('profile:changePassword.error') as string)
    }
  }

  const passwordRequirements = t('profile:changePassword.requirements')

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        {t('profile:changePassword.title')}
      </h2>

      <Form {...formInstance}>
        <form onSubmit={formInstance.handleSubmit(handlePasswordChange)} className="space-y-6">
          {/* Current Password */}
          <div>
            <label
              htmlFor="currentAliasPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t('profile:changePassword.currentPassword')}
            </label>
            <div className="relative">
              <input
                id="currentAliasPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...formInstance.register('currentAliasPassword', {
                  required: t('profile:changePassword.currentPasswordRequired') as string,
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="current-password-field"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showCurrentPassword ? (
                  <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <MdVisibility className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newAliasPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t('profile:changePassword.newPassword')}
            </label>
            <div className="relative">
              <input
                id="newAliasPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...formInstance.register('newAliasPassword', {
                  required: t('profile:changePassword.newPasswordRequired') as string,
                  minLength: {
                    value: 8,
                    message: t('profile:changePassword.passwordTooShort') as string,
                  },
                  pattern: {
                    value: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).{8,20}$/,
                    message: passwordRequirements,
                  },
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="new-password-field"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showNewPassword ? (
                  <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <MdVisibility className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formInstance.formState.errors.newAliasPassword && (
              <p className="mt-1 text-sm text-red-600">
                {formInstance.formState.errors.newAliasPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t('profile:changePassword.confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...formInstance.register('confirmPassword', {
                  required: t('profile:changePassword.confirmPasswordRequired') as string,
                  validate: value => {
                    const newPassword = formInstance.getValues('newAliasPassword')
                    return (
                      value === newPassword ||
                      (t('profile:changePassword.passwordMismatch') as string)
                    )
                  },
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="confirm-password-field"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? (
                  <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <MdVisibility className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formInstance.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {formInstance.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>{t('profile:changePassword.passwordRequirementsLabel')}</strong>{' '}
              {passwordRequirements}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading}
            data-testid="change-password-btn"
          >
            {isLoading
              ? t('profile:changePassword.changingPassword')
              : t('profile:changePassword.changeButton')}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default FormAccount
