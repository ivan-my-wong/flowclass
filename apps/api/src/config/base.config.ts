import * as Joi from 'joi'

const envs = ['development', 'staging', 'production', 'test'] as const
export type Environment = (typeof envs)[number]

export type BaseConfig = {
  NODE_ENV: Environment
  APP_PORT: number
  API_BASE_URL: string
  /** Web app URL (from NEXT_PUBLIC_WEB_BASE_URL). Used for redirects, invite links, etc. */
  NEXT_PUBLIC_WEB_BASE_URL: string
}

export const baseConfigSchema = Joi.object<BaseConfig>({
  NODE_ENV: Joi.string()
    .valid(...envs)
    .default('development'),
  APP_PORT: Joi.number().default(3100),
  API_BASE_URL: Joi.string().default('http://localhost:3100'),
  NEXT_PUBLIC_WEB_BASE_URL: Joi.string().default('http://localhost:3001'),
}).required()
