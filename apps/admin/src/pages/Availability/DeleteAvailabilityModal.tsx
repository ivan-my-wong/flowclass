import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { DialogFooter } from '@/components/ui/Dialog'
import ModalDialog from '@/components/ui/ModalDialog'
import Text from '@/components/ui/Text'

interface IDeleteAvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  availabilityId: number | null
  availabilityName: string
  onConfirm: (id: number) => void
  isDeleting: boolean
}

const DeleteAvailabilityModal = ({
  isOpen,
  onClose,
  availabilityId,
  availabilityName,
  onConfirm,
  isDeleting,
}: IDeleteAvailabilityModalProps): JSX.Element => {
  const { t } = useTranslation(['availability', 'common'])

  const handleConfirm = () => {
    if (availabilityId) {
      onConfirm(availabilityId)
    }
  }

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onClose}
      title={t('availability:delete.title') as string}
    >
      <Text className="text-sm">
        {t('availability:delete.confirmation', { name: availabilityName })}
      </Text>
      <DialogFooter>
        <Button
          variant="outline"
          className="mr-2"
          onClick={onClose}
          disabled={isDeleting}
        >
          {t('common:action.cancel')}
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          loading={isDeleting}
        >
          {t('common:action.delete')}
        </Button>
      </DialogFooter>
    </ModalDialog>
  )
}

export default DeleteAvailabilityModal
