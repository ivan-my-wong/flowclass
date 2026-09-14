import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { SubscriptionPresetPlanEntity } from './subscription-preset-plans.entity'

@Injectable()
export class SubscriptionPresetPlansRepository extends BaseAbstractRepository<SubscriptionPresetPlanEntity> {
  private _repository: Repository<SubscriptionPresetPlanEntity>

  constructor(
    @InjectRepository(SubscriptionPresetPlanEntity)
    repository: Repository<SubscriptionPresetPlanEntity>
  ) {
    super(repository)
    this._repository = repository
  }
}
