/* eslint-disable simple-import-sort/imports */

import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import * as _ from 'lodash'
import Stripe from 'stripe'
import { In, MoreThanOrEqual } from 'typeorm'

import {
  StripeProrateDetailDto,
  UpgradePlanRequestSinglePlan,
  UpgradePlanRequestSinglePlanV2,
} from '@/application/admin/subscription-plans/dto/upgrade-subscription-plans.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { STRIPE_CLIENT } from '@/common/constants/provider-keys'
import {
  FREE_SUBSCRIPTION_PLAN_RECORDS,
  SUBSCRIPTION_PLANS,
  TRIAL_SUBSCRIPTION_PLAN_RECORDS,
} from '@/common/constants/subscription-plans.constant'
import { ALWAYS_ONE_QUANTITY_PLANS } from '@/common/constants/subscription.constants'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import { StripeCheckoutSessionType, StripePriceInterval } from '@/models/enums'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'
import { StripeProductPricesEntity } from '@/models/stripe-product-prices.entity'
import {
  PlanPermission,
  PlanWithStripePrice,
  SubscriptionPlanRecordsEntity,
  SubscriptionPlanRecordsRepository,
} from '@/models/subscription-plan-records.entity'
import {
  PlanPriceMode,
  PlanType,
  SubscriptionPlan,
  SubscriptionPlanApp,
} from '@/models/subscription-plans.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'
import { calculatePlanPrice } from '@/utils/plan-calculation'
import { shallow } from '@/utils/shallow.utils'

@Injectable()
export class SubscriptionPlanRecordsService {
  private readonly logger = new Logger(SubscriptionPlanRecordsService.name)
  constructor(
    private readonly subscriptionPlanRecordsRepository: SubscriptionPlanRecordsRepository,
    private readonly subscriptionPlansRepository: SubscriptionPlansRepository,
    private readonly stripeConnectAccountRepository: StripeConnectRepository,
    @Inject(STRIPE_CLIENT)
    public readonly stripeClient: Stripe
  ) {}

  // async create(
  //   data: Partial<SubscriptionPlanRecordsEntity>
  // ): Promise<SubscriptionPlanRecordsEntity> {
  //   const record = this.subscriptionPlanRecordsRepository.create(data)
  //   return this.subscriptionPlanRecordsRepository.save(record)
  // }

  async findAll(siteId?: number): Promise<SubscriptionPlanRecordsEntity[]> {
    const where = siteId ? { siteId } : {}
    const records = await this.subscriptionPlanRecordsRepository.find({
      where,
      relations: {
        site: true,
      },
      order: {
        id: 'DESC',
      },
    })

    // Populate plans for each record
    await this.populatePlansForRecords(records)

    return records
  }

  async findOne(id: number): Promise<SubscriptionPlanRecordsEntity> {
    const record = await this.subscriptionPlanRecordsRepository.findOne({
      where: { id },
      relations: { site: true },
    })
    if (!record) {
      throw new ApiError(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }

    // Populate the plans array based on planIds
    await this.populatePlansForRecord(record)

    return record
  }

  async update(
    id: number,
    data: Partial<SubscriptionPlanRecordsEntity>
  ): Promise<SubscriptionPlanRecordsEntity> {
    const result = await this.subscriptionPlanRecordsRepository.update(id, data)
    if (result.affected === 0) {
      throw new ApiError(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
    return this.findOne(id)
  }

  async delete(id: number): Promise<void> {
    const result = await this.subscriptionPlanRecordsRepository.delete(id)

    if (result.affected === 0) {
      throw new ApiError(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
  }

  /***
   * Updates the subscription plan record with the new plan details.
   * @param subscriptionPlanRecord - The current subscription plan record to update
   * @param planDto - The plan DTO containing the new plan details
   * @param plans - The list of available subscription plans
   * @param isDowngradeAction - Whether this is a downgrade action
   * @return The updated subscription plan record
   */
  public updateRelatedPropertySubscriptionPlanRecord(
    subscriptionPlanRecord: SubscriptionPlanRecordsEntity,
    planDto: UpgradePlanRequestSinglePlan | UpgradePlanRequestSinglePlanV2,
    plans: SubscriptionPlan[],
    isDowngradeAction = false
  ) {
    const planFromDatabase = plans.find((p) => p.id === planDto.planId)

    if (!planFromDatabase) {
      return subscriptionPlanRecord
    }

    const correctColumn: keyof SubscriptionPlanRecordsEntity = planFromDatabase.typeColumnName

    let columnValue: number | Record<PlanPermission, boolean> = 0
    const valueFromDatabase =
      this.subscriptionPlansRepository.getSubscriptionPlanQuotaOrPermission(planFromDatabase)

    if (Number.isInteger(valueFromDatabase)) {
      if (planFromDatabase.priceMode === PlanPriceMode.PER_ITEM) {
        columnValue = planDto.planQuantity || valueFromDatabase
      } else {
        columnValue = valueFromDatabase
      }
    } else {
      columnValue = valueFromDatabase
    }

    if (typeof subscriptionPlanRecord[correctColumn] === 'object') {
      // If it's an object, we need to ensure we merge it correctly
      if (isDowngradeAction) {
        const key = Object.keys(columnValue)[0] as PlanPermission
        // Remove the key if it exists in the record
        if (subscriptionPlanRecord[correctColumn][key]) {
          delete subscriptionPlanRecord[correctColumn][key]
        }
      } else {
        const oldValue = subscriptionPlanRecord[correctColumn] || {}
        ;(subscriptionPlanRecord as any)[correctColumn] = {
          ...(columnValue as any),
          ...(oldValue as any),
        }
      }
    } else {
      // Otherwise, we can just assign the value
      ;(subscriptionPlanRecord as any)[correctColumn] = columnValue
    }
    return subscriptionPlanRecord
  }

  /**
   * Populates the plans array for each record based on planIds.
   * @param records - Array of SubscriptionPlanRecordsEntity to populate
   * @param isWithStripeProduct - Whether to include Stripe product prices
   * @returns Promise<SubscriptionPlanRecordsEntity>
   */
  async getSubscriptionPlanRecordWithPlans(
    siteId: number,
    isWithStripeProduct: boolean
  ): Promise<SubscriptionPlanRecordsEntity & { paymentLink?: string | Stripe.PaymentLink }> {
    // This will get ALL plans, including expired plans
    let record = await this.subscriptionPlanRecordsRepository.findOne({
      where: { siteId },
    })

    // Create a trial plan for the site if it doesn't exist
    if (!record) {
      record = await this.createTrialPlan(siteId)
    }

    // if (!record) {
    //   throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    // }

    // Populate the plans array based on planIds
    if (isWithStripeProduct) {
      record = await this.populateStripeProductPrices(record)
    }
    // get active session for this record
    const session = await this.getExistingCheckoutSession(
      record.siteId,
      StripeCheckoutSessionType.UPGRADE_SUBSCRIPTION,
      record.stripeSubscriptionId
    )
    return {
      ...record,
      paymentLink: session?.url || '',
    }
  }

  /**
   * populates the plans array for a single record based on its planIds.
   * @param record - The subscription plan record to populate plans for
   * @returns  Promise<SubscriptionPlanRecordsEntity>
   */
  async populateStripeProductPrices(
    record: SubscriptionPlanRecordsEntity
  ): Promise<SubscriptionPlanRecordsEntity> {
    const plansPrices = await this.subscriptionPlansRepository.find({
      where: {
        id: In(record.planIds),
      },
      relations: {
        stripeProductPrices: true,
      },
    })

    let cancelledPlans = ''

    // This happens when the use actually upgraded the plan using Stripe
    if (record.stripeSubscriptionId) {
      const subscription = await this.stripeClient.subscriptions.retrieve(
        record.stripeSubscriptionId
      )

      cancelledPlans = subscription?.metadata?.cancelledPlans || ''
    }

    const filteredPlans = plansPrices.filter((d) => record.planIds.includes(d.id))
    const interval = this.getPlanRecordInterval(record)

    record.plans = filteredPlans.map((plan) => {
      const quantity = record[plan.typeColumnName] || 1
      const price = plan.stripeProductPrices.find(
        (d) => d.currency === record.currency.toUpperCase() && d.interval === interval
      )
      return {
        ...shallow({
          source: plan,
          fields: Object.keys(plan),
          exceptFields: ['stripeProductPrices'],
        }),
        price,
        isCanceled: (cancelledPlans || '').split(',').includes(plan.id.toString()),
        qty: quantity,
      } as unknown as PlanWithStripePrice
    })
    // Find free plans
    const missingFreePlanIds = record.planIds.filter(
      (d) => !record.plans.map((e) => e.id).includes(d)
    )
    if (missingFreePlanIds.length > 0) {
      const freePlans = await this.subscriptionPlansRepository.find({
        where: { id: In(missingFreePlanIds) },
      })
      record.plans = record.plans.concat(
        freePlans.map((plan) => ({
          ...plan,
          qty: plan.typeQuota,
        }))
      )
    }
    return record
  }

  /**
   * Checks for existing Stripe checkout sessions for a site.
   * This is used to prevent duplicate sessions for the same upgrade.
   * @param siteId - The ID of the site to check for existing sessions.
   * @param type - The type of checkout session to look for.
   * @param subscriptionId - Optional subscription ID to filter sessions.
   * @returns A promise that resolves to the existing checkout session or null if none found.
   * @throws Error if there is an issue retrieving sessions from Stripe.
   */
  public async getExistingCheckoutSession(
    siteId: number,
    type: StripeCheckoutSessionType,
    subscriptionId?: string
  ): Promise<Stripe.Checkout.Session | null> {
    try {
      // Get recent sessions for this customer
      const stripeConnectAccount = await this.stripeConnectAccountRepository.findOne({
        where: { siteId },
      })

      if (!stripeConnectAccount?.customerId) return null
      const sessions = await this.stripeClient.checkout.sessions.list({
        customer: stripeConnectAccount.customerId,
        limit: 10,
        status: 'open', // Only get open sessions
        created: {
          gte: Math.floor(Date.now() / 1000) - 86400, // Last 24 hour
        },
      })

      // Find active session with same metadata
      const activeSession = sessions.data.find(
        (session) =>
          session.status === 'open' &&
          session.metadata.siteId === siteId.toString() &&
          session.metadata.type === type &&
          session.metadata.subscriptionId === subscriptionId
      )

      return activeSession || null
    } catch (error) {
      this.logger.error('Error checking existing sessions:', error)
      return null
    }
  }

  /**
   * Fetches plans by their IDs from the database.
   */
  public async getPlansById(planIds: number[]) {
    return this.subscriptionPlansRepository.find({
      where: { id: In(planIds) },
    })
  }

  public async getConnectAccount(siteId: number): Promise<StripeConnect> {
    return this.stripeConnectAccountRepository.findOne({
      where: {
        siteId,
      },
    })
  }

  /**
   * Determines the interval for a plan record based on its purchase and expiry dates.
   * If the difference is more than 1 month, it returns yearly; otherwise, monthly.
   */
  public getPlanRecordInterval(
    planRecord: SubscriptionPlanRecordsEntity
  ): StripePriceInterval | null {
    if (!planRecord.expiryDate || !planRecord.purchaseDate) {
      return null
    }
    return dayjs(planRecord.expiryDate).diff(dayjs(planRecord.purchaseDate), 'month') > 1
      ? StripePriceInterval.YEAR
      : StripePriceInterval.MONTH
  }
  /**
   * Process upgrade using Stripe's proration system
   */
  public async updateSubscriptionItemAfterAction(
    record: SubscriptionPlanRecordsEntity,
    newPlans: UpgradePlanRequestSinglePlanV2[],
    action: 'upgrade' | 'downgrade' = 'upgrade'
  ): Promise<Stripe.Subscription> {
    // Prepare subscription update items
    const subscriptionId = record.stripeSubscriptionId
    if (!subscriptionId) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
    const subscriptionPlansPerItem = await this.subscriptionPlansRepository.find({
      relations: {
        stripeProductPrices: true,
      },
    })
    const existingSubscriptionItems = await this.stripeClient.subscriptionItems.list({
      subscription: record.stripeSubscriptionId,
      expand: ['data.price.product'],
    })

    const subscriptionItemsWithMeta = existingSubscriptionItems.data.map((item) => {
      const metadata = this.getMetadataFromSubscriptionItemProduct(item)
      return {
        ...item,
        metadata,
      }
    })

    const newPlansWithPrice = await this.subscriptionPlansRepository.find({
      where: {
        id: In(newPlans.map((p) => p.planId)),
      },
      relations: {
        stripeProductPrices: true,
      },
    })

    const removedSubscriptionItems = []
    const subscriptionItems = []

    const interval = this.getPlanRecordInterval(record)
    if (!interval) {
      throw new BadRequestException('Cannot determine subscription interval from plan record')
    }

    for (const plan of newPlansWithPrice) {
      const priceId = newPlans.find((p) => p.planId === plan.id)?.priceId
      const qty = newPlans.find((p) => p.planId === plan.id)?.planQuantity || 1
      let price
      if (priceId === undefined) {
        price = plan.stripeProductPrices.find(
          (d) =>
            d.interval === interval && d.currency.toUpperCase() === record.currency.toUpperCase()
        )
      } else {
        price = plan.stripeProductPrices.find((p) => p.id === priceId)
      }
      price.plan = plan
      const where = { type: plan.type, id: In(record.planIds) }
      if (action === 'downgrade') {
        // For downgrade, we need to find the plan with the same type and remove it
        delete where.id
      }
      const planWithSameType = await this.subscriptionPlansRepository.find({
        where,
        relations: ['stripeProductPrices'],
      })
      const payload = this.generateSubscriptionItemMetadata(subscriptionPlansPerItem, price, qty)
      // Find previous subscription item for this plan
      const newPriceId = payload.metadata?.parentPriceId || price.stripePriceId
      const planNamesOnly = planWithSameType.map((p) => p.name)
      const planTypesOnly = planWithSameType.map((p) => p.type)
      const subscriptionItem = subscriptionItemsWithMeta.find(
        (item) =>
          item.price.id === newPriceId ||
          planNamesOnly.includes(item.metadata?.lookupKey) ||
          planTypesOnly.includes(item.metadata?.lookupKey as PlanType)
      )
      // This is the condition for upgrading a plan that has the same type as a previous plan.
      // If such a plan exists, we will remove it from the subscription
      // and add the new plan with the appropriate quantity.
      if (subscriptionItem) {
        removedSubscriptionItems.push(subscriptionItem.id)
      }
      subscriptionItems.push(payload)
    }
    for (const removedItem of removedSubscriptionItems) {
      await this.stripeClient.subscriptionItems.del(removedItem)
    }
    for (const item of subscriptionItems) {
      await this.stripeClient.subscriptionItems.create({
        subscription: subscriptionId,
        proration_behavior: 'none',
        ...item,
      })
    }
    const updatedSubscription = await this.stripeClient.subscriptions.retrieve(subscriptionId)
    return this.updateSubscriptionMetadata(updatedSubscription, newPlans, action)
  }

  private async updateSubscriptionMetadata(
    subscription: Stripe.Subscription,
    newPlans: UpgradePlanRequestSinglePlanV2[],
    action: 'upgrade' | 'downgrade'
  ): Promise<Stripe.Subscription> {
    const metadata = {
      ...subscription.metadata,
    }
    if (action === 'downgrade') {
      // Save metadata for downgrade action to be used later
      let downgradePlans = metadata.downgradePlans ? metadata.downgradePlans.split(',') : []
      downgradePlans = downgradePlans.concat(newPlans.map((p) => p.planId.toString()))
      metadata.downgradePlans = downgradePlans.join(',')
    } else {
      let upgradePlans = metadata.upgradePlans ? metadata.upgradePlans.split(',') : []
      upgradePlans = upgradePlans.concat(newPlans.map((p) => p.planId.toString()))
      metadata.upgradePlans = upgradePlans.join(',')
    }
    return this.stripeClient.subscriptions.update(subscription.id, {
      metadata,
    })
  }

  public generateSubscriptionItemMetadata(
    subscriptionPlans: SubscriptionPlan[],
    price: StripeProductPricesEntity,
    actualQuantity: number
  ) {
    const {
      totalPrice,
      qty: newQty,
      deductedBy,
      metadata: newMetadata,
    } = calculatePlanPrice(subscriptionPlans, price.plan, price, actualQuantity)
    const priceData = {
      unit_amount: (totalPrice / newQty) * 100, // This price is after deduction multiple by quantity
      currency: price.currency || 'usd',
      product: newMetadata?.productId || price.stripeProductId,
    }
    const metadata: Record<string, string> = {
      deductedBy: deductedBy?.toString() || '0',
      // This is the priceId of the parent plan, not the current price because we create
      // custom price for upgrade and adjust quantity by deductedBy
      parentPriceId: newMetadata?.priceId || price.stripePriceId,
      parentProductId: newMetadata?.productId || price.stripeProductId,
      planId: (newMetadata?.planId || price.plan.id).toString(),
      planType: newMetadata?.planType || price.plan.type,
      lookupKey: newMetadata?.lookupKey || price.lookupKey,
      planQuantity: newQty.toString(),
    }
    return {
      quantity: newQty, // Adjust quantity based on existing item
      // price: stripePrice.stripePriceId,
      metadata,
      price_data: {
        ...priceData,
        recurring: {
          interval: price.interval as StripePriceInterval,
        },
      },
    }
  }
  /**
   * Extract proration details from Stripe invoice
   */
  public async extractProrationDetails(
    invoice: Stripe.Response<Stripe.UpcomingInvoice>,
    subscriptionItems: Stripe.InvoiceRetrieveUpcomingParams.SubscriptionItem[]
  ) {
    const prorationItems = invoice.lines.data.filter((line) => line.proration === true)
    const credits = prorationItems
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0)

    const charges = prorationItems
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0)
    // const reduceDestructedPrices = destructedPrices.reduce((sum, price) => sum + price, 0)
    const totalProrationAmount = (charges - credits) / 100
    const mappedProrationItems = prorationItems.map((item) => {
      const subscriptionItem = subscriptionItems.find((si) => si.id === item.subscription_item)
      const metadata = subscriptionItem?.metadata || {}
      return {
        id: subscriptionItem?.id,
        planId: metadata?.planId || '',
        priceId: item.price.id,
        productId: item.price.product as string,
        amount: item.amount, // Keep in cents for now
        quantity: item.quantity || 1,
        description:
          item.description ||
          `${item.amount > 0 ? 'Charge' : 'Credit'} for ${item.price?.nickname || 'plan upgrade'}`,
        currency: item.currency || 'usd',
        proration: item.proration,
        period: {
          start: item.period?.start ? new Date(item.period.start * 1000) : null,
          end: item.period?.end ? new Date(item.period.end * 1000) : null,
        },
      }
    })
    return {
      totalProrationAmount, // Convert from cents
      credits: credits / 100,
      charges: charges / 100,
      nextInvoiceAmount: invoice.amount_due / 100 - totalProrationAmount,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      prorationItems: mappedProrationItems,
    } as StripeProrateDetailDto
  }

  /**
   * Extracts metadata from a Stripe subscription item product.
   * If the product is a string, it returns the item's metadata.
   * If the product is an object, it merges the item's metadata with the product's metadata.
   * @param subscriptionItem - The Stripe subscription item to extract metadata from.
   * @returns An object containing the merged metadata.
   */
  public getMetadataFromSubscriptionItemProduct(
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
   * Calculates the total price from Stripe subscription
   */
  public calculateSubscriptionTotal(subscription: Stripe.Subscription): number {
    let total = 0

    for (const item of subscription.items.data) {
      const unitAmount = item.price.unit_amount || 0
      const quantity = item.quantity || 1
      total += unitAmount * quantity
    }

    // Convert from cents to dollars
    return total / 100
  }

  async getActivePlan(siteId: number): Promise<SubscriptionPlanRecordsEntity | null> {
    const currentDate = dayjs().startOf('day').toDate()

    const plans = await this.subscriptionPlanRecordsRepository.findAll({
      where: {
        siteId,
        expiryDate: MoreThanOrEqual(currentDate),
      },
    })
    const combined = this.combinePlans(plans)
    const newSubscriptionPlan = _.isEmpty(combined)
      ? null
      : (combined as SubscriptionPlanRecordsEntity)
    if (newSubscriptionPlan && newSubscriptionPlan.expiryDate < dayjs().toDate()) {
      // Reset to FREE plan
      return this.subscriptionPlanRecordsRepository.save({
        ...FREE_SUBSCRIPTION_PLAN_RECORDS,
        id: newSubscriptionPlan.id,
        siteId,
        purchaseDate: dayjs().toDate(),
        expiryDate: dayjs().add(1, 'month').toDate(),
        app: SubscriptionPlanApp.FLOWCLASS,
      })
    }
    return newSubscriptionPlan
  }

  async createTrialPlan(siteId: number): Promise<SubscriptionPlanRecordsEntity> {
    const trialPlan: Partial<SubscriptionPlanRecordsEntity> = {
      ...TRIAL_SUBSCRIPTION_PLAN_RECORDS,
      siteId,
      purchaseDate: dayjs().toDate(),
      expiryDate: dayjs().add(2, 'week').toDate(),
      app: SubscriptionPlanApp.FLOWCLASS,
    }

    const listOfPlans = SUBSCRIPTION_PLANS.filter((p) => p.inTrial)
    const plans = await this.subscriptionPlansRepository.find({
      where: {
        name: In(listOfPlans.map((p) => p.name)),
      },
    })
    trialPlan.planIds = plans.map((p) => p.id)

    return this.subscriptionPlanRecordsRepository.save(trialPlan)
  }

  // Helper method to populate plans for a subscription plan record
  private async populatePlansForRecord(
    record: SubscriptionPlanRecordsEntity,
    withProductPrices?: boolean
  ): Promise<void> {
    if (record.planIds && record.planIds.length > 0) {
      record.plans = await this.subscriptionPlansRepository.find({
        where: { id: In(record.planIds) },
        relations: { stripeProductPrices: withProductPrices },
      })
    } else {
      record.plans = []
    }
  }

  // Helper method to populate plans for multiple records
  private async populatePlansForRecords(records: SubscriptionPlanRecordsEntity[]): Promise<void> {
    for (const record of records) {
      await this.populatePlansForRecord(record)
    }
  }

  // Utility to deeply merge plan records
  combinePlans(plans: SubscriptionPlanRecordsEntity[]): SubscriptionPlanRecordsEntity {
    if (!plans.length) return {} as SubscriptionPlanRecordsEntity
    // Start with a shallow copy of the first plan
    const result = { ...plans[0] } as Record<string, unknown>
    for (let i = 1; i < plans.length; i++) {
      const plan = plans[i]
      Object.keys(plan).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(plan, key)) return
        const value = plan[key as keyof SubscriptionPlanRecordsEntity]
        const prev = result[key]
        if (typeof value === 'number' && typeof prev === 'number') {
          result[key] = prev + value
        } else if (typeof value === 'boolean' && typeof prev === 'boolean') {
          result[key] = prev || value
        } else if (
          typeof value === 'object' &&
          value &&
          prev &&
          !Array.isArray(value) &&
          !Array.isArray(prev)
        ) {
          // Recursively merge objects
          result[key] = this.combinePlans([prev, value] as SubscriptionPlanRecordsEntity[])
        } else if (prev === undefined) {
          result[key] = value
        }
        // If types mismatch or not handled, keep the first non-undefined value
      })
    }
    return result as unknown as SubscriptionPlanRecordsEntity
  }

  async cancelSubscription(siteId: number) {
    const currentRecord = await this.getActivePlan(siteId)
    if (!currentRecord?.stripeSubscriptionId) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
    await this.stripeClient.subscriptions.cancel(currentRecord.stripeSubscriptionId, {
      expand: ['latest_invoice.payment_intent'],
    })
    await this.subscriptionPlanRecordsRepository.delete({ id: currentRecord.id })
  }

  public async updatePlanRecordSucceed(payload: {
    siteId: number
    plans: UpgradePlanRequestSinglePlanV2[]
    totalPrice?: number
    currency?: string
    stripeSubscriptionId?: string
    isDowngradeAction?: boolean
  }) {
    const record = await this.getSubscriptionPlanRecordWithPlans(payload.siteId, true)
    if (!record) {
      throw new BadRequestException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }

    for (const planDto of payload.plans) {
      // Find plan with the same type with the same planId
      const plan = await this.subscriptionPlansRepository.findOne({
        where: { id: planDto.planId },
        relations: ['stripeProductPrices'],
      })
      if (!plan) {
        throw new BadRequestException(PlanErrorMessage.INVALID_PLAN)
      }
      const planWithSameType = await this.subscriptionPlansRepository.findOneBy({
        type: plan.type,
        id: In(record.planIds),
      })
      if (!planWithSameType) {
        throw new BadRequestException(PlanErrorMessage.INVALID_PLAN)
      }

      this.updateRelatedPropertySubscriptionPlanRecord(
        record,
        planDto,
        [plan],
        payload.isDowngradeAction
      )
      if (!ALWAYS_ONE_QUANTITY_PLANS.includes(plan.type)) {
        record.planIds = record.planIds.filter((id) => id !== planWithSameType.id)
      }
      if (payload.isDowngradeAction) {
        // For downgrade, we need to remove the planId if it exists
        record.planIds = record.planIds.filter((id) => id !== planDto.planId)
      } else {
        record.planIds.push(planDto.planId)
      }
    }
    record.planIds = Array.from(new Set(record.planIds))
    record.totalPrice = payload.totalPrice || record.totalPrice
    record.currency = payload.currency || record.currency
    return this.subscriptionPlanRecordsRepository.save(record)
  }

  async getPaymentHistory(siteId: number) {
    const connectStripeAccount = await this.stripeConnectAccountRepository.findOne({
      where: { siteId },
    })
    if (!connectStripeAccount?.customerId) {
      throw new NotFoundException(PlanErrorMessage.STRIPE_CONNECT_ACCOUNT_NOT_FOUND)
    }
    const activePlan = await this.getActivePlan(siteId)
    if (!activePlan?.stripeSubscriptionId) {
      throw new NotFoundException(PlanErrorMessage.SUBSCRIPTION_PLAN_RECORD_NOT_FOUND)
    }
    // Fetch the last 10 invoices for the subscription
    return this.stripeClient.invoices.list({
      limit: 10,
      subscription: activePlan.stripeSubscriptionId,
      customer: connectStripeAccount.customerId,
    })
  }
}
