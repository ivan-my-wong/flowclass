import { DiscountType } from './coupon'

export type BundleDiscount = {
  id: number
  siteId: number
  institutionId: number
  courseId: number
  discountType: DiscountType
  bundleTable: BundleTable
}

export type BundleTable = {
  amount: number
  discount: number
}[]
