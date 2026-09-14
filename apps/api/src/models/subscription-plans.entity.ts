import { Column, Entity, OneToMany } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { StripeProductPricesEntity } from './stripe-product-prices.entity'
import { PlanPermission, SubscriptionPlanRecordsEntity } from './subscription-plan-records.entity'

export enum SubscriptionPlanApp {
  // ACTIVE_PAID = 'active-paid',
  FLOWCLASS = 'flowclass',
}

// Define enums for plan type and other relevant enums here
export enum PlanType {
  BASE_USER = 'BASE_USER',
  MULTIPLE_SCHOOL = 'MULTIPLE_SCHOOL',
  NOTIFICATION_QUOTA = 'NOTIFICATION_QUOTA',
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

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', default: 'DEFAULT_SUBSCRIPTION_PLAN' })
  name: string

  @Column({ name: 'type', enum: PlanType, type: 'varchar' })
  type: PlanType

  @Column({ name: 'tier', type: 'varchar' })
  tier: PlanTier

  @Column({ name: 'price_mode', enum: PlanPriceMode, type: 'varchar' })
  priceMode: PlanPriceMode

  // This indicates the number of items that the plan is for.
  // For example, if the plan is for 1 admin, then the typeQuantity is 1.
  @Column({ name: 'type_quantity', type: 'int', nullable: true })
  typeQuantity?: number

  // This signals the upper quota that the type quantity can reach.
  // For example, if the plan is for 10 admins, then the typeQuota is 10, while the typeQuantity is 1.
  @Column({ name: 'type_quota', type: 'int', nullable: true })
  typeQuota?: number

  // This indicates the permission of the extra feature that the plan is for.
  // Each custom feature will has an enum that can be set as the key of the object.
  @Column({ name: 'type_permission', type: 'jsonb', nullable: true, default: {} })
  typePermission?: Record<PlanPermission, boolean>

  @Column({ name: 'type_column_name', type: 'varchar' })
  typeColumnName: keyof SubscriptionPlanRecordsEntity

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @OneToMany(() => StripeProductPricesEntity, (stripeProductPrices) => stripeProductPrices.plan)
  stripeProductPrices: StripeProductPricesEntity[]

  @Column({
    name: 'app',
    enum: SubscriptionPlanApp,
    type: 'varchar',
    default: SubscriptionPlanApp.FLOWCLASS,
  })
  app: SubscriptionPlanApp

  // Temporary field for helper purposes
  price?: StripeProductPricesEntity
}

export type PlanWithPrice = SubscriptionPlanRecordsEntity & {
  qty?: number
  plan?: SubscriptionPlan
  price?: StripeProductPricesEntity
  deductedBy?: number
  metadata?: Record<string, any>
}
