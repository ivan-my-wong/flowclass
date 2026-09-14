import { UserRole } from '@/stores/userPermissionData'
import {
  PlanTier,
  StripePriceInterval,
  type SubscriptionPlanRecord,
} from '@/types/schoolSubscriptionPlan'
import type { UserState } from '@/types/user'

import dayjs from './dayjs'

export const getIntervalFromRecord = (
  record: SubscriptionPlanRecord
): StripePriceInterval | undefined => {
  const totalMonths = dayjs(record.expiryDate).diff(
    dayjs(record.purchaseDate),
    'month'
  )
  return totalMonths > 1 ? StripePriceInterval.YEAR : StripePriceInterval.MONTH
}

export const isSuperAdminUser = (
  userPermission?: UserRole,
  user?: Partial<UserState> | null
): boolean => {
  if (userPermission === UserRole.MasterAdmin) return true
  if (user?.permissions?.some(p => p.isMasterAdmin)) return true
  return false
}

export const isProOrAbovePlan = (
  activePlan?: Partial<SubscriptionPlanRecord> | null
): boolean => {
  if (!activePlan) return false
  const supportTier = activePlan.customerSupportTier
  if (
    supportTier === PlanTier.PRO ||
    supportTier === PlanTier.ENTERPRISE ||
    supportTier === PlanTier.GROWTH ||
    supportTier === PlanTier.CUSTOM
  ) {
    return true
  }
  if (
    activePlan.plans?.some(
      p =>
        p.tier === PlanTier.PRO ||
        p.tier === PlanTier.ENTERPRISE ||
        p.tier === PlanTier.GROWTH ||
        p.tier === PlanTier.CUSTOM ||
        p.name?.toLowerCase()?.includes('pro')
    )
  ) {
    return true
  }
  return false
}

export const hasWhatsappAccess = (
  userPermission?: UserRole,
  user?: Partial<UserState> | null,
  activePlan?: Partial<SubscriptionPlanRecord> | null
): boolean => {
  if (isSuperAdminUser(userPermission, user)) return true
  if (isProOrAbovePlan(activePlan)) return true
  if (
    activePlan?.notificationChannels?.TWILIO_WHATSAPP ||
    activePlan?.notificationChannels?.META_WHATSAPP ||
    activePlan?.notificationChannels?.UNOFFICIAL_WHATSAPP
  ) {
    return true
  }
  return false
}
