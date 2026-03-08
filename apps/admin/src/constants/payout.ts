import { PaymentMethodDetails, Payout } from '@/types/payout'

export const defaultPaymentMethodDetails: PaymentMethodDetails = {
  paymentMethodName: '',
  accountName: '',
  bankName: '',
  bankBranch: '',
  accountId: '',
  payoutImg: '',
  payoutUrl: '',
  receiptRequired: false,
  successMessage: '',
}

export const defaultPayout: Payout = {
  siteId: 0,
  institutionId: 0,
  description: '',
  methodType: '',
  methodName: '',
  payoutImg: '',
  payoutUrl: '',
  payoutMethodDetails: defaultPaymentMethodDetails,
  enabled: true,
}
