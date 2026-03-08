import Stripe from 'stripe'

import { StripeConnectDetail } from '../types/stripe-connect'

import apiClient from './index'

export type StripeAccountLinkProps = {
  object: string
  created: Date
  // eslint-disable-next-line camelcase
  expires_at: Date
  url: string

  returnUrl?: string
  refreshUrl?: string
}

export type StripeExpressDashboardProps = {
  object: string
  created: Date
  url: string
}

const refreshUrl = `${window.location.protocol}//${window.location.host}/settings/payments`

export const connectStripe = async (
  institutionId: number
): Promise<StripeAccountLinkProps> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects',

    needAuth: true,
    data: { institutionId, returnUrl: refreshUrl, refreshUrl },
  })

  return res.data.data as StripeAccountLinkProps
}

export const connectExpressDashboard = async (
  institutionId: number
): Promise<StripeExpressDashboardProps> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/express-dashboard',

    needAuth: true,

    data: { institutionId },
  })

  return res.data.data as StripeExpressDashboardProps
}

export const getBillingPortalLink = async (
  institutionId: number
): Promise<Stripe.BillingPortal.Session> => {
  const res = await apiClient.get({
    url: '/admin/stripe-connects/billing-portal',
    needAuth: true,
    params: { institutionId },
  })

  return res.data.data
}

export const getExpressAccountDetail = async (
  institutionId: number
): Promise<Stripe.Account> => {
  const res = await apiClient.get({
    url: '/admin/stripe-connects/account-detail',
    needAuth: true,
    params: { institutionId },
  })

  return res.data.data
}

export const getStripeConnectDetail = async (
  institutionId: number
): Promise<StripeConnectDetail> => {
  const res = await apiClient.get({
    url: '/admin/stripe-connects/stripe-connect-detail',
    needAuth: true,
    params: { institutionId },
  })

  return res.data.data
}

export const enableStripe = async (
  institutionId: number,
  enabled: boolean
): Promise<StripeConnectDetail> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/enabled',
    needAuth: true,
    params: { institutionId },
    data: { institutionId, enabled },
  })

  return res.data.data
}
