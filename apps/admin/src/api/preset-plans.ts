import Stripe from 'stripe'

import {
  SubscribePresetPlansDto,
  SubscriptionPresetPlan,
} from '@/types/subscription-preset-plan'

import apiClient from './index'

export const getPresetPlans = async (): Promise<SubscriptionPresetPlan[]> => {
  const res = await apiClient.get({
    url: '/admin/subscription-plans/preset-plans',
    needAuth: true,
  })

  return res.data.data
}

export const subscribePresetPlan = async (
  dto: SubscribePresetPlansDto
): Promise<Stripe.Checkout.Session> => {
  const res = await apiClient.post({
    url: '/admin/subscription-plan-records/preset-plans/subscribe',
    needAuth: true,
    data: dto,
  })

  return res.data.data
}
