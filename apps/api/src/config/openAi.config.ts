import * as Joi from 'joi'

export type OpenAiConfig = {
  AZURE_OPENAI_URL: string
  AZURE_OPENAI_KEY?: string
  OPENAI_MODEL_ID: string
}

export const OpenAiConfigSchema = Joi.object<OpenAiConfig>({
  AZURE_OPENAI_URL: Joi.string(),
  AZURE_OPENAI_KEY: Joi.string().allow('').optional(),
  OPENAI_MODEL_ID: Joi.string(),
})
