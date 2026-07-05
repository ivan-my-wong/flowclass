import * as fs from 'fs'
import * as path from 'path'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import loadEnv from './load-env'
loadEnv()
const ssl = process.env.DATABASE_SSL === 'true'

const databaseUrl = process.env.DATABASE_URL
const cleanedDbUrl = databaseUrl ? databaseUrl.replace(/[?&]sslmode=[^&]+/g, '') : undefined

let config: PostgresConnectionOptions = {
  type: 'postgres',
  ...(cleanedDbUrl
    ? { url: cleanedDbUrl }
    : {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      }),
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production' ? true : ['error', 'warn'],
  ssl: ssl
    ? {
        rejectUnauthorized: false,
      }
    : false,
  dropSchema: false,

  entities: ['src/models/**/*.entity.{js,ts}'],
  migrationsRun: false,
  migrations: ['migrations/runs/**/*.{js,ts}'],
}

// enable when test is using local database
if (process.env.NODE_ENV === 'test') {
  config = {
    ...config,
    ssl: false,
  }
}
const dataSource = new DataSource(config)

export default dataSource
