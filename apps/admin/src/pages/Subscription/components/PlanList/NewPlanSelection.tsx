import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsWindowDesktop } from 'react-icons/bs'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa'
import { IoCheckmark } from 'react-icons/io5'
import { useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DialogDescription } from '@/components/ui/Dialog'
import {
  availablePlanByPlanType,
  getSubscribedPlanByPlanType,
} from '@/stores/subscription'
import { SubscriptionRecordPlan } from '@/types/schoolSubscriptionPlan'
import { cn } from '@/utils/cn'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import { PlanCategory } from './DialogNewPlan'
import ReviewNewPlan from './ReviewNewPlan'

const unUsedPlans = [
  'FEATURE_ENABLE_RESCHEDULE_REQUEST',
  'FEATURE_ENABLE_APPLY_MULTIPLE_COURSES',
]

interface Props {
  planType: PlanCategory
  onBack: () => void
  onSubmitted: () => void
}
const NewPlanSelection: React.FC<Props> = ({
  planType,
  onBack,
  onSubmitted,
}): JSX.Element => {
  const { t } = useTranslation()
  const [isReviewMode, setReviewMode] = useState<boolean>(false)
  const availablePlans = useRecoilValue(availablePlanByPlanType(planType.type))
  const subscribedPlans = useRecoilValue(
    getSubscribedPlanByPlanType(planType.type)
  )
  const isMultipleSelection = planType.multipleChoices
  const [selectedPlans, setSelectedPlans] = useState<SubscriptionRecordPlan[]>(
    []
  )

  const usedPlans = useMemo(() => {
    return availablePlans.filter(
      plan =>
        unUsedPlans.indexOf(plan.name) < 0 &&
        plan.price &&
        plan.price.unitAmount > 0
    )
  }, [availablePlans])

  const totalPrice = useMemo(() => {
    let priceTemp: number = 0
    let currency: string = 'usd'
    selectedPlans.forEach(item => {
      const { price } = item
      if (price) {
        currency = price.currency
        priceTemp += Number(price.unitAmount)
      }
    })

    return {
      price: priceTemp,
      priceLabel: `${getCurrencyPrefix(currency)}${formatCurrency(
        priceTemp,
        currency
      )}`,
    }
  }, [selectedPlans])

  const onSelectPlan = (selected: SubscriptionRecordPlan) => {
    if (isSelected(selected)) {
      let newSelecteds: SubscriptionRecordPlan[]
      if (isMultipleSelection) {
        newSelecteds = selectedPlans.filter(item => item.name !== selected.name)
      } else {
        newSelecteds = []
      }
      setSelectedPlans(newSelecteds)
      return
    }
    if (isMultipleSelection) {
      const newSelecteds = [...selectedPlans, selected]
      setSelectedPlans(newSelecteds)
    } else {
      setSelectedPlans([selected])
    }
  }

  const isDisabledProceed = useMemo(() => {
    return selectedPlans.length === 0
  }, [selectedPlans])

  const isSubscribed = (plan: SubscriptionRecordPlan) => {
    const subscribedItems = subscribedPlans.map(item => item.name)
    return subscribedItems.indexOf(plan.name) >= 0
  }

  const isSelected = (plan: SubscriptionRecordPlan) => {
    const found = selectedPlans.find(item => item.name === plan.name)

    return !!found
  }

  return (
    <div className="mb-4">
      {isReviewMode ? (
        <ReviewNewPlan
          selectedPlans={selectedPlans}
          onBack={() => setReviewMode(false)}
          onSubmitted={onSubmitted}
        />
      ) : (
        <>
          <Button
            variant="ghost"
            className="flex pl-0 items-center gap-2 text-blue-600 mb-4 cursor-pointer"
            onClick={() => onBack()}
          >
            <FaArrowLeft />
            {t('subscription:addPlan.btnBackToCat')}
          </Button>
          <div className="font-semibold mb-1">
            {t(`subscription:planType.${planType.type}.title`)}
          </div>
          <DialogDescription className="mb-6 font-medium text-gray-600">
            {t(`subscription:planType.${planType.type}.desc`)}
          </DialogDescription>
          {usedPlans.map(availablePlan => (
            <Card
              key={availablePlan.id}
              className={cn(
                'px-5 py-7 mb-6 shadow-none border-gray-300 cursor-pointer relative',
                isSubscribed(availablePlan) &&
                  'bg-green-50 cursor-default border-green-300'
              )}
              onClick={() =>
                !isSubscribed(availablePlan) && onSelectPlan(availablePlan)
              }
            >
              <div className="flex items-center gap-3">
                <BsWindowDesktop
                  size={40}
                  className={cn(
                    'p-3 rounded-lg bg-blue-100 text-blue-700',
                    isSubscribed(availablePlan) && 'bg-green-200 text-green-800'
                  )}
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
                    {t(`subscription:perYear`)}
                  </div>
                </div>
              </div>
              {isSubscribed(availablePlan) && (
                <>
                  <Card className="bg-green-200 shadow-none border-none p-3 rounded-lg text-green-800 text-sm mt-4 font-medium">
                    {t(`subscription:planCurrentlyActiveLabel`)}
                  </Card>
                  <div className="px-3 py-1 flex items-center gap-2 text-xs text-white font-medium bg-green-500 rounded-full w-fit absolute top-[-13px] right-6">
                    <FaCheck size={12} /> {t(`subscription:subscribed`)}
                  </div>
                </>
              )}
              {isSelected(availablePlan) && (
                <div className="w-6 h-6 absolute right-4 top-2 rounded-full bg-primary text-gray-50 flex items-center justify-center">
                  <IoCheckmark size={18} />
                </div>
              )}
            </Card>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300 sticky z-10 bottom-0 bg-white">
            <div>
              <div className="text-sm font-medium text-gray-600">
                {t(`subscription:totalPrice`)}
              </div>
              <div className="text-2xl font-semibold text-primary">
                {totalPrice.priceLabel}
              </div>
            </div>
            <Button
              iconAfter={<FaArrowRight />}
              disabled={isDisabledProceed}
              onClick={() => setReviewMode(true)}
            >
              {t(`subscription:actions.proceedReview`)}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default NewPlanSelection
