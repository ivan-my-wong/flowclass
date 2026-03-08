import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassRegularSchedulesV2 } from './class-regular-schedules.entity'
import { RepeatFormats } from './repeat-formats.entity'

@Entity('class_regular_periods')
export class ClassRegularPeriodsV2 extends BaseEntity {
  @Column({ name: 'class_id' })
  classId: number

  @Column({ name: 'lesson_repeat_format_id', nullable: true })
  lessonRepeatFormatId: number

  @Column({ name: 'start_time', nullable: true, type: 'timestamptz' })
  startTime: Date

  @Column({ name: 'end_time', nullable: true, type: 'timestamptz' })
  endTime: Date

  @OneToOne(() => RepeatFormats, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'lesson_repeat_format_id' })
  lessonRepeatFormat: RepeatFormats

  @Index('IX_class_regular_period_schedules_v2_period_id')
  @Column({ name: 'regular_schedule_id' })
  regularScheduleId: number

  @ManyToOne(() => ClassRegularSchedulesV2, (classEntity) => classEntity.periodsV2, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'regular_schedule_id' })
  regularScheduleV2: ClassRegularSchedulesV2
}

@Injectable()
export class ClassRegularPeriodsV2Repository extends BaseAbstractRepository<ClassRegularPeriodsV2> {
  private _repository: Repository<ClassRegularPeriodsV2>

  constructor(
    @InjectRepository(ClassRegularPeriodsV2)
    repository: Repository<ClassRegularPeriodsV2>
  ) {
    super(repository)
    this._repository = repository
  }
}
