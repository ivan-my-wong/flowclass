import { Site } from '@/stores/siteData'

import { PromotionType } from './coupon'
import { ClassTypeEnum } from './course'

export enum SchoolSubscriptionPlans {
  Free = 'FREE_TIER',
  Starter = 'STARTER_TIER',
  Growth = 'GROWTH_TIER',
  Pro = 'PRO_TIER',
  Enterprise = 'ENTERPRISE_TIER',
}

export enum AllIntegrations {
  GOOGLE_CALENDAR = 'GOOGLE_CALENDAR',
  GOOGLE_SHEETS = 'GOOGLE_SHEETS',
  GOOGLE_MEET = 'GOOGLE_MEET',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
}

export enum ContactChannelIntegrations {
  EMAIL = 'EMAIL',
  TWILIO_WHATSAPP = 'TWILIO_WHATSAPP',
  META_WHATSAPP = 'META_WHATSAPP',
  UNOFFICIAL_WHATSAPP = 'UNOFFICIAL_WHATSAPP',
}

export enum FeatureEnableEnum {
  OWN_BRANDING = 'OWN_BRANDING',
  STUDENT_PORTAL = 'STUDENT_PORTAL',
  RESCHEDULE_REQUEST = 'RESCHEDULE_REQUEST',
  QRCODE_ATTENDANCE = 'QRCODE_ATTENDANCE',
  APPLY_MULTIPLE_COURSES = 'APPLY_MULTIPLE_COURSES',
  CREDIT_SYSTEM = 'CREDIT_SYSTEM',
  TUTOR_CENTRAL = 'TUTOR_CENTRAL',
}

// Define enums for plan type and other relevant enums here
export enum PlanType {
  BASE_USER = 'BASE_USER',
  MULTIPLE_SCHOOL = 'MULTIPLE_SCHOOL',
  SETUP_FEE = 'SETUP_FEE',
  MULTIPLE_ADMIN = 'MULTIPLE_ADMIN',
  MULTIPLE_TUTOR = 'MULTIPLE_TUTOR',
  CLASS_TYPE = 'CLASS_TYPE',
  FEATURE_ENABLE = 'FEATURE_ENABLE',
  NOTIFICATION_CHANNEL = 'NOTIFICATION_CHANNEL',
  PROMOTION_FEES = 'PROMOTION_FEES',
  INTEGRATION = 'INTEGRATION',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
}

export enum PlanTier {
  FREE = 'FREE_TIER',
  STARTER = 'STARTER_TIER',
  GROWTH = 'GROWTH_TIER',
  PRO = 'PRO_TIER',
  ENTERPRISE = 'ENTERPRISE_TIER',
  CUSTOM = 'CUSTOM_TIER',
}

export enum PresetPlanTier {
  FREE = 'FREE',
  INDIVIDUAL = 'INDIVIDUAL',
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  TIER_4 = 'TIER_4',
  TIER_5 = 'TIER_5',
}

export enum PlanPriceMode {
  FIXED = 'FIXED',
  PER_ITEM = 'PER_ITEM',
}

export enum StripeCurrency {
  USD = 'USD',
  HKD = 'HKD',
}

export enum StripePriceInterval {
  MONTH = 'month',
  YEAR = 'year',
  WEEK = 'week',
  DAY = 'day',
}

export type SubscriptionPlanRecord = {
  id?: number
  planIds?: number[]
  siteId: number
  purchaseDate: string
  expiryDate: string
  baseUserQuantity?: number
  notificationQuantity?: number
  schoolQuantity?: number
  setupFeeQuantity?: number
  adminQuantity?: number
  tutorQuantity?: number
  classTypeEnable?: ClassTypeEnable
  featureEnable?: FeatureEnable
  notificationChannels?: ContactChannelEnable
  promotionTier?: PromotionEnable
  integration?: IntegrationEnable
  customerSupportTier?: PlanTier
  totalPrice?: number
  currency?: string
  stripeSubscriptionId?: string
  isTrial?: boolean

  plans: SubscriptionRecordPlan[]
  createdAt: string
  updatedAt: string
}

export type SubscriptionPlanRecordWithSite = SubscriptionPlanRecord & {
  site?: Site
}

export type SubscriptionPlan = {
  id: number
  name: string
  type: PlanType
  tier: PlanTier
  priceMode: PlanPriceMode
  typeQuantity: number

  qty: number
  typeQuota: number
  typePermission: Record<string, boolean>

  typeColumnName: string
  isActive: boolean

  stripeProductPrices: StripeProductPrice[]
}

// Stripe price info for a plan
export type StripeProductPrice = {
  id: number
  stripeProductId: string
  stripeProductName: string
  stripePriceId: string
  unitAmount: number
  currency: string
  type?: string
  interval?: string
  intervalCount?: number
  isActive: boolean
  lookupKey?: string
  plan: SubscriptionPlan
}

export type PlanWithQuotasResponse = {
  activeStudents: QuotaItem
  reminder: QuotaItem
}

export type QuotaItem = {
  quota: number
  used: number
}

/**
 * Stripe related types
 */

export type SubscriptionCheckoutSession = {
  id: string
  amount_total: number
  cancel_url: string
  created: number
  currency: string
  expires_at: number
  success_url: string
  url: string
}

export type StripeConnectDetail = {
  id: number
  siteId: number
  institutionId: number
  stripeAccountId: string
  status: StripeConnectStatus
  customerId: string
  subscriptionId: string
  enabled: boolean
}

export type StripeConnectAccount = {
  siteId: number
  institutionId: number
  stripeAccountId: string
  status: StripeConnectStatus
  customerId: string
  subscriptionId: string
  enabled: boolean
}

export type SubscriptionStripePrice = {
  id: number
  active: boolean
  billing_scheme: string
  created: number
  currency: string
  type: string
  unitAmount: number
  unit_amount: number
  unit_amount_decimal: string
}

export type SubscriptionRecordPlan = {
  id: number
  name: string
  type: PlanType
  tier: PlanTier
  priceMode: PlanPriceMode
  typeQuantity: number

  qty: number
  typeQuota: number
  typePermission: Record<string, boolean>

  typeColumnName: string
  isActive: boolean
  isCanceled: boolean

  price: SubscriptionStripePrice | null
}

export type AvailableStripeInvoiceStatuses =
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void'

export type ClientSubscriptionPlanT = {
  id: number
  name: string
  type: PlanType
  tier: PlanTier
  priceMode: PlanPriceMode
  typeQuantity: number

  typeQuota: number
  typePermission: Record<string, boolean>

  typeColumnName: string
  isActive: boolean

  stripeProduct: StripeProductPrice | null
}

export type SubscriptionOverviewT = {
  planId: number | number[]
  stepIndex: number
  stepValid: boolean
  category: string
  count: number | null
  label: string
  calculation: string | null
  annual: number | 0
  currency: string
}

export type ClientSubscriptionPlanRecord = {
  category: string
  planId: number
  planQuantity: number
  interval: string
}

export type ClientSubscriptionPayload = {
  institutionId: number
  siteId: number

  plans: ClientSubscriptionPlanRecord[]
}

export type StripePaymentLinkRecord = {
  status: 'payment_required'
  checkoutUrl: string
  sessionId: string
}

export type SubscriptionPlansAndQuotasRecord = {
  subscriptionPlans: SubscriptionPlanRecord
  quotas: Record<SubscriptionPlanQuotaKey, SubscriptionPlanQuota>
}

export type SubscriptionPlanQuota = {
  quota: number
  used: number
}

export type NewPlanPayload = {
  planId: number
  priceId?: number
  planQuantity: number

  targetedPlans?: SubscriptionRecordPlan
}

export type SupportedActions = 'upgrade' | 'downgrade' | 'substitute'

export type SubscriptionReview = {
  actionType: SupportedActions
  targetTotalPrice: number
  targetTotalPriceLabel: string
  targetedPlans: NewPlanPayload[]
}

export type UpgradeSubscriptionPlanPayload = {
  newPlans: NewPlanPayload[]
  interval: string
}

export type SubstituteSubscriptionPlanPayload = {
  targetPlanId: number
  currentPlanId: number
}

export type AddPlansSubscriptionPayload = {
  planIds: number[]
}

export type UpgradePreviewInfo = {
  status: 'completed'
  currentPlanCost: number
  newPlanCost: number
  proRatedAmount: number
  daysRemaining: number
  totalDaysInCycle: number
  currentCycleEndDate: string
  paymentRequired: boolean
  stripeProrationDetails: StripeProrationDetails
}

export type StripeProrationDetails = {
  totalProrationAmount: number
  credits: number
  charges: number
  nextInvoiceAmount: number
  periodStart: string
  periodEnd: string
}

export type StripeBillingHistory = {
  total: number
  status: AvailableStripeInvoiceStatuses
  hosted_invoice_url: string
  invoice_pdf: string

  created: number
}

export enum SubscriptionPlanQuotaKey {
  BASE_USER = 'BASE_USER',
  MULTIPLE_SCHOOL = 'MULTIPLE_SCHOOL',
  MULTIPLE_ADMIN = 'MULTIPLE_ADMIN',
  MULTIPLE_TUTOR = 'MULTIPLE_TUTOR',
}

export enum SubscriptionProductQuotaKey {
  MULTIPLE_INSTITUTION_1 = 'MULTIPLE_INSTITUTION_1',
  MULTIPLE_INSTITUTION_4 = 'MULTIPLE_INSTITUTION_4',
  MULTIPLE_INSTITUTION_10 = 'MULTIPLE_INSTITUTION_10',
  MULTIPLE_INSTITUTION_20 = 'MULTIPLE_INSTITUTION_20',
  MULTIPLE_INSTITUTION_50 = 'MULTIPLE_INSTITUTION_50',
  MULTIPLE_INSTITUTION_UNLIMITED = 'MULTIPLE_INSTITUTION_UNLIMITED',

  MULTIPLE_TUTOR_2 = 'MULTIPLE_TUTOR_2',
  MULTIPLE_TUTOR_5 = 'MULTIPLE_TUTOR_5',
  MULTIPLE_TUTOR_10 = 'MULTIPLE_TUTOR_10',
  MULTIPLE_TUTOR_20 = 'MULTIPLE_TUTOR_20',
  MULTIPLE_TUTOR_UNLIMITED = 'MULTIPLE_TUTOR_UNLIMITED',

  MULTIPLE_ADMIN_1 = 'MULTIPLE_ADMIN_1',
  MULTIPLE_ADMIN_4 = 'MULTIPLE_ADMIN_4',
  MULTIPLE_ADMIN_20 = 'MULTIPLE_ADMIN_20',
  MULTIPLE_ADMIN_30 = 'MULTIPLE_ADMIN_30',
  MULTIPLE_ADMIN_UNLIMITED = 'MULTIPLE_ADMIN_UNLIMITED',
}

export enum StripeConnectStatus {
  RESTRICTED = 'RESTRICTED',
  RESTRICTED_SOON = 'RESTRICTED_SOON',
  PENDING = 'PENDING',
  ENABLED = 'ENABLED',
  COMPLETE = 'COMPLETE',
  NOTFOUND = 'NOTFOUND',
}

export type FeatureEnable = {
  [key in FeatureEnableEnum]?: boolean
}

export type ContactChannelEnable = {
  [key in ContactChannelIntegrations]?: boolean
}

export type PromotionEnable = {
  [key in PromotionType]?: boolean
}

export type IntegrationEnable = {
  [key in AllIntegrations]?: boolean
}

export type ClassTypeEnable = {
  [key in ClassTypeEnum]?: boolean
}

// For Admins
export type CreateSubscriptionPlanRecordDirectlySinglePlan = {
  planId: number
  planQuantity: number
}
export type CreateSubscriptionPlanRecordDirectlyProps = {
  siteId: number
  plans: CreateSubscriptionPlanRecordDirectlySinglePlan[]
  interval: StripePriceInterval
  expiryDate: string
  totalPrice: number
}
