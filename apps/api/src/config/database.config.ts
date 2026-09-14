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
  DATABASE_HOST: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432).required(),
  DATABASE_SSL: Joi.boolean().default(true).required(),
}).required()
