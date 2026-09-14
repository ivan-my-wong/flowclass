import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { In } from 'typeorm'

import { SubstitutePlanDto } from '@/application/admin/subscription-plans/dto/upgrade-subscription-plans.dto'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import {
  PlanPermission,
  SubscriptionPlanRecordsEntity,
  SubscriptionPlanRecordsRepository,
} from '@/models/subscription-plan-records.entity'
import { SubscriptionPlan } from '@/models/subscription-plans.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'

import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'

@Injectable()
export class SubstituteSubscriptionService {
  constructor(
    private readonly subscriptionPlanRecordsService: SubscriptionPlanRecordsService,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository,
    private readonly subscriptionPlanRecordsRepository: SubscriptionPlanRecordsRepository
  ) {}

  async substitutePlan(siteId: number, substitutePlanDto: SubstitutePlanDto) {
    const { targetPlanId, currentPlanId } = substitutePlanDto
    try {
      const currentRecord =
        await this.subscriptionPlanRecordsService.getSubscriptionPlanRecordWithPlans(siteId, true)
      const { targetPlan, currentPlan } = await this.validateSubstitutePlan(
        currentRecord,
        targetPlanId,
        currentPlanId
      )
      const columnKey: keyof SubscriptionPlanRecordsEntity = targetPlan.typeColumnName
      const targetValue =
        this.subscriptionPlansRepository.getSubscriptionPlanQuotaOrPermission(targetPlan)
      const currentValue = this.subscriptionPlansRepository.getSubscriptionPlanQuotaOrPermission(
        currentPlan
      ) as Record<PlanPermission, boolean>
      if (typeof currentValue !== 'object') {
        throw new BadRequestException(PlanErrorMessage.SUBSTITUTE_NON_PERMISSION_BASED_PLANS)
      }
      ;(currentRecord as any)[columnKey] = {
        ...(currentRecord as any)[columnKey],
        ...(targetValue as any),
      }
      // Delete currentValue
      const valueKeys = Object.keys(currentRecord[columnKey])
      const currentValueKeys = Object.keys(currentValue)
      for (const key of currentValueKeys) {
        if (valueKeys.includes(key)) {
          delete currentRecord[columnKey][key]
        }
      }

      currentRecord.planIds = currentRecord.planIds.filter((d) => d !== currentPlanId)
      currentRecord.planIds.push(targetPlanId)
      return this.subscriptionPlanRecordsRepository.save(currentRecord)
    } catch (error) {
      throw new BadRequestException(`Substitute plan failed: ${error.message}`)
    }
  }

  async validateSubstitutePlan(
    record: SubscriptionPlanRecordsEntity,
    targetPlanId: number,
    currentPlanId: number
  ): Promise<{
    targetPlan: SubscriptionPlan
    currentPlan: SubscriptionPlan
  }> {
    const plans = await this.subscriptionPlansRepository.find({
      where: { id: In([targetPlanId, currentPlanId]) },
      relations: ['stripeProductPrices'],
    })
    const targetPlan = plans.find((p) => p.id === targetPlanId)
    const currentPlan = plans.find((p) => p.id === currentPlanId)
    if (!targetPlan || !currentPlan) {
      throw new NotFoundException(PlanErrorMessage.PLAN_NOT_FOUND)
    }
    if (!record.planIds.includes(currentPlanId)) {
      throw new BadRequestException(PlanErrorMessage.PLAN_NOT_FOUND)
    }
    if (record.planIds.includes(targetPlanId)) {
      throw new BadRequestException(PlanErrorMessage.PLAN_ITEM_ALREADY_EXIST)
    }
    return {
      targetPlan,
      currentPlan,
    }
  }
}
