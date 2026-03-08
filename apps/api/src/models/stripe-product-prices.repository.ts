import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { StripeProductPricesEntity } from './stripe-product-prices.entity'

@Injectable()
export class StripeProductPricesRepository extends BaseAbstractRepository<StripeProductPricesEntity> {
  private _repository: Repository<StripeProductPricesEntity>

  constructor(
    @InjectRepository(StripeProductPricesEntity)
    repository: Repository<StripeProductPricesEntity>
  ) {
    super(repository)
    this._repository = repository
  }
}
