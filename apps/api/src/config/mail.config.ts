import * as Joi from 'joi'

export type MailConfig = {
  MAIL_ENCRYPTION?: string
  MAIL_FROM_ADDRESS?: string
  MAIL_FROM_NAME?: string
}

export const mailConfigSchema = Joi.object<MailConfig>({
  MAIL_ENCRYPTION: Joi.string().optional(),
  MAIL_FROM_ADDRESS: Joi.string().optional(),
  MAIL_FROM_NAME: Joi.string().optional(),
})
