import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import { Coupon } from '@/models/coupons.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { PromotionUsedStatus } from './enums/status'
import { Invoice } from './invoice.entity'

@Entity('course_promotion_used')
export class CoursePromotionUsed extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'course_id' })
  courseId: number

  @Index('IX_course_promotion_used_coupon_id')
  @Column({ name: 'coupon_id' })
  couponId: number

  @Column({ name: 'student_id' })
  studentId: number

  @Index('IX_course_promotion_used_enroll_id')
  @Column({ name: 'enroll_id', default: 0 })
  enrollId: number

  @Column({ name: 'invoice_id', default: 0 })
  invoiceId: number

  @Column({
    name: 'used_status',
    enum: PromotionUsedStatus,
    default: PromotionUsedStatus.REDEEMED,
    type: 'varchar',
  })
  usedStatus: PromotionUsedStatus

  @ManyToOne(() => Coupon, (coupon) => coupon.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon

  @OneToOne(() => Invoice, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice
}
