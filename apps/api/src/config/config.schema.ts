import * as Joi from 'joi'

import { AwsConfig, awsConfigSchema } from './aws.config'
import { BaseConfig, baseConfigSchema } from './base.config'
import { DatabaseConfig, databaseConfigSchema } from './database.config'
import { FileUploadConfig, fileUploadConfigSchema } from './fileUpload.config'
import { JwtConfig, jwtConfigSchema } from './jwt.config'
import { MailConfig, mailConfigSchema } from './mail.config'
import { OpenAiConfig, OpenAiConfigSchema } from './openAi.config'
import { SmtpConfig, smtpConfigSchema } from './smtp.config'
import { StripeConfig, stripeConfigSchema } from './stripe.config'
import { SwaggerConfig, swaggerConfigSchema } from './swagger.config'
import { DivitConfig, divitConfigSchema } from './divit.config'

export type TAppConfig = BaseConfig &
  DatabaseConfig &
  JwtConfig &
  FileUploadConfig &
  MailConfig &
  SmtpConfig &
  StripeConfig &
  DivitConfig &
  AwsConfig &
  OpenAiConfig &
  SwaggerConfig

export const configValidationSchema = Joi.object()
  .concat(baseConfigSchema)
  .concat(databaseConfigSchema)
  .concat(jwtConfigSchema)
  .concat(fileUploadConfigSchema)
  .concat(mailConfigSchema)
  .concat(smtpConfigSchema)
  .concat(stripeConfigSchema)
  .concat(divitConfigSchema)
  .concat(awsConfigSchema)
  .concat(OpenAiConfigSchema)
  .concat(swaggerConfigSchema)
  .required()
