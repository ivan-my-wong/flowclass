import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as dayjs from 'dayjs'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { DateOverride } from './availability.entity'
import { ClassRegularPeriodsV2 } from './class-regular-periods.entity'
import { ClassEntity, RepeatUnit } from './classes.entity'

export enum ClassRegularPeriodsSelectionMode {
  MUST_SELECT_ENTIRE_PERIOD = 'MUST_SELECT_ENTIRE_PERIOD',
  MUST_SELECT_UNTIL_END = 'MUST_SELECT_UNTIL_END',
  ALLOW_CUSTOM_SELECTION = 'ALLOW_CUSTOM_SELECTION',
}

export type ClassRegularPeriodRepeatFormat = {
  every: number
  unit: RepeatUnit
  startTime?: string
}

export const defaultPeriodRepeatFormat: ClassRegularPeriodRepeatFormat = {
  every: 1,
  unit: 'months' as RepeatUnit,
  startTime: dayjs().startOf('month').toISOString(),
}

export const defaultGapBetweenPeriod: ClassRegularPeriodRepeatFormat = {
  every: 0,
  unit: 'days' as RepeatUnit,
}

@Entity('class_regular_schedules')
export class ClassRegularSchedulesV2 extends BaseEntity {
  @Index('IX_class_regular_schedules_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_class_regular_schedules_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_class_regular_schedules_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Index('IX_class_regular_schedules_class_id')
  @Column({ name: 'class_id' })
  classId: number

  @ManyToOne(() => ClassEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity

  @OneToMany(() => ClassRegularPeriodsV2, (period) => period.regularScheduleV2)
  periodsV2: ClassRegularPeriodsV2[]

  // This should only be used by regular and recurring classes
  @Column('jsonb', { name: 'date_overrides', default: [] })
  dateOverrides: DateOverride[]

  // If infinite repeat, set to -1
  @Column({ name: 'period_repeat_count', default: -1 })
  periodRepeatCount: number

  @Column({
    type: 'jsonb',
    name: 'period_repeat_format',
    nullable: true,
    default: defaultPeriodRepeatFormat,
  })
  periodRepeatFormat: ClassRegularPeriodRepeatFormat

  @Column({
    type: 'jsonb',
    name: 'gap_between_periods',
    nullable: true,
    default: defaultGapBetweenPeriod,
  })
  gapBetweenPeriods: ClassRegularPeriodRepeatFormat

  @Column({
    name: 'selection_mode',
    type: 'enum',
    enum: ClassRegularPeriodsSelectionMode,
    default: ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD,
  })
  selectionMode: ClassRegularPeriodsSelectionMode
}

@Injectable()
export class ClassRegularSchedulesV2Repository extends BaseAbstractRepository<ClassRegularSchedulesV2> {
  private _repository: Repository<ClassRegularSchedulesV2>

  constructor(
    @InjectRepository(ClassRegularSchedulesV2)
    repository: Repository<ClassRegularSchedulesV2>
  ) {
    super(repository)
    this._repository = repository
  }
}
