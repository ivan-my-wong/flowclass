import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import loadEnv from './load-env'
loadEnv()
const ssl = process.env.DATABASE_SSL === 'true'

let config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production' ? true : ['error', 'warn'],
  ssl: ssl
    ? {
        ca: fs.readFileSync('src/config/certs/ap-east-1-bundle.pem').toString(),
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
