import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { RequestTimeChange } from './request-time-change.entity'

@Injectable()
export class RequestTimeChangeRepository extends BaseAbstractRepository<RequestTimeChange> {
  private _repository: Repository<RequestTimeChange>

  constructor(
    @InjectRepository(RequestTimeChange)
    repository: Repository<RequestTimeChange>
  ) {
    super(repository)
    this._repository = repository
  }
}
