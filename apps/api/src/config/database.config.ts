import * as Joi from 'joi'

export type DatabaseConfig = {
  DATABASE_HOST: string
  DATABASE_USER: string
  DATABASE_PASSWORD: string
  DATABASE_NAME: string
  DATABASE_PORT: string
  DATABASE_SSL: boolean
}

export const databaseConfigSchema = Joi.object<DatabaseConfig>({
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
  DATABASE_NAME: Joi.string().default('flowclass'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_SSL: Joi.boolean().default(false),
}).required()
