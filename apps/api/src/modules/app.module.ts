/* eslint-disable simple-import-sort/imports */
import { configValidationSchema } from '@/config/config.schema'
import { CloudWatchLoggerProvider } from '../config/loggers/cloudwatch-nestjs.provider'

import { AdminModule } from './admin.module'
import { CacheClientModule } from './cache/cacheClient.module'
import { MediaModule } from './media/media.module'
import { StudentModule } from './student.module'

import { SSEModule } from '@/modules/sse/sse.module'
import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { resolve } from 'path'
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware'
@Module({
  imports: [
    ConfigModule.forRoot({
      // Pick the env file sequence (later files override earlier ones).
      // Load from monorepo root. When running via pnpm dev from root, cwd is root.
      envFilePath: [
        resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}.local`),
        resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '.env.local'),
      ],
      validationSchema: configValidationSchema,
      isGlobal: true,
      expandVariables: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'exports'),
      serveRoot: '/exports/',
    }),
    SSEModule,
    CacheClientModule,
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
