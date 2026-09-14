import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import Stripe from 'stripe'
import { In } from 'typeorm'

import { SubscribePresetPlansDto } from '@/application/admin/subscription-plans/dto/preset-plans.dto'
import { PresetPlansMap } from '@/common/constants/preset-plans'
import { STRIPE_CLIENT, STRIPE_CONFIG_URL } from '@/common/constants/provider-keys'
import { PlanErrorMessage } from '@/exceptions/error-message/subscription-plan.error'
import { StripeConfigUrl } from '@/models/custom-types/stripe'
import { StripeCheckoutSessionType, StripePriceInterval } from '@/models/enums'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'
import { StripeProductPricesRepository } from '@/models/stripe-product-prices.repository'
import { SubscriptionPlanRecordsRepository } from '@/models/subscription-plan-records.entity'
import { SubscriptionPlanApp } from '@/models/subscription-plans.entity'
import {
  PresetPlansPrice,
  SubscriptionPresetPlanEntity,
} from '@/models/subscription-preset-plans.entity'
import { SubscriptionPresetPlansRepository } from '@/models/subscription-preset-plans.repository'

@Injectable()
export class SubscriptionPresetPlansService {
  private readonly logger = new Logger(SubscriptionPresetPlansService.name)
  constructor(
    private readonly subscriptionPresetPlansRepository: SubscriptionPresetPlansRepository,
    private readonly subscriptionPlanRecordRepository: SubscriptionPlanRecordsRepository,
    private readonly stripeConnectAccountRepository: StripeConnectRepository,
    private readonly stripeProductPricesRepository: StripeProductPricesRepository,
    @Inject(STRIPE_CLIENT)
    public readonly stripeClient: Stripe,
    @Inject(STRIPE_CONFIG_URL)
    private readonly stripeConfigUrl: StripeConfigUrl
  ) {}
  getPresetPlans(): Promise<SubscriptionPresetPlanEntity[]> {
    return this.subscriptionPresetPlansRepository.findAll()
  }

  async generateCheckoutSession(
    presetPlanId: number,
    price: PresetPlansPrice,
    stripeConnect: StripeConnect,
    siteId: number,
    institutionId: number
  ): Promise<Stripe.Checkout.Session> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: price.stripePriceId,
        quantity: 1,
      },
    ]
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      customer: stripeConnect.customerId,
      success_url: this.stripeConfigUrl.successUrl,
      cancel_url: this.stripeConfigUrl.cancelUrl,
      metadata: {
        type: StripeCheckoutSessionType.SUBSCRIPTION_PRESET_PLAN_EVENT,
        siteId: siteId.toString(),
        presetPlanId: presetPlanId.toString(),
        institutionId: institutionId.toString(),
        interval: price.interval,
        currency: price.currency,
      },
    }

    return this.stripeClient.checkout.sessions.create(sessionParams)
  }

  async createPresetSubscription(dto: SubscribePresetPlansDto) {
    const { siteId, institutionId, presetPlanId } = dto
    const presetPlan = await this.subscriptionPresetPlansRepository.findOneBy({
      id: presetPlanId,
    })
    if (!presetPlan) {
      throw new NotFoundException(PlanErrorMessage.PRESET_PLAN_NOT_FOUND)
    }
    const selectedPrice = presetPlan.prices.find((price) => price.stripePriceId === dto.priceId)
    if (!selectedPrice) {
      throw new NotFoundException(PlanErrorMessage.PRESET_PLAN_PRICE_NOT_FOUND)
    }
    const stripeConnectAccount = await this.stripeConnectAccountRepository.findOne({
      where: {
        siteId,
        institutionId,
      },
    })
    if (!stripeConnectAccount?.customerId) {
      throw new BadRequestException(PlanErrorMessage.STRIPE_CONNECT_ACCOUNT_NOT_FOUND)
    }

    const session = await this.generateCheckoutSession(
      presetPlanId,
      selectedPrice,
      stripeConnectAccount,
      siteId,
      institutionId
    )
    return session
  }
  groupSubscriptionItems(items: Stripe.SubscriptionCreateParams.Item[]) {
    return items.reduce((acc, item) => {
      const key = `${item.price}:${item.quantity}`
      if (!acc[key]) {
        acc[key] = { price: item.price, metadata: item.metadata, quantity: 0 }
      }
      acc[key].quantity += item.quantity
      return acc
    }, {} as Record<string, { price: string; metadata: Stripe.MetadataParam; quantity: number }>)
  }

  async processSubscriptionPresetPlanAfterPayment(session: Stripe.Checkout.Session) {
    const { presetPlanId, currency, interval, siteId, institutionId } = session.metadata
    if (!presetPlanId || !currency || !interval || !siteId || !institutionId) {
      this.logger.warn('Checkout session completed without required metadata')
      return
    }
    const presetPlan = await this.subscriptionPresetPlansRepository.findOneById(+presetPlanId)
    if (!presetPlan) {
      this.logger.warn('Checkout session completed with unknown presetPlanId')
      return
    }
    // Create Stripe Subscription without payment
    const mapPresetPlan = PresetPlansMap.get(presetPlan.name)
    if (!mapPresetPlan) return
    const productPrices = await this.stripeProductPricesRepository.find({
      where: {
        lookupKey: In(mapPresetPlan),
        interval: interval as StripePriceInterval,
        currency: currency.toLowerCase(),
      },
    })
    let subscriptionPlanRecord = await this.subscriptionPlanRecordRepository.findOneBy({
      siteId: +siteId,
    })

    const stripeConnectAccount = await this.stripeConnectAccountRepository.findOne({
      where: {
        siteId: +siteId,
        institutionId: +institutionId,
      },
    })
    if (!stripeConnectAccount?.customerId) {
      throw new BadRequestException(PlanErrorMessage.STRIPE_CONNECT_ACCOUNT_NOT_FOUND)
    }
    if (!subscriptionPlanRecord) {
      const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = productPrices.map(
        (price) => ({
          price: price.stripePriceId,
          metadata: {
            unitAmount: price.unitAmount,
          },
          quantity: 1,
        })
      )
      const groupedItems = this.groupSubscriptionItems(subscriptionItems)
      // Create subscription with invoice to be paid later

      const purchaseDate = dayjs().toDate()
      const expiryDate = dayjs()
        .add(1, interval as dayjs.ManipulateType)
        .toDate()
      const daysCounts = dayjs(expiryDate).diff(dayjs(purchaseDate), 'day')

      const selectedPrice = presetPlan.prices.find(
        (d) => d.currency === currency && d.interval === interval
      )
      // Calculate total amount from subscription items
      const totalAmount = Object.values(groupedItems).reduce((sum, item) => {
        return sum + (Number(item.metadata?.unitAmount) ?? 0) * item.quantity
      }, 0)
      const presetDiscount = totalAmount - (selectedPrice?.price ?? 0)
      const discounts: Stripe.SubscriptionCreateParams.Discount[] = []
      let coupon: Stripe.Coupon
      if (presetDiscount > 0) {
        coupon = await this.stripeClient.coupons.create({
          amount_off: presetDiscount * 100,
          duration: 'forever',
          currency: currency.toLowerCase(),
        })
        discounts.push({ coupon: coupon.id })
      }
      const stripeSubscription = await this.stripeClient.subscriptions.create({
        customer: stripeConnectAccount.customerId,
        items: Object.values(groupedItems),
        currency: currency.toLowerCase(),
        discounts,
        collection_method: 'send_invoice',
        days_until_due: daysCounts,
        expand: ['latest_invoice'],
      })

      // Get final amount either from invoice or calculated total
      this.logger.debug(`Subscription amount: ${totalAmount / 100} ${currency}`)

      // Find the matching price from preset plan
      subscriptionPlanRecord = this.subscriptionPlanRecordRepository.create({
        siteId: +siteId,
        adminQuantity: presetPlan.adminQuantity,
        notificationQuantity: presetPlan.notificationQuantity,
        tutorQuantity: presetPlan.tutorQuantity,
        baseUserQuantity: presetPlan.baseUserQuantity,
        classTypeEnable: presetPlan.classTypeEnable,
        customerSupportTier: presetPlan.customerSupportTier,
        featureEnable: presetPlan.featureEnable,
        promotionTier: presetPlan.promotionTier,
        notificationChannels: presetPlan.notificationChannels,
        integration: presetPlan.integration,
        planIds: productPrices.map((price) => price.planId),
        stripeSubscriptionId: stripeSubscription.id,
        app: SubscriptionPlanApp.FLOWCLASS,
        currency: currency.toLowerCase(),
        totalPrice: selectedPrice?.price ?? 0,
      })
      subscriptionPlanRecord.purchaseDate = purchaseDate
      subscriptionPlanRecord.expiryDate = expiryDate
      subscriptionPlanRecord.presetCouponId = coupon?.id ?? undefined
      subscriptionPlanRecord.presetDiscount = Math.max(presetDiscount, 0)
      await this.subscriptionPlanRecordRepository.save(subscriptionPlanRecord)
    }
  }
}
