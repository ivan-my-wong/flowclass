// src/models/teacher-submission-response.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { TeacherFeedback } from './teacher-feedback.entity'

@Injectable()
export class TeacherFeedbackRepository extends BaseAbstractRepository<TeacherFeedback> {
  private _repository: Repository<TeacherFeedback>

  constructor(
    @InjectRepository(TeacherFeedback)
    repository: Repository<TeacherFeedback>
  ) {
    super(repository)
    this._repository = repository
  }
}
