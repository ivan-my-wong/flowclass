import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Invoice } from './invoice.entity'

@Injectable()
export class InvoiceRepository extends BaseAbstractRepository<Invoice> {
  private _repository: Repository<Invoice>

  constructor(
    @InjectRepository(Invoice)
    repository: Repository<Invoice>
  ) {
    super(repository)
    this._repository = repository
  }
}
