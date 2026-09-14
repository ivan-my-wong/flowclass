import * as Joi from 'joi'

export type StripeConfig = {
  STRIPE_SECRET_KEY: string
  STRIPE_ENDPOINT_SECRET: string
  STRIPE_CONNECT_ENDPOINT_SECRET: string
}

export const stripeConfigSchema = Joi.object<StripeConfig>({
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_ENDPOINT_SECRET: Joi.string().required(),
  STRIPE_CONNECT_ENDPOINT_SECRET: Joi.string().required(),
}).required()
