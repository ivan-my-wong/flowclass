import * as Joi from 'joi'

export type JwtConfig = {
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  JWT_REFRESH_SECRET: string
  JWT_REFRESH_EXPIRES_IN: string
  JWT_SECRET_STUDENT: string
}

export const jwtConfigSchema = Joi.object<JwtConfig>({
  JWT_SECRET: Joi.string().allow('').default('local-dev-jwt-secret'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().allow('').default('local-dev-jwt-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  JWT_SECRET_STUDENT: Joi.string().allow('').default('local-dev-jwt-student-secret'),
}).required()
