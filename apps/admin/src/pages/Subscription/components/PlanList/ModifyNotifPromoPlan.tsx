import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsWindowDesktop } from 'react-icons/bs'
import { FaArrowRight } from 'react-icons/fa'
import { IoCheckmark } from 'react-icons/io5'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DialogBody, DialogDescription } from '@/components/ui/Dialog'
import {
  NewPlanPayload,
  SubscriptionRecordPlan,
  SubscriptionReview,
  SupportedActions,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import CardSubscribedPlan from './CardSubscribedPlan'

interface Props {
  currentPlan: SubscriptionRecordPlan
  availablePlans: SubscriptionRecordPlan[]
  onProceed: (selected: SubscriptionReview) => void
  onCancel: () => void
}

const ContentNotificationChannel: React.FC<Props> = ({
  currentPlan,
  availablePlans,
  onProceed,
  onCancel,
}): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<SubscriptionRecordPlan | null>(null)

  const usedPlans = useMemo(() => {
    return availablePlans.filter(item => {
      if (item.price?.unitAmount) {
        return item?.price?.unitAmount > 0
      }
      return false
    })
  }, [availablePlans])

  const isSelected = (plan: SubscriptionRecordPlan) => {
    return plan.id === selected?.id
  }

  const handleProceed = () => {
    const currentPrice = currentPlan.price?.unitAmount || 0
    const targetedPrice = selected?.price?.unitAmount || 0
    const diff = targetedPrice - currentPrice
    let actionType: SupportedActions = 'substitute'

    if (diff > 0) {
      actionType = 'upgrade'
    } else if (diff < 0) {
      actionType = 'downgrade'
    }

    if (selected) {
      const { id, price } = selected
      const targetedPlans: NewPlanPayload[] = [
        {
          planId: id,
          priceId: price?.id || 0,
          planQuantity: 1,
          targetedPlans: selected,
        },
      ]

      const totalPrice = Number(price?.unitAmount || 0)
      const totalPriceLabel = `${getCurrencyPrefix(
        price?.currency
      )}${formatCurrency(price?.unitAmount || 0, price?.currency || 'usd')}`

      onProceed({
        actionType,
        targetTotalPrice: totalPrice,
        targetTotalPriceLabel: totalPriceLabel,
        targetedPlans,
      })
    }
  }

  return (
    <>
      <DialogBody>
        <DialogDescription className="mb-6 text-gray-600">
          {currentPlan.type === 'NOTIFICATION_CHANNEL'
            ? t('subscription:planType.NOTIFICATION_CHANNEL.desc')
            : t('subscription:planType.PROMOTION_FEES.desc')}
        </DialogDescription>
        <CardSubscribedPlan currentPlan={currentPlan} onCancel={onCancel} />
        {!currentPlan.isCanceled &&
          currentPlan.price &&
          usedPlans.length > 0 && (
            <>
              <div className="font-medium text-sm my-3">
                {t('subscription:switchPlans')}
              </div>
              {usedPlans.map(availablePlan => (
                <Card
                  key={availablePlan.id}
                  className="px-5 py-5 mb-6 shadow-none border-gray-300 cursor-pointer relative"
                  onClick={() => {
                    setSelected(availablePlan)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BsWindowDesktop
                      size={40}
                      className="p-3 rounded-lg bg-blue-100 text-blue-500"
                    />
                    <div className="text-sm font-semibold">
                      {t(`subscription:stripeProduct.${availablePlan?.name}`)}
                    </div>
                    <div className="text-right ml-auto">
                      <div className="text-2xl font-semibold">
                        {`${getCurrencyPrefix(
                          availablePlan.price?.currency || 'usd'
                        )}${formatCurrency(
                          availablePlan.price?.unitAmount || 0,
                          availablePlan.price?.currency || 'usd'
                        )}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t('subscription:perYear')}
                      </div>
                    </div>
                  </div>
                  {isSelected(availablePlan) && (
                    <div className="w-6 h-6 absolute right-2 top-1 rounded-full bg-primary text-gray-50 flex items-center justify-center">
                      <IoCheckmark size={18} />
                    </div>
                  )}
                </Card>
              ))}
              <div className="flex items-center justify-end gap-2 my-5">
                <Button
                  disabled={!selected}
                  iconAfter={<FaArrowRight />}
                  onClick={() => handleProceed()}
                >
                  {t('subscription:actions.proceedReview')}
                </Button>
              </div>
            </>
          )}
      </DialogBody>
    </>
  )
}

export default ContentNotificationChannel
