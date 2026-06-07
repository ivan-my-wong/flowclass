import { StatusPaymentProof } from '@/types/paymentProof'

export enum PaymentMethodsEnum {
  PAY_LATER = 'PAY_LATER',
  PAY_NOW = 'PAY_NOW',
  PAY_NOW_DIVIT = 'PAY_NOW_DIVIT',
}

export enum PaymentEvidenceState {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
}

export enum PaymentState {
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PENDING = 'PENDING',
  REFUNDED = 'REFUNDED',
  CRITICAL = 'CRITICAL',

  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
}

export const stripeSupportedCountry = [
  'AU',
  'AT',
  'BE',
  'BR',
  'BG',
  'CA',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GI',
  'GR',
  'HK',
  'HU',
  'IN',
  'ID',
  'IE',
  'IT',
  'JP',
  'LV',
  'LI',
  'LT',
  'LU',
  'MY',
  'MT',
  'MX',
  'NL',
  'NZ',
  'NO',
  'PL',
  'PT',
  'RO',
  'SG',
  'SK',
  'SI',
  'ES',
  'SE',
  'CH',
  'TH',
  'AE',
  'GB',
  'US',
]

export const paymentStatusOptions = [
  {
    value: `${StatusPaymentProof.confirmed},${StatusPaymentProof.approved}`,
    label: 'student:paymentProof.confirmed',
  },
  {
    value: StatusPaymentProof.awaitingReviewProof,
    label: 'student:paymentProof.paymentStatusOptions.awaitingReviewProof',
  },
  {
    value: StatusPaymentProof.awaitingReviewWithoutProof,
    label:
      'student:paymentProof.paymentStatusOptions.awaitingReviewWithoutProof',
  },
  {
    value: StatusPaymentProof.rejected,
    label: 'student:paymentProof.rejected',
  },
]

export const paymentProofCsvHeaders = [
  { label: 'ID', key: 'id' },
  { label: 'student:column.lastUpdated', key: 'lastUpdated' },
  { label: 'student:userName', key: 'name' },
  { label: 'student:phone', key: 'phone' },
  { label: 'student:email', key: 'email' },
  { label: 'setting:webpageSetting.currency', key: 'currency' },
  { label: 'student:paymentAmount', key: 'paymentAmount' },
  { label: 'student:paymentStatus.status', key: 'paymentState' },
  { label: 'student:paymentMethod.method', key: 'paymentMethod' },
  { label: 'student:exportCSV.payLaterMethod', key: 'payLaterMethod' },
  { label: 'student:enrolledCourse', key: 'courseName' },
  { label: 'student:className', key: 'className' },
  { label: 'student:period', key: 'period' },
  { label: 'student:promotionUsed', key: 'promotionUsed' },
] as { label: string; key: string }[]

export const MAX_LIMIT_REMIND_STUDENT = 500
