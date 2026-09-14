import { PromotionType } from '@/types/coupon'
import { ClassTypeEnum } from '@/types/course'
import {
  ContactChannelIntegrations,
  FeatureEnableEnum,
  PlanTier,
  SubscriptionPlanRecord,
} from '@/types/schoolSubscriptionPlan'

export type StripePriceInterval = 'month' | 'year'

export type CurrencyPair = {
  currency: 'HKD' | 'USD'
  price: number
  interval: StripePriceInterval | 'billedYearly'
}

export type OriginalCurrencyPairSavings = CurrencyPair & {
  savings: number
  percentage: number
}

export interface PricingTier {
  id: string
  nameKey: string // Changed from 'name' to 'nameKey' for translation
  prices: CurrencyPair[]
  originalPrices?: OriginalCurrencyPairSavings[]
  isPopular?: boolean
  features: {
    students: number | string
    schools: number | string
    managers: number | string
    tutors: number | string
    classTypes: number | string
    studentPortal: boolean
    rescheduleRequest: boolean
    tutorCentral: boolean
    qrCodeAttendance: boolean
    creditSystem: boolean
    notifications: string
    promotions: string
  }
}

export enum PricingTierId {
  Individual = 'individual',
  Startup = 'startup',
  Growing = 'growing',
  MultiBranch = 'multi-branch',
}

// Pricing data based on the provided tiers
export const pricingTiers: PricingTier[] = [
  {
    id: PricingTierId.Individual,
    nameKey: 'pricingTiers.individual',
    prices: [
      { currency: 'USD', price: 14.8, interval: 'month' },
      { currency: 'HKD', price: 108, interval: 'month' },
      { currency: 'USD', price: 128, interval: 'year' },
      { currency: 'HKD', price: 980, interval: 'year' },
      { currency: 'USD', price: 10.67, interval: 'billedYearly' },
      { currency: 'HKD', price: 81.67, interval: 'billedYearly' },
    ],
    originalPrices: [
      {
        currency: 'USD',
        price: 228,
        interval: 'year',
        savings: 100,
        percentage: 66.67,
      },
      {
        currency: 'HKD',
        price: 2400,
        interval: 'year',
        savings: 1600,
        percentage: 66.67,
      },
    ],
    features: {
      students: 50,
      schools: 1,
      managers: 1,
      tutors: 1,
      classTypes: 1,
      studentPortal: true,
      rescheduleRequest: false,
      tutorCentral: true,
      qrCodeAttendance: false,
      creditSystem: false,
      notifications: 'Email Only',
      promotions: 'Basic',
    },
  },
  {
    id: PricingTierId.Startup,
    nameKey: 'pricingTiers.startup',
    prices: [
      { currency: 'USD', price: 52.8, interval: 'month' },
      { currency: 'HKD', price: 408, interval: 'month' },
      { currency: 'USD', price: 480, interval: 'year' },
      { currency: 'HKD', price: 3800, interval: 'year' },
      { currency: 'USD', price: 40.67, interval: 'billedYearly' },
      { currency: 'HKD', price: 316.67, interval: 'billedYearly' },
    ],
    originalPrices: [
      {
        currency: 'USD',
        price: 910,
        interval: 'year',
        savings: 430,
        percentage: 53.66,
      },
      {
        currency: 'HKD',
        price: 8200,
        interval: 'year',
        savings: 4400,
        percentage: 53.66,
      },
    ],

    features: {
      students: 300,
      schools: 1,
      managers: 1,
      tutors: 5,
      classTypes: 2,
      studentPortal: true,
      rescheduleRequest: true,
      tutorCentral: true,
      qrCodeAttendance: false,
      creditSystem: false,
      notifications: 'Email Only',
      promotions: 'Advanced',
    },
  },
  {
    id: PricingTierId.Growing,
    nameKey: 'pricingTiers.growing',
    prices: [
      { currency: 'USD', price: 90.8, interval: 'month' },
      { currency: 'HKD', price: 708, interval: 'month' },
      { currency: 'USD', price: 880, interval: 'year' },
      { currency: 'HKD', price: 6800, interval: 'year' },
      { currency: 'USD', price: 74, interval: 'billedYearly' },
      { currency: 'HKD', price: 566.67, interval: 'billedYearly' },
    ],
    originalPrices: [
      {
        currency: 'USD',
        price: 1680,
        interval: 'year',
        savings: 800,
        percentage: 53.1,
      },
      {
        currency: 'HKD',
        price: 14500,
        interval: 'year',
        savings: 7700,
        percentage: 53.1,
      },
    ],

    isPopular: true,
    features: {
      students: 1000,
      schools: 2,
      managers: 3,
      tutors: 15,
      classTypes: 'All',
      studentPortal: true,
      rescheduleRequest: true,
      tutorCentral: true,
      qrCodeAttendance: true,
      creditSystem: false,
      notifications: 'Email + WhatsApp',
      promotions: 'Advanced',
    },
  },
  {
    id: PricingTierId.MultiBranch,
    nameKey: 'pricingTiers.multiBranch',
    prices: [
      { currency: 'USD', price: 178, interval: 'month' },
      { currency: 'HKD', price: 1380, interval: 'month' },
      { currency: 'USD', price: 1580, interval: 'year' },
      { currency: 'HKD', price: 12800, interval: 'year' },
      { currency: 'USD', price: 131.67, interval: 'billedYearly' },
      { currency: 'HKD', price: 1066.67, interval: 'billedYearly' },
    ],
    originalPrices: [
      {
        currency: 'USD',
        price: 2980,
        interval: 'year',
        savings: 1400,
        percentage: 53.1,
      },
      {
        currency: 'HKD',
        price: 26220,
        interval: 'year',
        savings: 13420,
        percentage: 51.18,
      },
    ],
    features: {
      students: 3000,
      schools: 5,
      managers: 10,
      tutors: 30,
      classTypes: 'All',
      studentPortal: true,
      rescheduleRequest: true,
      tutorCentral: true,
      qrCodeAttendance: true,
      creditSystem: true,
      notifications: 'Email + WhatsApp',
      promotions: 'Advanced',
    },
  },
]

export type PresetSubscriptionPlanType = {
  name: string
  baseUserQuantity: number
  notificationQuantity: number
  schoolQuantity: number
  setupFeeQuantity: number
  adminQuantity: number
  tutorQuantity: number
  classTypeEnable: Record<string, boolean>
  notificationChannels: Record<string, boolean>
  promotionTier: Record<string, boolean>
  featureEnable: Record<string, boolean>
  integration: Record<string, boolean>
  customerSupportTier: string
  prices: CurrencyPair[]
  isTrial: boolean
}

export const PRESET_SUBSCRIPTION_PLANS: PresetSubscriptionPlanType[] = [
  // Individual Trainers & Tutors
  {
    name: 'INDIVIDUAL_TRAINERS_TUTORS',
    baseUserQuantity: 50,
    notificationQuantity: 1000,
    schoolQuantity: 1,
    setupFeeQuantity: 1,
    adminQuantity: 1,
    tutorQuantity: 1,
    classTypeEnable: {
      REGULAR: true,
      REGULAR_V2: true,
      RECURRING: false,
      APPOINTMENT: false,
    },
    notificationChannels: {
      EMAIL: true,
    },
    promotionTier: {
      COUPON_DISCOUNT: true,
    },
    featureEnable: {
      STUDENT_PORTAL: true,
      TUTOR_CENTRAL: true,
    },
    integration: {},
    customerSupportTier: 'STARTER',
    prices: [
      { currency: 'USD', price: 14.8, interval: 'month' },
      { currency: 'HKD', price: 108, interval: 'month' },
      { currency: 'USD', price: 128, interval: 'year' },
      { currency: 'HKD', price: 980, interval: 'year' },
    ],
    isTrial: false,
  },

  // Startup Education Centres
  {
    name: 'STARTUP_EDUCATION_CENTRES',
    baseUserQuantity: 300,
    notificationQuantity: 1000,
    schoolQuantity: 1,
    setupFeeQuantity: 1,
    adminQuantity: 1,
    tutorQuantity: 5,
    classTypeEnable: {
      REGULAR: true,
      REGULAR_V2: true,
      RECURRING: false,
      APPOINTMENT: false,
    },
    notificationChannels: {
      EMAIL: true,
    },
    promotionTier: {
      COUPON_DISCOUNT: true,
      TRIAL_LESSON: true,
      DIRECT_DISCOUNT: true,
      BUNDLE_DISCOUNT: true,
    },
    featureEnable: {
      STUDENT_PORTAL: true,
      RESCHEDULE_REQUEST: true,
      TUTOR_CENTRAL: true,
    },
    integration: {},
    customerSupportTier: 'STARTER',
    prices: [
      { currency: 'USD', price: 52.8, interval: 'month' },
      { currency: 'HKD', price: 408, interval: 'month' },
      { currency: 'USD', price: 488, interval: 'year' },
      { currency: 'HKD', price: 3800, interval: 'year' },
    ],
    isTrial: false,
  },

  // Growing Education Centres
  {
    name: 'GROWING_EDUCATION_CENTRES',
    baseUserQuantity: 1000,
    notificationQuantity: 2000,
    schoolQuantity: 2,
    setupFeeQuantity: 1,
    adminQuantity: 3,
    tutorQuantity: 15,
    classTypeEnable: {
      REGULAR: true,
      REGULAR_V2: true,
      RECURRING: true,
      APPOINTMENT: true,
    },
    notificationChannels: {
      EMAIL: true,
      TWILIO_WHATSAPP: true,
      UNOFFICIAL_WHATSAPP: true,
    },
    promotionTier: {
      COUPON_DISCOUNT: true,
      TRIAL_LESSON: true,
      DIRECT_DISCOUNT: true,
      BUNDLE_DISCOUNT: true,
    },
    featureEnable: {
      STUDENT_PORTAL: true,
      RESCHEDULE_REQUEST: true,
      TUTOR_CENTRAL: true,
    },
    integration: {
      GOOGLE_DRIVE: true,
    },
    customerSupportTier: 'GROWTH',
    prices: [
      { currency: 'USD', price: 90.8, interval: 'month' },
      { currency: 'HKD', price: 708, interval: 'month' },
      { currency: 'USD', price: 888, interval: 'year' },
      { currency: 'HKD', price: 6800, interval: 'year' },
    ],
    isTrial: false,
  },

  // Multi-Branch Education Centres
  {
    name: 'MULTI_BRANCH_EDUCATION_CENTRES',
    baseUserQuantity: 3000,
    notificationQuantity: 5000,
    schoolQuantity: 5,
    setupFeeQuantity: 1,
    adminQuantity: 10,
    tutorQuantity: 30,
    classTypeEnable: {
      REGULAR: true,
      REGULAR_V2: true,
      RECURRING: true,
      APPOINTMENT: true,
    },
    notificationChannels: {
      EMAIL: true,
      TWILIO_WHATSAPP: true,
      UNOFFICIAL_WHATSAPP: true,
    },
    promotionTier: {
      COUPON_DISCOUNT: true,
      TRIAL_LESSON: true,
      DIRECT_DISCOUNT: true,
      BUNDLE_DISCOUNT: true,
    },
    featureEnable: {
      STUDENT_PORTAL: true,
      RESCHEDULE_REQUEST: true,
      TUTOR_CENTRAL: true,
      CREDIT_SYSTEM: true,
    },
    integration: {
      GOOGLE_DRIVE: true,
    },
    customerSupportTier: 'PRO',
    prices: [
      { currency: 'USD', price: 178, interval: 'month' },
      { currency: 'HKD', price: 1380, interval: 'month' },
      { currency: 'USD', price: 1580, interval: 'year' },
      { currency: 'HKD', price: 12800, interval: 'year' },
    ],
    isTrial: false,
  },
]

export const FREE_SUBSCRIPTION_PLAN_RECORDS: Partial<SubscriptionPlanRecord> = {
  planIds: [],
  baseUserQuantity: 20,
  notificationQuantity: 50,
  schoolQuantity: 1,
  setupFeeQuantity: 1,
  adminQuantity: 1,
  tutorQuantity: 1,
  classTypeEnable: {
    [ClassTypeEnum.regular]: false,
    [ClassTypeEnum.regularV2]: false,
    [ClassTypeEnum.recurring]: false,
    [ClassTypeEnum.appointment]: true,
  },
  notificationChannels: {
    [ContactChannelIntegrations.EMAIL]: true,
  },
  promotionTier: {
    [PromotionType.COUPON_DISCOUNT]: false,
    [PromotionType.TRIAL_LESSON]: false,
    [PromotionType.DIRECT_DISCOUNT]: false,
    [PromotionType.BUNDLE_DISCOUNT]: false,
  },
  featureEnable: {
    [FeatureEnableEnum.STUDENT_PORTAL]: true,
    [FeatureEnableEnum.QRCODE_ATTENDANCE]: false,
    [FeatureEnableEnum.CREDIT_SYSTEM]: false,
    [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: false,
    [FeatureEnableEnum.RESCHEDULE_REQUEST]: false,
    [FeatureEnableEnum.TUTOR_CENTRAL]: false,
  },
  integration: {},
  customerSupportTier: PlanTier.FREE,
  totalPrice: 0,
  currency: 'USD',
  isTrial: false,
}

export const TRIAL_SUBSCRIPTION_PLAN_RECORDS: Partial<SubscriptionPlanRecord> =
  {
    planIds: [],
    baseUserQuantity: 300,
    notificationQuantity: 1000,
    schoolQuantity: 1,
    setupFeeQuantity: 1,
    adminQuantity: 1,
    tutorQuantity: 5,
    classTypeEnable: {
      [ClassTypeEnum.regular]: true,
      [ClassTypeEnum.regularV2]: true,
      [ClassTypeEnum.recurring]: false,
      [ClassTypeEnum.appointment]: false,
    },
    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
    },
    promotionTier: {
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.BUNDLE_DISCOUNT]: true,
    },
    featureEnable: {
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.QRCODE_ATTENDANCE]: false,
      [FeatureEnableEnum.CREDIT_SYSTEM]: false,
      [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: false,
      [FeatureEnableEnum.RESCHEDULE_REQUEST]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
    },
    integration: {},
    customerSupportTier: PlanTier.STARTER,
    totalPrice: 0,
    currency: 'USD',
    isTrial: true,
  }

// Helper function to get plan by name
export const getPresetPlanByName = (
  name: string
): PresetSubscriptionPlanType | undefined => {
  return PRESET_SUBSCRIPTION_PLANS.find(plan => plan.name === name)
}

// Helper function to get price by currency and interval
export const getPlanPrice = (
  plan: PresetSubscriptionPlanType,
  currency: 'HKD' | 'USD',
  interval: 'month' | 'year'
): number => {
  const price = plan.prices.find(
    p => p.currency === currency && p.interval === interval
  )
  return price?.price || 0
}
