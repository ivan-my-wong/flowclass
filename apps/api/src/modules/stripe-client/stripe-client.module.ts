import { Module } from '@nestjs/common'
import Stripe from 'stripe'

import { STRIPE_CLIENT, STRIPE_CONFIG_URL } from '@/common/constants/provider-keys'

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      useFactory: () => {
        // Centralized Stripe client for subscription and payment processing
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
        if (!STRIPE_SECRET_KEY) {
          throw new Error('STRIPE_SECRET_KEY environment variable is required')
        }
        return new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: (process.env.STRIPE_API_VERSION || '2023-10-16') as Stripe.LatestApiVersion,
        })
      },
    },
    {
      provide: STRIPE_CONFIG_URL,
      useFactory: () => {
        // Centralized URLs for Stripe payment success and cancellation
        const STRIPE_PAYMENT_SUCCESS_URL = process.env.STRIPE_SUBSCRIPTION_SUCCESS_URL
        const STRIPE_PAYMENT_CANCEL_URL = process.env.STRIPE_SUBSCRIPTION_CANCEL_URL

        if (!STRIPE_PAYMENT_SUCCESS_URL || !STRIPE_PAYMENT_CANCEL_URL) {
          throw new Error('STRIPE_PAYMENT_SUCCESS_URL and STRIPE_PAYMENT_CANCEL_URL are required')
        }

        return {
          successUrl: STRIPE_PAYMENT_SUCCESS_URL,
          cancelUrl: STRIPE_PAYMENT_CANCEL_URL,
        }
      },
    },
  ],
  exports: [STRIPE_CLIENT, STRIPE_CONFIG_URL],
})
export class StripeClientModule {}
