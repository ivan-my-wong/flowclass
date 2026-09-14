import { ReactElement } from 'react'

import useAuth from '@/hooks/useAuth'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { SubscriptionPlanRecord } from '@/types/schoolSubscriptionPlan'

interface IPaywallComponentProps {
  planKey: keyof SubscriptionPlanRecord
  planValue: number | string | boolean
  fallback?: ReactElement
  children: ReactElement
}

const PaywallComponent: React.FC<IPaywallComponentProps> = ({
  planKey,
  planValue,
  children,
  fallback,
}) => {
  const { isLogin } = useAuth()
  const { checkSubscriptionAccess } = usePlanData()

  const isPass = checkSubscriptionAccess(planKey, planValue)

  if (isLogin && isPass) {
    return children
  }
  return fallback ?? <></>
}

export default PaywallComponent
