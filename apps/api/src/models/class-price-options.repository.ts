// src/models/class-price-options.repository.ts
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { ClassPriceOption } from './class-price-options.entity'

export class ClassPriceOptionRepository extends BaseAbstractRepository<ClassPriceOption> {
  private _repository: Repository<ClassPriceOption>

  constructor(
    @InjectRepository(ClassPriceOption)
    repository: Repository<ClassPriceOption>
  ) {
    super(repository)
    this._repository = repository
  }
}
