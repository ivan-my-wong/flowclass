import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { LessonQuestion } from './lesson-question.entity'

@Injectable()
export class LessonQuestionRepository extends BaseAbstractRepository<LessonQuestion> {
  private _repository: Repository<LessonQuestion>

  constructor(
    @InjectRepository(LessonQuestion)
    repository: Repository<LessonQuestion>
  ) {
    super(repository)
    this._repository = repository
  }
}
