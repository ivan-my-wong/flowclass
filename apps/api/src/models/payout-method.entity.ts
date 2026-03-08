import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity } from 'typeorm'
import { Repository } from 'typeorm'

import {
  IBankTransferDetails,
  IOtherPayoutMethodDetails,
} from '@/application/admin/request-payout/dto/receive-Payout-Preference.dto'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('payout_methods')
export class PayoutMethod extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column()
  description?: string

  @Column({ name: 'method_type' })
  methodType: string

  @Column({ name: 'method_name' })
  methodName: string

  @Column({ name: 'payout_method_details', type: 'jsonb' })
  payoutMethodDetails: IOtherPayoutMethodDetails | IBankTransferDetails

  @Column({ default: false })
  enabled: boolean
}

@Injectable()
export class PayoutMethodRepository extends BaseAbstractRepository<PayoutMethod> {
  private _repository: Repository<PayoutMethod>

  constructor(
    @InjectRepository(PayoutMethod)
    repository: Repository<PayoutMethod>
  ) {
    super(repository)
    this._repository = repository
  }
}
