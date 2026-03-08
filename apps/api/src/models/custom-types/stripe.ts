import Stripe from 'stripe'

export type StripeClientSecretType = {
  id: string
  clientSecret: string
}

export type CreatePaymentLinkReturnType = {
  clientSecret: StripeClientSecretType | null
  paymentLink: Stripe.Response<Stripe.PaymentLink> | null
  redirectUrl: URL | null
}

export type CreateCheckoutSessionReturnType = {
  status: string
  clientSecret: StripeClientSecretType | null
}

export type StripeConfigUrl = {
  successUrl: string
  cancelUrl: string
}
