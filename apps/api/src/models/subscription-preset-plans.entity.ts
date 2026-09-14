import { Column, Entity } from 'typeorm'

import { PresetPlanName } from '@/common/constants/preset-plans'
import { BaseEntity } from '@/modules/base/base.entity'

import {
  ClassTypeEnable,
  ContactChannelEnable,
  FeatureEnable,
  IntegrationEnable,
  PromotionEnable,
} from './subscription-plan-records.entity'
import { PlanTier } from './subscription-plans.entity'

export type PresetPlansPrice = {
  currency: string
  price: number
  interval: 'month' | 'year'
  stripePriceId?: string
}

@Entity('subscription_preset_plan')
export class SubscriptionPresetPlanEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar' })
  name: PresetPlanName

  @Column({ name: 'base_user_quantity', default: 1 })
  baseUserQuantity: number

  @Column({ name: 'notification_quantity', default: 0 })
  notificationQuantity: number

  @Column({ name: 'school_quantity', default: 1 })
  schoolQuantity: number

  @Column({ name: 'setup_fee_quantity', default: 1 })
  setupFeeQuantity: number

  @Column({ name: 'admin_quantity', default: 1 })
  adminQuantity: number

  @Column({ name: 'tutor_quantity', default: 1 })
  tutorQuantity: number

  @Column({ name: 'class_type_enable', type: 'jsonb', nullable: true })
  classTypeEnable: ClassTypeEnable

  @Column({ name: 'feature_enable', type: 'jsonb', nullable: true })
  featureEnable: FeatureEnable

  @Column({
    name: 'notification_channels',
    type: 'jsonb',
    nullable: true,
  })
  notificationChannels: ContactChannelEnable

  @Column({ name: 'promotion_tier', type: 'jsonb', nullable: true })
  promotionTier: PromotionEnable

  @Column({ name: 'integration', type: 'jsonb', nullable: true })
  integration: IntegrationEnable

  @Column({ name: 'customer_support_tier', type: 'varchar', nullable: true })
  customerSupportTier: PlanTier

  @Column({ name: 'total_price', nullable: true })
  totalPrice: number

  @Column({ name: 'currency', type: 'varchar', length: 3, nullable: true })
  currency: string

  @Column({ name: 'stripe_product_id', nullable: true })
  stripeProductId: string

  @Column({ name: 'prices', type: 'jsonb', nullable: true })
  prices: PresetPlansPrice[]

  @Column({ name: 'is_trial', default: false })
  isTrial: boolean
}
