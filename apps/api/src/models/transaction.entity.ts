import { Column, Entity, Index } from 'typeorm'

import { PaymentMethod } from '@/models/enums/'
import { CheckoutStatus } from '@/models/enums/status'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Index('IX_transactions_transaction_id', { unique: true })
  @Column('uuid', { name: 'transaction_id', nullable: true })
  transactionId: string // transaction_id

  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'course_id' })
  courseId: number

  // for further reference
  @Column({ name: 'checkout_session_id', nullable: true })
  checkoutSessionId: string // could be null for PAY_LATER method

  // for further reference
  @Column({ name: 'invoice_id', nullable: true })
  invoiceId?: number

  @Column({ name: 'status', enum: CheckoutStatus, type: 'varchar' })
  status: CheckoutStatus

  @Column({ name: 'payment_link_id' })
  paymentLinkId: string // could be "pay_later" for PAY_LATER method

  @Column({ name: 'payment_intent', nullable: true })
  paymentIntent: string // could be null for PAY_LATER method

  @Column({ name: 'amount_subtotal', default: 0, type: 'numeric' })
  amountSubtotal: number //payment amount before tax

  @Column({ name: 'amount_total', default: 0, type: 'numeric' })
  amountTotal: number // payment amount after tax and (stripe) discount

  @Column({ name: 'currency', default: 'USD' })
  currency: string

  @Column({ name: 'payment_method', enum: PaymentMethod, type: 'varchar' })
  paymentMethod: PaymentMethod

  // maybe there is some transaction fee on stripe
  // this makes amount_total a little bit smaller when deduct from amount_subtotal
  @Column({ name: 'transaction_fee', default: 0, type: 'numeric' })
  transactionFee: number

  @Column('jsonb', { name: 'customer', nullable: true })
  customer?: any

  @Column('jsonb', { name: 'merchant', nullable: true })
  merchant?: any

  @Column({ name: 'description', nullable: true })
  description?: string

  @Column({ name: 'authorization_code', nullable: true })
  authorizationCode: string // is By_Stripe for PAY_NOW or id of evident proof record for PAY_LATER

  @Column({ name: 'approver_id', nullable: true })
  approverId?: number // id of user who approve this transaction, null if transaction comes from Tripe

  @Column({ name: 'approver_name', nullable: true })
  approverName?: string // name of user who approve this transaction, null if transaction come from Tripe
}
