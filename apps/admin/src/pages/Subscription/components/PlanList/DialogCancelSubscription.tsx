import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FiAlertCircle } from 'react-icons/fi'
import { LuDot } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { SubscriptionRecordPlan } from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

interface Props {
  open: boolean
  planToCancel: SubscriptionRecordPlan | null
  nextBillingDate: string
  onBackToPlan: () => void
  onSubmitted: () => void
  onClose: () => void
}

const DialogCancelSubscription: React.FC<Props> = ({
  open,
  planToCancel,
  nextBillingDate,
  onBackToPlan,
  onSubmitted,
  onClose,
}): JSX.Element => {
  const { t } = useTranslation()
  const [isUnderstand, setUnderstand] = useState<boolean>(false)
  const [isBackedUp, setBackedUp] = useState<boolean>(false)
  const { useCancelSubscriptionPlan } = usePlanData()

  const { isLoading: isCancellingPlan, mutateAsync: downGradePlan } =
    useCancelSubscriptionPlan(onSubmitted)

  const doCancelPlan = async () => {
    if (planToCancel && planToCancel?.id) {
      await downGradePlan(planToCancel?.id || 0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lg:w-[550px]">
        <DialogHeader className="py-5 h-30">
          <DialogTitle className="flex items-center gap-2 h-40">
            <FiAlertCircle
              size={35}
              className="bg-red-100 p-2 rounded-lg text-red-600"
            />
            <div className="font-semibold text-xl text-gray-900">
              {t(`subscription:actions.cancelSubscriptions`)}
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="text-gray-600 pb-5">
          <DialogDescription />
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <div className="font-medium mb-1 text-gray-900">
              {t(`subscription:stripeProduct.${planToCancel?.name}`)}
            </div>
            <div className="text-sm text-gray-600">
              {`${getCurrencyPrefix(
                planToCancel?.price?.currency || 'usd'
              )}${formatCurrency(
                planToCancel?.price?.unitAmount || 0,
                planToCancel?.price?.currency || 'usd'
              )}`}
              /{t('subscription:year')}
            </div>
          </div>
          <div className="bg-yellow-50 border-yellow-200 border my-6 rounded-lg p-4">
            <div className="text-yellow-800 font-medium mb-2">
              {t('subscription:importantNote.title')}
            </div>
            <div className="text-sm flex flex-col gap-1 text-yellow-700">
              <div className="flex items-center gap-1">
                <LuDot size={25} />
                {t('subscription:importantNote.remainUntilNextBil', {
                  nextBillingDate,
                })}
              </div>
              <div className="flex items-center gap-1">
                <LuDot size={25} />
                {t('subscription:importantNote.noRefund')}
              </div>
              <div className="flex items-center gap-1">
                <LuDot size={25} />
                {t('subscription:importantNote.loseAllFeatures')}
              </div>
              <div className="flex items-center gap-1">
                <LuDot size={25} />
                {t('subscription:importantNote.resubscribe')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              className="mt-1"
              checked={isUnderstand}
              onCheckedChange={() => setUnderstand(!isUnderstand)}
              id="understand"
            />
            <Label
              htmlFor="understand"
              className="leading-5 cursor-pointer text-gray-700 text-sm"
            >
              {t('subscription:cancelLabelConfirm')}
            </Label>
          </div>
          <div className="flex items-start gap-2 my-2">
            <Checkbox
              id="backup"
              checked={isBackedUp}
              onCheckedChange={() => setBackedUp(!isBackedUp)}
            />
            <Label
              htmlFor="backup"
              className="cursor-pointer text-gray-700 text-sm"
            >
              {t('subscription:cancelLabelBackup')}
            </Label>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <Button
              variant="outline"
              className="w-1/2 border-gray-300"
              onClick={() => onBackToPlan()}
            >
              {t('subscription:actions.keepSubscription')}
            </Button>
            <Button
              variant="outline"
              className="w-1/2 bg-red-600 text-white border-none"
              loading={isCancellingPlan}
              disabled={!isUnderstand || !isBackedUp}
              onClick={() => doCancelPlan()}
            >
              {t('subscription:actions.cancelConfirm')}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default DialogCancelSubscription
