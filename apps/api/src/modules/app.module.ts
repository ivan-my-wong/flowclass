/* eslint-disable simple-import-sort/imports */
import { configValidationSchema } from '@/config/config.schema'
import { CloudWatchLoggerProvider } from '../config/loggers/cloudwatch-nestjs.provider'

import { AdminModule } from './admin.module'
import { RedisModule } from './cache/cacheClient.module'
import { DataMigrationModule } from './data-migration.module'
import { MediaModule } from './media/media.module'
import { StudentModule } from './student.module'

import { SSEModule } from '@/modules/sse/sse.module'
import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      // Pick the env file sequence.
      // In NestJS ConfigModule (dotenv), the FIRST file in the array takes precedence (first one wins).
      // Thus, files are ordered from highest precedence (most specific/local) to lowest precedence (defaults):
      // 1. .env.local (local developer overrides)
      // 2. .env.${process.env.APP_ENV}.local (environment-specific local overrides)
      // 3. .env (actual generated/custom environment configuration)
      // 4. .env.${process.env.APP_ENV} (environment-specific default template/fallback)
      envFilePath: [
        '.env.local',
        `.env.${process.env.APP_ENV}.local`,
        '.env',
        `.env.${process.env.APP_ENV}`,
      ],
      validationSchema: configValidationSchema,
      isGlobal: true,
      expandVariables: true,
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_URL,
          port: +process.env.REDIS_PORT,
        },
        limiter: {
          max: 10,
          duration: 5000,
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'exports'),
      serveRoot: '/exports/',
    }),
    SSEModule,
    DataMigrationModule,
    RedisModule,
    AdminModule,
    StudentModule,
    MediaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: CloudWatchLoggerProvider,
      useValue: new CloudWatchLoggerProvider(),
      scope: Scope.DEFAULT,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // ✅ Register LoggerMiddleware at app level to avoid duplicate logs
    // This ensures it only runs once per request, regardless of which module handles it
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
