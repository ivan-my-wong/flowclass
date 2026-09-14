import { ContactChannelIntegrations, FeatureEnableEnum } from '@/models/custom-types/integrations'
import { ClassTypeEnum, PromotionType } from '@/models/enums'
import { PlanTier } from '@/models/subscription-plans.entity'
import { SubscriptionPresetPlanEntity } from '@/models/subscription-preset-plans.entity'

export enum PresetPlanName {
  INDIVIDUAL_TRAINERS_TUTORS = 'INDIVIDUAL_TRAINERS_TUTORS',
  STARTUP_EDUCATION_CENTRES = 'STARTUP_EDUCATION_CENTRES',
  GROWING_EDUCATION_CENTRES = 'GROWING_EDUCATION_CENTRES',
  MULTI_BRANCH_EDUCATION_CENTRES = 'MULTI_BRANCH_EDUCATION_CENTRES',
}
export const PRESET_SUBSCRIPTION_PLANS: Partial<SubscriptionPresetPlanEntity>[] = [
  // Individual Trainers & Tutors
  {
    name: PresetPlanName.INDIVIDUAL_TRAINERS_TUTORS,
    baseUserQuantity: 50,
    notificationQuantity: 1000,
    schoolQuantity: 1,
    setupFeeQuantity: 0,
    adminQuantity: 1,
    tutorQuantity: 1,
    classTypeEnable: {
      [ClassTypeEnum.APPOINTMENT]: true,
    },
    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
    },
    promotionTier: {
      [PromotionType.BUNDLE_DISCOUNT]: true,
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.RECURRING_DISCOUNT]: true,
    },
    featureEnable: {
      [FeatureEnableEnum.OWN_BRANDING]: true,
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },
    integration: {},
    customerSupportTier: PlanTier.INDIVIDUAL,
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
    name: PresetPlanName.STARTUP_EDUCATION_CENTRES,
    baseUserQuantity: 300,
    notificationQuantity: 1000,
    schoolQuantity: 1,
    setupFeeQuantity: 0,
    adminQuantity: 1,
    tutorQuantity: 5,
    classTypeEnable: {
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },

    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
    },
    promotionTier: {
      [PromotionType.BUNDLE_DISCOUNT]: true,
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.RECURRING_DISCOUNT]: true,
    },
    featureEnable: {
      [FeatureEnableEnum.OWN_BRANDING]: true,
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },
    customerSupportTier: PlanTier.STARTER,
    prices: [
      { currency: 'USD', price: 52.8, interval: 'month' },
      { currency: 'HKD', price: 408, interval: 'month' },
      { currency: 'USD', price: 488, interval: 'year' },
      { currency: 'HKD', price: 3800, interval: 'year' },
    ],
    isTrial: false,
  },

  // Small-scale Education Centres
  {
    name: PresetPlanName.GROWING_EDUCATION_CENTRES,
    baseUserQuantity: 1000,
    notificationQuantity: 2000,
    schoolQuantity: 2,
    setupFeeQuantity: 0,
    adminQuantity: 3,
    tutorQuantity: 15,
    classTypeEnable: {
      [ClassTypeEnum.SUBSCRIPTION]: true,
      [ClassTypeEnum.WORKSHOP]: true,
      [ClassTypeEnum.REGULAR_V2]: true,
      [ClassTypeEnum.RECURRING]: true,
      [ClassTypeEnum.APPOINTMENT]: true,
    },
    notificationChannels: {
      [ContactChannelIntegrations.EMAIL]: true,
      [ContactChannelIntegrations.TWILIO_WHATSAPP]: true,
    },
    promotionTier: {
      [PromotionType.BUNDLE_DISCOUNT]: true,
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.RECURRING_DISCOUNT]: true,
    },
    featureEnable: {
      [FeatureEnableEnum.OWN_BRANDING]: true,
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },
    integration: {},
    customerSupportTier: PlanTier.GROWTH,
    prices: [
      { currency: 'USD', price: 90.8, interval: 'month' },
      { currency: 'HKD', price: 708, interval: 'month' },
      { currency: 'USD', price: 888, interval: 'year' },
      { currency: 'HKD', price: 6800, interval: 'year' },
    ],
    isTrial: false,
  },

  // Medium-size Education Centres
  {
    name: PresetPlanName.MULTI_BRANCH_EDUCATION_CENTRES,
    baseUserQuantity: 3000,
    notificationQuantity: 5000,
    schoolQuantity: 5,
    setupFeeQuantity: 0,
    adminQuantity: 10,
    tutorQuantity: 30,
    classTypeEnable: {
      [ClassTypeEnum.SUBSCRIPTION]: true,
      [ClassTypeEnum.WORKSHOP]: true,
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
      [PromotionType.BUNDLE_DISCOUNT]: true,
      [PromotionType.COUPON_DISCOUNT]: true,
      [PromotionType.TRIAL_LESSON]: true,
      [PromotionType.DIRECT_DISCOUNT]: true,
      [PromotionType.RECURRING_DISCOUNT]: true,
    },
    featureEnable: {
      [FeatureEnableEnum.OWN_BRANDING]: true,
      [FeatureEnableEnum.STUDENT_PORTAL]: true,
      [FeatureEnableEnum.TUTOR_CENTRAL]: true,
      [FeatureEnableEnum.APPLY_MULTIPLE_COURSES]: true,
      [FeatureEnableEnum.CREDIT_SYSTEM]: true,
    },
    integration: {},
    customerSupportTier: PlanTier.PRO,
    prices: [
      { currency: 'USD', price: 178, interval: 'month' },
      { currency: 'HKD', price: 1380, interval: 'month' },
      { currency: 'USD', price: 1580, interval: 'year' },
      { currency: 'HKD', price: 12800, interval: 'year' },
    ],
    isTrial: false,
  },
]

const individualTrainersTutorsMap = [
  'BASE_USER_100',
  'MULTIPLE_INSTITUTION_1',
  'MULTIPLE_ADMIN_1',
  'MULTIPLE_TUTOR_2',
  'CLASS_TYPE_APPOINTMENT',
  'NOTIFICATION_CHANNEL_EMAIL_ONLY',
  'PROMOTION_FEES_ADVANCED',
  'FEATURE_ENABLE_OWN_BRANDING',
  'FEATURE_ENABLE_STUDENT_PORTAL',
  'FEATURE_ENABLE_TUTOR_CENTRAL',
  'FEATURE_ENABLE_CREDIT_SYSTEM',
  'FEATURE_ENABLE_APPLY_MULTIPLE_COURSES',
]

const startupEducationCentresMap = [
  'BASE_USER_500',
  'MULTIPLE_INSTITUTION_1',
  'MULTIPLE_ADMIN_1',
  'MULTIPLE_TUTOR_5',
  'CLASS_TYPE_APPOINTMENT',
  'CLASS_TYPE_RECURRING',
  'NOTIFICATION_CHANNEL_EMAIL_ONLY',
  'PROMOTION_FEES_ADVANCED',
  'FEATURE_ENABLE_OWN_BRANDING',
  'FEATURE_ENABLE_STUDENT_PORTAL',
  'FEATURE_ENABLE_TUTOR_CENTRAL',
  'FEATURE_ENABLE_CREDIT_SYSTEM',
  'FEATURE_ENABLE_APPLY_MULTIPLE_COURSES',
]

const smallScaleEducationCentresMap = [
  'BASE_USER_1500',
  'MULTIPLE_INSTITUTION_4',
  'MULTIPLE_ADMIN_4',
  'MULTIPLE_TUTOR_10',
  'CLASS_TYPE_REGULAR',
  'CLASS_TYPE_APPOINTMENT',
  'CLASS_TYPE_RECURRING',
  'NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_OFFICIAL',
  'PROMOTION_FEES_ADVANCED',
  'FEATURE_ENABLE_OWN_BRANDING',
  'FEATURE_ENABLE_STUDENT_PORTAL',
  'FEATURE_ENABLE_TUTOR_CENTRAL',
  'FEATURE_ENABLE_CREDIT_SYSTEM',
  'FEATURE_ENABLE_APPLY_MULTIPLE_COURSES',
]
export const mediumSizeEducationCentresMap = [
  'BASE_USER_3000',
  'MULTIPLE_INSTITUTION_10',
  'MULTIPLE_ADMIN_20',
  'MULTIPLE_TUTOR_20',
  'CLASS_TYPE_REGULAR',
  'CLASS_TYPE_APPOINTMENT',
  'CLASS_TYPE_RECURRING',
  'NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_OFFICIAL',
  'PROMOTION_FEES_ADVANCED',
  'FEATURE_ENABLE_OWN_BRANDING',
  'FEATURE_ENABLE_STUDENT_PORTAL',
  'FEATURE_ENABLE_TUTOR_CENTRAL',
  'FEATURE_ENABLE_CREDIT_SYSTEM',
  'FEATURE_ENABLE_APPLY_MULTIPLE_COURSES',
]

export const PresetPlansMap = new Map<PresetPlanName, string[]>([
  [PresetPlanName.INDIVIDUAL_TRAINERS_TUTORS, individualTrainersTutorsMap],
  [PresetPlanName.STARTUP_EDUCATION_CENTRES, startupEducationCentresMap],
  [PresetPlanName.GROWING_EDUCATION_CENTRES, smallScaleEducationCentresMap],
  [PresetPlanName.MULTI_BRANCH_EDUCATION_CENTRES, mediumSizeEducationCentresMap],
])
