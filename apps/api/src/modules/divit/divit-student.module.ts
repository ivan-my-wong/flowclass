import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Course } from '@/models/courses.entity'
import { Invoice } from '@/models/invoice.entity'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'

import { DivitStudentController } from './controllers/divit-student.controller'
import { DivitConfig, DivitConfigRepository } from './entities/divit-config.entity'
import { DivitOrder, DivitOrderRepository } from './entities/divit-order.entity'
import { DivitService } from './services/divit.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([DivitConfig, DivitOrder, Invoice, User, Course, Site]),
  ],
  controllers: [DivitStudentController],
  providers: [DivitService, DivitConfigRepository, DivitOrderRepository],
})
export class DivitStudentModule {}
