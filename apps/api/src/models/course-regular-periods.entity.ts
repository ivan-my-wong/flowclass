import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Repository,
} from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassEntity } from './classes.entity'
import { PeriodLessons } from './period-lessons.entity'
import { RepeatFormats } from './repeat-formats.entity'
import { StudentSchedule } from './student-schedule.entity'

// export class RepeatType {
//   @IsNotEmpty()
//   repeat: boolean
//
//   @IsNotEmpty()
//   @IsNumber()
//   every: number
//
//   @IsNotEmpty()
//   @IsEnum(RepeatUnit)
//   unit: RepeatUnit // days | weeks | month
//
//   @IsNotEmpty()
//   @IsNumber()
//   times: number // how many times of repeat
//
//   static example = {
//     repeat: true,
//     every: 3,
//     unit: RepeatUnit.days,
//     times: 15,
//   }
// }

@Entity('course_regular_periods')
export class RegularPeriods extends BaseEntity {
  @Index('IX_course_regular_periods_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_course_regular_periods_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_course_regular_periods_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Index('IX_course_regular_periods_class_id')
  @Column({ name: 'class_id' })
  classId: number

  @ManyToOne(() => ClassEntity, (classEn) => classEn.regularPeriods, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity

  @Column({ name: 'repeat_format_id', default: null })
  repeatFormatId: number

  @OneToOne(() => RepeatFormats, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'repeat_format_id' })
  repeatFormat: RepeatFormats

  @Column({ name: 'name', default: 'Unnamed period' })
  name: string

  @Column({ name: 'duration', nullable: true })
  duration: number // the length of each lesson

  @OneToMany(() => PeriodLessons, (lesson) => lesson.period)
  lessons: PeriodLessons[]

  @Column({ name: 'order_index', default: 1 })
  orderIndex: number

  @OneToMany(() => StudentSchedule, (studentSchedule) => studentSchedule.regularPeriod)
  studentSchedules: StudentSchedule[]
}

@Injectable()
export class RegularPeriodsRepository extends BaseAbstractRepository<RegularPeriods> {
  private _repository: Repository<RegularPeriods>

  constructor(
    @InjectRepository(RegularPeriods)
    repository: Repository<RegularPeriods>
  ) {
    super(repository)
    this._repository = repository
  }
}
