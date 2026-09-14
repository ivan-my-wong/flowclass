import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import {
  PlanWithQuotasResponse,
  SubscriptionPlanRecord,
} from '../types/schoolSubscriptionPlan'

const defaultSubscriptionState: {
  planRecords: SubscriptionPlanRecord[]
  activePlan: SubscriptionPlanRecord
  planQuotas: PlanWithQuotasResponse
} = {
  planRecords: [] as SubscriptionPlanRecord[],
  activePlan: {} as SubscriptionPlanRecord,
  planQuotas: {} as PlanWithQuotasResponse,
}

export const schoolSubscriptionState = atom<{
  planRecords: SubscriptionPlanRecord[]
  activePlan: SubscriptionPlanRecord
  planQuotas: PlanWithQuotasResponse
}>({
  key: ATOM_KEY.SchoolSubscriptionState,
  default: defaultSubscriptionState,
})

export type SubscriptionDialogState = {
  open: boolean
  message: string | null
}

const defaultSubscriptionDialogState: SubscriptionDialogState = {
  open: false,
  message: null,
}

export const subscriptionDialogOpenState = atom<SubscriptionDialogState>({
  key: ATOM_KEY.SubscriptionDialogOpenState,
  default: defaultSubscriptionDialogState,
})
