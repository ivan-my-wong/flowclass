import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { PlanPermission } from './subscription-plan-records.entity'
import { SubscriptionPlan } from './subscription-plans.entity'

const UNLIMITED_QUOTA = 999999999
@Injectable()
export class SubscriptionPlansRepository extends BaseAbstractRepository<SubscriptionPlan> {
  private _repository: Repository<SubscriptionPlan>

  constructor(
    @InjectRepository(SubscriptionPlan)
    repository: Repository<SubscriptionPlan>
  ) {
    super(repository)
    this._repository = repository
  }

  getSubscriptionPlanQuotaOrPermission(
    plan: SubscriptionPlan
  ): number | Record<PlanPermission, boolean> {
    if (plan.typeColumnName.includes('Quantity')) {
      if (plan.tier === 'CUSTOM') {
        return UNLIMITED_QUOTA
      }
      return plan.typeQuota
    }
    return plan.typePermission
  }
}
