import * as Joi from 'joi'

export type AwsConfig = {
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_REGION?: string
}

export const awsConfigSchema = Joi.object<AwsConfig>({
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().optional(),
}).required()
