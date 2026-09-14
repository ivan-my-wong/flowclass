/* eslint-disable simple-import-sort/imports */
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import Stripe from 'stripe'
import { In } from 'typeorm'

import {
  UpgradeCostCalculation,
  UpgradePlanRequestDto,
  UpgradePlanRequestSinglePlan,
  UpgradePlanRequestSinglePlanV2,
  UpgradeSubscriptionPlanDto,
} from '@/application/admin/subscription-plans/dto/upgrade-subscription-plans.dto'
import { STRIPE_CLIENT, STRIPE_CONFIG_URL } from '@/common/constants/provider-keys'
import { FREE_SUBSCRIPTION_PLAN_RECORDS } from '@/common/constants/subscription-plans.constant'
import { ALWAYS_ONE_QUANTITY_PLANS } from '@/common/constants/subscription.constants'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import { StripeCheckoutSessionType, StripePriceInterval } from '@/models/enums'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'
import { StripeProductPricesRepository } from '@/models/stripe-product-prices.repository'
import {
  SubscriptionPlanRecordsEntity,
  SubscriptionPlanRecordsRepository,
} from '@/models/subscription-plan-records.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'

import { StripeConfigUrl } from '@/models/custom-types/stripe'
import { PlanTier } from '@/models/subscription-plans.entity'
import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'

@Injectable()
export class UpgradeSubscriptionService {
  private readonly logger = new Logger(UpgradeSubscriptionService.name)
  constructor(
    private readonly subscriptionPlanRecordsRepository: SubscriptionPlanRecordsRepository,
    private readonly stripeProductPricesRepository: StripeProductPricesRepository,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository,
    private readonly stripeConnectAccountRepository: StripeConnectRepository,
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe,
    @Inject(STRIPE_CONFIG_URL)
    private readonly stripeConfigUrl: StripeConfigUrl
  ) {}
  async assignPlanFromSubscriptionPlans({
    siteId,
    interval,
    plans,
    totalPrice,
    currency,
    stripeSubscriptionId,
  }: {
    siteId: number
    interval: StripePriceInterval
    plans: UpgradePlanRequestSinglePlan[]
    totalPrice?: number
    currency?: string
    stripeSubscriptionId?: string
  }): Promise<SubscriptionPlanRecordsEntity> {
    const planIds = plans.map((plan) => plan.planId)
    const uniquePlanIds = [...new Set(planIds)]

    const getPlan = await this.subscriptionPlansRepository.find({
      where: {
        id: In(uniquePlanIds),
      },
    })

    if (!getPlan || getPlan.length === 0) {
      throw new NotFoundException(PlanErrorMessage.PLAN_NOT_FOUND)
    }
    const finalSubscriptionPlanRecord = this.subscriptionPlanRecordsRepository.create({})

    // Compose from the basic free plan first
    let accumulatedUpdates = {}

    const freePlans = await this.subscriptionPlansRepository.find({
      where: {
        tier: PlanTier.FREE,
      },
    })

    const freePlansToUpgradeRequest = freePlans.map((plan) => ({
      planId: plan.id,
      planQuantity: plan.typeQuota,
    }))

    const allPlans = [...freePlansToUpgradeRequest, ...plans]

    allPlans.forEach((planDto) => {
      const updates = this.subscriptionService.updateRelatedPropertySubscriptionPlanRecord(
        finalSubscriptionPlanRecord,
        planDto,
        getPlan
      )

      accumulatedUpdates = { ...accumulatedUpdates, ...updates }
    })

    Object.assign(finalSubscriptionPlanRecord, accumulatedUpdates)

    if (totalPrice) {
      finalSubscriptionPlanRecord.totalPrice = totalPrice
    }

    if (stripeSubscriptionId) {
      finalSubscriptionPlanRecord.stripeSubscriptionId = stripeSubscriptionId
    }

    if (currency) {
      finalSubscriptionPlanRecord.currency = currency
    }

    const subscriptionPlanRecord = await this.subscriptionService.getActivePlan(siteId)
    if (subscriptionPlanRecord) {
      return this.subscriptionPlanRecordsRepository.save({
        ...subscriptionPlanRecord,
        planIds,
        ...finalSubscriptionPlanRecord,
      })
    }

    const expiryDate = dayjs().add(1, interval).toDate()

    return this.subscriptionPlanRecordsRepository.save({
      ...FREE_SUBSCRIPTION_PLAN_RECORDS,
      siteId,
      planIds,
      currency,
      purchaseDate: dayjs().toDate(),
      expiryDate,
      ...finalSubscriptionPlanRecord,
    })
  }

  async upgradePlanDirectly({
    siteId,
    plans,
    interval,
    expiryDate,
    totalPrice,
    currency,
  }: UpgradePlanRequestDto): Promise<SubscriptionPlanRecordsEntity> {
    let noOfMonths = 1

    if (interval === StripePriceInterval.YEAR) {
      noOfMonths = 12
    }

    // Get existing subscription plan record to calculate new expiry date
    const subscriptionPlanRecord =
      await this.subscriptionPlanRecordsRepository.findOneWithExpiryDate(siteId)

    let currentPlanExpiryDate

    if (expiryDate) {
      currentPlanExpiryDate = new Date(expiryDate)
    } else {
      currentPlanExpiryDate = subscriptionPlanRecord?.expiryDate

      if (!currentPlanExpiryDate) {
        currentPlanExpiryDate = dayjs().add(noOfMonths, 'month').toDate()
      } else {
        currentPlanExpiryDate = dayjs(currentPlanExpiryDate).add(noOfMonths, 'month').toDate()
      }
    }

    // Use assignPlanFromSubscriptionPlans to properly handle multiple plan IDs
    const result = await this.assignPlanFromSubscriptionPlans({
      siteId,
      interval,
      plans,
      totalPrice,
      currency,
    })

    // Update the expiry date with our calculated value
    if (result && currentPlanExpiryDate) {
      result.expiryDate = currentPlanExpiryDate
      return await this.subscriptionPlanRecordsRepository.save(result)
    }

    return result
  }
  async upgradePlan(siteId: number, dto: UpgradeSubscriptionPlanDto) {
    const { newPlans } = dto
    try {
      const currentRecord = await this.subscriptionService.getActivePlan(siteId)

      if (!currentRecord?.stripeSubscriptionId) {
        throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
      }

      // Let Stripe handle the proration calculation

      const costCalculation = await this.previewUpgradeCost(siteId, newPlans)
      if (costCalculation.stripeProrationDetails.totalProrationAmount <= 0) {
        const updatedSubscription =
          await this.subscriptionService.updateSubscriptionItemAfterAction(
            currentRecord,
            newPlans,
            'upgrade'
          )
        const totalPrice = this.subscriptionService.calculateSubscriptionTotal(updatedSubscription)
        const updatedRecord = await this.subscriptionService.updatePlanRecordSucceed({
          siteId,
          plans: newPlans,
          totalPrice,
          currency: updatedSubscription.currency,
          stripeSubscriptionId: currentRecord.stripeSubscriptionId,
        })

        return {
          status: 'completed',
          message: 'Upgrade completed successfully with Stripe proration',
          subscriptionRecord: updatedRecord,
          prorationDetails: costCalculation.stripeProrationDetails,
        }
      }
      // If payment is required, return the checkout URL
      const checkoutSession = await this.createUpgradeCheckoutSession({
        subscriptionId: currentRecord.stripeSubscriptionId,
        siteId: currentRecord.siteId,
        newPlans,
        interval: costCalculation.interval,
        costCalculation,
        currency: currentRecord.currency || 'usd',
      })
      // Update local record
      return {
        status: 'payment_required',
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
        proRatedAmount: costCalculation.proRatedAmount,
        daysRemaining: costCalculation.daysRemaining,
        prorationDetails: costCalculation.stripeProrationDetails,
        message: 'Upgrade requires payment, please complete checkout',
      }
    } catch (error) {
      throw new BadRequestException(`Upgrade failed: ${error.message}`)
    }
  }
  async validateUpgradePlans(newPlans: UpgradePlanRequestSinglePlanV2[]): Promise<void> {
    if (!newPlans || newPlans.length === 0) {
      throw new BadRequestException('No plans provided for upgrade')
    }
    const planIds = newPlans.map((p) => p.planId)
    if (planIds.length === 0) {
      throw new BadRequestException('No valid plan IDs provided for upgrade')
    }
    const plans = await this.subscriptionPlansRepository.find({
      where: { id: In(planIds) },
      relations: ['stripeProductPrices'],
    })
    if (plans.length === 0) {
      throw new BadRequestException('No valid plans found for upgrade')
    }
    if (plans.some((p) => ALWAYS_ONE_QUANTITY_PLANS.includes(p.type))) {
      throw new BadRequestException(PlanErrorMessage.ONLY_QUOTA_PLAN_CAN_BE_UPGRADED)
    }
  }
  /**
   * Creates Stripe checkout session for upgrade or add-feature payment
   */
  private async createUpgradeCheckoutSession({
    subscriptionId,
    siteId,
    newPlans,
    interval,
    costCalculation,
    currency = 'usd',
  }: {
    siteId: number
    newPlans: UpgradePlanRequestSinglePlanV2[]
    interval: StripePriceInterval
    costCalculation: UpgradeCostCalculation
    currency?: string
    subscriptionId?: string
  }): Promise<Stripe.Checkout.Session> {
    const existingSession = await this.subscriptionService.getExistingCheckoutSession(
      siteId,
      StripeCheckoutSessionType.UPGRADE_SUBSCRIPTION,
      subscriptionId
    )

    if (existingSession) {
      // Return existing session instead of creating new one
      throw new BadRequestException(
        `There is already an active checkout session for this upgrade. Please complete the existing payment or wait for it to expire.`
      )
    }
    const stripeConnectAccount = await this.stripeConnectAccountRepository.findOne({
      where: {
        siteId,
      },
    })
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    for (const invoiceItem of costCalculation.subscriptionItems) {
      // Find metadata inside costCalculation.subscriptionItems
      const metadata = invoiceItem.metadata as Record<string, string>
      const quantityOfPlan =
        newPlans.find((p) => p.planId === parseInt(metadata?.planId || '0'))?.planQuantity || 1
      const deductedBy = parseInt(metadata?.deductedBy || '0')
      const quantity = quantityOfPlan - deductedBy

      if (quantity <= 0) {
        this.logger.warn(`Invalid quantity ${quantity} for plan ${metadata?.planId}`)
        continue // Skip this line item
      }

      const plan = await this.subscriptionPlansRepository.findOne({
        where: { id: parseInt(metadata?.planId || '0') },
        relations: ['stripeProductPrices'],
      })
      if (invoiceItem.price_data) {
        lineItems.push({
          price_data: {
            currency,
            product_data: {
              name: plan?.name,
              metadata,
            },
            unit_amount: Math.round(invoiceItem.price_data?.unit_amount), // Convert to cents
          },
          quantity, // Default to 1 if quantity is not specified
        })
      } else {
        lineItems.push({
          price: invoiceItem.price,
          quantity: invoiceItem.quantity,
        })
      }
    }
    return this.stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer: stripeConnectAccount?.customerId,
      success_url: this.stripeConfigUrl.successUrl,
      cancel_url: this.stripeConfigUrl.cancelUrl,
      metadata: {
        siteId: siteId.toString(),
        type: StripeCheckoutSessionType.UPGRADE_SUBSCRIPTION,
        subscriptionId: subscriptionId || '',
        plans: JSON.stringify(newPlans),
        interval,
        proRatedAmount: costCalculation.proRatedAmount.toString(),
        daysRemaining: costCalculation.daysRemaining.toString(),
      },
      client_reference_id: siteId.toString(),
    })
  }

  async buildSubscriptionItem(
    currentRecord: SubscriptionPlanRecordsEntity,
    newPlans: UpgradePlanRequestSinglePlanV2[],
    interval: StripePriceInterval
  ): Promise<{
    subscriptionItems: Stripe.InvoiceRetrieveUpcomingParams.SubscriptionItem[]
  }> {
    const subscriptionPlansPerItem = await this.subscriptionPlansRepository.find({
      relations: {
        stripeProductPrices: true,
      },
    })
    if (!currentRecord?.stripeSubscriptionId) {
      throw new Error('No active subscription found')
    }
    // Check if one of planId already exist in currentRecord.planIds

    const existingSubscriptionItems = await this.stripeClient.subscriptionItems.list({
      subscription: currentRecord.stripeSubscriptionId,
      expand: ['data.price.product'],
    })
    // Create preview items for upcoming invoice
    const subscriptionItems: Stripe.InvoiceRetrieveUpcomingParams.SubscriptionItem[] = []
    const pricesWithPlan = await this.stripeProductPricesRepository.find({
      where: {
        planId: In(newPlans.map((p) => p.planId)),
        interval,
        currency: currentRecord.currency.toUpperCase(),
      },
      relations: {
        plan: true,
      },
    })
    const mapPlanPriceQuantity = new Map<string, number>()
    const onlyItemsPlans = existingSubscriptionItems.data.filter((d) =>
      pricesWithPlan.map((p) => p.stripePriceId).includes(d.price.id)
    )
    for (const subItem of onlyItemsPlans) {
      if (subItem.price && subItem.price.unit_amount) {
        mapPlanPriceQuantity.set(subItem.price.id, subItem.quantity)
      }
    }

    for (const pricePlan of pricesWithPlan) {
      const newQuantity = newPlans.find((p) => p.planId === pricePlan.plan.id)?.planQuantity || 0
      const existingQuantity =
        (mapPlanPriceQuantity.get(pricePlan.stripePriceId) || 0) + newQuantity
      mapPlanPriceQuantity.set(pricePlan.stripePriceId, existingQuantity)
    }
    for (const mapPlan of mapPlanPriceQuantity.keys()) {
      // Logic to handle multiple plans
      // get plan by stripePriceId
      const price = pricesWithPlan.find((p) => p.stripePriceId === mapPlan)

      // quantity of new plan wil be set based on quantity at mapPlanPriceQuantity
      const actualQuantity = mapPlanPriceQuantity.get(mapPlan) || 1
      const payload = this.subscriptionService.generateSubscriptionItemMetadata(
        subscriptionPlansPerItem,
        price,
        actualQuantity
      )
      subscriptionItems.push(payload)
    }
    return {
      subscriptionItems,
    }
  }

  getMetadataFromSubscriptionItemProduct(
    subscriptionItem: Stripe.SubscriptionItem
  ): Record<string, string> {
    if (typeof subscriptionItem.price.product === 'string') {
      return subscriptionItem.metadata || {}
    }
    const productMetadata = (subscriptionItem.price.product as Stripe.Product).metadata
    return {
      ...subscriptionItem.metadata,
      ...productMetadata,
    }
  }

  /**
   * Preview upgrade cost using Stripe's proration (before actually upgrading)
   */
  async previewUpgradeCost(
    siteId: number,
    newPlans: UpgradePlanRequestSinglePlanV2[]
  ): Promise<UpgradeCostCalculation> {
    const currentRecord = await this.subscriptionPlanRecordsRepository.findOneWithExpiryDate(siteId)
    if (!currentRecord?.stripeSubscriptionId) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
    const newInterval = this.subscriptionService.getPlanRecordInterval(currentRecord)
    await this.validateUpgradePlans(newPlans)
    // Check if one of planId already exist in currentRecord.planIds
    try {
      const { subscriptionItems } = await this.buildSubscriptionItem(
        currentRecord,
        newPlans,
        newInterval
      )
      const upcomingInvoice = await this.stripeClient.invoices.retrieveUpcoming({
        subscription: currentRecord.stripeSubscriptionId,
        subscription_items: subscriptionItems,
        subscription_proration_behavior: 'create_prorations',
      })
      // Extract proration details
      const prorationDetails = await this.subscriptionService.extractProrationDetails(
        upcomingInvoice,
        subscriptionItems
      )
      return {
        currentPlanCost: 0, // Can be calculated from current subscription
        newPlanCost: 0, // Can be calculated from new plans
        proRatedAmount: prorationDetails.totalProrationAmount,
        daysRemaining: Math.ceil(
          (prorationDetails.periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        totalDaysInCycle: Math.ceil(
          (prorationDetails.periodEnd.getTime() - prorationDetails.periodStart.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        currentCycleEndDate: prorationDetails.periodEnd.toISOString(),
        paymentRequired: prorationDetails.totalProrationAmount > 0,
        stripeProrationDetails: prorationDetails,
        subscriptionItems,
        interval: newInterval,
      }
    } catch (error) {
      this.logger.error('Error retrieving upcoming invoice:', error)
      throw new Error('Failed to retrieve upcoming invoice for proration calculation')
    }
  }

  /**
   * Processes upgrade after successful payment via webhook
   */
  async processUpgradeAfterPayment(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const { metadata } = session

      if (metadata.type !== StripeCheckoutSessionType.UPGRADE_SUBSCRIPTION) {
        this.logger.debug(`Skipping non-upgrade webhook: ${metadata.type}`)
        return // Not an upgrade payment
      }
      const siteId = parseInt(metadata.siteId)
      const newPlans = JSON.parse(metadata.plans) as UpgradePlanRequestSinglePlanV2[]
      // const interval = metadata.interval as StripePriceInterval

      // Get current record
      const currentRecord = await this.subscriptionService.getActivePlan(siteId)
      if (!currentRecord?.stripeSubscriptionId) {
        throw new BadRequestException(PlanErrorMessage.SUBSCRIPTION_NOT_FOUND)
      }
      // Now process the actual upgrade in Stripe
      const updatedSubscription = await this.subscriptionService.updateSubscriptionItemAfterAction(
        currentRecord,
        newPlans,
        'upgrade'
      )

      // Calculate new total price
      const totalPrice = this.subscriptionService.calculateSubscriptionTotal(updatedSubscription)
      // Update local subscription plan record
      await this.subscriptionService.updatePlanRecordSucceed({
        siteId,
        plans: newPlans,
        totalPrice,
        currency: updatedSubscription.currency || 'usd',
        stripeSubscriptionId: currentRecord.stripeSubscriptionId,
      })
    } catch (error) {
      this.logger.error('Failed to process upgrade after payment:', error)
      throw error
    }
  }
}
