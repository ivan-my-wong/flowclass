// eslint-disable-next-line simple-import-sort/imports
import { SubscriptionPlan } from '@/models/subscription-plans.entity'
import { SubscriptionPlansRepository } from '@/models/subscription-plans.repository'

import { GetSubscriptionPlansDto } from '@/application/admin/subscription-plans/dto/subscription-plans-pagination.dto'
import { Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class PlansService {
  constructor(private readonly subscriptionPlansRepository: SubscriptionPlansRepository) {}

  async findAll(params?: GetSubscriptionPlansDto): Promise<SubscriptionPlan[]> {
    const where: any = {}
    if (params?.type) where.type = params.type
    if (params?.tier) where.tier = params.tier
    if (params?.isActive !== undefined) where.isActive = params.isActive
    if (params?.priceMode) where.priceMode = params.priceMode
    // interval is not a direct field on SubscriptionPlan, so we skip it here
    return this.subscriptionPlansRepository.find({
      where,
      relations: {
        stripeProductPrices: true,
      },
    })
  }

  async updateSubscriptionPlanBenefits(
    id: number,
    data: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansRepository.findOneBy({ id })
    if (!plan) {
      throw new NotFoundException('Plan not found')
    }
    return this.subscriptionPlansRepository.save({ ...plan, ...data })
  }
}
