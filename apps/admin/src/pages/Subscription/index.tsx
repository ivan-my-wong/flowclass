import { useMemo } from 'react'

import usePlanData from '@/hooks/useSubscriptionPlanData'

import SubscribePresetPlan from './SubscribePresetPlan'

const SubscriptionManagementPage = (): JSX.Element => {
  const { useGetSubscriptionPlansAndQuotas, useSubscriptionPresetPlans } =
    usePlanData()
  const { data: subscriptionPlansAndQuota } = useGetSubscriptionPlansAndQuotas()
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

  return (
    <div className="w-full h-full p-6 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Choose Your Subscription Plan
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500">
            Select the plan that fits your business best. All plans include
            high-performance database querying and optimization toolsets.
          </p>
        </div>

        <SubscribePresetPlan activePresetPlanName={activePresetPlanName} />
      </div>
    </div>
  )
}

export default SubscriptionManagementPage
