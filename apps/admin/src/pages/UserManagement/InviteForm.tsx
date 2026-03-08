import { useMemo } from 'react'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import RadioGroup from '@/components/RadioGroup/RadioButtonGroup'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import PhoneNumberInput from '@/components/ui/PhoneInput'
import { roleOptions } from '@/constants/userManagement'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { InviteUserFormData } from '@/types/userManagement'
import { validateEmail, validatePhone } from '@/utils/validate'

export default function InviteForm(): JSX.Element {
  const { t } = useTranslation()
  const formData = useFormContext<InviteUserFormData>()
  const [user] = useRecoilState(userState)

  const defaultRoleValue = UserRole.Operations

  const [userPermission] = useRecoilState(userPermissionState)
  const userRolesRadioGroup = useMemo(() => {
    return {
      defaultValue: defaultRoleValue,
      inputValues: roleOptions[userPermission].map(role => {
        return {
          value: role.value,
          label: t(role.label as string),
        }
      }),
    }
  }, [defaultRoleValue, userPermission])

  return (
    <div className="box-col-full gap-6">
      <FormField
        control={formData.control}
        name="name"
        rules={{
          required: t('setting:userManagement.nameRequired').toString(),
        }}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel required>{t('setting:userManagement.name')}</FormLabel>
            <FormControl>
              <Input
                className="w-full"
                {...field}
                data-testid="input-name"
                placeholder={t('setting:userManagement.enterName').toString()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="email"
        rules={{
          required: t('setting:userManagement.emailRequired').toString(),
          validate: (value: string) => {
            if (!validateEmail(value)) {
              return t('setting:userManagement.emailInvalid').toString()
            }
            if (value.toLowerCase() === user.email.toLowerCase()) {
              return t('setting:userManagement.cannotInviteYourself').toString()
            }
            return true
          },
        }}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel required>{t('setting:userManagement.email')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                data-testid="input-email"
                placeholder={t('setting:userManagement.enterEmail').toString()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={formData.control}
        name="phone"
        rules={{
          required: t('setting:userManagement.phoneRequired').toString(),
          validate: (value: string) => {
            if (!validatePhone(value)) {
              return t('setting:userManagement.phoneInvalid').toString()
            }
            return true
          },
        }}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel required>{t('setting:userManagement.phone')}</FormLabel>
            <FormControl>
              <PhoneNumberInput
                inputStyle={{ height: '2.5rem', width: '100%' }}
                ref={field.ref}
                field={field}
                data-testid="input-phone"
                fullWidth
                error={!!formData.formState.errors.phone}
                errorMessage={formData.formState.errors.phone?.message}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="role"
        rules={{
          required: t('setting:userManagement.roleRequired').toString(),
        }}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel required>
              {t('setting:userManagement.assignRoleDesc')}
            </FormLabel>
            <FormControl>
              <RadioGroup
                defaultValue={field.value}
                itemValues={userRolesRadioGroup.inputValues}
                onValueChange={(newValue: any) => {
                  field.onChange(newValue as UserRole)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
