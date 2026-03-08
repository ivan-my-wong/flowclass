import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ClassTrialLesson, TrialLesson } from '@/models/trial-lesson.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

@Injectable()
export class TrialLessonRepository extends BaseAbstractRepository<TrialLesson> {
  private _repository: Repository<TrialLesson>

  constructor(
    @InjectRepository(TrialLesson)
    repository: Repository<TrialLesson>
  ) {
    super(repository)
    this._repository = repository
  }
}

@Injectable()
export class ClassTrialLessonRepository extends BaseAbstractRepository<ClassTrialLesson> {
  private _repository: Repository<ClassTrialLesson>

  constructor(
    @InjectRepository(ClassTrialLesson)
    repository: Repository<ClassTrialLesson>
  ) {
    super(repository)
    this._repository = repository
  }
}
