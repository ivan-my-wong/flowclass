import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { BundleDiscount } from '../types/bundleDiscounts'
import { Coupon } from '../types/coupon'

import { persistLocalStorage } from './utils/recoilPersist'

type PromotionState = {
  coupons: Coupon[]
  currentCoupon: Coupon | null
  bundleDiscounts: BundleDiscount[]
  currentBundleDiscount: BundleDiscount | null
  initFetch: boolean
}

const defaultPromotionState: PromotionState = {
  coupons: [],
  currentCoupon: null,
  bundleDiscounts: [],
  currentBundleDiscount: null,
  initFetch: false,
}

export const promotionState = atom<PromotionState>({
  key: ATOM_KEY.PromotionState,
  default: defaultPromotionState,
  effects: [persistLocalStorage],
})
