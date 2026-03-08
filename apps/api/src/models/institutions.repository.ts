import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Institution } from './institutions.entity'

@Injectable()
export class InstitutionsRepository extends BaseAbstractRepository<Institution> {
  private _repository: Repository<Institution>

  constructor(
    @InjectRepository(Institution)
    repository: Repository<Institution>
  ) {
    super(repository)
    this._repository = repository
  }
}
