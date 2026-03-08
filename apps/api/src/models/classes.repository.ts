import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { PeriodLessonsRepository } from '@/models/period-lessons.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { ClassEntity } from './classes.entity'

@Injectable()
export class ClassRepository extends BaseAbstractRepository<ClassEntity> {
  private _repository: Repository<ClassEntity>

  constructor(
    @InjectRepository(ClassEntity)
    repository: Repository<ClassEntity>,
    private regularPeriodsRepository: RegularPeriodsRepository,
    private periodLessonRepository: PeriodLessonsRepository
  ) {
    super(repository)
    this._repository = repository
  }
}
