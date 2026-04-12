import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { InvoicePromotionUsed } from './invoice-promotion-used.entity'

@Injectable()
export class InvoicePromotionUsedRepository extends BaseAbstractRepository<InvoicePromotionUsed> {
  private _repository: Repository<InvoicePromotionUsed>

  constructor(
    @InjectRepository(InvoicePromotionUsed)
    repository: Repository<InvoicePromotionUsed>
  ) {
    super(repository)
    this._repository = repository
  }
}
