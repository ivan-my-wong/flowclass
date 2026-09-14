import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import Stripe from 'stripe'

import { PlanIntervalDto } from '@/application/admin/subscription-plans/dto/create-subscription-plans.dto'
import { SubscriptionPlanCheckoutResponse } from '@/application/admin/subscription-plans/dto/subscription-plans.dto'
import { STRIPE_CLIENT, STRIPE_CONFIG_URL } from '@/common/constants/provider-keys'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import { StripeConfigUrl } from '@/models/custom-types/stripe'
import { StripeCheckoutSessionType, StripePriceInterval } from '@/models/enums'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'
import { StripeProductPricesRepository } from '@/models/stripe-product-prices.repository'
import { SubscriptionPlanRecordsEntity } from '@/models/subscription-plan-records.entity'
import { PlanPriceMode, PlanTier, PlanWithPrice } from '@/models/subscription-plans.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'
import { calculatePlanPrice } from '@/utils/plan-calculation'

import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'

@Injectable()
export class SubmitSubscriptionService {
  constructor(
    private readonly stripeProductPricesRepository: StripeProductPricesRepository,
    private readonly stripeConnectAccountRepository: StripeConnectRepository,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository,
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe,
    @Inject(STRIPE_CONFIG_URL)
    private readonly stripeConfigUrl: StripeConfigUrl
  ) {}
  /**
   * Batch create subscription plan records for multiple planId+interval pairs.
   * @param institutionId
   * @param siteId
   * @param plans: Array<{ planId, interval }>
   * @returns Promise<SubscriptionPlanRecordsEntity[]>
   */
  async createMultiplePlanRecords({
    institutionId,
    siteId,
    plans,
  }: {
    institutionId: number
    siteId: number
    plans: PlanIntervalDto[]
  }): Promise<SubscriptionPlanCheckoutResponse> {
    const hasAnyPlans = await this.subscriptionService.getActivePlan(siteId)

    if (!hasAnyPlans.isTrial) {
      throw new BadRequestException(PlanErrorMessage.ALREADY_HAS_ACTIVE_PLAN)
    }

    const subscriptionPlansPerItem = await this.subscriptionPlansRepository.find({
      where: {
        priceMode: PlanPriceMode.PER_ITEM,
      },
    })
    const createdRecords: SubscriptionPlanRecordsEntity[] = []
    const stripeConnectAccount = await this.stripeConnectAccountRepository.findOne({
      where: {
        siteId,
        institutionId,
      },
    })
    if (!stripeConnectAccount) {
      throw new BadRequestException(PlanErrorMessage.STRIPE_CONNECT_ACCOUNT_NOT_FOUND)
    }
    for (const { planId, interval, planQuantity } of plans) {
      // Find the price for this planId and interval
      const price = await this.stripeProductPricesRepository.findOne({
        where: { planId, interval },
      })
      const plan = await this.subscriptionPlansRepository.findOne({ where: { id: planId } })
      // Compose the plan record fields
      if (!plan) {
        throw new NotFoundException(PlanErrorMessage.PLAN_NOT_FOUND)
      }
      if (!price && plan.tier === PlanTier.FREE) {
        continue
      }
      const {
        totalPrice,
        qty: newQty,
        deductedBy,
        metadata,
      } = calculatePlanPrice(subscriptionPlansPerItem, plan, price, planQuantity)
      createdRecords.push({
        siteId,
        planIds: [planId],
        totalPrice,
        qty: newQty,
        price,
        plan,
        metadata,
        deductedBy,
        currency: price.currency || 'usd',
      } as PlanWithPrice)
    }
    // Generate checkout session with metadata
    const checkoutSession = await this.generateCheckoutSession(
      createdRecords,
      stripeConnectAccount,
      {
        siteId,
        plans: plans.map((d) => ({ id: d.planId, qty: d.planQuantity, i: d.interval })),
      }
    )

    return {
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    }
  }

  async generateCheckoutSession(
    planRecords: PlanWithPrice[],
    stripeConnect: StripeConnect,
    metadata: { siteId: number; plans: Array<{ id: number; qty: number; i: StripePriceInterval }> }
  ): Promise<Stripe.Checkout.Session> {
    const lineItems = this.generateStripeLineItems(planRecords)
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: lineItems,
      customer: stripeConnect.customerId,
      success_url: this.stripeConfigUrl.successUrl,
      cancel_url: this.stripeConfigUrl.cancelUrl,
      metadata: {
        type: StripeCheckoutSessionType.SUBSCRIPTION_PLAN_EVENT,
        siteId: metadata.siteId.toString(),
        plansData: JSON.stringify(metadata.plans),
      },
    }

    return this.stripeClient.checkout.sessions.create(sessionParams)
  }

  generateStripeLineItems(
    planRecords: PlanWithPrice[]
  ): Stripe.Checkout.SessionCreateParams.LineItem[] {
    const items = planRecords.map((record) => {
      const hasDeducted = record.deductedBy && record.deductedBy > 0
      // const isClassPlan = record.plan?.type === PlanType.CLASS_TYPE
      if (record.price?.stripePriceId && !hasDeducted) {
        // Use the price ID if available
        return {
          quantity: record.qty,
          price: record.price.stripePriceId,
        } as Stripe.Checkout.SessionCreateParams.LineItem
      } else {
        // Fallback to price_data if no price ID is available
        const actualQuantity = hasDeducted ? record.qty + record.deductedBy : record.qty
        return {
          price_data: {
            currency: record.currency,
            product_data: {
              name: `${record.plan?.name}`,
              description: `Actual Quantity: ${actualQuantity} deducted by ${
                record.deductedBy || 0
              }`,
              metadata: {
                lookupKey: record.price?.lookupKey || '',
                parentPriceId: record.price?.stripePriceId || '',
                parentProductId: record.price?.stripeProductId || '',
                planId: record.plan?.id.toString(),
                planType: record.plan?.type,
                planQuantity: actualQuantity.toString(),
                deductedBy: record.deductedBy?.toString() || '0',
              },
            },
            unit_amount: Math.round((record.totalPrice / record.qty) * 100),
            recurring: {
              interval: record.price?.interval || StripePriceInterval.MONTH,
            },
          },
          quantity: record.qty,
        } as Stripe.Checkout.SessionCreateParams.LineItem
      }
    })
    // Group items by price ID to avoid duplicates
    // and sum quantities
    const groupedItems: Record<string, Stripe.Checkout.SessionCreateParams.LineItem> = {}
    items.forEach((item) => {
      const key =
        item.price ||
        `${item.price_data?.currency}_${item.price_data?.unit_amount}_${item.price_data?.recurring?.interval}`

      if (groupedItems[key]) {
        groupedItems[key].quantity += item.quantity
      } else {
        groupedItems[key] = item
      }
    })
    return Object.values(groupedItems)
  }
}
