import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import Stripe from 'stripe'
import { In } from 'typeorm'

import { AddPlanDto } from '@/application/admin/subscription-plans/dto/upgrade-subscription-plans.dto'
import { STRIPE_CLIENT } from '@/common/constants/provider-keys'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import { StripeCheckoutSessionType } from '@/models/enums'
import {
  PlanWithStripePrice,
  SubscriptionPlanRecordsEntity,
  SubscriptionPlanRecordsRepository,
} from '@/models/subscription-plan-records.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'
import { shallow } from '@/utils/shallow.utils'

import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'

@Injectable()
export class AddSubscriptionPlanService {
  constructor(
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    private readonly subscriptionPlanRecordsRepository: SubscriptionPlanRecordsRepository,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository,
    @Inject(STRIPE_CLIENT)
    public readonly stripeClient: Stripe
  ) {}

  async addPlan(siteId: number, addPlanDto: AddPlanDto) {
    const stripeConnectAccount = await this.subscriptionService.getConnectAccount(siteId)
    const record = await this.subscriptionService.getSubscriptionPlanRecordWithPlans(siteId, true)
    if (!stripeConnectAccount?.customerId) {
      throw new BadRequestException('Customer ID not found for Stripe Connect account')
    }

    const costCalculation = await this.previewAddPlan(record, addPlanDto)
    if (costCalculation.newPlanCost <= 0) {
      const updatedSubscription = await this.addSubscriptionItemAfterAdd(record, addPlanDto.planIds)
      const updatedRecord = await this.updateRecordByStripeSubscription(
        record,
        updatedSubscription,
        costCalculation.plans
      )

      return {
        status: 'completed',
        message: 'Add plan completed successfully with Stripe proration',
        subscriptionRecord: updatedRecord,
      }
    }
    const lineItems = costCalculation.subscriptionItems.map((d) => {
      return {
        price_data: {
          currency: d.price_data.currency,
          product: d.price_data.product,
          unit_amount: d.price_data.unit_amount,
        },
        quantity: d.quantity,
      }
    })
    const paymentSession = await this.stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer: stripeConnectAccount?.customerId,
      success_url: process.env.STRIPE_SUBSCRIPTION_SUCCESS_URL,
      cancel_url: process.env.STRIPE_SUBSCRIPTION_CANCEL_URL,
      metadata: {
        siteId: siteId.toString(),
        type: StripeCheckoutSessionType.ADD_FEATURE,
        plans: JSON.stringify(addPlanDto.planIds),
      },
    })
    return {
      status: 'payment_required',
      checkoutUrl: paymentSession.url,
      sessionId: paymentSession.id,
      // proRatedAmount: costCalculation.proRatedAmount,
      // daysRemaining: costCalculation.daysRemaining,
      // prorationDetails: costCalculation.stripeProrationDetails,
      message: 'Add plan requires payment, please complete checkout',
    }
  }

  async previewAddPlan(
    record: SubscriptionPlanRecordsEntity,
    addPlanDto: AddPlanDto,
    customerId?: string
  ) {
    const interval = this.subscriptionService.getPlanRecordInterval(record)
    const plans = await this.subscriptionPlansRepository.find({
      where: { id: In(addPlanDto.planIds) },
      relations: ['stripeProductPrices'],
    })
    const currentSubscriptionItems = await this.stripeClient.subscriptions.retrieve(
      record.stripeSubscriptionId,
      {
        expand: ['items.data.price'],
      }
    )
    const subscriptionItemMap = new Map()
    for (const planDto of plans) {
      const price = planDto.stripeProductPrices.find(
        (spp) => spp.currency === record.currency.toUpperCase() && spp.interval === interval
      )
      if (!price) {
        throw new BadRequestException(PlanErrorMessage.PLAN_PRICE_NOT_FOUND)
      }
      const existingItem = currentSubscriptionItems.items.data.find(
        (item) => item.price.id === price.stripePriceId
      )
      if (existingItem) {
        // If the item already exists, we just update the quantity
        const existingItemQuantity = subscriptionItemMap.get(existingItem.id)
        if (existingItemQuantity) {
          existingItemQuantity.quantity += 1
          subscriptionItemMap.set(existingItem.id, existingItemQuantity)
          continue
        }
        subscriptionItemMap.set(existingItem.id, {
          id: existingItem.id,
          price_data: {
            currency: price.currency,
            product: price.stripeProductId,
            unit_amount: price.unitAmount * 100,
            recurring: {
              interval: price.interval,
            },
          },
          quantity: existingItem.quantity + 1,
        })
        continue
      }
      // If the item does not exist, we create a new one
      subscriptionItemMap.set(price.stripePriceId, {
        price_data: {
          currency: price.currency,
          product: price.stripeProductId,
          unit_amount: price.unitAmount * 100,
          recurring: {
            interval: price.interval,
          },
        },
        quantity: 1,
      })
    }
    console.log(Array.from(subscriptionItemMap.values()))
    const upcomingInvoice = await this.stripeClient.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: record.stripeSubscriptionId,
      subscription_items: Array.from(subscriptionItemMap.values()),
      subscription_proration_behavior: 'none',
    })
    const summaryTotal = Array.from(subscriptionItemMap.values())
      .map((item) => {
        const subtotal = item.price_data.unit_amount * item.quantity
        return subtotal
      })
      .reduce((a, b) => a + b, 0)
    const subtotal = summaryTotal / 100
    const currentPlanCost = upcomingInvoice.total / 100 - subtotal
    const total = currentPlanCost + subtotal
    return {
      currentPlanCost,
      newPlanCost: subtotal,
      subscriptionItems: Array.from(subscriptionItemMap.values()),
      total,
      plans,
    }
  }

  async updateRecordByStripeSubscription(
    record: SubscriptionPlanRecordsEntity,
    subscription: Stripe.Subscription,
    newPlans: PlanWithStripePrice[]
  ) {
    const totalPrice = this.subscriptionService.calculateSubscriptionTotal(subscription)
    return this.updatePlanRecordAfterAdd({
      siteId: record.siteId,
      plans: newPlans,
      totalPrice,
      currency: subscription.currency,
      stripeSubscriptionId: record.stripeSubscriptionId,
    })
  }

  async addSubscriptionItemAfterAdd(record: SubscriptionPlanRecordsEntity, plans: number[]) {
    const subscription = await this.stripeClient.subscriptions.retrieve(
      record.stripeSubscriptionId,
      {
        expand: ['items.data.price'],
      }
    )
    if (!subscription) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_NOT_FOUND)
    }
    const subscriptionItems = subscription.items.data
    const subscriptionItemMap = new Map<
      string,
      {
        id?: string
        quantity: number
        price?: string
        subscription?: string
        proration_behavior?: Stripe.SubscriptionItemUpdateParams.ProrationBehavior
      }
    >()
    for (const planId of plans) {
      const plan = await this.subscriptionPlansRepository.findOne({
        where: { id: planId },
        relations: ['stripeProductPrices'],
      })
      if (!plan) {
        throw new NotFoundException(PlanErrorMessage.PLAN_NOT_FOUND)
      }
      const price = plan.stripeProductPrices.find(
        (spp) =>
          spp.currency === record.currency.toUpperCase() &&
          spp.interval === this.subscriptionService.getPlanRecordInterval(record)
      )
      if (!price) {
        throw new NotFoundException(PlanErrorMessage.PLAN_PRICE_NOT_FOUND)
      }
      // Check if the item already exists
      const existingItem = subscriptionItems.find(
        (item) =>
          item.price.id === price.stripePriceId ||
          this.subscriptionService.getMetadataFromSubscriptionItemProduct(item).lookupKey ===
            plan.name
      )
      if (existingItem) {
        // If it exists, we just update the quantity
        if (subscriptionItemMap.has(existingItem.id)) {
          const existingItemQuantity = subscriptionItemMap.get(existingItem.id)
          existingItemQuantity.quantity += 1
          subscriptionItemMap.set(existingItem.id, existingItemQuantity)
        } else {
          subscriptionItemMap.set(existingItem.id, {
            id: existingItem.id,
            quantity: existingItem.quantity + 1,
            proration_behavior: 'none',
          })
        }
        await this.stripeClient.subscriptionItems.update(existingItem.id, {
          quantity: 1,
          proration_behavior: 'none',
        })
      } else {
        // If it does not exist, we create a new item
        subscriptionItemMap.set(price.stripePriceId, {
          subscription: record.stripeSubscriptionId,
          price: price.stripePriceId,
          quantity: 1,
          proration_behavior: 'none',
        })
      }
    }
    for (const item of subscriptionItemMap.values()) {
      if (item.id) {
        await this.stripeClient.subscriptionItems.update(
          item.id,
          shallow({
            source: item,
            fields: Object.keys(item),
            exceptFields: ['id'],
          })
        )
      } else {
        await this.stripeClient.subscriptionItems.create(
          item as Stripe.SubscriptionItemCreateParams
        )
      }
    }
    return subscription
  }

  async updatePlanRecordAfterAdd({
    siteId,
    plans,
    totalPrice,
    currency,
    stripeSubscriptionId,
  }: {
    siteId: number
    plans: PlanWithStripePrice[]
    totalPrice?: number
    currency?: string
    stripeSubscriptionId?: string
  }) {
    const record = await this.subscriptionService.getSubscriptionPlanRecordWithPlans(siteId, true)
    if (!record) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
    // Update the record with the new plans
    let recordMap = {}
    for (const plan of plans) {
      recordMap = this.subscriptionService.updateRelatedPropertySubscriptionPlanRecord(
        record,
        {
          planId: plan.id,
          planQuantity: 1,
        },
        plans
      )
    }
    record.planIds = record.planIds.concat(plans.map((d) => d.id))
    record.planIds = Array.from(new Set(record.planIds))
    record.totalPrice = totalPrice || record.totalPrice
    record.currency = currency || record.currency
    if (stripeSubscriptionId) {
      record.stripeSubscriptionId = stripeSubscriptionId
    }
    return this.subscriptionPlanRecordsRepository.save({
      ...record,
      ...recordMap,
    })
  }
}
