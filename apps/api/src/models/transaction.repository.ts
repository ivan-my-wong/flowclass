import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { Transaction } from './transaction.entity'

@Injectable()
export class TransactionRepository extends BaseAbstractRepository<Transaction> {
  private _repository: Repository<Transaction>

  constructor(
    @InjectRepository(Transaction)
    repository: Repository<Transaction>
  ) {
    super(repository)
    this._repository = repository
  }
}
