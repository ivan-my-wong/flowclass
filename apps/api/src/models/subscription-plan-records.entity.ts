import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as dayjs from 'dayjs'
import { Column, Entity, JoinColumn, ManyToOne, MoreThanOrEqual, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import {
  ContactChannelIntegrations,
  FeatureEnableEnum,
  ThirdPartyIntegrations,
} from './custom-types/integrations'
import { ClassTypeEnum, PromotionType } from './enums'
import { Site } from './site.entity'
import { StripeProductPricesEntity } from './stripe-product-prices.entity'
import { PlanTier, SubscriptionPlan, SubscriptionPlanApp } from './subscription-plans.entity'

export type PlanPermission =
  | ClassTypeEnum
  | FeatureEnableEnum
  | ContactChannelIntegrations
  | PromotionType
  | ThirdPartyIntegrations
  | PlanTier

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
  [key in ThirdPartyIntegrations]?: boolean
}

export type ClassTypeEnable = {
  [key in ClassTypeEnum]?: boolean
}

export type PlanWithStripePrice = {
  price?: StripeProductPricesEntity
  qty?: number
} & SubscriptionPlan

@Entity('subscription_plan_records')
export class SubscriptionPlanRecordsEntity extends BaseEntity {
  @Column({ name: 'plan_ids', type: 'int', array: true, default: [] })
  planIds: number[]

  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'purchase_date', type: 'timestamptz' })
  purchaseDate: Date

  @Column({ name: 'expiry_date', type: 'timestamptz' })
  expiryDate: Date

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

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId: string

  @Column({ name: 'is_trial', type: 'boolean', default: false })
  isTrial: boolean

  @ManyToOne(() => Site, (site) => site.subscriptionPlanRecords, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  plans?: PlanWithStripePrice[]

  @Column({ name: 'app', type: 'varchar' })
  app: SubscriptionPlanApp

  @Column({ name: 'preset_discount', type: 'int', default: 0 })
  presetDiscount: number

  @Column({ name: 'preset_coupon_id', type: 'varchar', nullable: true })
  presetCouponId: string
}

@Injectable()
export class SubscriptionPlanRecordsRepository extends BaseAbstractRepository<SubscriptionPlanRecordsEntity> {
  private _repository: Repository<SubscriptionPlanRecordsEntity>

  constructor(
    @InjectRepository(SubscriptionPlanRecordsEntity)
    repository: Repository<SubscriptionPlanRecordsEntity>
  ) {
    super(repository)
    this._repository = repository
  }

  async findOneWithExpiryDate(siteId: number): Promise<SubscriptionPlanRecordsEntity | null> {
    return this._repository.findOne({
      where: {
        siteId,
        expiryDate: MoreThanOrEqual(dayjs().toDate()),
      },
    })
  }
}
