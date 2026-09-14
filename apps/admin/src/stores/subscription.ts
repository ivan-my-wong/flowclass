import { atom, selectorFamily } from 'recoil'

import { ATOM_KEY, SELECTOR_KEY } from '@/constants/atomKey'
import { SubscriptionRecordPlan } from '@/types/schoolSubscriptionPlan'

const defaultSubsctiptionPlansData: SubscriptionRecordPlan[] = []

export const allSubscriptionPlansState = atom<SubscriptionRecordPlan[]>({
  key: ATOM_KEY.SubscriptionPlansState,
  default: defaultSubsctiptionPlansData,
})

export const availablePlanByPlanId = selectorFamily({
  key: SELECTOR_KEY.AvailablePlanByPlanIdSelector,
  get:
    (plan?: SubscriptionRecordPlan | null) =>
    ({ get }) => {
      return get(allSubscriptionPlansState).filter(
        item => item.type === plan?.type && item.id !== plan.id
      )
    },
})

export const availablePlanByPlanType = selectorFamily({
  key: SELECTOR_KEY.AvailablePlanByPlanTypeSelector,
  get:
    (planType?: string | null) =>
    ({ get }) => {
      return get(allSubscriptionPlansState).filter(
        item => item.type === planType
      )
    },
})

const defaultSubscribedPlansData: SubscriptionRecordPlan[] = []

export const allSubscribedPlans = atom<SubscriptionRecordPlan[]>({
  key: ATOM_KEY.SubscribedPlansState,
  default: defaultSubscribedPlansData,
})

export const getSubscribedPlanByPlanType = selectorFamily({
  key: SELECTOR_KEY.SubscribedPlanByPlanType,
  get:
    (planType?: string | null) =>
    ({ get }) => {
      return get(allSubscribedPlans).filter(item => item.type === planType)
    },
})
