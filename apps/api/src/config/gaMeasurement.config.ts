import * as Joi from 'joi'

export type GaMeasurementConfig = {
  GA_MEASUREMENT_API_KEY: string
  GA_MEASUREMENT_ID: string
}

export const GaMeasurementConfigSchema = Joi.object<GaMeasurementConfig>({
  GA_MEASUREMENT_API_KEY: Joi.string().required(),
  GA_MEASUREMENT_ID: Joi.string().required(),
}).required()
