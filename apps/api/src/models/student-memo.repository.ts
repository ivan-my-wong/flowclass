import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { StudentMemo } from '@/models/student-memo.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

@Injectable()
export class StudentMemoRepository extends BaseAbstractRepository<StudentMemo> {
  constructor(
    @InjectRepository(StudentMemo)
    repository: Repository<StudentMemo>
  ) {
    super(repository)
  }
}
