import { Column, Entity } from 'typeorm'

import { StripePriceInterval, StripePriceType } from '@/models/enums/'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('stripe_product_prices')
export class StripeProductPricesEntity extends BaseEntity {
  // This is the string from stripe, not linking to our database
  @Column({ name: 'stripe_product_id', nullable: true })
  stripeProductId: string

  @Column({ name: 'stripe_product_name', default: 'DEFAULT_PRODUCT_NAME' })
  stripeProductName: string

  @Column({ name: 'stripe_price_id', nullable: true })
  stripePriceId: string

  @Column({ name: 'unit_amount', type: 'decimal', precision: 10, scale: 2 })
  unitAmount: number

  @Column({ name: 'currency' })
  currency: string

  @Column({ name: 'type', type: 'varchar', enum: StripePriceType, nullable: true })
  type?: StripePriceType

  @Column({
    name: 'interval',
    type: 'varchar',
    enum: StripePriceInterval,
    nullable: true,
  })
  interval?: StripePriceInterval

  @Column({ name: 'interval_count', nullable: true })
  intervalCount: number

  @Column({ name: 'is_active', default: false })
  isActive: boolean

  @Column({ name: 'lookup_key', nullable: true })
  lookupKey: string

  @Column({ name: 'plan_id', nullable: true })
  planId: number
}
