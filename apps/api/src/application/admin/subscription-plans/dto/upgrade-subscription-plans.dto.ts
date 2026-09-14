import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Stripe } from 'stripe'

import { StripePriceInterval } from '@/models/enums'
import { StripeProductPricesEntity } from '@/models/stripe-product-prices.entity'
import { SubscriptionPlan } from '@/models/subscription-plans.entity'

export class UpgradePlanRequestSinglePlan {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  planId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  planQuantity?: number
}

export class UpgradePlanRequestSinglePlanV2 extends UpgradePlanRequestSinglePlan {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  priceId?: number
}

export class UpgradePlanRequestDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: {
      planId: 2,
      planQuantity: 1,
    },
  })
  @IsArray()
  plans: UpgradePlanRequestSinglePlan[]

  @ApiProperty({
    example: StripePriceInterval.MONTH,
  })
  @IsEnum(StripePriceInterval)
  interval: StripePriceInterval

  @ApiProperty({
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  expiryDate?: string

  @ApiProperty({
    example: 100,
  })
  @IsNumber()
  totalPrice: number

  @ApiProperty({
    example: 'USD',
  })
  @IsString()
  currency: string
}

export class UpgradePlanDirectlyDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  planId: number

  @ApiProperty({
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  expiryDate?: string
}

export class UpgradeSubscriptionPlanDto {
  @ApiProperty({
    example: [{ planId: 2, priceId: 1, planQuantity: 1 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpgradePlanRequestSinglePlanV2) // ← Add this line to specify the type
  newPlans: UpgradePlanRequestSinglePlanV2[]

  @ApiProperty({
    example: StripePriceInterval.MONTH,
  })
  @IsEnum(StripePriceInterval)
  interval: StripePriceInterval
}

export class UpgradePlanResponse {
  @ApiProperty({
    example: 'payment_required',
    description: 'Status of the upgrade: payment_required, completed, or error',
  })
  status: 'payment_required' | 'completed' | 'error'

  @ApiProperty({
    example: 'https://checkout.stripe.com/pay/cs_test_...',
    description: 'Stripe checkout URL for payment (only if payment required)',
  })
  @IsOptional()
  checkoutUrl?: string

  @ApiProperty({
    example: 'cs_test_...',
    description: 'Stripe checkout session ID',
  })
  @IsOptional()
  sessionId?: string

  @ApiProperty({
    example: 25.5,
    description: 'Pro-rated amount to be charged for upgrade',
  })
  @IsOptional()
  proRatedAmount?: number

  @ApiProperty({
    example: 142,
    description: 'Days remaining in current billing cycle',
  })
  @IsOptional()
  daysRemaining?: number

  @ApiProperty({
    example: 'Upgrade successful, features activated immediately',
  })
  message: string

  @ApiProperty({
    description: 'Updated subscription plan record (only if completed)',
  })
  @IsOptional()
  subscriptionRecord?: any
}

export class StripeProrateDetailDto {
  @ApiProperty({
    example: 10.0,
    description: 'Total proration amount calculated from Stripe invoice',
  })
  totalProrationAmount: number
  @ApiProperty({
    example: 5.0,
    description: 'Amount credited to the account from proration',
  })
  credits: number
  @ApiProperty({
    example: 15.0,
    description: 'Amount charged for the upgrade after applying credits',
  })
  charges: number
  @ApiProperty({
    example: 20.0,
    description: 'Next invoice amount after applying proration',
  })
  @IsOptional()
  nextInvoiceAmount: number
  @ApiProperty({
    example: new Date(),
    description: 'Start date of the current billing cycle',
  })
  periodStart: Date
  @ApiProperty({
    example: new Date(),
    description: 'End date of the current billing cycle',
  })
  @IsOptional()
  periodEnd: Date

  prorationItems?: Record<string, any>[]
}
export class UpgradeCostCalculation {
  @ApiProperty({
    example: 50.0,
    description: 'Current plan monthly cost',
  })
  currentPlanCost: number

  @ApiProperty({
    example: 100.0,
    description: 'New plan monthly cost',
  })
  newPlanCost: number

  @ApiProperty({
    example: 25.5,
    description: 'Pro-rated amount to charge for remaining days',
  })
  proRatedAmount: number

  @ApiProperty({
    example: 142,
    description: 'Days remaining in current billing cycle',
  })
  daysRemaining: number

  @ApiProperty({
    example: 30,
    description: 'Total days in current billing cycle',
  })
  totalDaysInCycle: number

  @ApiProperty({
    example: '2025-08-15T00:00:00.000Z',
    description: 'Current billing cycle end date',
  })
  currentCycleEndDate: string

  @ApiProperty({
    example: true,
    description: 'Whether payment is required for this upgrade',
  })
  paymentRequired: boolean

  @ApiProperty({
    description: 'Stripe proration details if applicable',
    type: StripeProrateDetailDto,
    required: false,
  })
  stripeProrationDetails?: StripeProrateDetailDto

  interval?: StripePriceInterval
  subscriptionItems?: Stripe.InvoiceRetrieveUpcomingParams.SubscriptionItem[] // Optional field to include subscription items if needed
}

export class DowngradeSubscriptionPlanDto {
  @ApiProperty({
    example: [{ planId: 2, planQuantity: 1 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpgradePlanRequestSinglePlanV2) // ← Add this line to specify the type
  newPlans: UpgradePlanRequestSinglePlanV2[]

  @ApiProperty({
    example: StripePriceInterval.MONTH,
  })
  @IsEnum(StripePriceInterval)
  interval: StripePriceInterval
}
export interface DowngradeCostCalculation {
  currentPlanCost: number
  newPlanCost: number
  creditAmount: number // Amount that will be credited
  daysRemaining: number
  currentCycleEndDate: string
  nextBillingDate: string
  stripeProrationDetails: StripeProrateDetailDto
}

export interface PlansPriceDiff {
  plan: SubscriptionPlan
  price: StripeProductPricesEntity
  currentPrice: number
  newPrice: number
  priceDiff: number
  quantity: number
}

export class CancelPlanDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  planId: number
}

export class AddPlanDto {
  @ApiProperty({
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  planIds: number[]
}

export class SubstitutePlanDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  targetPlanId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  currentPlanId: number
}
