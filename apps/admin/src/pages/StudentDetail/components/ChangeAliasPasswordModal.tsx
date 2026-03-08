import { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import useUsersManagement from '@/hooks/useUsersManagement'
import i18n from '@/i18n'

const formSchema = z
  .object({
    newAliasPassword: z
      .string()
      .min(
        8,
        i18n.t('student:changePassword.errMessage.passwordTooShort') ||
          'Password must be at least 8 characters'
      )
      .max(
        20,
        i18n.t('student:changePassword.errMessage.passwordTooLong') ||
          'Password must not exceed 20 characters'
      )
      .regex(
        /^(?![.\n]).{8,20}$/,
        i18n.t('student:changePassword.errMessage.passwordFormat') ||
          'Password cannot start with a dot or newline'
      ),
    confirmPassword: z
      .string()
      .min(
        1,
        i18n.t('student:changePassword.errMessage.emptyConfirmPassword') ||
          'Please confirm your password'
      ),
  })
  .refine(data => data.newAliasPassword === data.confirmPassword, {
    message:
      i18n.t('student:changePassword.errMessage.newPasswordNotMatch') ||
      'Passwords do not match',
    path: ['confirmPassword'],
  })

type Props = {
  userAliasId: number
  isOpen: boolean
  onClose: () => void
}

const ChangeAliasPasswordModal = ({
  userAliasId,
  isOpen,
  onClose,
}: Props): JSX.Element | null => {
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newAliasPassword: '',
      confirmPassword: '',
    },
  })

  const { useChangeAliasPassword } = useUsersManagement()
  const { mutate: changeAliasPasswordMutation, isLoading } =
    useChangeAliasPassword(() => {
      onClose()
      form.reset()
    })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = data => {
    changeAliasPasswordMutation({
      userAliasId,
      newAliasPassword: data.newAliasPassword,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            {t('student:changePassword.title')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('student:changePassword.description')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newAliasPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t(
                        'student:changePassword.newPassword'
                      )?.toString()}
                      {...field}
                      showPasswordToggler
                      data-testid="new-alias-password-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t(
                        'student:changePassword.confirmPassword'
                      )?.toString()}
                      {...field}
                      showPasswordToggler
                      data-testid="confirm-alias-password-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t('common:action.cancel')}
              </Button>
              <Button
                loading={isLoading}
                type="submit"
                data-testid="change-alias-password-button"
              >
                {t('common:action.saveChanges')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ChangeAliasPasswordModal
