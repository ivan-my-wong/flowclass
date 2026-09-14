import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsISO4217CurrencyCode,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

import {
  ClassTypeEnable,
  ContactChannelEnable,
  FeatureEnable,
  IntegrationEnable,
  PromotionEnable,
} from '@/models/subscription-plan-records.entity'
import { PlanTier } from '@/models/subscription-plans.entity'

export class UpdateSubscriptionPlanRecordsDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of plan IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  planIds?: number[]

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Purchase date' })
  @IsOptional()
  purchaseDate?: Date

  @ApiProperty({ example: '2024-12-31T23:59:59Z', description: 'Expiry date' })
  @IsOptional()
  expiryDate?: Date

  @ApiProperty({ example: 100, description: 'Base user quantity' })
  @IsOptional()
  @IsNumber()
  baseUserQuantity?: number

  @ApiProperty({ example: 1000, description: 'Notification quantity' })
  @IsOptional()
  @IsNumber()
  notificationQuantity?: number

  @ApiProperty({ example: 1, description: 'School quantity' })
  @IsOptional()
  @IsNumber()
  schoolQuantity?: number

  @ApiProperty({ example: 1, description: 'Setup fee quantity' })
  @IsOptional()
  @IsNumber()
  setupFeeQuantity?: number

  @ApiProperty({ example: 1, description: 'Admin quantity' })
  @IsOptional()
  @IsNumber()
  adminQuantity?: number

  @ApiProperty({ example: 1, description: 'Tutor quantity' })
  @IsOptional()
  @IsNumber()
  tutorQuantity?: number

  @ApiProperty({
    example: { regular: true, recurring: true },
    description: 'Class type enablement settings',
  })
  @IsOptional()
  @Type(() => Object)
  classTypeEnable?: ClassTypeEnable

  @ApiProperty({
    example: { OWN_BRANDING: true, STUDENT_PORTAL: true },
    description: 'Feature enablement settings',
  })
  @IsOptional()
  @Type(() => Object)
  featureEnable?: FeatureEnable

  @ApiProperty({
    example: { EMAIL: true, TWILIO_WHATSAPP: true },
    description: 'Notification channel settings',
  })
  @IsOptional()
  @Type(() => Object)
  notificationChannels?: ContactChannelEnable

  @ApiProperty({
    example: { COUPON_DISCOUNT: true, TRIAL_LESSON: true },
    description: 'Promotion tier settings',
  })
  @IsOptional()
  @Type(() => Object)
  promotionTier?: PromotionEnable

  @ApiProperty({
    example: { GOOGLE_DRIVE: true },
    description: 'Integration settings',
  })
  @IsOptional()
  @Type(() => Object)
  integration?: IntegrationEnable

  @ApiProperty({ enum: PlanTier, description: 'Customer support tier' })
  @IsOptional()
  customerSupportTier?: PlanTier

  @ApiProperty({ example: 999.99, description: 'Total price' })
  @IsOptional()
  @IsNumber()
  totalPrice?: number

  @ApiProperty({ example: 'USD', description: 'Currency' })
  @IsOptional()
  @IsString()
  @IsISO4217CurrencyCode()
  currency?: string

  @ApiProperty({ example: 'sub_1234567890', description: 'Stripe subscription ID' })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string

  @ApiProperty({ example: false, description: 'Is trial subscription' })
  @IsOptional()
  @IsBoolean()
  isTrial?: boolean
}
