import { useRecoilValue } from 'recoil'

import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'

const useSubscriptionPlanData = () => {
  const schoolSubscription = useRecoilValue(schoolSubscriptionState)
  return { schoolSubscription }
}

export default useSubscriptionPlanData
