import { useTranslation } from 'react-i18next'
import { FiInfo } from 'react-icons/fi'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface DialogTrialUpgradeProps {
  open: boolean
  onClose: () => void
  onCreateSubscription: () => void
}

const DialogTrialUpgrade: React.FC<DialogTrialUpgradeProps> = ({
  open,
  onClose,
  onCreateSubscription,
}): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FiInfo className="text-primary" size={20} />
            {t('subscription:trialUpgrade.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-col gap-4">
          <p className="leading-relaxed">
            {t('subscription:trialUpgrade.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t('subscription:trialUpgrade.cancel')}
            </Button>
            <Button
              onClick={onCreateSubscription}
              type="button"
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {t('subscription:trialUpgrade.createYearlySubscription')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogTrialUpgrade
