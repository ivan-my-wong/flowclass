import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import Stripe from 'stripe'
import { FindOptionsOrder, FindOptionsWhere, In } from 'typeorm'

import { getAllPlanPricesReponse } from '@/application/admin/stripe-product-prices/dto/get-all-plan-prices.dto'
import { StripeProductPricesDetailReponse } from '@/application/admin/stripe-product-prices/dto/stripe-product-prices.dto'
import {
  StripeProductPricesPageDto,
  StripeProductPricesPageOptionDto,
} from '@/application/admin/stripe-product-prices/dto/stripe-product-prices-pagination.dto'
import { STRIPE_CLIENT } from '@/common/constants/provider-keys'
import { ensureStripeConfigured } from '@/common/stripe-guard'
import { StripePlanPriceLookupKey, StripePriceInterval, StripePriceType } from '@/models/enums/'
import { StripeProductPricesEntity } from '@/models/stripe-product-prices.entity'
import { StripeProductPricesRepository } from '@/models/stripe-product-prices.repository'

@Injectable()
export class StripeProductPricesService {
  constructor(
    private readonly stripeProductPricesRepository: StripeProductPricesRepository,
    @Inject(STRIPE_CLIENT)
    private readonly stripeClient: Stripe | null
  ) {}

  private get stripe(): Stripe {
    ensureStripeConfigured(this.stripeClient)
    return this.stripeClient
  }

  async findAll(
    pageOptionsDto: StripeProductPricesPageOptionDto
  ): Promise<StripeProductPricesPageDto> {
    const whereCondition: FindOptionsWhere<StripeProductPricesEntity> = {}
    const orderOption: FindOptionsOrder<StripeProductPricesEntity> = {}

    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    return this.stripeProductPricesRepository.paginationWithTransform(
      pageOptionsDto,
      StripeProductPricesDetailReponse,
      whereCondition,
      orderOption
    )
  }

  async updatePlanPrice(id: number, price: number): Promise<Stripe.Price> {
    const existingPlan = await this.stripeProductPricesRepository.findOneBy({ id })
    if (!existingPlan) {
      throw new NotFoundException('Plan not found')
    }

    // Convert price to cents for Stripe
    const unitAmountInCents = Math.round(price * 100)

    // Create new price in Stripe (prices are immutable, so we create a new one)
    const stripePrice = await this.stripe.prices.create({
      product: existingPlan.stripeProductId,
      unit_amount: unitAmountInCents,
      currency: existingPlan.currency,
      recurring: existingPlan.interval ? { interval: existingPlan.interval } : undefined,
      lookup_key: existingPlan.lookupKey || undefined,
      metadata: {
        old_price_id: existingPlan.stripePriceId,
        updated_at: new Date().toISOString(),
      },
    })

    // The webhook will handle updating the database when Stripe sends the price.created event
    return stripePrice
  }

  async createOrUpdateStripeProductPrices(session: Stripe.Price): Promise<void> {
    const {
      id: stripePriceId,
      product: stripeProductId,
      unit_amount: unitAmount,
      currency,
      type,
      recurring,
      active,
      lookup_key: lookupKey = null,
    } = session
    const { interval = null, interval_count: intervalCount = null } = recurring || {}
    const stripeProductPrice = await this.stripeProductPricesRepository.findOneBy({
      stripePriceId: stripePriceId as string,
    })
    if (stripeProductPrice) {
      try {
        await this.stripeProductPricesRepository.update(
          {
            stripePriceId,
          },
          {
            unitAmount,
            currency,
            type: type as StripePriceType,
            interval: interval as StripePriceInterval,
            intervalCount,
            isActive: active,
            lookupKey,
          }
        )
      } catch (error) {
        console.error(error)
      }
    } else {
      const stripeProductPrice = this.stripeProductPricesRepository.create({
        stripePriceId,
        stripeProductId: stripeProductId as string,
        unitAmount,
        currency,
        type: type as StripePriceType,
        interval: interval as StripePriceInterval,
        intervalCount,
        isActive: active,
        lookupKey,
      })
      await this.stripeProductPricesRepository.save(stripeProductPrice)
    }
  }

  async deleteStripeProductPrices(session: Stripe.Price): Promise<void> {
    const { id: stripePriceId } = session
    const stripeProductPrice = await this.stripeProductPricesRepository.findOneBy({
      stripePriceId: stripePriceId as string,
    })
    if (stripeProductPrice) {
      await this.stripeProductPricesRepository.softDelete({ stripePriceId })
    }
  }

  async getAllPlanPrices(): Promise<getAllPlanPricesReponse[]> {
    const result = await this.stripeProductPricesRepository.find({
      where: {
        lookupKey: In(Object.values(StripePlanPriceLookupKey)),
      },
    })

    return plainToInstance(getAllPlanPricesReponse, result)
  }
}
