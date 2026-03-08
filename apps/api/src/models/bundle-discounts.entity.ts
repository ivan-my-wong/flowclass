import { IsNumber } from 'class-validator'
import { Column, Entity, Unique } from 'typeorm'

import { DiscountType } from '@/models/enums/'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('bundle_discounts')
@Unique(['name', 'siteId', 'institutionId'])
export class BundleDiscount extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED_AMOUNT,
  })
  discountType: DiscountType

  @Column({ name: 'amount' })
  amount: number

  @Column({ name: 'minQty' })
  minQty: number

  @Column('jsonb', { name: 'bundle_table', default: [] })
  bundleTable: BundleTableCell[] // e.g., buy X get Y% off

  @Column({ name: 'is_auto_apply', type: 'boolean', default: false })
  isAutoApply: boolean // auto-apply to invoices

  @Column({ name: 'is_retroactive', type: 'boolean', default: false })
  isRetroactive: boolean // apply to previous invoices in same month

  @Column({ name: 'is_all_items', type: 'boolean', default: true })
  isAllItems: boolean // true = applies to all courses

  @Column('int', { array: true, name: 'applicable_item_ids', nullable: true })
  applicableItemIds?: number[] // required if isAllItems = false

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate?: Date

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean // manually toggleable by admin

  @Column({ name: 'is_stackable', type: 'boolean', default: false })
  isStackable: boolean // allow stacking with other discounts
}

export class BundleTableCell {
  @IsNumber()
  minQty: number // minimum quantity required (e.g. 3)

  @IsNumber()
  amount: number // discount value (e.g. 12 means 12% / fixed)
}
