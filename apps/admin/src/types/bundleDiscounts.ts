import { DiscountType } from './coupon'

export type BundleDiscountDeprecated = {
  id: number
  siteId: number
  institutionId: number
  courseId: number
  discountType: DiscountType
  bundleTable: BundleTable
  startDate: Date
  endDate: Date
}

export type BundleDiscount = {
  id: number
  createdAt: string
  updatedAt: string
  createdBy: number | null
  updatedBy: number | null
  siteId: number
  institutionId: number
  name: string
  discountType: DiscountType
  amount: number
  minQty: number
  bundleTable: BundleTable | null
  isAutoApply: boolean
  isRetroactive: boolean
  isAllItems: boolean
  applicableItemIds: number[] | null
  startDate: string // ISO string from API
  endDate: string // ISO string from API
  isActive: boolean
  isStackable: boolean
}

export type CreateBundleDiscountDtoDeprecated = {
  siteId: number
  institutionId: number
  courseId: number
  discountType: DiscountType
  bundleTable: BundleTable
}

export type CreateBundleDiscountDto = {
  siteId: number
  institutionId: number
  name: string
  discountType: DiscountType
  minQty: number
  amount: number
  bundleTable: BundleTable
  isAllItems: boolean
  applicableItemIds: number[] | null
  isAutoApply: boolean
  isRetroactive: boolean
  startDate: Date
  endDate: Date
}

export type BundleTableCell = {
  amount: number
  discount: number
}

export type BundleTable = BundleTableCell[]

export type CheckEligibleDto = {
  bundleId: number
  userAliasIds?: number[]
}
