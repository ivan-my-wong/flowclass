import { atom } from 'recoil'

import ATOM_KEY from '@/constants/atomKey'
import { PriceOption } from '@/page-components/enrol/PickTimeSteps/PickPriceOptionStep'
import { Class, PeriodLesson, RecurringSchedule, RegularPeriod } from '@/types'
import { BundleTable } from '@/types/bundleDiscount'
import { InvoiceState, Tuition } from '@/types/enrol'
import { RegularScheduleLessonPreviewPeriodGroup } from '@/types/regularSchedule'
import { ClassTriaLessonResponse } from '@/types/trial-lesson'

// for any fields, will defined later

export type SelectedClassDataState = {
  selectedClass?: Class

  selectedRegularPeriod?: RegularPeriod
  selectedLessons?: PeriodLesson[]

  selectedRegularSchedulePreviewV2?: RegularScheduleLessonPreviewPeriodGroup[]

  selectedRecurSchedule?: RecurringSchedule
  selectedRecurLessons?: string[]
  selectedIndividualRecurLessons?: string[]

  selectedRecurSchedules?: RecurringSchedule[]

  selectedPriceOption?: PriceOption
}

export type EnrolPromotion = {
  couponCode?: string
  bundleDiscountId?: number
  bundleDiscountTable?: BundleTable
}

export type EnrolState = {
  currentStep: number

  selectedClassData: SelectedClassDataState[]
  currentSelectedClassIndex: number

  classTrialLesson?: ClassTriaLessonResponse
  setMultipleClass: boolean
  setMultipleApplicant: boolean

  FieldData?: Record<string, any>[]
  studentData: Record<string, any>

  promotion?: EnrolPromotion

  tuition: Tuition[]

  numberOfApplicant: number
}

export const defaultTuition: Tuition = {
  couponDiscount: 0,
  directDiscount: 0,
  bundleDiscount: 0,
  recurringDiscount: 0,
  totalDiscount: 0,
  originalFee: -1,
  paymentAmount: -1,
  currency: 'USD',
  feePerLesson: -1,
}

export const defaultEnrolState: EnrolState = {
  currentStep: 0,
  selectedClassData: [],
  currentSelectedClassIndex: 0,

  studentData: {},

  tuition: [],
  setMultipleClass: false,
  setMultipleApplicant: false,

  numberOfApplicant: 1,
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
  autoCouponApplied: false,
  // bundleDiscountId: 0,
  // couponCode: '',
}

export const enrolState = atom<EnrolState>({
  key: ATOM_KEY.enrolState,
  default: defaultEnrolState,
})

export const invoiceState = atom<InvoiceState>({
  key: ATOM_KEY.invoiceState,
  default: defaultInvoiceState,
})

export const prevSelectedOptionState = atom<EnrolState>({
  key: ATOM_KEY.prevSelectOption,
  default: defaultEnrolState,
})

export const invoicesState = atom<InvoiceState[]>({
  key: ATOM_KEY.invoicesState,
  default: [] as InvoiceState[],
  effects: [
    ({ onSet }) => {
      onSet(newValue => {
        if (!Array.isArray(newValue)) {
          console.error('invoicesState must be an array')
        }
      })
    },
  ],
})
