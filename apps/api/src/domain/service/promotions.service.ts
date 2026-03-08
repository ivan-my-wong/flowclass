import { Injectable } from '@nestjs/common'

import { CheckPossiblePromotionsDto } from '@/application/admin/promotions/dto/promotion-detail.dto'
import { Coupon } from '@/models/coupons.entity'
import { CouponsRepository } from '@/models/coupons.repository'
import { Institution } from '@/models/institutions.entity'

import { CouponsService } from './coupons.service'

@Injectable()
export class PromotionsService {
  constructor(
    private readonly couponsRepository: CouponsRepository,
    private readonly couponService: CouponsService
  ) {}

  async countByType(id: number): Promise<any> {
    const coupons = await this.couponsRepository
      .createQueryBuilder('coupon')
      .where('coupon.institution_id = :institution_id', {
        institution_id: id,
      })
      .select('COUNT(coupon.id)', 'coupon.id')
      .getRawMany()

    return coupons
  }

  async checkPossiblePromotions(
    institution: Institution,
    checkPromotionDto: CheckPossiblePromotionsDto
  ): Promise<Coupon[]> {
    const { userId, classId } = checkPromotionDto
    // Implement your logic to check possible promotions based on the provided IDs
    const coupons = await this.couponService.getCoupons({
      userId,
      institutionId: institution.id,
      siteId: institution.siteId,
    })
    return coupons.filter((coupon) => {
      if ((coupon.classIds || []).length <= 0) return true
      return coupon.classIds.includes(classId)
    })
  }
}
