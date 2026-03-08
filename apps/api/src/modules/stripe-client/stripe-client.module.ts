import { Module } from '@nestjs/common'
import Stripe from 'stripe'

import { STRIPE_CLIENT, STRIPE_CONFIG_URL } from '@/common/constants/provider-keys'

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      useFactory: (): Stripe | null => {
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY?.trim()
        if (!STRIPE_SECRET_KEY) {
          return null
        }
        return new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: (process.env.STRIPE_API_VERSION || '2023-10-16') as Stripe.LatestApiVersion,
        })
      },
    },
    {
      provide: STRIPE_CONFIG_URL,
      useFactory: () => {
        const successUrl = process.env.STRIPE_SUBSCRIPTION_SUCCESS_URL || 'http://localhost:3001'
        const cancelUrl = process.env.STRIPE_SUBSCRIPTION_CANCEL_URL || 'http://localhost:3001'
        return { successUrl, cancelUrl }
      },
    },
  ],
  exports: [STRIPE_CLIENT, STRIPE_CONFIG_URL],
})
export class StripeClientModule {}
