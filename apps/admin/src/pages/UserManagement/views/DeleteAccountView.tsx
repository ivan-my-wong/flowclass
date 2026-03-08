import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import useUsersManagement from '@/hooks/useUsersManagement'

import { BackButton } from '../components/BackButton'
import { useProfile } from '../ProfileContext'

const DeleteAccountView = (): JSX.Element => {
  const { goToProfile, goToUserManagement, userRoleData } = useProfile()
  const { t } = useTranslation()
  const { useDeleteUser } = useUsersManagement()
  const {
    mutate: deleteUser,
    isLoading,
    isError,
  } = useDeleteUser(() => {
    goToUserManagement()
  })
  const onConfirm = () => {
    if (userRoleData.user?.id !== undefined && userRoleData.user?.id !== null) {
      deleteUser(userRoleData.user?.id.toString())
    }
  }
  useEffect(() => {
    if (isError) {
      goToUserManagement()
    }
  }, [isError, goToUserManagement])
  return (
    <div className="p-6">
      <div className="mb-6">
        <BackButton />

        <h2 className="text-xl font-bold text-red-500">
          {t('account:deleteAccount.deleteAccount')}
        </h2>
        <div className="space-y-4 mt-4 text-gray-500 text-sm">
          <p>{t('account:deleteAccount.notice1')}</p>

          <p>{t('account:deleteAccount.notice2')}</p>

          <p>{t('account:deleteAccount.notice3')}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={onConfirm}
          disabled={isLoading}
          loading={isLoading}
          aria-label={t('account:deleteAccount.ariaDeleteAccount').toString()}
          role="alertdialog"
          data-testid="delete-user-button"
        >
          {t('account:deleteAccount.confirm')}
        </Button>
      </div>
    </div>
  )
}

export default DeleteAccountView
