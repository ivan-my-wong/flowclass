import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { CommonField } from './common-field.entity'

@Injectable()
export class CommonFieldRepository extends BaseAbstractRepository<CommonField> {
  private _repository: Repository<CommonField>

  constructor(
    @InjectRepository(CommonField)
    repository: Repository<CommonField>
  ) {
    super(repository)
    this._repository = repository
  }
}
