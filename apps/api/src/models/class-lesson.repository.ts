import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { ClassLesson } from './class-lessons.entity'

export class ClassLessonRepository extends BaseAbstractRepository<ClassLesson> {
  private _repository: Repository<ClassLesson>
  constructor(
    @InjectRepository(ClassLesson)
    repository: Repository<ClassLesson>
  ) {
    super(repository)
    this._repository = repository
  }

  getEffectiveStartTime(classLesson: ClassLesson): Date {
    return classLesson.changeStartTime ?? classLesson.startTime
  }

  getEffectiveEndTime(classLesson: ClassLesson): Date {
    return classLesson.changeEndTime ?? classLesson.endTime
  }
}
