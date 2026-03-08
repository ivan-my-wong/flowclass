import * as Joi from 'joi'

export type MailConfig = {
  MAIL_ENCRYPTION: string
  MAIL_FROM_ADDRESS: string
  MAIL_FROM_NAME: string
}

export const mailConfigSchema = Joi.object<MailConfig>({
  MAIL_ENCRYPTION: Joi.string().default('tls'),
  MAIL_FROM_ADDRESS: Joi.string().default('no-reply@localhost'),
  MAIL_FROM_NAME: Joi.string().default('Flowclass OSS'),
})
