import {
  ContactChannelIntegrations,
  FeatureEnableEnum,
  ThirdPartyIntegrations,
} from '@/models/custom-types/integrations'
import { ClassTypeEnum, PromotionType, StripePriceInterval, StripePriceType } from '@/models/enums'
import {
  PlanPermission,
  SubscriptionPlanRecordsEntity,
} from '@/models/subscription-plan-records.entity'
import { PlanPriceMode, PlanTier, PlanType } from '@/models/subscription-plans.entity'

export type CurrencyPair = {
  currency: string
  price: number
  interval?: StripePriceInterval
}

export type SubscriptionPlanType = {
  name: string
  type: PlanType
  tier: PlanTier
  priceMode: PlanPriceMode
  priceInterval: StripePriceType
  typeQuantity?: number
  typeQuota?: number
  typePermission?: Partial<Record<PlanPermission, boolean>>
  typeColumnName: string
  prices: CurrencyPair[]
  inTrial?: boolean
  inFree?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanType[] = [
  // Users (Base User Tiers)
  {
    name: 'BASE_USER_100',
    type: PlanType.BASE_USER,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuantity: 100,
    typeQuota: 100,
    typeColumnName: 'baseUserQuantity',
    inFree: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 99.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 100, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 12.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'BASE_USER_500',
    type: PlanType.BASE_USER,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 500,
    typeQuota: 500,
    typeColumnName: 'baseUserQuantity',
    priceInterval: StripePriceType.RECURRING,
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 2800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 349.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 350, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 43.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'BASE_USER_1500',
    type: PlanType.BASE_USER,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 1500,
    typeQuota: 1500,
    typeColumnName: 'baseUserQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 4800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 519.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 600, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 74.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'BASE_USER_3000',
    type: PlanType.BASE_USER,
    tier: PlanTier.PRO,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 3000,
    typeQuota: 3000,
    typeColumnName: 'baseUserQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 6800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 869.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 750, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 93.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'BASE_USER_5000',
    type: PlanType.BASE_USER,
    tier: PlanTier.ENTERPRISE,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 5000,
    typeQuota: 5000,
    typeColumnName: 'baseUserQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 9800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 1249.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 1250, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 154.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'BASE_USER_UNLIMITED',
    type: PlanType.BASE_USER,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: -1,
    typeColumnName: 'baseUserQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 19800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 2529.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 2500, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 319.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Multiple Schools
  {
    name: 'MULTIPLE_INSTITUTION_1',
    type: PlanType.MULTIPLE_SCHOOL,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 1,
    typeColumnName: 'schoolQuantity',
    priceInterval: StripePriceType.RECURRING,
    inTrial: true,
    inFree: true,
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 0, interval: StripePriceInterval.YEAR },
    ],
  },

  {
    name: 'MULTIPLE_INSTITUTION_4',
    type: PlanType.MULTIPLE_SCHOOL,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 1,
    typeColumnName: 'schoolQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 500, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 62.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 65, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 8.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_INSTITUTION_10',
    type: PlanType.MULTIPLE_SCHOOL,
    tier: PlanTier.PRO,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 10,
    typeColumnName: 'schoolQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 480, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 62.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 60, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 7.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_INSTITUTION_20',
    type: PlanType.MULTIPLE_SCHOOL,
    tier: PlanTier.ENTERPRISE,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 20,
    typeColumnName: 'schoolQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 450, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 55.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 55, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 6.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_INSTITUTION_50',
    type: PlanType.MULTIPLE_SCHOOL,
    tier: PlanTier.ENTERPRISE,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 50,
    typeColumnName: 'schoolQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 350, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 44.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 40, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 5.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_INSTITUTION_UNLIMITED',
    type: PlanType.MULTIPLE_SCHOOL,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: -1,
    typeColumnName: 'schoolQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 30000, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 3849.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 3500, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 449.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Set Up Fee
  {
    name: 'SETUP_FEE_SCHOOL_1',
    type: PlanType.SETUP_FEE,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 1,
    typeQuota: 1,
    typeColumnName: 'setupFeeQuantity',
    priceInterval: StripePriceType.ONE_TIME,
    prices: [
      { currency: 'HKD', price: 2800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 359.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 300, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 39.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'SETUP_FEE_INSTITUTION_2',
    type: PlanType.SETUP_FEE,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 2,
    typeQuota: 2,
    typeColumnName: 'setupFeeQuantity',
    priceInterval: StripePriceType.ONE_TIME,
    prices: [
      { currency: 'HKD', price: 4200, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 539.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 450, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 59.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'SET_UP_FEE_INSTITUTION_3',
    type: PlanType.SETUP_FEE,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 3,
    typeQuota: 3,
    typeColumnName: 'setupFeeQuantity',
    priceInterval: StripePriceType.ONE_TIME,
    prices: [
      { currency: 'HKD', price: 5600, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 719.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 600, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 79.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'SETUP_FEE_PER_INSTITUTION_AFTER_4',
    type: PlanType.SETUP_FEE,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeColumnName: 'setupFeeQuantity',
    priceInterval: StripePriceType.ONE_TIME,
    prices: [
      { currency: 'HKD', price: 1000, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 129.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 100, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 14.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Multiple Admin
  {
    name: 'MULTIPLE_ADMIN_1',
    type: PlanType.MULTIPLE_ADMIN,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.PER_ITEM,
    priceInterval: StripePriceType.RECURRING,
    typeQuantity: 1,
    typeQuota: 3,
    typeColumnName: 'adminQuantity',
    inTrial: true,
    inFree: true,
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_ADMIN_4',
    type: PlanType.MULTIPLE_ADMIN,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.PER_ITEM,
    priceInterval: StripePriceType.RECURRING,
    typeQuantity: 1,
    typeQuota: 10,
    typeColumnName: 'adminQuantity',
    prices: [
      { currency: 'HKD', price: 300, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 39.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 40, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 4.9, interval: StripePriceInterval.MONTH },
    ],
  },

  {
    name: 'MULTIPLE_ADMIN_20',
    type: PlanType.MULTIPLE_ADMIN,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 20,
    typeColumnName: 'adminQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 280, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 36.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 35, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 3.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_ADMIN_30',
    type: PlanType.MULTIPLE_ADMIN,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 30,
    typeColumnName: 'adminQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 250, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 32.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 30, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 3.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_ADMIN_UNLIMITED',
    type: PlanType.MULTIPLE_ADMIN,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: -1,
    typeColumnName: 'adminQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 25000, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 1329.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 3000, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 399.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Multiple Tutor
  {
    name: 'MULTIPLE_TUTOR_2',
    type: PlanType.MULTIPLE_TUTOR,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 2,
    typeColumnName: 'tutorQuantity',
    priceInterval: StripePriceType.RECURRING,
    inTrial: true,
    inFree: true,
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_TUTOR_5',
    type: PlanType.MULTIPLE_TUTOR,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 5,
    typeColumnName: 'tutorQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 200, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 26.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 20, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 2.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_TUTOR_10',
    type: PlanType.MULTIPLE_TUTOR,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 10,
    typeColumnName: 'tutorQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 190, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 25.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 20, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 2.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'MULTIPLE_TUTOR_20',
    type: PlanType.MULTIPLE_TUTOR,
    tier: PlanTier.PRO,
    priceMode: PlanPriceMode.PER_ITEM,
    typeQuantity: 1,
    typeQuota: 20,
    typeColumnName: 'tutorQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 180, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 24.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 20, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 2.9, interval: StripePriceInterval.MONTH },
    ],
  },

  {
    name: 'MULTIPLE_TUTOR_UNLIMITED',
    type: PlanType.MULTIPLE_TUTOR,
    tier: PlanTier.CUSTOM,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: -1,
    typeColumnName: 'tutorQuantity',
    priceInterval: StripePriceType.RECURRING,
    prices: [
      { currency: 'HKD', price: 25000, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 3399.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 3000, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 399.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Class Type
  {
    name: 'CLASS_TYPE_REGULAR',
    type: PlanType.CLASS_TYPE,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'classTypeEnable',
    typePermission: {
      [ClassTypeEnum.REGULAR]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
    },
    priceInterval: StripePriceType.RECURRING,
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'CLASS_TYPE_RECURRING',
    type: PlanType.CLASS_TYPE,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'classTypeEnable',
    typePermission: {
      [ClassTypeEnum.RECURRING]: true,
    },
    priceInterval: StripePriceType.RECURRING,
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'CLASS_TYPE_APPOINTMENT',
    type: PlanType.CLASS_TYPE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'classTypeEnable',
    typePermission: {
      [ClassTypeEnum.APPOINTMENT]: true,
    },
    priceInterval: StripePriceType.RECURRING,
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Feature Enable
  {
    name: 'FEATURE_ENABLE_OWN_BRANDING',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.OWN_BRANDING]: true,
    },
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'FEATURE_ENABLE_STUDENT_PORTAL',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'FEATURE_ENABLE_RESCHEDULE_REQUEST',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'FEATURE_ENABLE_TUTOR_CENTRAL',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'FEATURE_ENABLE_QRCODE_ATTENDANCE',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.QRCODE_ATTENDANCE]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'FEATURE_ENABLE_CREDIT_SYSTEM',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 1800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 249, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 180, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 24.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'FEATURE_ENABLE_APPLY_MULTIPLE_COURSES',
    type: PlanType.FEATURE_ENABLE,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'featureEnable',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Notification Channels
  {
    name: 'NOTIFICATION_CHANNEL_EMAIL_ONLY',
    type: PlanType.NOTIFICATION_CHANNEL,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'notificationChannels',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [ContactChannelIntegrations.EMAIL]: true,
    },
    inTrial: true,
    inFree: true,
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_OFFICIAL',
    type: PlanType.NOTIFICATION_CHANNEL,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'notificationChannels',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.TWILIO_WHATSAPP]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_UNOFFICIAL',
    type: PlanType.NOTIFICATION_CHANNEL,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'notificationChannels',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.UNOFFICIAL_WHATSAPP]: true,
    },
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 109.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 10.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Promotion & Fees
  {
    name: 'PROMOTION_FEES_BASIC',
    type: PlanType.PROMOTION_FEES,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    typeQuantity: 1,
    typeColumnName: 'promotionTier',
    priceInterval: StripePriceType.RECURRING,
    inFree: true,
    typePermission: {
      [PromotionType.COUPON_DISCOUNT]: true,
    },
    prices: [
      { currency: 'HKD', price: 0 },
      { currency: 'USD', price: 0 },
    ],
  },
  {
    name: 'PROMOTION_FEES_ADVANCED',
    type: PlanType.PROMOTION_FEES,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'promotionTier',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.BUNDLE_DISCOUNT]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 1800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 239.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 200, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 26.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Integrations
  {
    name: 'INTEGRATION_GOOGLE_DRIVE',
    type: PlanType.INTEGRATION,
    tier: PlanTier.STARTER,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'integration',
    priceInterval: StripePriceType.ONE_TIME,
    typePermission: {
      [ThirdPartyIntegrations.GOOGLE_DRIVE]: true,
    },
    prices: [
      { currency: 'HKD', price: 5000, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 669.9, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 500, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 66.9, interval: StripePriceInterval.MONTH },
    ],
  },

  // Customer Support
  {
    name: 'CUSTOMER_SUPPORT_BASIC',
    type: PlanType.CUSTOMER_SUPPORT,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    typeColumnName: 'customerSupportTier',
    priceInterval: StripePriceType.RECURRING,
    typePermission: {
      [ContactChannelIntegrations.EMAIL]: true,
    },
    inFree: true,
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'CUSTOMER_SUPPORT_ADVANCED',
    type: PlanType.CUSTOMER_SUPPORT,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeColumnName: 'customerSupportTier',
    typePermission: {
      [PlanTier.GROWTH]: true,
    },
    inTrial: true,
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
  },
  {
    name: 'CUSTOMER_SUPPORT_EXPERT',
    type: PlanType.CUSTOMER_SUPPORT,
    tier: PlanTier.GROWTH,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeColumnName: 'customerSupportTier',
    typePermission: {
      [PlanTier.ENTERPRISE]: true,
    },
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
  },
]

export const FREE_SUBSCRIPTION_PLAN_RECORDS: Partial<SubscriptionPlanRecordsEntity> = {
  planIds: [],

  baseUserQuantity: 20,

  notificationQuantity: 50,

  schoolQuantity: 1,

  setupFeeQuantity: 1,

  adminQuantity: 1,

  tutorQuantity: 1,

  notificationChannels: {
    [ContactChannelIntegrations.EMAIL]: true,
  },

  customerSupportTier: PlanTier.FREE,

  totalPrice: 0,

  currency: 'USD',

  isTrial: false,
}

export const TRIAL_SUBSCRIPTION_PLAN_RECORDS: Partial<SubscriptionPlanRecordsEntity> = {
  planIds: [],

  baseUserQuantity: 500,

  notificationQuantity: 1000,

  schoolQuantity: 1,

  setupFeeQuantity: 1,

  adminQuantity: 1,

  tutorQuantity: 1,

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
    [FeatureEnableEnum.QRCODE_ATTENDANCE]: true,
    [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: true,
    [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
    [FeatureEnableEnum.TUTOR_CENTRAL]: true,
  },

  integration: {
    [ThirdPartyIntegrations.GOOGLE_DRIVE]: true,
  },

  customerSupportTier: PlanTier.GROWTH,

  totalPrice: 0,

  currency: 'USD',

  isTrial: true,
}

export type ActivePaidSubscriptionPlanType = {
  name: string
  type: PlanType
  tier: PlanTier
  priceMode: PlanPriceMode
  priceInterval: StripePriceType
  typeQuantity?: number
  typeQuota?: number
  typePermission?: Partial<Record<PlanPermission, boolean>>
  typeColumnName: string
  prices: CurrencyPair[]
  maxClientQuantity?: number
  maxNotificationQuantity?: number
}

export const ACTIVE_PAID_SUBSCRIPTION_PLANS: ActivePaidSubscriptionPlanType[] = [
  {
    name: 'ACTIVE_PAID_FREE_TIER',
    type: PlanType.BASE_USER,
    tier: PlanTier.FREE,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuota: 20,
    typeQuantity: 20,
    typeColumnName: 'activePaidClientQuantity',
    prices: [
      { currency: 'HKD', price: 0, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 0, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 0, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 0, interval: StripePriceInterval.MONTH },
    ],
    maxClientQuantity: 20,
    maxNotificationQuantity: 50,
  },
  {
    name: 'ACTIVE_PAID_TIER_1',
    type: PlanType.BASE_USER,
    tier: PlanTier.TIER_1,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuota: 100,
    typeQuantity: 100,
    typeColumnName: 'activePaidClientQuantity',
    prices: [
      { currency: 'HKD', price: 800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 99, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 80, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 9.9, interval: StripePriceInterval.MONTH },
    ],
    maxClientQuantity: 100,
    maxNotificationQuantity: 250,
  },
  {
    name: 'ACTIVE_PAID_TIER_2',
    type: PlanType.BASE_USER,
    tier: PlanTier.TIER_2,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuota: 500,
    typeQuantity: 500,
    typeColumnName: 'activePaidClientQuantity',
    prices: [
      { currency: 'HKD', price: 2800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 349, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 280, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 34.9, interval: StripePriceInterval.MONTH },
    ],
    maxClientQuantity: 500,
    maxNotificationQuantity: 1250,
  },
  {
    name: 'ACTIVE_PAID_TIER_3',
    type: PlanType.BASE_USER,
    tier: PlanTier.TIER_3,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuota: 1000,
    typeQuantity: 1000,
    typeColumnName: 'activePaidClientQuantity',
    prices: [
      { currency: 'HKD', price: 5800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 699, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 580, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 69.9, interval: StripePriceInterval.MONTH },
    ],
    maxClientQuantity: 1000,
    maxNotificationQuantity: 2500,
  },
  {
    name: 'ACTIVE_PAID_TIER_4',
    type: PlanType.BASE_USER,
    tier: PlanTier.TIER_4,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuota: 3000,
    typeQuantity: 3000,
    typeColumnName: 'activePaidClientQuantity',
    prices: [
      { currency: 'HKD', price: 10800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 1299, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 1080, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 129.9, interval: StripePriceInterval.MONTH },
    ],
    maxClientQuantity: 3000,
    maxNotificationQuantity: 7500,
  },
  {
    name: 'ACTIVE_PAID_TIER_5',
    type: PlanType.BASE_USER,
    tier: PlanTier.TIER_5,
    priceMode: PlanPriceMode.FIXED,
    priceInterval: StripePriceType.RECURRING,
    typeQuota: 10000,
    typeQuantity: 10000,
    typeColumnName: 'activePaidClientQuantity',
    prices: [
      { currency: 'HKD', price: 16800, interval: StripePriceInterval.YEAR },
      { currency: 'USD', price: 1999, interval: StripePriceInterval.YEAR },
      { currency: 'HKD', price: 1680, interval: StripePriceInterval.MONTH },
      { currency: 'USD', price: 199.9, interval: StripePriceInterval.MONTH },
    ],
    maxClientQuantity: 10000,
    maxNotificationQuantity: 25000,
  },
]
