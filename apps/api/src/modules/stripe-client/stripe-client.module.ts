import { Module } from '@nestjs/common'
import Stripe from 'stripe'

import { STRIPE_CLIENT, STRIPE_CONFIG_URL } from '@/common/constants/provider-keys'

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      useFactory: () => {
        // Centralized Stripe client for subscription and payment processing
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key'
        return new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: (process.env.STRIPE_API_VERSION || '2023-10-16') as Stripe.LatestApiVersion,
        })
      },
    },
    {
      provide: STRIPE_CONFIG_URL,
      useFactory: () => {
        // Centralized URLs for Stripe payment success and cancellation
        const STRIPE_PAYMENT_SUCCESS_URL =
          process.env.STRIPE_SUBSCRIPTION_SUCCESS_URL || 'http://localhost:3000/payment/success'
        const STRIPE_PAYMENT_CANCEL_URL =
          process.env.STRIPE_SUBSCRIPTION_CANCEL_URL || 'http://localhost:3000/payment/cancel'

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
