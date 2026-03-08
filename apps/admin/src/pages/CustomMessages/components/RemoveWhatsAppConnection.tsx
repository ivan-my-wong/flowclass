import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { useWhatsappWeb } from '@/hooks/useWhatsappWeb'

interface RemoveWhatsAppConnectionProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const RemoveWhatsAppConnection = ({
  isOpen,
  onOpenChange,
}: RemoveWhatsAppConnectionProps): React.ReactElement => {
  const { t } = useTranslation()
  const { useRemoveSession, useGetSession } = useWhatsappWeb()

  const { refetch: refetchSession } = useGetSession()

  const { mutate: removeSession, isLoading: isRemoving } = useRemoveSession(
    () => {
      onOpenChange(false)
      refetchSession()
    }
  )

  const handleRemoveSession = () => {
    removeSession()
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <ModalDialog
      title={t('customMessage:whatsappWeb.removeSession').toString()}
      open={isOpen}
      onOpenChange={onOpenChange}
      className="max-w-md"
    >
      <div className="flex flex-col space-y-4">
        <p className="text-gray-700">
          {t('customMessage:whatsappWeb.removeSessionDescription')}
        </p>

        <div className="flex justify-end space-x-3 py-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isRemoving}
          >
            {t('customMessage:whatsappWeb.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveSession}
            loading={isRemoving}
            disabled={isRemoving}
          >
            {t('customMessage:whatsappWeb.remove')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}

export default RemoveWhatsAppConnection
