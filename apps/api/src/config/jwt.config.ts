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
  JWT_SECRET: Joi.string().empty('').default('flowclass-jwt-secret-dev'),
  JWT_EXPIRES_IN: Joi.string().empty('').default('7d'),
  JWT_REFRESH_SECRET: Joi.string().empty('').default('flowclass-jwt-refresh-secret-dev'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().empty('').default('30d'),
  JWT_SECRET_STUDENT: Joi.string().empty('').default('flowclass-jwt-student-secret-dev'),
  JWT_TOKEN_FORGOT_PASSWORD_SECRET_KEY: Joi.string().empty('').default('flowclass-jwt-forgot-password-secret-dev'),
  JWT_TOKEN_FORGOT_PASSWORD_EXPRIED: Joi.string().empty('').default('1d'),
  JWT_TOKEN_ENROLL_COURSE_SECRET_KEY: Joi.string().empty('').default('flowclass-jwt-enroll-course-secret-dev'),
  JWT_TOKEN_ENROLL_COURSE_EXPRIED: Joi.string().empty('').default('7d'),
})
