import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, ManyToOne, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { RegularPeriods } from './course-regular-periods.entity'
@Entity('period_lessons')
export class PeriodLessons extends BaseEntity {
  @Column({ name: 'class_id' })
  classId: number

  @Index('IX_period_lessons_period_id')
  @Column({ name: 'period_id' })
  periodId: number

  @ManyToOne(() => RegularPeriods, (classEn) => classEn.lessons, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'period_id' })
  period: RegularPeriods

  @Column({ name: 'start_time', nullable: true, type: 'timestamptz' })
  startTime: Date

  @Column({ name: 'end_time', nullable: true, type: 'timestamptz' })
  endTime: Date
}

@Injectable()
export class PeriodLessonsRepository extends BaseAbstractRepository<PeriodLessons> {
  private _repository: Repository<PeriodLessons>

  constructor(
    @InjectRepository(PeriodLessons)
    repository: Repository<PeriodLessons>
  ) {
    super(repository)
    this._repository = repository
  }
}
