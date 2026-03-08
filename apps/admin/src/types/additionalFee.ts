import { CouponStatusEnum, DiscountType } from './coupon'

export type AdditionalFee = {
  id: number
  siteId: number
  institutionId: number
  name: string
  feeType: DiscountType
  amount: number
  status: CouponStatusEnum
  condition: AdditionalFeeConditions
  courseIds: number[]
}

export enum AdditionalFeeConditions {
  NEW_STUDENT = 'NEW_STUDENT',
  ALWAYS = 'ALWAYS',
}
