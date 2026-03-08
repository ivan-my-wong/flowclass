import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

const DeleteAccountButton = ({
  onDelete,
}: {
  onDelete: () => void
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className="mt-8 pt-4 text-center absolute bottom-2 left-0 right-0">
      <Button
        variant="ghost"
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={onDelete}
        data-testid="delete-user-button"
      >
        {t('account:deleteAccount.deleteAccount')}
      </Button>
    </div>
  )
}

export default DeleteAccountButton
