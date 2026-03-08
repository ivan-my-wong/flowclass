export enum PayoutMethodType {
  bankTransfer = 'bankTransfer',
  external = 'external',
  others = 'Others',
}

export type PaymentMethodDetails = {
  paymentMethodName?: string
  accountName?: string
  bankName?: string
  bankBranch?: string
  accountId?: string
  payoutImg?: string
  payoutUrl?: string
  receiptRequired?: boolean
  successMessage?: string
}

export type Payout = {
  id?: number
  siteId: number
  institutionId: number
  description: string
  methodType: string
  methodName: string
  payoutImg?: string
  payoutUrl?: string
  payoutMethodDetails: PaymentMethodDetails
  enabled: boolean
}

export type PayoutResponse = {
  item: Payout
  status: number
}

// Now, both Bank Payout Method and Other Payout Method are called accountId for standardization
export type IBasePayoutDetails = {
  // Some case payout methods require a receipt or not
  receiptRequired?: boolean
}
export type BankPayoutMethodDetails = {
  accountName: string
  accountId: string
  bankName: string
  bankBranch: string
} & IBasePayoutDetails

export type ExternalPayoutMethodDetails = {
  payoutUrl: string
  payoutImg: string
} & IBasePayoutDetails

export type OtherPayoutMethodDetails = {
  accountName: string
  accountId: string
  payoutImg: string
  payoutUrl: string
} & IBasePayoutDetails
