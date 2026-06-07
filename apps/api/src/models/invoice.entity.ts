import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'

import {
  DiscountInvoices,
  InvoiceSplitType,
  SplitItem,
} from '@/application/admin/invoice-campaign/dto/send-invoice.dto'
import { ClassPriceOption } from '@/models/class-price-options.entity'
import { Course } from '@/models/courses.entity'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { DiscountType, PaymentMethod } from '@/models/enums/'
import { PaymentStatus } from '@/models/enums/status'
import { InvoicePromotionUsed } from '@/models/invoice-promotion-used.entity'
import { PaymentEvidence } from '@/models/payment-evidence.entity'
import { PayoutMethod } from '@/models/payout-method.entity'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { User } from '@/models/user.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { CreditTransactions } from './credit-transactions.entity'
import { Institution } from './institutions.entity'
import { Site } from './site.entity'
import { UserAlias } from './user-aliases.entity'

export enum InvoiceType {
  COMBINED = 'COMBINED',
  REGULAR = 'REGULAR',
}

export type ManualDiscount = {
  name: string
  amount: number
}

export type InvoiceSplit = {
  description: string
  percentage: number
  dueDate: Date
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  divitOrder?: any

  @Index('IX_invoices_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_invoices_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'course_id', nullable: true })
  courseId: number

  // @Column({ name: 'enroll_id', nullable: true })
  // enrollId: number

  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'user_alias_id', nullable: true })
  userAliasId: number

  // This is used for combined invoice
  // @Column({ name: 'enroll_ids', nullable: true, type: 'jsonb' })
  // enrollIds?: number[]

  // This is used for combined invoice
  // @Column({ name: 'course_ids', nullable: true, type: 'jsonb' })
  // courseIds?: number[]

  @Column({ name: 'payment_state', enum: PaymentStatus, type: 'varchar' })
  paymentState: PaymentStatus

  @Column({ name: 'payment_method', enum: PaymentMethod, type: 'varchar' })
  paymentMethod: PaymentMethod

  @Column('jsonb', { name: 'pay_later_method', nullable: true })
  payLaterMethod?: PayoutMethod

  @Column({ name: 'payment_link_id', nullable: true })
  paymentLinkId: string

  // @Column({ name: 'payment_evidence_id', nullable: true })
  // paymentEvidenceId: string
  @Column({ name: 'price_option_id', nullable: true })
  priceOptionId: number

  @ManyToOne(() => ClassPriceOption, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'price_option_id' })
  priceOption: ClassPriceOption

  @Column({ name: 'fee_per_lesson', default: 0, type: 'numeric' })
  feePerLesson: number

  @Column({ name: 'num_of_lesson', default: 0 })
  numOfLesson: number

  @Column({ name: 'num_of_applicant', default: 1 })
  numOfApplicant: number

  @Column({ name: 'original_fee', default: 0, type: 'numeric' })
  originalFee: number

  @Column({ name: 'pay_amount', default: 0, type: 'numeric' })
  payAmount: number

  @Column({ name: 'amount_paid', default: 0, type: 'numeric' })
  amountPaid: number

  @Column({ name: 'currency', nullable: true })
  currency: string

  @Column({ name: 'pay_by', length: 255 })
  payBy: string

  @Column({ name: 'pay_by_id', default: 0 })
  payById: number

  @Column({ name: 'discounts', length: 255, nullable: true })
  discounts: string

  @Column('decimal', { name: 'discount_amount', default: 0 })
  discountAmount: number

  @Column('decimal', { name: 'additional_fee', default: 0 })
  additionalFee: number

  @Column({ name: 'reviewed', default: false })
  reviewed: boolean

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string

  @Column({ name: 'approver_id', nullable: true })
  approverId: number

  @Column({ name: 'proof_token', nullable: true, length: 255 })
  proofToken?: string

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: string

  // @Column('jsonb', { name: 'references', nullable: true })
  // references: MetaRef[] | MetaRef;

  @ManyToOne(() => Site, (site) => site.invoices, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @ManyToOne(() => Institution, (institution) => institution.invoices, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @OneToMany(() => EnrollCourse, (enrollCourse) => enrollCourse.invoice, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  enrollCourses: EnrollCourse[]

  @OneToMany(() => StudentSchedule, (studentSchedule) => studentSchedule.invoice, {
    cascade: true,
  })
  studentSchedules: StudentSchedule[]

  @OneToOne(() => PaymentEvidence, (paymentEvidence) => paymentEvidence.invoice, {
    createForeignKeyConstraints: false,
  })
  paymentEvidence: PaymentEvidence

  @OneToMany(() => InvoicePromotionUsed, (p) => p.invoice, {
    createForeignKeyConstraints: false,
  })
  invoicePromotionsUsed: InvoicePromotionUsed[]

  @ManyToOne(() => Course, (course) => course.invoices, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course

  @ManyToOne(() => User, (user) => user.invoices, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => UserAlias, (userAlias) => userAlias.invoices, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_alias_id' })
  userAlias: UserAlias

  // user: User this is for grepping so we know this is referring to users
  @Column({ name: 'applicants', default: [], type: 'jsonb' })
  applicants?: number[]

  @Column({ name: 'invoice_parent_id', nullable: true })
  invoiceParentId: number

  @Index('IX_invoices_parent_id')
  @ManyToOne(() => Invoice, (invoice) => invoice.childInvoices, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'invoice_parent_id' })
  parentInvoice: Invoice

  @OneToMany(() => Invoice, (invoice) => invoice.parentInvoice, {
    cascade: false,
  })
  childInvoices: Invoice[]

  @Column({ name: 'is_parent', type: 'boolean', default: false })
  isParent: boolean

  @Column({
    name: 'is_combined',
    type: 'boolean',
    default: false,
  })
  isCombined?: boolean

  // Helper method to check if this is a parent invoice
  get hasChildren(): boolean {
    return this.childInvoices && this.childInvoices.length > 0
  }

  // Helper method to get total amount including children
  get getTotalAmountWithChildren(): number {
    if (!this.hasChildren) {
      return this.payAmount
    }

    const childrenTotal = this.childInvoices.reduce((sum, child) => sum + child.payAmount, 0)
    return this.payAmount + childrenTotal
  }
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDiscountDetail)
  @Column('jsonb', { name: 'discount_details', nullable: true })
  discountDetails?: InvoiceDiscountDetail[]

  @Column({ name: 'manual_discount', type: 'jsonb', nullable: true })
  manualDiscount?: ManualDiscount

  // This is use for merging invoices
  // This will be used when admin decided to combine multiple invoices into one
  // and split installments accordingly. Id of this invoice will be used to create invoice installments
  @Column({ name: 'invoice_ids', type: 'jsonb', default: [] })
  invoiceIds: number[]

  @Column('varchar', { name: 'split_type', default: InvoiceSplitType.SINGLE, nullable: true })
  splitType: InvoiceSplitType

  @Column('jsonb', { name: 'split_items', default: [], nullable: true })
  splitItems: SplitItem[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DiscountInvoices)
  @Column('jsonb', { name: 'admin_discounts', nullable: true, default: [] })
  adminDiscounts?: DiscountInvoices[]

  @Index('IX_invoices_document_campaign_id')
  @Column({
    name: 'document_campaign_id',
    type: 'bigint',
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value == null ? null : Number(value)),
    },
  })
  documentCampaignId: number

  @Column({
    type: 'decimal',
    name: 'used_balance',
    default: 0,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value == null ? null : Number(value)),
    },
  })
  usedBalance: number

  @Column({ type: 'bigint', name: 'credit_transactions_id', nullable: true })
  creditTransactionsId: number

  @Column({ type: 'text', name: 'pdf_url', default: null, nullable: true })
  pdfUrl?: string | null

  @OneToOne(() => CreditTransactions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'credit_transactions_id' })
  creditTransaction: CreditTransactions

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date | null

  private _originalPaymentState?: PaymentStatus

  @AfterLoad()
  loadOriginalValues() {
    this._originalPaymentState = this.paymentState
  }

  @BeforeInsert()
  handleInsert() {
    if (this.paymentState === PaymentStatus.PAID && !this.paymentDate) {
      this.paymentDate = new Date()
    }
    this.amountPaid = 0
  }

  @BeforeUpdate()
  handleUpdate() {
    const wasNotPaid = this._originalPaymentState !== PaymentStatus.PAID
    const isNowPaid = this.paymentState === PaymentStatus.PAID

    if (wasNotPaid && isNowPaid && !this.paymentDate) {
      this.paymentDate = new Date()
    }

    if (
      this._originalPaymentState === PaymentStatus.PAID &&
      this.paymentState !== PaymentStatus.PAID
    ) {
      this.paymentDate = null
    }

    if (wasNotPaid && isNowPaid) {
      this.amountPaid = this.payAmount ?? 0
    }
  }
  @Column({ type: 'text', nullable: true })
  remark?: string

  @ManyToOne(() => User, { createForeignKeyConstraints: false, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User
}

export class InvoiceDiscountDetail {
  @IsNumber()
  bundleId: number

  @IsString()
  name: string

  @IsEnum(DiscountType)
  type: DiscountType

  @IsNumber()
  amount: number

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  classesIds?: number[]
}
