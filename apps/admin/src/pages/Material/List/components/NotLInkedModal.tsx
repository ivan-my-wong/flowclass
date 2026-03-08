import { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'

interface NotLinkedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLinkGoogleDrive?: () => Promise<void>
}

const NotLinkedModal = ({
  open,
  onOpenChange,
  onLinkGoogleDrive,
}: NotLinkedModalProps) => {
  const { t } = useTranslation(['storage', 'common'])
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleLinkGoogleDrive = useCallback(async () => {
    if (!onLinkGoogleDrive) return

    try {
      setIsLoading(true)
      await onLinkGoogleDrive()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to link Google Drive:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onLinkGoogleDrive, onOpenChange])

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(
        'storage:googleDriveNotLinked.title',
        'You have not linked Google Drive'
      )}
      className="max-w-md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t('common:action.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleLinkGoogleDrive}
            disabled={isLoading}
            loading={isLoading}
          >
            {t('storage:googleDriveNotLinked.linkDrive', 'Link Google Drive')}
          </Button>
        </div>
      }
    >
      <div className="py-2">
        <p className="text-sm text-gray-700 leading-relaxed">
          {t(
            'storage:googleDriveNotLinked.description',
            'You must first link your own Google Drive in order to upload materials and receive student submissions.'
          )}
        </p>
      </div>
    </ModalDialog>
  )
}

export default NotLinkedModal
