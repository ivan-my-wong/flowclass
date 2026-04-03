import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { BundleDiscount } from '../types/bundleDiscounts'
import { Coupon } from '../types/coupon'
import { PackageDiscount } from '../types/packageDiscounts'

import { persistLocalStorage } from './utils/recoilPersist'

type PromotionState = {
  coupons: Coupon[]
  currentCoupon: Coupon | null
  bundleDiscounts: BundleDiscount[]
  currentBundleDiscount: BundleDiscount | null
  packageDiscounts: PackageDiscount[]
  currentPackageDiscount: PackageDiscount | null
  initFetch: boolean
}

const defaultPromotionState: PromotionState = {
  coupons: [],
  currentCoupon: null,
  bundleDiscounts: [],
  currentBundleDiscount: null,
  packageDiscounts: [],
  currentPackageDiscount: null,
  initFetch: false,
}

export const promotionState = atom<PromotionState>({
  key: ATOM_KEY.PromotionState,
  default: defaultPromotionState,
  effects: [persistLocalStorage],
})
