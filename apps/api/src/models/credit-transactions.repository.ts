import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { CreditTransactions } from './credit-transactions.entity'

@Injectable()
export class CreditTransactionsRepository extends BaseAbstractRepository<CreditTransactions> {
  constructor(
    @InjectRepository(CreditTransactions)
    repository: Repository<CreditTransactions>
  ) {
    super(repository)
  }
}
