import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Course } from '@/models/courses.entity'
import { Invoice } from '@/models/invoice.entity'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'

import { DivitAdminController } from './controllers/divit-admin.controller'
import { DivitConfig, DivitConfigRepository } from './entities/divit-config.entity'
import { DivitOrder, DivitOrderRepository } from './entities/divit-order.entity'
import { DivitService } from './services/divit.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([DivitConfig, DivitOrder, Invoice, User, Course, Site]),
  ],
  controllers: [DivitAdminController],
  providers: [DivitService, DivitConfigRepository, DivitOrderRepository],
  exports: [DivitService],
})
export class DivitModule {}
