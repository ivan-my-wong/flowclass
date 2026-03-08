import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { findLast } from 'lodash'

import {
  MetaRef,
  StudentConfirmEnrollDto,
  StudentEnrollCoursePricingInfo,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { StudentGetAdditionalFeeDto } from '@/application/student/enroll-courses/dto/enroll-course-pagination.dto'
import { EnrollCourseErrorMessage } from '@/exceptions/error-message/course'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { AdditionalFeeRepository } from '@/models/additional-fee.entity'
import { BundleDiscountsRepository } from '@/models/bundle-discounts.repository'
import { ClassPriceOption } from '@/models/class-price-options.entity'
import { ClassPriceOptionRepository } from '@/models/class-price-options.repository'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import {
  AdditionalFeeConditions,
  DiscountType,
  PriceType,
  PromotionType,
  STRIPE_CURRENCY,
} from '@/models/enums/'
import { CouponStatus, EnrollConfirmStatus } from '@/models/enums/status'
import { SitesRepository } from '@/models/sites.repository'

import { CouponsService } from './coupons.service'
import { UsersService } from './users.service'

@Injectable()
export class PaymentService {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly sitesRepository: SitesRepository,
    private readonly bundleDiscountsRepository: BundleDiscountsRepository,
    private readonly additionalFeeRepository: AdditionalFeeRepository,
    private readonly usersService: UsersService,
    private readonly priceOptionRepository: ClassPriceOptionRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository
  ) {}

  /**
   * TODO: calculate pay amount an return
   * @param confirmEnrollDto
   * @returns
   */
  async calculateDiscountedPrice({
    dto,
    meta = null,
    enrolToken,
    priceType = PriceType.PER_LESSON,
  }: {
    dto: StudentConfirmEnrollDto
    meta: MetaRef | null
    enrolToken?: string
    priceType?: PriceType
  }): Promise<StudentEnrollCoursePricingInfo> {
    if (!meta) {
      throw new BadRequestException(EnrollCourseErrorMessage.META_NOT_FOUND)
    }
    // Quantity is for number of classes, while lessonCount is the number of lessons in the total enrollment
    const totalFee = dto.price

    // get all discount
    const discounts = await this.getAllAppliedDiscounts({
      dto,
      meta,
      numOfClasses: dto.numOfClasses ?? 1,
      totalFee,
      lessonQuantity: dto.lessonCount,
      enrolToken,
    })

    // declare variable for calculate discount
    let directDiscount = 0,
      bundleDiscount = 0,
      recurringDiscount = 0,
      couponDiscount = 0

    // calculate total fee before apply discount

    // calculate other type of discount
    if (discounts.couponDiscount) {
      couponDiscount = discounts.couponDiscount // Do some calculation
    }
    if (discounts.directDiscount) {
      directDiscount = discounts.directDiscount // Do some calculation
    }
    if (discounts.bundleDiscount) {
      bundleDiscount = discounts.bundleDiscount // Do some calculation
    }
    if (discounts.recurringDiscount) {
      recurringDiscount = 0 // Do some calculation
    }

    // total discount amount
    let totalDiscount = directDiscount + bundleDiscount + recurringDiscount + couponDiscount

    // summary discount info
    const infos = []
    if (directDiscount > 0) {
      infos.push(PromotionType.DIRECT_DISCOUNT)
    }
    if (bundleDiscount > 0) {
      infos.push(PromotionType.BUNDLE_DISCOUNT)
    }
    if (recurringDiscount > 0) {
      infos.push(PromotionType.RECURRING_DISCOUNT)
    }
    if (couponDiscount > 0) {
      infos.push(PromotionType.COUPON_DISCOUNT)
    }
    const discountInfo = infos.join('\n')

    const currentSite = await this.sitesRepository.findOneById(dto.siteId)

    if (!currentSite) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }

    const currency = currentSite.currency

    if (
      ([STRIPE_CURRENCY.KRW, STRIPE_CURRENCY.VND, STRIPE_CURRENCY.JPY] as string[]).includes(
        currency
      )
    ) {
      totalDiscount = Math.round(totalDiscount)
    }

    // price after apply discount
    let afterDiscount = totalFee - totalDiscount
    if (afterDiscount < 0) {
      afterDiscount = 0
      totalDiscount = totalFee
    }
    // inspect original fee per lesson
    const selectedPriceOption = await this.priceOptionRepository.findOneBy({
      classId: meta?.classId,
      id: meta.priceOptionId,
    })
    // everything is okay
    return plainToInstance(StudentEnrollCoursePricingInfo, {
      classId: meta?.classId,
      periodId: meta?.periodId,
      numberOfLesson: dto.lessonCount,
      feePerLesson: this.calculateFeePerLesson(
        priceType,
        afterDiscount,
        dto.lessonCount,
        selectedPriceOption
      ),
      originalFee: +dto.price * +dto.numOfApplicant,

      additionalFee: 0,
      discountInfo,
      couponDiscount,
      directDiscount,
      bundleDiscount,
      recurringDiscount,
      totalDiscount,
      paymentAmount: +afterDiscount * +dto.numOfApplicant,
      currency,
      numOfApplicant: dto.numOfApplicant,
    })
  }

  calculateFeePerLesson(
    priceType: PriceType,
    afterDiscount: number,
    lessonCount: number,
    selectedPriceOption: ClassPriceOption
  ): number {
    switch (priceType) {
      case PriceType.PER_LESSON:
        return lessonCount > 0 ? afterDiscount / lessonCount : 0
      case PriceType.PER_CLASS:
        return afterDiscount
      case PriceType.MULTIPLE_OPTIONS:
        return selectedPriceOption?.amount ?? afterDiscount
      default:
        return afterDiscount
    }
  }

  async getAllAdditionalFee(
    additionalFeeDto: StudentGetAdditionalFeeDto
  ): Promise<Record<string, number | string>> {
    const { applicants, siteId, institutionId, courseId } = additionalFeeDto
    if (applicants.length <= 0) return

    const additionalFee = await this.additionalFeeRepository.findBy({
      institutionId,
      siteId,
    })

    if (!additionalFee || additionalFee.length === 0) return

    const totalFee = { [AdditionalFeeConditions.NEW_STUDENT]: 0, newStudentCount: 0, label: '' }

    const enrollCoursesWithPaidApplicants = await Promise.all(
      applicants.map(async (d) => {
        return await this.enrollCourseRepository.findOneBy({
          email: d.email,
          phone: d.phone,
          siteId,
          institutionId,
          confirmState: EnrollConfirmStatus.ACCEPTED,
        })
      })
    )
    const onlyNullData = enrollCoursesWithPaidApplicants.filter(
      (data) => data === null || typeof data === 'undefined'
    )
    totalFee['newStudentCount'] = onlyNullData.length

    for (const fee of additionalFee) {
      if (fee.status !== CouponStatus.ACTIVE) continue
      if (!fee?.courseIds?.includes(courseId)) continue

      if (fee.condition === AdditionalFeeConditions.NEW_STUDENT && onlyNullData.length > 0) {
        // apply fee
        totalFee[AdditionalFeeConditions.NEW_STUDENT] += fee.amount * onlyNullData.length
      }
      totalFee['label'] = fee.name
    }

    return totalFee
  }

  async getAllAppliedDiscounts({
    dto,
    meta,
    totalFee,
    numOfClasses,
    lessonQuantity,
    enrolToken,
  }: {
    dto: StudentConfirmEnrollDto
    meta: MetaRef
    totalFee: number
    numOfClasses: number
    lessonQuantity: number
    enrolToken?: string
  }) {
    let bundleDiscount = 0,
      couponDiscount = 0

    // check coupon code
    let couponCheck = null
    let coupon = null
    if (dto.coupon) {
      couponCheck = await this.couponsService.isCouponValid({
        couponCode: dto.coupon,
        enrolToken,
        institutionId: dto.institutionId,
      })
      if (!couponCheck.valid) {
        throw new BadRequestException(`Coupon is invalid: ${couponCheck.message}`)
      }
      coupon = couponCheck.coupon
      if (meta) meta.coupon = coupon

      if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
        couponDiscount = coupon.amount
      } else if (coupon.discountType === DiscountType.PERCENTAGE) {
        couponDiscount = (coupon.amount / 100) * totalFee
      } else {
        throw new Error('coupon discount type is invalid: ' + coupon.discountType)
      }
    }

    // Only applicable to multiple classes
    if (meta && meta.bundleId && numOfClasses) {
      const bundle = await this.bundleDiscountsRepository.findOneBy({
        id: meta.bundleId,
      })

      if (bundle) {
        if (bundle.discountType === DiscountType.FIXED_AMOUNT) {
          bundleDiscount =
            (findLast(bundle.bundleTable, (bundle) => bundle.amount <= numOfClasses)?.discount ??
              0) * lessonQuantity
        } else if (bundle.discountType === DiscountType.PERCENTAGE) {
          const bundlePercentage = findLast(
            bundle.bundleTable,
            (bundle) => bundle.amount <= numOfClasses
          )?.discount
          bundleDiscount = ((totalFee * bundlePercentage) / 100) * lessonQuantity
        }
      }
    }

    return {
      directDiscount: meta?.directDiscount ?? 0,
      couponDiscount,
      bundleDiscount,
      recurringDiscount: null,
    }
  }

  combinePricingInfoArrayToPricingInfo(
    pricingInfo: StudentEnrollCoursePricingInfo[]
  ): StudentEnrollCoursePricingInfo {
    if (!pricingInfo) return null
    if (pricingInfo.length === 0) return pricingInfo[0]
    const totalNumOfLesson = this.sumIfArray(pricingInfo, 'numberOfLesson')
    const totalPaymentAmount = this.sumIfArray(pricingInfo, 'paymentAmount')
    const discountAmount = this.sumIfArray(pricingInfo, 'totalDiscount')
    const additionalFee = this.sumIfArray(pricingInfo, 'additionalFee')
    const originalFee = this.sumIfArray(pricingInfo, 'originalFee')
    const couponDiscount = this.sumIfArray(pricingInfo, 'couponDiscount')
    const directDiscount = this.sumIfArray(pricingInfo, 'directDiscount')
    const bundleDiscount = this.sumIfArray(pricingInfo, 'bundleDiscount')
    const recurringDiscount = this.sumIfArray(pricingInfo, 'recurringDiscount')
    const numOfApplicant = this.sumIfArray(pricingInfo, 'numOfApplicant')

    const commonItems = pricingInfo
      .map((info) => info.discountInfo.split(','))
      .reduce((common, current) => common.filter((item) => current.includes(item)))

    const discountInfo = commonItems.join(',')

    const pricingInfoObject = {
      courseId: pricingInfo[0].courseId,
      classId: pricingInfo[0].classId,
      numberOfLesson: totalNumOfLesson,
      feePerLesson: totalPaymentAmount / totalNumOfLesson,
      originalFee,
      additionalFee,
      discountInfo,
      couponDiscount,
      directDiscount,
      bundleDiscount,
      recurringDiscount,
      totalDiscount: discountAmount,
      paymentAmount: totalPaymentAmount,
      currency: pricingInfo[0].currency,
      numOfApplicant,
    }

    return plainToInstance(StudentEnrollCoursePricingInfo, pricingInfoObject)
  }

  sumIfArray(array: any[] | any, key: string) {
    if (Array.isArray(array)) {
      return array.reduce((a, b) => a + b[key], 0)
    }
    return array[key]
  }
}
