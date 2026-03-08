export enum StripeConnectStatus {
  RESTRICTED = 'RESTRICTED',
  RESTRICTED_SOON = 'RESTRICTED_SOON',
  PENDING = 'PENDING',
  ENABLED = 'ENABLED',
  COMPLETE = 'COMPLETE',
  NOTFOUND = 'NOTFOUND',
}

export type StripeConnectDetail = {
  id: number
  siteId: number
  institutionId: number
  stripeAccountId: string
  status: StripeConnectStatus
  customerId: string
  subscriptionId: string
  enabled: boolean
}

export type StripeConnectAccount = {
  siteId: number
  institutionId: number
  stripeAccountId: string
  status: StripeConnectStatus
  customerId: string
  subscriptionId: string
  enabled: boolean
}

export enum StripeCurrency {
  USD = 'USD',
  HKD = 'HKD',
}
