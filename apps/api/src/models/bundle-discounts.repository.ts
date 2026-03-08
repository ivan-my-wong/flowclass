import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { BundleDiscount } from './bundle-discounts.entity'

@Injectable()
export class BundleDiscountsRepository extends BaseAbstractRepository<BundleDiscount> {
  private _repository: Repository<BundleDiscount>

  constructor(
    @InjectRepository(BundleDiscount)
    repository: Repository<BundleDiscount>
  ) {
    super(repository)
    this._repository = repository
  }
}
