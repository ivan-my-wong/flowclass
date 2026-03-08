import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Course } from './courses.entity'

@Injectable()
export class CoursesRepository extends BaseAbstractRepository<Course> {
  private _repository: Repository<Course>

  constructor(
    @InjectRepository(Course)
    repository: Repository<Course>
  ) {
    super(repository)
    this._repository = repository
  }
}
