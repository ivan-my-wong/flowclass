import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsWindowDesktop } from 'react-icons/bs'
import { FaArrowRight } from 'react-icons/fa'
import { IoCheckmark } from 'react-icons/io5'
import { useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { getSubscribedPlanByPlanType } from '@/stores/subscription'
import {
  NewPlanPayload,
  SubscriptionRecordPlan,
  SubscriptionReview,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import CardSubscribedPlan from './CardSubscribedPlan'

interface Props {
  currentPlan: SubscriptionRecordPlan
  availablePlans: SubscriptionRecordPlan[]
  onProceed: (selected: SubscriptionReview) => void
  onCancel: () => void
}
const ContentClassType: React.FC<Props> = ({
  currentPlan,
  availablePlans,
  onProceed,
  onCancel,
}): JSX.Element => {
  const { t } = useTranslation()
  const currency = currentPlan.price?.currency || 'usd'
  const currencyPrefix = getCurrencyPrefix(currency)
  const [selected, setSelected] = useState<SubscriptionRecordPlan | null>(null)
  const subscribedPlans = useRecoilValue(
    getSubscribedPlanByPlanType(currentPlan.type)
  ).filter(item => item.id !== currentPlan.id)
  const unSubscribedPlans = useMemo(() => {
    return availablePlans.filter(item => {
      const isExistOnSubscription = subscribedPlans.some(x => x.id === item.id)
      if (isExistOnSubscription) {
        return false
      }
      return true
    })
  }, [availablePlans, subscribedPlans])

  const priceCalculation = useMemo(() => {
    const totalPrice: number = Number(selected?.price?.unitAmount || 0)
    const totalPriceLabel = `${currencyPrefix}${formatCurrency(
      totalPrice,
      currency
    )}`

    return { totalPrice, totalPriceLabel }
  }, [currency, currencyPrefix, selected])

  const handleProceed = () => {
    if (selected) {
      const { id, price } = selected
      const payload: NewPlanPayload[] = [
        {
          planId: id,
          priceId: price?.id || 0,
          planQuantity: 1,
          targetedPlans: selected,
        },
      ]
      onProceed({
        actionType: 'substitute',
        targetTotalPrice: priceCalculation.totalPrice,
        targetTotalPriceLabel: priceCalculation.totalPriceLabel,
        targetedPlans: payload,
      })
    }
  }

  return (
    <>
      <DialogBody>
        <DialogDescription className="mb-6 text-gray-600">
          {t('subscription:planType.CLASS_TYPE.desc2')}
        </DialogDescription>
        <CardSubscribedPlan currentPlan={currentPlan} onCancel={onCancel} />
        {!currentPlan.isCanceled && unSubscribedPlans.length > 0 && (
          <>
            <div className="font-medium text-sm mt-3 mb-2">
              {t('subscription:switchPlans')}
            </div>
            {unSubscribedPlans.map(availablePlan => (
              <Card
                key={availablePlan.id}
                className="p-5 rounded-lg shadow-none cursor-pointer border-gray-200 bg-white relative mb-4"
                onClick={() => setSelected(availablePlan)}
              >
                <div className="flex items-center gap-3">
                  <BsWindowDesktop
                    size={40}
                    className="p-3 rounded-lg bg-blue-100 text-blue-500"
                  />
                  <div className="font-medium">
                    {t(`subscription:stripeProduct.${availablePlan.name}`)}
                  </div>
                  <div className="text-right ml-auto">
                    <div className="text-2xl font-semibold">
                      {`${getCurrencyPrefix(
                        availablePlan.price?.currency || 'usd'
                      )}${formatCurrency(
                        availablePlan.price?.unit_amount || 0,
                        availablePlan.price?.currency || 'usd'
                      )}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('subscription:perYear')}
                    </div>
                  </div>
                </div>
                {selected?.id === availablePlan.id && (
                  <div className="w-6 h-6 absolute right-2 top-1 rounded-full bg-primary text-gray-50 flex items-center justify-center">
                    <IoCheckmark size={18} />
                  </div>
                )}
              </Card>
            ))}
          </>
        )}
      </DialogBody>
      {!currentPlan.isCanceled && unSubscribedPlans.length > 0 && (
        <DialogFooter className="flex items-center bg-white justify-between border-t border-gray-300">
          <div>
            <div className="text-sm font-medium text-gray-600">
              {t('subscription:totalPrice')}
            </div>
            <div className="text-2xl font-medium">
              {priceCalculation.totalPriceLabel}
            </div>
          </div>
          <div>
            <Button
              disabled={selected === null}
              onClick={() => handleProceed()}
              iconAfter={<FaArrowRight />}
            >
              {t('subscription:actions.proceedReview')}
            </Button>
          </div>
        </DialogFooter>
      )}
    </>
  )
}

export default ContentClassType
