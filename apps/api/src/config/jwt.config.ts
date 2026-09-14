import * as Joi from 'joi'

export type JwtConfig = {
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  JWT_REFRESH_SECRET: string
  JWT_REFRESH_EXPIRES_IN: string
  JWT_SECRET_STUDENT: string
  JWT_TOKEN_FORGOT_PASSWORD_SECRET_KEY: string
  JWT_TOKEN_FORGOT_PASSWORD_EXPRIED: string
  JWT_TOKEN_ENROLL_COURSE_SECRET_KEY: string
  JWT_TOKEN_ENROLL_COURSE_EXPRIED: string
}

export const jwtConfigSchema = Joi.object<JwtConfig>({
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  JWT_SECRET_STUDENT: Joi.string().required(),
  JWT_TOKEN_FORGOT_PASSWORD_SECRET_KEY: Joi.string().required(),
  JWT_TOKEN_FORGOT_PASSWORD_EXPRIED: Joi.string().required(),
  JWT_TOKEN_ENROLL_COURSE_SECRET_KEY: Joi.string().required(),
  JWT_TOKEN_ENROLL_COURSE_EXPRIED: Joi.string().required(),
}).required()
