import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'

type ActivePlan = {
  planIds?: number[]
  notificationChannels?: Record<string, boolean>
  customerSupportTier?: string
  isTrial?: boolean
}

type PlanQuotas = {
  activeStudents?: { used: number; quota: number }
  reminder?: { used: number; quota: number }
}

const defaultSubscriptionState: {
  planRecords: unknown[]
  activePlan: ActivePlan
  planQuotas: PlanQuotas
} = {
  planRecords: [],
  activePlan: {},
  planQuotas: {},
}

export const schoolSubscriptionState = atom<{
  planRecords: unknown[]
  activePlan: ActivePlan
  planQuotas: PlanQuotas
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
