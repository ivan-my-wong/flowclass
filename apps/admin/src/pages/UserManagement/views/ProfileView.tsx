import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import {
  LuBriefcase,
  LuBuilding,
  LuLock,
  LuMail,
  LuPencil,
  LuPhone,
  LuShieldCheck,
} from 'react-icons/lu'

import ImageAspect from '@/components/Images/ImageAspect'
import { Button } from '@/components/ui/Button'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { getSinglePermissionFromUserRole } from '@/utils/convert'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

import PermissionBadges from '../components/PermissionBadges'
import { useProfile } from '../ProfileContext'

import DeleteAccountButton from './DeleteAccountButton'

const ProfileView = (): JSX.Element => {
  const {
    userRoleData,
    goToEditProfile,
    goToChangePassword,
    goToDeleteAccount,
  } = useProfile()

  const { t } = useTranslation()
  const { currentSite } = useSiteData()

  const permissionArray = useMemo(() => {
    return getSinglePermissionFromUserRole(userRoleData, currentSite?.id ?? 0)
  }, [userRoleData, currentSite])

  const personalInfo = useMemo(() => {
    if (!userRoleData || !userRoleData.user) return []

    const { user } = userRoleData

    return [
      { label: t('account:email'), value: user.email, icon: 'mail' },
      {
        label: t('account:phone'),
        value: user.phone ? `+${user.phone}` : '-',
        icon: 'phone',
      },
      {
        label: t('account:company'),
        value: currentSite?.name,
        icon: 'building',
      },
      {
        label: t('account:position'),
        value: user.position,
        icon: 'briefcase',
      },
    ]
  }, [userRoleData])

  return (
    <>
      <div className="relative p-6 pb-0">
        <div className="flex flex-col items-center gap-2">
          <ImageAspect
            src={
              userRoleData?.user?.avatarUrl
                ? getMediaFileUrl(userRoleData?.user?.avatarUrl)
                : ''
            }
            alt={`${userRoleData?.user?.firstName} ${
              userRoleData?.user?.lastName || ''
            }`}
            width="24"
            height="24"
            objectFit="cover"
            ratio={1}
            boxProps={{
              className:
                'w-32 h-32 flex justify-center items-center rounded-full',
            }}
          />

          <h2 data-testid="user-name" className="mt-4 text-xl font-bold">{`${
            userRoleData?.user?.firstName
          } ${userRoleData?.user?.lastName || ''}`}</h2>
          <Button
            variant="ghost"
            className="mt-1 h-auto p-0 text-text-subtle hover:underline"
            onClick={goToEditProfile}
            data-testid="edit-profile-button"
          >
            <span className="flex items-center gap-1">
              <LuPencil />
              {t('account:editInformation')}
            </span>
          </Button>
          <Button
            variant="link"
            className="mt-1 h-auto p-0 text-blue-500"
            onClick={goToChangePassword}
            data-testid="change-password-button"
          >
            <span className="flex items-center gap-1">
              <LuLock />
              {t('account:changePassword')}
            </span>
          </Button>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="mb-2 border-t border-gray-200 pt-4">
          <h3 className="mb-4 text-lg font-bold">
            {t('setting:userManagement.personalInformation')}
          </h3>
          <div className="space-y-4">
            {personalInfo
              .filter(item => item.value)
              .map((item, index) => (
                <div key={index} className="flex flex-col gap-y-2">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.icon === 'mail' && (
                      <LuMail className="h-5 w-5 text-gray-500" />
                    )}
                    {item.icon === 'phone' && (
                      <LuPhone className="h-5 w-5 text-gray-500" />
                    )}
                    {item.icon === 'building' && (
                      <LuBuilding className="h-5 w-5 text-gray-500" />
                    )}
                    {item.icon === 'briefcase' && (
                      <LuBriefcase className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-gray-700">{item.value}</span>
                  </div>
                </div>
              ))}
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm text-gray-400">{t('account:role')}</span>
              <div className="flex items-center gap-2">
                <LuShieldCheck className="h-5 w-5 text-gray-500" />
                <PermissionBadges permissions={[permissionArray]} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteAccountButton onDelete={goToDeleteAccount} />
    </>
  )
}

export default ProfileView
