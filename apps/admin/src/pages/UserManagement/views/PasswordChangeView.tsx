import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
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

import { useProfile } from '../ProfileContext'

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, i18n.t('account:errMessage.emptyNewPassword').toString()),
    confirmPassword: z
      .string()
      .min(1, i18n.t('account:errMessage.emptyConfirmPassword').toString()),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: i18n.t('account:errMessage.newPasswordNotMatch').toString(),
    path: ['confirmPassword'],
  })

const PasswordChangeView = (): JSX.Element => {
  const { goToProfile, userRoleData } = useProfile()
  const { t } = useTranslation()
  const { useUpdateUserPassword } = useUsersManagement()
  const { mutate: updateUserPasswordMutation, isLoading } =
    useUpdateUserPassword(userRoleData?.user?.id || 0, () => {
      goToProfile()
    })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = data => {
    updateUserPasswordMutation({
      newPassword: data.newPassword,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mb-2 -ml-2 h-8 w-8"
            onClick={goToProfile}
          >
            <LuArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>

          <h2 className="text-xl font-bold">{t('account:changePassword')}</h2>
          <p className="text-sm text-gray-500">
            {t('account:changePasswordExplanation')}
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('account:newPassword').toString()}
                    {...field}
                    showPasswordToggler
                    data-testid="new-password-input"
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
                    placeholder={t('account:confirmPassword').toString()}
                    {...field}
                    showPasswordToggler
                    data-testid="confirm-password-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            loading={isLoading}
            type="submit"
            className="bg-blue-500 hover:bg-blue-600"
            data-testid="save-button"
          >
            {t('common:action.saveChanges')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PasswordChangeView
