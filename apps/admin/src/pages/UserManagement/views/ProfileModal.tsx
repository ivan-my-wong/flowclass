import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import ModalDialog from '@/components/ui/ModalDialog'
import { StaffUserType } from '@/types/user'

import { ProfileProvider } from '../ProfileContext'

import DeleteAccountView from './DeleteAccountView'
import EditProfileView from './EditProfileView'
import PasswordChangeView from './PasswordChangeView'
import ProfileView from './ProfileView'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
  selectedUserRole: StaffUserType | null
}

const validViews = ['profile', 'edit', 'change-password', 'delete']

export default function ProfileModal({
  open,
  onClose,
  selectedUserRole,
}: ProfileModalProps): JSX.Element {
  const [params] = useSearchParams()
  const view = params.get('view')
  const currentView = validViews.includes(view || '') ? view : 'profile'
  const { t } = useTranslation()

  if (!selectedUserRole) {
    return (
      <ModalDialog title="" open={open} onOpenChange={() => onClose()}>
        <div className="flex justify-center p-4">
          <SkeletonLoader />
        </div>
      </ModalDialog>
    )
  }

  return (
    <ProfileProvider initialProfile={selectedUserRole}>
      <ModalDialog
        title={t(`account:profileView.${currentView}`) as string}
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) onClose()
        }}
      >
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'edit' && <EditProfileView />}
        {currentView === 'change-password' && <PasswordChangeView />}
        {currentView === 'delete' && <DeleteAccountView />}
      </ModalDialog>
    </ProfileProvider>
  )
}
