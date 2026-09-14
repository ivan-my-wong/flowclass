import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { In } from 'typeorm'

import {
  DowngradeSubscriptionPlanDto,
  PlansPriceDiff,
  UpgradePlanRequestSinglePlanV2,
} from '@/application/admin/subscription-plans/dto/upgrade-subscription-plans.dto'
import { ALWAYS_ONE_QUANTITY_PLANS } from '@/common/constants/subscription.constants'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import { SubscriptionPlanRecordsEntity } from '@/models/subscription-plan-records.entity'
import { PlanPriceMode, PlanType, SubscriptionPlan } from '@/models/subscription-plans.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'

import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'
import { SubscriptionSummaryService } from './subscription-summary.service'

@Injectable()
export class DowngradeSubscriptionService {
  private readonly logger = new Logger(DowngradeSubscriptionService.name)
  constructor(
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    private readonly subscriptionSummaryService: SubscriptionSummaryService,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository
  ) {}
  /**
   * Downgrades the subscription plan for a site.
   * Validates the downgrade, processes the Stripe upgrade with proration,
   * and updates the plan record accordingly.
   * @param siteId - The ID of the site to downgrade the plan for.
   * @param dto - The downgrade subscription plan DTO containing new plans and interval.
   * @returns A promise that resolves to the updated subscription plan record.
   * @throws BadRequestException if the downgrade is not allowed or fails.
   */
  async downgradePlan(siteId: number, dto: DowngradeSubscriptionPlanDto) {
    const { newPlans } = dto

    try {
      const currentRecord = await this.subscriptionService.getSubscriptionPlanRecordWithPlans(
        siteId,
        true
      )

      const currentPlans = currentRecord.plans

      const newPlanDetails = await this.subscriptionPlansRepository.find({
        where: { id: In(newPlans.map((p) => p.planId)) },
        relations: ['stripeProductPrices'],
      })
      // Validate downgrade is allowed
      await this.validateDowngrade(currentPlans, currentRecord, newPlans, newPlanDetails)

      // Calculate downgrade details
      const updatedSubscription = await this.subscriptionService.updateSubscriptionItemAfterAction(
        currentRecord,
        newPlans,
        'downgrade'
      )
      const totalPrice = this.subscriptionService.calculateSubscriptionTotal(updatedSubscription)
      await this.subscriptionService.updatePlanRecordSucceed({
        siteId,
        plans: newPlans,
        totalPrice,
        currency: updatedSubscription.currency,
        stripeSubscriptionId: currentRecord.stripeSubscriptionId,
        isDowngradeAction: true,
      })
      return {
        status: 'scheduled',
        message: 'Downgrade scheduled for next billing cycle',
      }
    } catch (error) {
      this.logger.error('Failed to downgrade subscription item:', error)
      throw new BadRequestException(`Downgrade failed: ${error.message}`)
    }
  }
  private getQuantityFromRecord(record: SubscriptionPlanRecordsEntity, columnName: string): number {
    return Number(record[columnName]) || 1
  }

  /**
   * Validates that the downgrade is allowed
   */
  private async validateDowngrade(
    currentPlans: SubscriptionPlan[],
    currentRecord: SubscriptionPlanRecordsEntity,
    newPlans: UpgradePlanRequestSinglePlanV2[],
    newPlanDetails: SubscriptionPlan[]
  ) {
    if (newPlanDetails.some((plan) => ALWAYS_ONE_QUANTITY_PLANS.includes(plan.type))) {
      throw new BadRequestException(PlanErrorMessage.ONLY_QUOTA_PLAN_CAN_BE_DOWNGRADED)
    }
    // Check if new plans actually represent a downgrade
    await this.generatePlanPricesDiff(currentPlans, currentRecord, newPlans, newPlanDetails)

    // Check usage limits - ensure current usage doesn't exceed new plan limits
    await this.validateUsageAgainstNewLimits(currentRecord.siteId, newPlanDetails)
  }

  async generatePlanPricesDiff(
    currentPlans: SubscriptionPlan[],
    currentRecord: SubscriptionPlanRecordsEntity,
    newPlans: UpgradePlanRequestSinglePlanV2[],
    newPlanDetails: SubscriptionPlan[]
  ): Promise<PlansPriceDiff[]> {
    const result: PlansPriceDiff[] = []

    // Validate that it's actually a downgrade (lower price or fewer features)
    for (const newPlan of newPlanDetails) {
      let newPrice = 0,
        currentPrice = 0
      const qty = newPlans.find((p) => p.planId === newPlan.id)?.planQuantity || 1
      const currentPlanWithSameType = currentPlans.filter(
        (cp) => cp.type === newPlan.type && cp.priceMode === newPlan.priceMode
      )
      const price = newPlan.stripeProductPrices.find(
        (p) =>
          p.currency === currentRecord.currency.toUpperCase() &&
          p.interval === this.subscriptionService.getPlanRecordInterval(currentRecord)
      )
      if (!price) {
        throw new BadRequestException(
          `Cannot downgrade: no price found for plan ${newPlan.name} in currency ${currentRecord.currency}`
        )
      }
      let currentQuantity = 1
      if (newPlan.priceMode === PlanPriceMode.PER_ITEM) {
        if (currentPlanWithSameType.length <= 0) {
          throw new BadRequestException(
            `Cannot downgrade: no current plan found for type ${newPlan.type}`
          )
        }
        currentQuantity = this.getQuantityFromRecord(
          currentRecord,
          currentPlanWithSameType.at(0).typeColumnName
        )
      } else {
        currentQuantity = currentPlanWithSameType.length
      }
      newPrice = price.unitAmount * qty
      currentPrice = price.unitAmount * currentQuantity
      if (newPrice >= currentPrice) {
        throw new BadRequestException(
          `Cannot downgrade: new plan ${newPlan.name} is not cheaper than current plan`
        )
      }
      result.push({
        plan: newPlan,
        price,
        currentPrice, // Convert to dollars
        newPrice, // Convert to dollars
        priceDiff: newPrice - currentPrice, // Convert to dollars
        quantity: qty,
      })
    }
    return result
  }
  /**
   * Validates current usage against new plan limits
   */
  private async validateUsageAgainstNewLimits(siteId: number, newPlans: SubscriptionPlan[]) {
    for (const plan of newPlans) {
      const quota = this.subscriptionPlansRepository.getSubscriptionPlanQuotaOrPermission(plan)

      if (typeof quota === 'number') {
        let currentUsage = 0

        switch (plan.type) {
          case PlanType.MULTIPLE_TUTOR:
            currentUsage = await this.subscriptionSummaryService.getCountTutorUserRoles(siteId)
            break
          case PlanType.MULTIPLE_ADMIN:
            currentUsage = await this.subscriptionSummaryService.getCountAdminUserRoles(siteId)
            break
          case PlanType.MULTIPLE_SCHOOL:
            currentUsage = await this.subscriptionSummaryService.getCountOfSchools(siteId)
            break
          case PlanType.BASE_USER:
            currentUsage = await this.subscriptionSummaryService.getActiveStudents(siteId)
            break
          case PlanType.NOTIFICATION_QUOTA:
            // For notifications, we might be more lenient as it's monthly
            break
        }

        if (currentUsage > quota) {
          throw new BadRequestException(PlanErrorMessage.EXCEEDING_PLAN_QUOTA_LIMITS)
        }
      }
    }
  }
}
