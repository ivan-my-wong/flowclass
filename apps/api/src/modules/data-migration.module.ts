import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { Module, NestModule } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RouterModule } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DataMigrationController } from '@/application/data-migration/data-migration.controller'
import { DataMigrationService } from '@/application/data-migration/data-migration.service'
import {
  QUEUE_ENROLL_COURSE,
  QUEUE_NAME_BLOCK_TIME,
  QUEUE_NAME_IMPORT_CSV,
} from '@/common/constants'
import { TAppConfig } from '@/config/config.schema'
import { getAllEntities, getAllRepositories, getAllServices } from '@/config/database'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { PostgresStore } from '@/domain/external/whatsapp/postgres.store'
import { DatabaseModule } from '@/modules/database.module'

import { StripeClientModule } from './stripe-client/stripe-client.module'
import { AzureOpenaiModule } from './azure-openai.module'

@Module({
  imports: [
    StripeClientModule,
    ScheduleModule.forRoot(),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<TAppConfig>) => ({
        secret: configService.get('JWT_SECRET_STUDENT'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    TypeOrmModule.forFeature([...getAllEntities()]),
    RouterModule.register([
      {
        path: 'data-migration',
        module: DataMigrationModule,
        children: [],
      },
    ]),

    HttpModule,
    AzureOpenaiModule,
    BullModule.registerQueueAsync(
      {
        name: QUEUE_NAME_BLOCK_TIME,
      },
      {
        name: QUEUE_NAME_IMPORT_CSV,
      },
      {
        name: QUEUE_ENROLL_COURSE,
      }
    ),
  ],
  controllers: [DataMigrationController],
  providers: [
    DataMigrationService,
    CloudWatchLoggerProvider,
    PostgresStore,
    ...getAllServices(),
    ...getAllRepositories(),
  ],
})
export class DataMigrationModule implements NestModule {
  configure(): void {
    return
  }
}
