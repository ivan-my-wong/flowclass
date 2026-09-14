import {
  ClassTypeEnable,
  ContactChannelEnable,
  FeatureEnable,
  IntegrationEnable,
  PresetPlanTier,
  PromotionEnable,
  StripePriceInterval,
} from './schoolSubscriptionPlan'

export enum CurrencyEnum {
  HKD = 'HKD',
  USD = 'USD',
}

export type PresetPlansPrice = {
  currency: CurrencyEnum
  price: number
  interval: StripePriceInterval
  stripePriceId?: string
}

export type SubscriptionPresetPlan = {
  id?: number
  name: string
  baseUserQuantity: number
  notificationQuantity: number
  schoolQuantity: number
  setupFeeQuantity: number
  adminQuantity: number
  tutorQuantity: number
  classTypeEnable: ClassTypeEnable
  featureEnable: FeatureEnable
  notificationChannels: ContactChannelEnable
  promotionTier: PromotionEnable
  integration: IntegrationEnable
  customerSupportTier: PresetPlanTier
  totalPrice: number
  currency: CurrencyEnum
  stripeProductId: string
  prices: PresetPlansPrice[]
  isTrial: boolean
}

export type SubscribePresetPlansDto = {
  presetPlanId: number
  priceId: string
  siteId: number
  institutionId: number
}
