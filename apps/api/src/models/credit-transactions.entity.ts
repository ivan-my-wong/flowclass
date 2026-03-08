import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

export enum CreditTransactionType {
  ADDED = 'ADDED',
  DEDUCTED = 'DEDUCTED',
  EXPIRED = 'EXPIRED',
}

export enum CreditSourceType {
  INVOICE_PAYMENT = 'INVOICE_PAYMENT',
  LESSON_BOOKING = 'LESSON_BOOKING',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  REFUND = 'REFUND',
  EXPIRY = 'EXPIRY',
  MOVE_CREDIT = 'MOVE_CREDIT',
  REFERRAL = 'REFERRAL',
}

@Entity('credit_transactions')
export class CreditTransactions extends BaseEntity {
  @Index('IX_credit_transactions_institution_id')
  @Column({
    name: 'institution_id',
    type: 'int4',
  })
  institutionId: number

  @Index('IX_credit_transactions_user_alias_id')
  @Column({
    name: 'user_alias_id',
    type: 'int4',
  })
  userAliasId: number

  @Index('IX_credit_transactions_source_type')
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: CreditSourceType,
  })
  sourceType: CreditSourceType

  @Index('IX_credit_transactions_transaction_type')
  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: CreditTransactionType,
  })
  transactionType: CreditTransactionType

  @Column({
    name: 'amount',
    type: 'numeric',
  })
  amount: number

  @Column({
    name: 'balance_after',
    type: 'numeric',
  })
  balanceAfter: number

  @Column({
    name: 'invoice_id',
    type: 'int4',
    nullable: true,
  })
  invoiceId?: number

  @Column({
    name: 'lesson_booking_id',
    type: 'int4',
    nullable: true,
  })
  bookingId?: number

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string
}
