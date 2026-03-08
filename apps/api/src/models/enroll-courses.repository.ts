import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { EnrollClassMapping, EnrollCourse } from './enroll-courses.entity'

@Injectable()
export class EnrollCourseRepository extends BaseAbstractRepository<EnrollCourse> {
  private _repository: Repository<EnrollCourse>

  constructor(
    @InjectRepository(EnrollCourse)
    repository: Repository<EnrollCourse>
  ) {
    super(repository)
    this._repository = repository
  }
}

@Injectable()
export class EnrollClassMappingRepository extends BaseAbstractRepository<EnrollClassMapping> {
  private _repository: Repository<EnrollClassMapping>

  constructor(
    @InjectRepository(EnrollClassMapping)
    repository: Repository<EnrollClassMapping>
  ) {
    super(repository)
    this._repository = repository
  }

  /**
   * Find all EnrollClassMapping records for a given classId
   * @param classId - The classId to search for
   */
  async findByClassId(classId: number): Promise<EnrollClassMapping[]> {
    return this._repository.find({ where: { classId } })
  }
}
