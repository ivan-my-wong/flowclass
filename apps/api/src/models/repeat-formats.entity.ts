import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { RepeatUnit } from './classes.entity'

@Entity('repeat_formats')
export class RepeatFormats extends BaseEntity {
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'repeat', type: 'boolean', default: false })
  repeat: boolean

  @Column({ name: 'every', type: 'int', nullable: true, default: null })
  every: number

  @Column({ name: 'unit', type: 'varchar', default: '' })
  unit: RepeatUnit // days | weeks | months

  @Column({ name: 'times', type: 'int', nullable: true, default: null })
  times: number // how many times of repeat

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime: Date

  @Column({ name: 'weekday_occurrence', type: 'int', nullable: true, default: null })
  weekdayOccurrence?: number // 1-4 for 1st, 2nd, 3rd, 4th, -1 for last

  @Column({ name: 'weekday', type: 'int', nullable: true, default: null })
  weekday?: number // 0-6 (Sunday-Saturday)
}

@Injectable()
export class RepeatFormatsRepository extends BaseAbstractRepository<RepeatFormats> {
  private _repository: Repository<RepeatFormats>

  constructor(
    @InjectRepository(RepeatFormats)
    repository: Repository<RepeatFormats>
  ) {
    super(repository)
    this._repository = repository
  }
}
