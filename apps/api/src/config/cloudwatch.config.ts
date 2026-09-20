import * as Joi from 'joi'

export type CloudwatchConfig = {
  CLOUDWATCH_LOG_GROUP_NAME: string
  CLOUDWATCH_LOG_STREAM_NAME: string
}

export const cloudWatchConfigSchema = Joi.object<CloudwatchConfig>({
  CLOUDWATCH_LOG_GROUP_NAME: Joi.string().allow('').optional(),
  CLOUDWATCH_LOG_STREAM_NAME: Joi.string().allow('').optional(),
})
