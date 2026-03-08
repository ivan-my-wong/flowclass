import { useCallback } from 'react'

import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'

interface StorageFullModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const StorageFullModal = ({ open, onOpenChange }: StorageFullModalProps) => {
  const { t } = useTranslation(['storage', 'common'])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleVisitGoogleDrive = useCallback(() => {
    window.open(
      'https://drive.google.com/drive/my-drive',
      '_blank',
      'noopener,noreferrer'
    )
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('storage:googleDriveFull.title', 'Your Google Drive is full')}
      className="max-w-md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            {t('common:action.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleVisitGoogleDrive}>
            {t('storage:googleDriveFull.visitDrive', 'Visit Google Drive')}
            <ExternalLinkIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="py-2">
        <p className="text-sm text-gray-700 leading-relaxed">
          {t(
            'storage:googleDriveFull.description',
            'Your have no space in your Google Drive. Please clear up storage so you can upload materials from Flowclass.'
          )}
        </p>
      </div>
    </ModalDialog>
  )
}

export default StorageFullModal
