// src/models/student-submission.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { StudentSubmissions } from './student-submission.entity'

@Injectable()
export class StudentSubmissionRepository extends BaseAbstractRepository<StudentSubmissions> {
  private _repository: Repository<StudentSubmissions>

  constructor(
    @InjectRepository(StudentSubmissions)
    repository: Repository<StudentSubmissions>
  ) {
    super(repository)
    this._repository = repository
  }
}
