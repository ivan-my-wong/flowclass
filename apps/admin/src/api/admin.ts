import { WhatsappMessageType } from '@/types/whatsappMessage'

import { School } from '../types/school'
import {
  AddPlansSubscriptionPayload,
  ClientSubscriptionPayload,
  CreateSubscriptionPlanRecordDirectlyProps,
  StripeBillingHistory,
  StripeConnectAccount,
  StripePaymentLinkRecord,
  SubscriptionPlanRecord,
  SubscriptionPlanRecordWithSite,
  SubscriptionPlansAndQuotasRecord,
  SubstituteSubscriptionPlanPayload,
  UpgradePreviewInfo,
  UpgradeSubscriptionPlanPayload,
} from '../types/schoolSubscriptionPlan'

import { subscriptionPlanRecordsPrefix } from './schoolSubscription'
import apiClient from '.'

export const createExpressStripeAccount = async (
  schoolId: number
): Promise<StripeConnectAccount> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/create-account',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })
  return res.data
}

export const createCustomerAccount = async (
  schoolId: number
): Promise<StripeConnectAccount> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/create-customer-account',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })
  return res.data.data.content
}

export const sendWtsTestMessage = async (
  sendWtsDTO: Partial<WhatsappMessageType>
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/notification-reminder/send',
    needAuth: true,
    data: sendWtsDTO,
  })
  return res.data
}

// Below are reserved for direct admin actions

export const getAllSubscriptionPlanRecordsMasterAdmin = async (
  siteId: number
): Promise<SubscriptionPlanRecordWithSite[]> => {
  const res = await apiClient.get({
    url: '/admin/subscription-plan-records',
    needAuth: true,
    params: {
      siteId,
    },
  })

  return res.data.data
}

export const createSubscriptionPlanRecordDirectly = async (
  data: CreateSubscriptionPlanRecordDirectlyProps
): Promise<SubscriptionPlanRecord> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/direct-upgrade`,
    data,
    needAuth: true,
  })
  return res.data.data
}

export const updateSubscriptionPlanRecord = async (
  id: number,
  data: Partial<SubscriptionPlanRecord>
): Promise<SubscriptionPlanRecord> => {
  const res = await apiClient.put({
    url: `${subscriptionPlanRecordsPrefix}/${id}`,
    data,
    needAuth: true,
  })
  return res.data.data
}

export const deleteSubscriptionPlanRecord = async (
  id: number
): Promise<void> => {
  await apiClient.delete({
    url: `${subscriptionPlanRecordsPrefix}/${id}`,
    needAuth: true,
  })
}

export const getAllInstitutionsForAdmin = async (): Promise<School[]> => {
  const res = await apiClient.get({
    url: '/admin/institutions/all',
    needAuth: true,
  })

  return res.data.data
}

export const createClientSubscriptionPlan = async (
  data: ClientSubscriptionPayload
): Promise<StripePaymentLinkRecord> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/create-multiple`,
    data,
    needAuth: true,
  })
  return res.data.data
}

export const getAllSubscriptionPlansAndQuotas = async (
  institutionId: number,
  siteId: number
): Promise<SubscriptionPlansAndQuotasRecord> => {
  const { data: subscriptions } = await apiClient.get({
    url: `/admin/subscription-plan-records/site/${siteId}`,
    params: { institutionId },
    needAuth: true,
  })
  const { data: subscriptionPlans }: { data: SubscriptionPlanRecord } =
    subscriptions
  let quotas

  if (subscriptionPlans) {
    const { planIds } = subscriptionPlans
    const { data: quota } = await apiClient.post({
      url: `/admin/subscription-plan-records/${siteId}/quotas`,
      data: {
        planIds,
      },
      params: { institutionId },
      needAuth: true,
    })
    const { data: quotaResp } = quota
    quotas = quotaResp
  }
  return { subscriptionPlans, quotas }
}

export const getUpgradeSubscriptionPreview = async (
  siteId: number,
  payload?: UpgradeSubscriptionPlanPayload
): Promise<UpgradePreviewInfo> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/preview-upgrade-plan`,
    data: payload ?? {},
    needAuth: true,
  })
  return res.data.data
}

export const upgradeSubscriptionPlan = async (
  siteId: number,
  payload: UpgradeSubscriptionPlanPayload | null
): Promise<StripePaymentLinkRecord> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/upgrade-plan`,
    data: payload || {},
    needAuth: true,
  })
  return res.data.data
}

export const downgradeSubscriptionPlan = async (
  siteId: number,
  payload: UpgradeSubscriptionPlanPayload | null
): Promise<UpgradePreviewInfo> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/downgrade-plan`,
    data: payload || {},
    needAuth: true,
  })
  return res.data.data
}

export const cancelSubscriptionPlan = async (
  siteId: number,
  planId: number
): Promise<UpgradePreviewInfo> => {
  const res = await apiClient.put({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/cancel-plan`,
    data: { planId },
    needAuth: true,
  })
  return res.data.data
}

export const getNewPlanSubscriptionPreview = async (
  siteId: number,
  payload: AddPlansSubscriptionPayload
): Promise<UpgradePreviewInfo> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/preview-add-plan`,
    data: payload || {},
    needAuth: true,
  })
  return res.data.data
}

export const addNewSubscriptionPlan = async (
  siteId: number,
  payload: AddPlansSubscriptionPayload
): Promise<UpgradePreviewInfo | StripePaymentLinkRecord> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/add-plan`,
    data: payload || {},
    needAuth: true,
  })
  return res.data.data
}

export const substituteSubscriptionPlan = async (
  siteId: number,
  payload: SubstituteSubscriptionPlanPayload | null
): Promise<SubscriptionPlanRecord> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/${siteId}/substitute-plan`,
    data: payload || {},
    needAuth: true,
  })
  return res.data.data
}

export const fetchSubscriptionBillingHistory = async (
  siteId: number
): Promise<StripeBillingHistory[]> => {
  const res = await apiClient.get({
    url: `${subscriptionPlanRecordsPrefix}/site/${siteId}/payment-history`,
    needAuth: true,
  })
  return res.data.data.data
}

export const changeOtherUserPassword = async (
  email: string,
  password: string
): Promise<void> => {
  await apiClient.post({
    url: `/admin/auth/change-other-user-password`,
    needAuth: true,
    data: {
      email,
      password,
    },
  })
}
