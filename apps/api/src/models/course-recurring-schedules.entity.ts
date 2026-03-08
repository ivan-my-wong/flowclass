import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Repository } from 'typeorm'

import { StudentSchedule } from '@/models/student-schedule.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassEntity } from './classes.entity'

export type SingleRecurringSchedule = {
  weekDay: number
  startTime: Date
  endTime: Date
}

@Entity('course_recurring_schedules')
export class RecurringSchedules extends BaseEntity {
  @Index('IX_course_recurring_schedules_class_id')
  @Column({ name: 'class_id' })
  classId: number

  @Column({ name: 'week_day' })
  weekDay: number

  // It's a pure string, like '10:00' and '21:23'
  @Column({ name: 'start_time', type: 'time without time zone' })
  startTime: Date

  // It's a pure string, like '10:00' and '21:23'
  @Column({ name: 'end_time', type: 'time without time zone' })
  endTime: Date

  @ManyToOne(() => ClassEntity, (classEn) => classEn.recurringSchedules, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity

  @OneToMany(() => StudentSchedule, (StudentSchedule) => StudentSchedule.recurringSchedule)
  studentSchedules: StudentSchedule[]
}

@Injectable()
export class RecurringSchedulesRepository extends BaseAbstractRepository<RecurringSchedules> {
  private _repository: Repository<RecurringSchedules>

  constructor(
    @InjectRepository(RecurringSchedules)
    repository: Repository<RecurringSchedules>
  ) {
    super(repository)
    this._repository = repository
  }
}
