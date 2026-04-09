import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { DiscountType } from '@/models/enums/'
import { CouponStatus } from '@/models/enums/status'
import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  discountType: DiscountType

  @Column({ name: 'amount' })
  amount: number

  @Column({ name: 'code' })
  code: string

  @Column({ name: 'quota' })
  quota: number

  @Index('IX_coupons_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'for_bundle', default: false })
  forBundle: boolean

  @Column({ name: 'for_trial_lesson', default: false })
  forTrialLesson: boolean

  @Column({ name: 'expire_date', type: 'timestamptz' })
  expireDate: Date

  @Column({
    name: 'status',
    enum: CouponStatus,
    type: 'enum',
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus

  @Column({ name: 'user_ids', type: 'int', array: true, default: [] })
  userIds: number[]

  @Column({ name: 'class_ids', type: 'int', array: true, default: [] })
  classIds: number[]

  @ManyToOne(() => Institution, (institution) => institution.coupons, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Promise<Institution[]>

  usedCount: number
}
