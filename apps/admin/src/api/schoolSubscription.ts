import Stripe from 'stripe'

import {
  PlanWithQuotasResponse,
  StripeProductPrice,
  SubscriptionPlan,
  SubscriptionPlanRecord,
} from '../types/schoolSubscriptionPlan'

import apiClient from './index'

export const subscriptionPlanRecordsPrefix = '/admin/subscription-plan-records'

export const getAllSubscriptionPlans = async (): Promise<
  SubscriptionPlan[]
> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/subscription-plans',
  })

  return res.data.data
}

export const getSubscriptionDetail = async (
  schoolId: number
): Promise<Stripe.Subscription> => {
  const res = await apiClient.get({
    url: '/admin/stripe-connects/subscription-detail',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })

  return res.data.data
}

export const updateSubscription = async (
  schoolId: number,
  planIds: number[]
): Promise<Stripe.Subscription> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/update-subscription',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
    data: {
      planIds,
    },
  })

  return res.data.data
}

export const getUpdateSubscriptionPortalLink = async (
  schoolId: number,
  planIds: number[]
): Promise<Stripe.BillingPortal.Session> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/update-subscription-portal-link',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
    data: {
      planIds,
    },
  })

  return res.data.data
}

export const getAllPlanPrices = async (): Promise<StripeProductPrice[]> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/stripe-product-prices/all-plan-prices',
  })
  return res.data.data
}

export const downgradePlan = async (institutionId: number): Promise<void> => {
  await apiClient.post({
    url: '/admin/plans/downgrade-plan',
    params: { institutionId },
    needAuth: true,
  })
}

export const createSubscriptionUpgradeCheckoutSession = async (
  schoolId: number,
  stripeProductPricesIds: number[]
): Promise<Stripe.Checkout.Session> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/create-subscription`,
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
    data: {
      stripeProductPricesIds,
    },
  })
  return res.data.data
}

// Subscription Plan Records

export const getAllSubscriptionPlanRecords = async (): Promise<
  SubscriptionPlanRecord[]
> => {
  const res = await apiClient.get({
    url: subscriptionPlanRecordsPrefix,
    needAuth: true,
  })
  return res.data.data
}

export const getSubscriptionPlanRecordDetail = async (
  id: number
): Promise<SubscriptionPlanRecord> => {
  const res = await apiClient.get({
    url: `${subscriptionPlanRecordsPrefix}/${id}`,
    needAuth: true,
  })
  return res.data.data
}

export const getAllSubscriptionPlanRecordsBySiteId = async (
  institutionId: number,
  siteId: number
): Promise<SubscriptionPlanRecord[]> => {
  const res = await apiClient.get({
    url: `${subscriptionPlanRecordsPrefix}/site/${siteId}`,
    params: { institutionId },
    needAuth: true,
  })
  return res.data.data
}

export const getCurrentPlanAndQuotas = async (
  institutionId: number
): Promise<PlanWithQuotasResponse> => {
  const res = await apiClient.get({
    url: `${subscriptionPlanRecordsPrefix}/institution/${institutionId}/quotas`,
    needAuth: true,
  })

  return res.data.data
}

export const getActiveSubscriptionPlanRecord = async (
  institutionId: number,
  siteId: number
): Promise<SubscriptionPlanRecord> => {
  const res = await apiClient.get({
    url: `${subscriptionPlanRecordsPrefix}/site/${siteId}/active`,
    params: { institutionId },
    needAuth: true,
  })
  return res.data.data
}

export const createTrialPlan = async (
  siteId: number
): Promise<SubscriptionPlanRecord> => {
  const res = await apiClient.post({
    url: `${subscriptionPlanRecordsPrefix}/site/${siteId}/create-trial`,
    needAuth: true,
  })
  return res.data.data
}
