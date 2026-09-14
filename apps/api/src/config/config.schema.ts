import * as Joi from 'joi'

import { AwsConfig, awsConfigSchema } from './aws.config'
import { BaseConfig, baseConfigSchema } from './base.config'
import { CloudwatchConfig, cloudWatchConfigSchema } from './cloudwatch.config'
import { DatabaseConfig, databaseConfigSchema } from './database.config'
import { FileUploadConfig, fileUploadConfigSchema } from './fileUpload.config'
import { FirebaseConfig, firebaseConfigSchema } from './firebase.config'
import { JwtConfig, jwtConfigSchema } from './jwt.config'
import { LinkConfig, linkConfigSchema } from './link.config'
import { MailConfig, mailConfigSchema } from './mail.config'
import { OpenAiConfig, OpenAiConfigSchema } from './openAi.config'
import { StripeConfig, stripeConfigSchema } from './stripe.config'
import { SwaggerConfig, swaggerConfigSchema } from './swagger.config'

export type TAppConfig = BaseConfig &
  DatabaseConfig &
  LinkConfig &
  JwtConfig &
  FileUploadConfig &
  MailConfig &
  StripeConfig &
  AwsConfig &
  CloudwatchConfig &
  OpenAiConfig &
  FirebaseConfig &
  SwaggerConfig

export const configValidationSchema = Joi.object()
  .concat(baseConfigSchema)
  .concat(databaseConfigSchema)
  .concat(linkConfigSchema)
  .concat(jwtConfigSchema)
  .concat(fileUploadConfigSchema)
  .concat(mailConfigSchema)
  .concat(stripeConfigSchema)
  .concat(awsConfigSchema)
  .concat(cloudWatchConfigSchema)
  .concat(OpenAiConfigSchema)
  .concat(firebaseConfigSchema)
  .concat(swaggerConfigSchema)
  .required()
