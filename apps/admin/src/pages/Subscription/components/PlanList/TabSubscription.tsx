import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { CardPresetPlan } from '@/pages/Subscription/components/CardPresetPlan'
import SubscriptionStep from '@/pages/Welcome/steps/SubscriptionStep'
import { StripePriceInterval } from '@/types/schoolSubscriptionPlan'
import { CurrencyEnum } from '@/types/subscription-preset-plan'

const TabSubscription = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useGetSubscriptionPlansAndQuotas, useSubscriptionPresetPlans } =
    usePlanData()
  const { data: subscriptionPlansAndQuota, isLoading } =
    useGetSubscriptionPlansAndQuotas()
  const { data: presetPlans } = useSubscriptionPresetPlans()

  const activeRecord = subscriptionPlansAndQuota?.subscriptionPlans
  const presetNames = useMemo(
    () => presetPlans?.map(p => p.name) || [],
    [presetPlans]
  )
  const activePresetPlanName = useMemo(() => {
    const plans = activeRecord?.plans || []
    const found = plans.find(p => presetNames.includes(p.name))
    return found?.name ?? null
  }, [activeRecord?.plans, presetNames])
  const activePresetPlan = useMemo(
    () => presetPlans?.find(p => p.name === activePresetPlanName) ?? null,
    [presetPlans, activePresetPlanName]
  )
  const activeCurrency =
    activeRecord?.currency?.toUpperCase() === 'USD'
      ? CurrencyEnum.USD
      : CurrencyEnum.HKD

  return (
    <div className="space-y-10">
      <SubscriptionStep
        showTestimonials={false}
        activePresetPlanName={activePresetPlanName}
      />

      <div>
        <div className="text-xl font-semibold text-gray-900 mb-4">
          {t('subscription:activeSubscription')}
        </div>
        {isLoading && (
          <div className="text-sm text-gray-500">{t('common:loading')}</div>
        )}
        {!isLoading && !activeRecord && (
          <div className="text-sm text-gray-500">
            {t('subscription:noSubscriptionLabel')}
          </div>
        )}
        {!isLoading && activeRecord && !activePresetPlan && (
          <div className="text-sm text-gray-500 rounded-lg border border-gray-200 bg-gray-50 p-4">
            {t('subscription:customPlanLabel')}
          </div>
        )}
        {!isLoading && activePresetPlan && (
          <div className="max-w-sm">
            <CardPresetPlan
              plan={activePresetPlan}
              currency={activeCurrency}
              interval={StripePriceInterval.YEAR}
              isCurrentPlan
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-lg font-semibold text-gray-900">
          {t('subscription:subscriptionManagement.customPlanTitle')}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {t('subscription:subscriptionManagement.customPlanDescription')}
        </div>
        <Button
          className="mt-4"
          variant="primary-outline"
          onClick={() => navigate('/subscription/create-subscription')}
        >
          {t('subscription:subscriptionManagement.createSubscription')}
        </Button>
      </div>
    </div>
  )
}

export default TabSubscription
