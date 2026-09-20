import * as Joi from 'joi'

export type SwaggerConfig = {
  SWAGGER_ENABLED: boolean
}

export const swaggerConfigSchema = Joi.object<SwaggerConfig>({
  SWAGGER_ENABLED: Joi.boolean().default(true),
})
