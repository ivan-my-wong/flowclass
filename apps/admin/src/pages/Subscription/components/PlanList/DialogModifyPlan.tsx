import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { availablePlanByPlanId } from '@/stores/subscription'
import {
  SubscriptionRecordPlan,
  SubscriptionReview,
} from '@/types/schoolSubscriptionPlan'

import ModifyCancelPlan from './ModifyCancelPlan'
import ModifyClassTypePlan from './ModifyClassTypePlan'
import ModifyCounterPlan from './ModifyCounterPlan'
import ModifyNotifPromoPlan from './ModifyNotifPromoPlan'
import ModifyUsers from './ModifyUsers'

interface Props {
  open: boolean
  currentPlan: SubscriptionRecordPlan
  onClose: () => void
  onProceed: (event: SubscriptionReview) => void
  onCancel: () => void
}

const ModifyDialog: React.FC<Props> = ({
  open,
  currentPlan,
  onClose,
  onProceed,
  onCancel,
}): JSX.Element => {
  const { t } = useTranslation()
  const availablePlans = useRecoilValue(availablePlanByPlanId(currentPlan))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[700px]">
        <DialogHeader className="sticky top-0 bg-white z-10">
          <DialogTitle>
            {t(`subscription:manage`)}{' '}
            {t(`subscription:planType.${currentPlan.type}.title`)}
          </DialogTitle>
        </DialogHeader>

        {currentPlan.type === 'BASE_USER' && (
          <ModifyUsers
            currentPlan={currentPlan}
            availablePlans={availablePlans}
            onProceed={onProceed}
          />
        )}

        {['MULTIPLE_ADMIN', 'MULTIPLE_SCHOOL', 'MULTIPLE_TUTOR'].includes(
          currentPlan.type
        ) && (
          <ModifyCounterPlan
            currentPlan={currentPlan}
            availablePlans={availablePlans}
            onProceed={onProceed}
          />
        )}

        {currentPlan.type === 'CLASS_TYPE' && (
          <ModifyClassTypePlan
            currentPlan={currentPlan}
            availablePlans={availablePlans}
            onProceed={onProceed}
            onCancel={onCancel}
          />
        )}

        {currentPlan.type === 'FEATURE_ENABLE' && (
          <ModifyCancelPlan currentPlan={currentPlan} onCancel={onCancel} />
        )}

        {['NOTIFICATION_CHANNEL', 'PROMOTION_FEES'].includes(
          currentPlan.type
        ) && (
          <ModifyNotifPromoPlan
            currentPlan={currentPlan}
            availablePlans={availablePlans}
            onProceed={onProceed}
            onCancel={onCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ModifyDialog
