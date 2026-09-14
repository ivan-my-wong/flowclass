import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import Stripe from 'stripe'

import { CancelPlanDto } from '@/application/admin/subscription-plans/dto/upgrade-subscription-plans.dto'
import { STRIPE_CLIENT } from '@/common/constants/provider-keys'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import {
  SubscriptionPlanRecordsEntity,
  SubscriptionPlanRecordsRepository,
} from '@/models/subscription-plan-records.entity'
import { SubscriptionPlan } from '@/models/subscription-plans.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'

import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'

@Injectable()
export class CancelSubscriptionService {
  constructor(
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository,
    private readonly subscriptionPlanRecordsRepository: SubscriptionPlanRecordsRepository,
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe
  ) {}

  async cancelPlan(siteId: number, dto: CancelPlanDto) {
    const { planId } = dto
    try {
      const currentRecord = await this.subscriptionService.getSubscriptionPlanRecordWithPlans(
        siteId,
        true
      )

      if (!currentRecord) {
        throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
      }
      // Validate that the new plans are valid
      const validPlan = await this.subscriptionPlansRepository.findOne({
        where: { id: planId },
        relations: ['stripeProductPrices'],
      })
      await this.validateCancelPlan(currentRecord, validPlan)
      // Update the record with the new plans
      // plan that will be cancel will be remove from next invoice
      // plan id will be still on the record., and will be removed after current cycle end date
      await this.createCancelSubscriptionItemsForNextInvoice(currentRecord, validPlan)
      // Save the updated record
      return this.subscriptionPlanRecordsRepository.save(currentRecord)
    } catch (error) {
      throw new BadRequestException(`Cancel plan failed: ${error.message}`)
    }
  }

  async createCancelSubscriptionItemsForNextInvoice(
    currentRecord: SubscriptionPlanRecordsEntity,
    canceledPlan: SubscriptionPlan
  ) {
    // Remove the plans that are being cancelled from the current record
    const subscription = await this.stripeClient.subscriptions.retrieve(
      currentRecord.stripeSubscriptionId,
      {
        expand: ['items.data.price'],
      }
    )
    if (!subscription) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_NOT_FOUND)
    }
    const subscriptionItems = subscription.items.data
    const price = canceledPlan.stripeProductPrices.find(
      (spp) =>
        spp.currency === currentRecord.currency.toUpperCase() &&
        spp.interval === this.subscriptionService.getPlanRecordInterval(currentRecord)
    )
    if (price) {
      const item = subscriptionItems.find(
        (item) =>
          item.price.id === price.stripePriceId ||
          this.subscriptionService.getMetadataFromSubscriptionItemProduct(item).lookupKey ===
            canceledPlan.name
      )
      if (!item) {
        throw new NotFoundException(PlanErrorMessage.PLAN_ITEM_ALREADY_CANCELED)
      }
      const itemQuantity = Math.max(item.quantity - 1, 0)
      if (itemQuantity <= 0) {
        await this.stripeClient.subscriptionItems.del(item.id)
      } else {
        const payload = {
          price: price.stripePriceId,
          quantity: itemQuantity,
          proration_behavior: 'none',
        } as Stripe.SubscriptionItemUpdateParams
        await this.stripeClient.subscriptionItems.update(item.id, payload)
      }
    }
    const metadata = subscription.metadata || {}
    const oldCanceledPlans = metadata.cancelledPlans
      ? metadata.cancelledPlans.split(',').filter(Boolean)
      : []
    oldCanceledPlans.push(canceledPlan.id.toString())
    await this.stripeClient.subscriptions.update(currentRecord.stripeSubscriptionId, {
      metadata: {
        ...metadata,
        cancelledPlans: oldCanceledPlans.join(','),
      },
    })
  }
  async validateCancelPlan(
    currentRecord: SubscriptionPlanRecordsEntity,
    validPlan: SubscriptionPlan
  ) {
    // Ensure that the plans being cancelled are not essential plans
    const essentialPlans = currentRecord.planIds.filter((id) => id !== validPlan.id)
    if (essentialPlans.length === 0) {
      // If the plan is not a quota plan, ensure it can be cancelled
      throw new BadRequestException(PlanErrorMessage.CANNOT_CANCEL_ALL_PLANS)
    }
  }
}
