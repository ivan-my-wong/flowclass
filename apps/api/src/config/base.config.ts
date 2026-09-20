import * as Joi from 'joi'

const envs = ['local', 'staging', 'production', 'test'] as const
export type Environment = (typeof envs)[number]

export type BaseConfig = {
  APP_ENV: Environment
  APP_PORT: number
  APP_HOSTNAME: string
}

export const baseConfigSchema = Joi.object<BaseConfig>({
  APP_ENV: Joi.string().valid(...envs).default('local'),
  APP_PORT: Joi.number().default(5000),
  APP_HOSTNAME: Joi.string().default('localhost'),
})
