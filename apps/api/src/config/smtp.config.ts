import * as Joi from 'joi'

export type SmtpConfig = {
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_SECURE: boolean
  SMTP_USER?: string
  SMTP_PASS?: string
}

export const smtpConfigSchema = Joi.object<SmtpConfig>({
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().default(1025),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
}).required()
