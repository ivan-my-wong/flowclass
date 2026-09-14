import { TFunction } from 'i18next'

import {
  PlanType,
  SubscriptionProductQuotaKey,
} from '@/types/schoolSubscriptionPlan'

import { isNumberInRange } from './number.utils'

export const getSchoolPlanKey = (count: number): string => {
  if (count === 1) return SubscriptionProductQuotaKey.MULTIPLE_INSTITUTION_1
  if (isNumberInRange(count, 2, 4))
    return SubscriptionProductQuotaKey.MULTIPLE_INSTITUTION_4
  if (isNumberInRange(count, 5, 10))
    return SubscriptionProductQuotaKey.MULTIPLE_INSTITUTION_10
  if (isNumberInRange(count, 11, 20))
    return SubscriptionProductQuotaKey.MULTIPLE_INSTITUTION_20
  if (isNumberInRange(count, 21, 50))
    return SubscriptionProductQuotaKey.MULTIPLE_INSTITUTION_50
  if (count > 50)
    return SubscriptionProductQuotaKey.MULTIPLE_INSTITUTION_UNLIMITED
  return ''
}

export const getTutorPlanKey = (count: number): string => {
  if (isNumberInRange(count, 0, 2))
    return SubscriptionProductQuotaKey.MULTIPLE_TUTOR_2
  if (isNumberInRange(count, 3, 5))
    return SubscriptionProductQuotaKey.MULTIPLE_TUTOR_5
  if (isNumberInRange(count, 6, 10))
    return SubscriptionProductQuotaKey.MULTIPLE_TUTOR_10
  if (isNumberInRange(count, 11, 20))
    return SubscriptionProductQuotaKey.MULTIPLE_TUTOR_20
  if (count > 20) return SubscriptionProductQuotaKey.MULTIPLE_TUTOR_UNLIMITED

  return ''
}

export const getAdminPlanKey = (count: number): string => {
  if (isNumberInRange(count, 1, 3))
    return SubscriptionProductQuotaKey.MULTIPLE_ADMIN_1
  if (isNumberInRange(count, 4, 10))
    return SubscriptionProductQuotaKey.MULTIPLE_ADMIN_4
  if (isNumberInRange(count, 11, 20))
    return SubscriptionProductQuotaKey.MULTIPLE_ADMIN_20
  if (isNumberInRange(count, 21, 30))
    return SubscriptionProductQuotaKey.MULTIPLE_ADMIN_30
  if (count > 30) return SubscriptionProductQuotaKey.MULTIPLE_ADMIN_UNLIMITED
  return ''
}

export const getPlanTypeDisplayName = (
  type: PlanType,
  t: TFunction
): string => {
  switch (type) {
    case PlanType.BASE_USER:
      return t('planType.BASE_USER.title')
    case PlanType.MULTIPLE_SCHOOL:
      return t('planType.MULTIPLE_SCHOOL.title')
    case PlanType.FEATURE_ENABLE:
      return t('planType.FEATURE_ENABLE.title')
    case PlanType.NOTIFICATION_CHANNEL:
      return t('planType.NOTIFICATION_CHANNEL.title')
    case PlanType.INTEGRATION:
      return t('planType.INTEGRATION.title')
    case PlanType.CUSTOMER_SUPPORT:
      return t('planType.CUSTOMER_SUPPORT.title')
    case PlanType.CLASS_TYPE:
      return t('planType.CLASS_TYPE.title')
    case PlanType.SETUP_FEE:
      return t('planType.SETUP_FEE.title')
    case PlanType.MULTIPLE_ADMIN:
      return t('planType.MULTIPLE_ADMIN.title')
    case PlanType.MULTIPLE_TUTOR:
      return t('planType.MULTIPLE_TUTOR.title')
    case PlanType.PROMOTION_FEES:
      return t('planType.PROMOTION_FEES.title')
    default:
      return String(type).replace(/_/g, ' ')
  }
}
