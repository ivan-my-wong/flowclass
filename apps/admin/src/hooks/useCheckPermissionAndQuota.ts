import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'

import { getAllSubscriptionPlansAndQuotas } from '@/api/admin'
import { siteState } from '@/stores/siteData'
import { PlanType } from '@/types/schoolSubscriptionPlan'

import usePlanData from './useSubscriptionPlanData'

interface HookResult {
  isLoadingPermissionAndQuota: boolean
  checkQuota: (planType: PlanType) => boolean
  checkPermission: (fieldName: string, planName: string) => boolean
}
const useCheckPermissionAndQuota = (): HookResult => {
  const siteData = useRecoilValue(siteState)

  const { useGetSubscriptionPlansAndQuotas } = usePlanData()

  const { data, isFetching: isLoadingPermissionAndQuota } =
    useGetSubscriptionPlansAndQuotas()

  const checkQuota = (planType: PlanType) => {
    if (data?.quotas) {
      const { quotas } = data
      if (!quotas[planType]) return false
      const { used, quota } = quotas[planType]
      return used < quota
    }
    return false
  }

  const checkPermission = (fieldName: string, planName: string) => {
    if (data?.subscriptionPlans) {
      const { subscriptionPlans } = data
      if (!subscriptionPlans[fieldName]) return false

      const field = subscriptionPlans[fieldName]
      return field[planName]
    }
    return false
  }
  return { checkQuota, checkPermission, isLoadingPermissionAndQuota }
}

export default useCheckPermissionAndQuota
