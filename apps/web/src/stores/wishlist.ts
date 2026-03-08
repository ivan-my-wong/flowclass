import { atom } from 'recoil'

import ATOM_KEY from '@/constants/atomKey'
import CourseDetail from '@/entities/CourseDetail'
import {
  Class,
  CourseWithQuotaValueClasses,
  PeriodLesson,
  RecurringSchedule,
  RegularPeriod,
  School,
} from '@/types'
import { BundleTable } from '@/types/bundleDiscount'
import { InvoiceState, Tuition } from '@/types/enrol'

import { EnrolState } from './enrol'

// for any fields, will defined later

export type SelectedClassDataState = {
  selectedClass?: Class

  selectedRegularPeriod?: RegularPeriod
  selectedLessons?: PeriodLesson[]

  selectedRecurSchedule?: RecurringSchedule
  selectedRecurLessons?: string[]
}

export type EnrolPromotion = {
  couponCode?: string
  bundleDiscountId?: number
  bundleDiscountTable?: BundleTable
}

export const defaultTuition: Tuition = {
  feePerLesson: -1,
  couponDiscount: 0,
  directDiscount: 0,
  bundleDiscount: 0,
  recurringDiscount: 0,
  totalDiscount: 0,
  originalFee: -1,
  paymentAmount: -1,
  currency: 'USD',
}

export const defaultInvoiceState: InvoiceState = {
  id: -1,
  numberOfLesson: -1,
  feePerLesson: -1,
  originalFee: -1,
  additionalFee: -1,
  couponDiscount: 0,
  directDiscount: 0,
  bundleDiscount: 0,
  recurringDiscount: 0,
  totalDiscount: 0,
  paymentAmount: -1,
  currency: '',
  discountInfo: [],
  numOfApplicant: 1,
  // bundleDiscountId: 0,
  // couponCode: '',
}

export type WishlistItem = {
  id: string
  courseId: number
  course: CourseWithQuotaValueClasses
  school: School
  enrollForm: EnrolState
  courseDetail: CourseDetail
  registrationForm: Record<string, any>[]
}

export type WishlistState = {
  wishlistItems: WishlistItem[]
  currentStep: number
  currentEnrolForm: EnrolState | undefined
  currentCourse: CourseWithQuotaValueClasses | undefined
}

export const defaultWishlistState: WishlistState = {
  wishlistItems: [],
  currentStep: 0,
  currentEnrolForm: undefined,
  currentCourse: undefined,
}

const localStorage = typeof window !== 'undefined' ? window.localStorage : null

const localStorageEffect =
  (key: string) =>
  ({ setSelf, onSet }: { setSelf: (value: any) => void; onSet: (value: any) => void }) => {
    const savedValue = localStorage?.getItem(key)
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue))
    }
    onSet((newValue: any) => {
      localStorage?.setItem(key, JSON.stringify(newValue))
    })
  }

export const wishlistState = atom<WishlistState>({
  key: ATOM_KEY.wishlistState,
  default: defaultWishlistState,
  effects_UNSTABLE: [localStorageEffect('wishlist')],
})
