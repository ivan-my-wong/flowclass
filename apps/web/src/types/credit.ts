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
}

export type CreditTransaction = {
  id: number
  userAliasId: number
  institutionId: number
  amount: number
  transactionType: CreditTransactionType
  sourceType: CreditSourceType
  balanceAfter: number
  invoiceId?: number
  bookingId?: number
  description: string
  createdAt: string
  updatedAt: string
}

export type CreditSettings = {
  id: number
  institutionId: number
  isEnabled: boolean
  conversionRate: number // 1 credit = X currency units
  currencyCode: string // e.g. 'HKD'
  creditExpiryDays?: number
  minCreditUsage: number // minimum credit usage per transaction
  maxCreditPerTransaction?: number
  createdAt: string
  updatedAt: string
}
