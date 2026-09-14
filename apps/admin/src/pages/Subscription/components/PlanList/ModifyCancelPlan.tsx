import { useTranslation } from 'react-i18next'

import { DialogBody, DialogDescription } from '@/components/ui/Dialog'
import { SubscriptionRecordPlan } from '@/types/schoolSubscriptionPlan'

import CardSubscribedPlan from './CardSubscribedPlan'

interface Props {
  currentPlan: SubscriptionRecordPlan
  onCancel: () => void
}
const CancelPlanContent: React.FC<Props> = ({
  currentPlan,
  onCancel,
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <>
      <DialogBody>
        <DialogDescription className="mb-6 text-gray-600">
          {t('subscription:planType.FEATURE_ENABLE.desc')}
        </DialogDescription>
        <CardSubscribedPlan currentPlan={currentPlan} onCancel={onCancel} />
      </DialogBody>
    </>
  )
}

export default CancelPlanContent
