import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsArray } from 'class-validator'

import { StripePriceInterval } from '@/models/enums/'
import {
  ClassTypeEnable,
  ContactChannelEnable,
  FeatureEnable,
  IntegrationEnable,
  PromotionEnable,
} from '@/models/subscription-plan-records.entity'
import { PlanTier } from '@/models/subscription-plans.entity'
import { PresetPlansPrice } from '@/models/subscription-preset-plans.entity'

@Exclude()
export class SubscriptionPlanCheckoutResponse {
  @ApiProperty()
  @Expose()
  checkoutUrl: string

  @ApiProperty()
  @Expose()
  sessionId: string
}

@Exclude()
export class PlanDetailResponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  type?: string

  @ApiProperty()
  @Expose()
  baseSubscription: number

  @ApiPropertyOptional()
  @Expose()
  usersByInstitution: number

  @ApiPropertyOptional()
  @Expose()
  regularAppointmentPages: number

  @ApiPropertyOptional()
  @Expose()
  eventsWorkshopPages: number

  @ApiPropertyOptional()
  @Expose()
  removeBranding: boolean

  @ApiPropertyOptional()
  @Expose()
  customDomain: boolean

  @ApiPropertyOptional()
  @Expose()
  gpt3Writer: number

  @ApiPropertyOptional()
  @Expose()
  directDiscounts: boolean

  @ApiPropertyOptional()
  @Expose()
  trialLessons: boolean

  @ApiPropertyOptional()
  @Expose()
  recurringBundleDiscounts: boolean

  @ApiPropertyOptional()
  @Expose()
  couponCode: boolean

  @ApiPropertyOptional()
  @Expose()
  searchEngine: boolean

  @ApiPropertyOptional()
  @Expose()
  commentEmails: boolean

  @ApiPropertyOptional()
  @Expose()
  referralEmails: boolean

  @ApiPropertyOptional()
  @Expose()
  connectDigitalPayments: boolean

  @ApiPropertyOptional()
  @Expose()
  customFields: boolean

  @ApiPropertyOptional()
  @Expose()
  schoolManagementSystem: boolean

  @ApiPropertyOptional()
  @Expose()
  connectCalendars: boolean

  @ApiPropertyOptional()
  @Expose()
  marketingConsultancy: boolean

  @ApiPropertyOptional()
  @Expose()
  interval?: StripePriceInterval
}

export class QuotaItems {
  @ApiProperty()
  quota: number

  @ApiProperty()
  used: number
}

export class PlanWithQuotas {
  @ApiProperty()
  activeStudents: QuotaItems

  @ApiProperty()
  reminder: QuotaItems
}

export class GetPlansQuota {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of plan ID',
  })
  @IsArray()
  planIds: number[]
}

export class PresetPlansDto {
  @ApiProperty({ description: 'Name of the preset plan' })
  name: string

  @ApiProperty({ description: 'Base number of users included in the plan' })
  baseUserQuantity: number

  @ApiProperty({ description: 'Number of notifications allowed' })
  notificationQuantity: number

  @ApiProperty({ description: 'Number of schools allowed' })
  schoolQuantity: number

  @ApiProperty({ description: 'Setup fee quantity' })
  setupFeeQuantity: number

  @ApiProperty({ description: 'Number of admin users allowed' })
  adminQuantity: number

  @ApiProperty({ description: 'Number of tutor users allowed' })
  tutorQuantity: number

  @ApiProperty({
    description: 'Enabled class types',
    type: String,
  })
  classTypeEnable: ClassTypeEnable

  @ApiProperty({
    description: 'Enabled features',
    type: String,
  })
  featureEnable: FeatureEnable

  @ApiProperty({
    description: 'Enabled notification channels',
    type: String,
  })
  notificationChannels: ContactChannelEnable

  @ApiProperty({
    description: 'Promotion tier level',
    type: String,
  })
  promotionTier: PromotionEnable

  @ApiProperty({
    description: 'Enabled integrations',
    type: String,
  })
  integration: IntegrationEnable

  @ApiProperty({
    description: 'Customer support tier level',
    type: String,
  })
  customerSupportTier: PlanTier

  @ApiProperty({ description: 'Total price of the plan' })
  totalPrice: number

  @ApiProperty({ description: 'Currency code (e.g., USD, SGD)' })
  currency: string

  @ApiProperty({ description: 'Stripe product ID for payment processing' })
  stripeProductId: string

  @ApiProperty({
    description: 'Array of plan prices with different intervals',
    isArray: true,
    type: 'object',
  })
  prices: PresetPlansPrice[]

  @ApiProperty({
    description: 'Whether this is a trial plan',
    default: false,
  })
  isTrial: boolean
}
