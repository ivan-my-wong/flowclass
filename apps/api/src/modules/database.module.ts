// eslint-disable-next-line simple-import-sort/imports
import { TAppConfig } from '@/config/config.schema'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

const getEnvironmentSpecificPoolConfig = (environment: string) => {
  // Staging / Local / Development
  if (environment === 'staging' || environment === 'local' || environment === 'development') {
    return {
      poolSize: 20,
      min: 5,
      max: 20,
      priority: 1,
      idleTimeoutMillis: 300000,
      connectionTimeoutMillis: 30000,
    }
  }

  // Production gets highest priority with max 40 connections
  return {
    poolSize: 40,
    min: 10,
    max: 40,
    priority: 0,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 25000,
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TAppConfig>) => {
        const environment = process.env.APP_ENV || 'development'
        const poolConfig = getEnvironmentSpecificPoolConfig(environment)

        const ssl = configService.get<boolean>('DATABASE_SSL')
        const databaseHost = configService.get<string>('DATABASE_HOST')
        const databasePort = configService.get<number>('DATABASE_PORT')
        const databaseName = configService.get<string>('DATABASE_NAME')
        const databaseUser = configService.get<string>('DATABASE_USER')
        const databasePassword = configService.get<string>('DATABASE_PASSWORD')
        console.log('Connected to database', databaseHost, databasePort, databaseName)
        console.log('Environment', environment)

        const options: TypeOrmModuleOptions = {
          type: 'postgres',
          host: databaseHost,
          port: databasePort,
          username: databaseUser,
          password: databasePassword,
          database: databaseName,
          synchronize: false,
          useUTC: true,
          poolErrorHandler: (err: Error) => {
            console.error('[Database Pool Error]', {
              error: err.message,
              stack: err.stack,
              timestamp: new Date().toISOString(),
              environment,
              poolSize: poolConfig.poolSize,
              currentConnections: poolConfig.max,
            })

            if (err.message.includes('remaining connection slots')) {
              console.error('[Connection Limit Warning]', {
                poolSize: poolConfig.poolSize,
                environment,
                timestamp: new Date().toISOString(),
              })
            }
          },
          ssl: ssl
            ? {
                ca: fs.readFileSync('src/config/certs/ap-east-1-bundle.pem').toString(),
                rejectUnauthorized: false,
              }
            : false,
          autoLoadEntities: true,
          logging: process.env.APP_ENV !== 'production' ? ['error', 'warn'] : ['error'],
          poolSize: poolConfig.poolSize,
          connectTimeoutMS: 30000,
          extra: {
            // Pool configuration with environment-specific settings
            max: poolConfig.max,
            min: poolConfig.min,
            idleTimeoutMillis: poolConfig.idleTimeoutMillis,
            connectionTimeoutMillis: poolConfig.connectionTimeoutMillis,
            priority: poolConfig.priority, // Add connection priority

            // Connection resilience
            maxUses: 7500,
            statement_timeout: 30000,
            idle_in_transaction_session_timeout: 30000,

            // Enhanced retry logic
            retryAttempts: 5,
            retryDelay: 1000,

            // Connection cleanup
            allowExitOnIdle: true,
            application_name: `flowclass-api-${environment}`, // Add app name with environment

            // Additional connection settings
            keepalive: true,
            keepaliveInitialDelayMillis: 10000,
          },

          // Connection management
          keepConnectionAlive: true,
        }

        if (process.env.APP_ENV === 'test') {
          return {
            ...options,
            synchronize: false,
          }
        }

        return options
      },
      dataSourceFactory: async (options: PostgresConnectionOptions) => {
        const dataSource = new DataSource(options)
        await dataSource.initialize()
        if (process.env.APP_ENV === 'test') {
          await dataSource.synchronize()
        }
        return addTransactionalDataSource(dataSource)
      },
    }),
  ],
})
export class DatabaseModule {}
