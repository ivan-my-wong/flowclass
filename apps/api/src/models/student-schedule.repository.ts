import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { StudentSchedule } from '@/models/student-schedule.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

@Injectable()
export class StudentScheduleRepository extends BaseAbstractRepository<StudentSchedule> {
  private _repository: Repository<StudentSchedule>

  constructor(
    @InjectRepository(StudentSchedule)
    repository: Repository<StudentSchedule>
  ) {
    super(repository)
    this._repository = repository
  }
}
