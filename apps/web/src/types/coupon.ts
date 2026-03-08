export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixedAmount',
}

export enum PromotionType {
  BUNDLE_DISCOUNT = 'BUNDLE_DISCOUNT',
  DIRECT_DISCOUNT = 'DIRECT_DISCOUNT',
  COUPON_DISCOUNT = 'COUPON_DISCOUNT',
  RECURRING_DISCOUNT = 'RECURRING_DISCOUNT',
  TRIAL_LESSON = 'TRIAL_LESSON',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID',
}

export enum PromotionUsedStatus {
  REDEEMED = 'REDEEMED',
  CONFIRMED = 'CONFIRMED',
}

export type Coupon = {
  discountType: DiscountType
  amount: number
  code: string
  quota: number

  siteId: number
  institutionId: number
  courseIds: number[]

  forBundle: boolean
  forTrialLesson: boolean

  expireDate: Date
  status: CouponStatus
  userIds: number[]
}

export type CheckCouponResponse = {
  amountReduced: number
  subTotal: number
} & Coupon

/*
API Specs for Validating Coupon
*/

export type ValidateCouponDto = {
  enrolToken: string
  couponCode: string
  institutionId: number
  invoiceId?: number
}

export type ValidateCouponResponse = {
  valid: boolean
  message: string
  coupon: Coupon
}

export type CalculateCouponPriceDto = {
  couponCode: string
  courseId: number
  institutionId: number
  initialPrice: number
}

export type CalculateCouponPriceResponse = {
  couponPrice: number
  amountReduced: number
  coupon: Coupon
}

export type CoursePromotionUsed = {
  id: number
  couponId: number
  courseId: number

  enrollId: number
  institutionId: number
  invoiceId: number
  siteId: number
  studentId: number

  usedStatus: PromotionUsedStatus

  coupon: Coupon
}
