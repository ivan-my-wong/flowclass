import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCalendar, LuDollarSign } from 'react-icons/lu'

import Heading from '@/components/Texts/Heading'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import useSubscriptionPlanData from '@/hooks/useSubscriptionPlanData'
import ContentLayout from '@/layouts/ContentLayout'
import { StripePriceInterval } from '@/types/schoolSubscriptionPlan'
import {
  CurrencyEnum,
  SubscriptionPresetPlan,
} from '@/types/subscription-preset-plan'

import { CardPresetPlan } from './components/CardPresetPlan'

type SubscribePresetPlanProps = {
  activePresetPlanName?: string | null
}

const SubscribePresetPlan = ({
  activePresetPlanName,
}: SubscribePresetPlanProps) => {
  const { t } = useTranslation()
  const { currentSchool } = useSchoolData()
  const { currentSite } = useSiteData()
  const institutionId = currentSchool?.id
  const siteId = currentSite?.id
  const { useSubscriptionPresetPlans, useSubscribePresetPlan } =
    useSubscriptionPlanData()
  const { data: presetPlans } = useSubscriptionPresetPlans()
  const { mutateAsync: subscribePresetPlan, isLoading } =
    useSubscribePresetPlan(data => {
      window.open(data.url as string, '_blank')
    })
  const [currency, setCurrency] = useState<CurrencyEnum>(CurrencyEnum.HKD)
  const [intervalPlan, setIntervalPlan] = useState<StripePriceInterval>(
    StripePriceInterval.YEAR
  )
  const handleSubscribe = (plan: SubscriptionPresetPlan) => {
    const selectedPrice = plan.prices.find(
      price => price.currency === currency && price.interval === intervalPlan
    )
    if (!institutionId || !siteId || !plan.id || !selectedPrice?.stripePriceId)
      return
    subscribePresetPlan({
      presetPlanId: plan.id as number,
      institutionId,
      siteId,
      priceId: selectedPrice?.stripePriceId as string,
    })
  }
  return (
    <div className="mx-auto w-full flex flex-col justify-center items-center">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <div className="flex items-center gap-3">
          <LuCalendar className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-700">
            {t('onboarding:pricingPublic.presetPlans.duration')}
          </span>
          <div className="flex bg-white rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setIntervalPlan(StripePriceInterval.MONTH)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                intervalPlan === StripePriceInterval.MONTH
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('subscription:monthly') as string}
            </button>
            <button
              type="button"
              onClick={() => setIntervalPlan(StripePriceInterval.YEAR)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                intervalPlan === StripePriceInterval.YEAR
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('subscription:yearly') as string}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 align-baseline mx-auto w-full">
        {presetPlans?.map(plan => (
          <CardPresetPlan
            key={plan.id}
            plan={plan}
            currency={currency}
            interval={intervalPlan}
            onStartUsing={() => handleSubscribe(plan)}
            isLoading={isLoading}
            isCurrentPlan={plan.name === activePresetPlanName}
          />
        ))}
      </div>
    </div>
  )
}
export default SubscribePresetPlan
