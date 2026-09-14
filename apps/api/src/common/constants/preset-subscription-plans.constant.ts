import {
  ContactChannelIntegrations,
  FeatureEnableEnum,
  ThirdPartyIntegrations,
} from '@/models/custom-types/integrations'
import { ClassTypeEnum, PromotionType, StripePriceInterval } from '@/models/enums'
import { SubscriptionPlanRecordsEntity } from '@/models/subscription-plan-records.entity'
import { PlanTier } from '@/models/subscription-plans.entity'

import { CurrencyPair } from './subscription-plans.constant'

export type PresetSubscriptionPlanType = Partial<SubscriptionPlanRecordsEntity> & {
  name: string
  prices: CurrencyPair[]
}

export const PRESET_SUBSCRIPTION_PLANS: PresetSubscriptionPlanType[] = [
  // Individual Trainers & Tutors
  {
    name: 'INDIVIDUAL_TRAINERS_TUTORS',

    planIds: [],

    baseUserQuantity: 100,

    notificationQuantity: 1000,

    schoolQuantity: 1,

    setupFeeQuantity: 1,

    adminQuantity: 3,

    tutorQuantity: 2,

    classTypeEnable: {
      [ClassTypeEnum.REGULAR]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },

    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
    },

    promotionTier: {
      [PromotionType.COUPON_DISCOUNT]: true,
    },

    featureEnable: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
    },

    customerSupportTier: PlanTier.STARTER,

    prices: [
      { currency: 'USD', price: 9.9, interval: StripePriceInterval.MONTH },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 99, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
    ],

    isTrial: false,
  },

  // Startup Education Centres
  {
    name: 'STARTUP_EDUCATION_CENTRES',

    planIds: [],

    baseUserQuantity: 500,

    notificationQuantity: 1000,

    schoolQuantity: 1,

    setupFeeQuantity: 1,

    adminQuantity: 3,

    tutorQuantity: 5,

    classTypeEnable: {
      [ClassTypeEnum.REGULAR]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },

    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.TWILIO_WHATSAPP]: true,
      [ContactChannelIntegrations.UNOFFICIAL_WHATSAPP]: true,
    },

    promotionTier: {
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.BUNDLE_DISCOUNT]: true,
    },

    featureEnable: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
    },

    integration: {
      [ThirdPartyIntegrations.GOOGLE_DRIVE]: true,
    },

    customerSupportTier: PlanTier.STARTER,

    prices: [
      { currency: 'USD', price: 49.9, interval: StripePriceInterval.MONTH },
      { currency: 'HKD', price: 380, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 499.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 3800, interval: StripePriceInterval.YEAR },
    ],

    isTrial: true,
  },

  // Small-scale Education Centres
  {
    name: 'GROWING_EDUCATION_CENTRES',

    planIds: [],

    baseUserQuantity: 1500,

    notificationQuantity: 2000,

    schoolQuantity: 4,

    setupFeeQuantity: 1,

    adminQuantity: 3,

    tutorQuantity: 10,

    classTypeEnable: {
      [ClassTypeEnum.REGULAR]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },

    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.TWILIO_WHATSAPP]: true,
      [ContactChannelIntegrations.UNOFFICIAL_WHATSAPP]: true,
    },

    promotionTier: {
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.BUNDLE_DISCOUNT]: true,
    },

    featureEnable: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.QRCODE_ATTENDANCE]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },

    integration: {
      [ThirdPartyIntegrations.GOOGLE_DRIVE]: true,
    },

    customerSupportTier: PlanTier.GROWTH,

    prices: [
      { currency: 'USD', price: 89.9, interval: StripePriceInterval.MONTH },
      { currency: 'HKD', price: 680, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 899.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 6800, interval: StripePriceInterval.YEAR },
    ],

    isTrial: true,
  },

  // Medium-size Education Centres
  {
    name: 'MULTI_BRANCH_EDUCATION_CENTRES',

    planIds: [],

    baseUserQuantity: 5000,

    notificationQuantity: 5000,

    schoolQuantity: 10,

    setupFeeQuantity: 1,

    adminQuantity: 10,

    tutorQuantity: 20,

    classTypeEnable: {
      [ClassTypeEnum.REGULAR]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },

    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.TWILIO_WHATSAPP]: true,
      [ContactChannelIntegrations.UNOFFICIAL_WHATSAPP]: true,
    },

    promotionTier: {
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.BUNDLE_DISCOUNT]: true,
    },

    featureEnable: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.QRCODE_ATTENDANCE]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },

    integration: {
      [ThirdPartyIntegrations.GOOGLE_DRIVE]: true,
    },

    customerSupportTier: PlanTier.PRO,

    prices: [
      { currency: 'USD', price: 169.9, interval: StripePriceInterval.MONTH },
      { currency: 'HKD', price: 1280, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 1699.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 12800, interval: StripePriceInterval.YEAR },
    ],

    isTrial: true,
  },

  // Large-size Education Centres
  {
    name: 'LARGE_SIZE_EDUCATION_CENTRES',

    planIds: [],

    baseUserQuantity: -1, // Unlimited

    notificationQuantity: 10000,

    schoolQuantity: 20,

    setupFeeQuantity: 1,

    adminQuantity: 30,

    tutorQuantity: 40,

    classTypeEnable: {
      [ClassTypeEnum.REGULAR]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },

    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.TWILIO_WHATSAPP]: true,
      [ContactChannelIntegrations.UNOFFICIAL_WHATSAPP]: true,
    },

    promotionTier: {
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.BUNDLE_DISCOUNT]: true,
    },

    featureEnable: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.QRCODE_ATTENDANCE]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },

    integration: {
      [ThirdPartyIntegrations.GOOGLE_DRIVE]: true,
    },

    customerSupportTier: PlanTier.ENTERPRISE,

    prices: [
      { currency: 'USD', price: 259.9, interval: StripePriceInterval.MONTH },
      { currency: 'HKD', price: 1980, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 2599.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 19800, interval: StripePriceInterval.YEAR },
    ],

    isTrial: true,
  },
]
