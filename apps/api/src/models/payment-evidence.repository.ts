import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { PaymentEvidence } from './payment-evidence.entity'

@Injectable()
export class PaymentEvidenceRepository extends BaseAbstractRepository<PaymentEvidence> {
  private _repository: Repository<PaymentEvidence>

  constructor(
    @InjectRepository(PaymentEvidence)
    repository: Repository<PaymentEvidence>
  ) {
    super(repository)
    this._repository = repository
  }
}
