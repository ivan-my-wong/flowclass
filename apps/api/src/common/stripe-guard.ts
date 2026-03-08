import { BadRequestException } from '@nestjs/common'
import Stripe from 'stripe'

const STRIPE_DISABLED_MESSAGE =
  'Stripe is not configured. Set STRIPE_SECRET_KEY in .env to enable payment features.'

export function ensureStripeConfigured(client: Stripe | null): asserts client is Stripe {
  if (!client) {
    throw new BadRequestException(STRIPE_DISABLED_MESSAGE)
  }
}
