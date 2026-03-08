import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { StripeConnect } from './stripe-connect.entity'

@Injectable()
export class StripeConnectRepository extends BaseAbstractRepository<StripeConnect> {
  private _repository: Repository<StripeConnect>

  constructor(
    @InjectRepository(StripeConnect)
    repository: Repository<StripeConnect>
  ) {
    super(repository)
    this._repository = repository
  }
}
