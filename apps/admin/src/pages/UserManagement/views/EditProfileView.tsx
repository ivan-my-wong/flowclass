import { useMemo } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuLock, LuSave } from 'react-icons/lu'
import { useRecoilState } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import DraggableFileInput from '@/components/ui/FileInput'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import PhoneNumberInput from '@/components/ui/PhoneInput'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { roleOptions } from '@/constants/userManagement'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import useUsersManagement from '@/hooks/useUsersManagement'
import ProtectedComponent from '@/routes/ProtectedComponent'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import {
  BaseUserRole,
  SinglePermission,
  StaffUserFormType,
  StaffUserType,
} from '@/types/user'
import { getSinglePermissionFromUserRole } from '@/utils/convert'
import { getMediaFileUrl } from '@/utils/generate-link.utils'
import {
  generateFirstNameAndLastName,
  roleParserMap,
} from '@/utils/user-profile.utils'
import { validatePhone } from '@/utils/validate'

import { BackButton } from '../components/BackButton'
import { useProfile } from '../ProfileContext'

import DeleteAccountButton from './DeleteAccountButton'

const IS_EDITING_PHONE_DISABLED = true

const IS_TUTOR_CENTER_ENABLE_PROFILE_PICTURE = false

const EditProfileView = (): JSX.Element => {
  const { t } = useTranslation()
  const { useUpdateUser, useUpdateUserPermission } = useUsersManagement()
  const { currentSite } = useSiteData()
  const { currentSchool } = useSchoolData()
  const siteId = currentSite?.id || 0
  const schoolId = currentSchool?.id || 0
  const {
    userRoleData,
    goToChangePassword,
    goToDeleteAccount,
    goToProfile,
    setUserRoleData,
  } = useProfile()

  const { mutate: updateUser, isLoading: isUpdating } = useUpdateUser(
    userRoleData?.user?.id || 0,
    user => {
      setUserRoleData(user)
      goToProfile()
    }
  )
  const { mutate: updateUserPermission } = useUpdateUserPermission(
    userRoleData?.user?.id || 0,
    user => {
      setUserRoleData(user)
      goToProfile()
    }
  )
  const [firstName, lastName] = useMemo(() => {
    if (!userRoleData) return ['', '']
    return generateFirstNameAndLastName(userRoleData)
  }, [userRoleData])
  const [userPermission] = useRecoilState(userPermissionState)
  const permission = getSinglePermissionFromUserRole(userRoleData, siteId)

  const formData = useForm<StaffUserFormType>({
    defaultValues: {
      user: {
        firstName,
        lastName,
        email: userRoleData?.user?.email,
        phone: userRoleData?.user?.phone || '',
        position: userRoleData?.user?.position || '',
      },
      permissions: permission || {
        siteId,
        institutionId: schoolId,
        isInstitutionManager: false,
        isInstructor: false,
        isMasterAdmin: false,
        isOperator: false,
        isSiteManager: false,
      },
    },
  })

  const onSubmit: SubmitHandler<StaffUserFormType> = data => {
    if (!userRoleData?.user?.id) return
    const permission = {
      ...data.permissions,
      userId: userRoleData?.user?.id,
    }
    updateUser({
      ...data,
    } as StaffUserType)

    // Only call the API if the permission has been changed. But they are an object, so we need to compare the properties
    if (permission) {
      updateUserPermission([permission])
    }
  }

  const getCurrentPermissionValue = (permissions: SinglePermission): string => {
    if (!permissions) return ''

    const foundEntry = Object.entries(roleParserMap).find(
      ([, mappedKey]) => permissions[mappedKey as keyof SinglePermission]
    )

    return foundEntry ? foundEntry[0] : ''
  }

  return (
    <>
      <Form {...formData}>
        <form onSubmit={formData.handleSubmit(onSubmit)}>
          <div className="relative p-6">
            <BackButton />
            <div className="flex flex-col items-center">
              {IS_TUTOR_CENTER_ENABLE_PROFILE_PICTURE && (
                <FormField
                  control={formData.control}
                  name="user.avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DraggableFileInput
                          directory={MediaFileDirectory.SITE}
                          imageUrl={
                            field.value ? getMediaFileUrl(field.value) : ''
                          }
                          onFileUpload={field.onChange}
                          classDropZone="rounded-full h-32 w-32"
                          croppable
                          data-testid="avatar-input"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className="mb-4 grid w-full grid-cols-2 gap-4">
                <FormField
                  control={formData.control}
                  name="user.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t('account:firstName').toString()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formData.control}
                  name="user.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t('account:lastName').toString()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="link"
                dataTestId="change-password-button"
                className="mb-4 h-auto p-0 text-blue-500"
                onClick={goToChangePassword}
              >
                <span className="flex items-center gap-1">
                  <LuLock className="h-4 w-4" />
                  {t('account:changePassword')}
                </span>
              </Button>
            </div>
            <Button
              type="submit"
              variant="default"
              loading={isUpdating}
              disabled={isUpdating}
              data-testid="save-button"
              className="absolute right-4 top-4 bg-blue-500 hover:bg-blue-600 gap-x-2"
            >
              <LuSave className="h-5 w-5" /> {t('common:action.save')}
            </Button>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 mb-10 overflow-y-auto max-h-[60vh]">
            <h3 className="mb-4 text-lg font-bold">
              {t('setting:userManagement.personalInformation')}
            </h3>

            <div className="space-y-4">
              <FormField
                control={formData.control}
                name="user.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm ">
                      {t('setting:userManagement.email')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formData.control}
                name="user.phone"
                rules={{
                  required: IS_EDITING_PHONE_DISABLED
                    ? false
                    : t('setting:userManagement.phoneRequired').toString(),
                  validate: (value: string | null) => {
                    if (
                      !IS_EDITING_PHONE_DISABLED &&
                      (!value || !validatePhone(value))
                    ) {
                      return t('setting:userManagement.phoneInvalid').toString()
                    }
                    return true
                  },
                }}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel required={!IS_EDITING_PHONE_DISABLED}>
                      {t('setting:userManagement.phone')}
                    </FormLabel>
                    <FormControl data-testid="teacher-phone-input">
                      <PhoneNumberInput
                        inputStyle={{ height: '2.5rem', width: '100%' }}
                        ref={field.ref}
                        field={field}
                        disabled={IS_EDITING_PHONE_DISABLED}
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
                name="user.position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm ">
                      {t('account:position')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={
                          t('account:position', 'position') as string
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formData.control}
                name="permissions"
                rules={{
                  required: t('setting:userManagement.roleRequired').toString(),
                }}
                render={({ field }) => {
                  return (
                    <ProtectedComponent
                      roleAllowed={[UserRole.SiteAdmin, UserRole.SchoolAdmin]}
                    >
                      <div className="flex flex-col gap-y-2">
                        <FormLabel className="text-sm">
                          {t('setting:userManagement.permissions')}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={getCurrentPermissionValue(field.value)}
                            onValueChange={value => {
                              const newPermission = {
                                ...field.value,
                                siteId,
                                institutionId: schoolId,
                                isInstitutionManager: false,
                                isInstructor: false,
                                isMasterAdmin: false,
                                isOperator: false,
                                isSiteManager: false,
                              }

                              const selectedPermissionKey =
                                roleParserMap[
                                  value as keyof typeof roleParserMap
                                ]
                              if (
                                selectedPermissionKey &&
                                selectedPermissionKey in newPermission
                              ) {
                                ;(newPermission as any)[selectedPermissionKey] =
                                  true
                              }

                              field.onChange(newPermission)
                            }}
                            className="flex flex-col gap-y-2"
                          >
                            {roleOptions[userPermission].map(item => (
                              <FormItem
                                className="flex w-full gap-x-1 items-center space-y-0"
                                key={item.value}
                              >
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem
                                    value={item.value}
                                    id={item.value}
                                  />
                                  <FormLabel
                                    htmlFor={item.value}
                                    className="!font-normal cursor-pointer"
                                  >
                                    {t(item.label as string)}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </ProtectedComponent>
                  )
                }}
              />
            </div>
          </div>
        </form>
      </Form>
      <DeleteAccountButton onDelete={goToDeleteAccount} />
    </>
  )
}
export default EditProfileView
