import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm'

import { PaymentEvidenceStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { EnrollCourse } from './enroll-courses.entity'

@Entity('payment_evidences')
export class PaymentEvidence extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'user_id' })
  userId: number

  @Index('IX_payment_evidences_enroll_course_id')
  @Column({ name: 'enroll_course_id' })
  enrollCourseId: number

  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: number

  @Column()
  image: string

  @Column({ enum: PaymentEvidenceStatus, type: 'varchar' })
  status: PaymentEvidenceStatus

  @Column({ name: 'approver_id', nullable: true })
  approverId: number

  @OneToOne(() => EnrollCourse, (enrollCourse) => enrollCourse.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'enroll_course_id' })
  enrollCourse: EnrollCourse

  @OneToOne(() => Invoice, (invoice) => invoice.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice
}
