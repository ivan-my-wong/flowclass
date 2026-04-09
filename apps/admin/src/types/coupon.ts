import { DynamicTypeSelectorItemProps } from '@/components/Selector/Select'

export enum CouponStatusEnum {
  active = 'ACTIVE',
  inActive = 'INACTIVE',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixedAmount',
}

export enum CouponTypeHistoryEnum {
  CREATE_COUPON = 'CREATE_COUPON',
  USAGE_COUPON = 'USAGE_COUPON',
  INACTIVE_COUPON = 'INACTIVE_COUPON',
}

export enum PromotionType {
  BUNDLE_DISCOUNT = 'BUNDLE_DISCOUNT',
  DIRECT_DISCOUNT = 'DIRECT_DISCOUNT',
  COUPON_DISCOUNT = 'COUPON_DISCOUNT',
  RECURRING_DISCOUNT = 'RECURRING_DISCOUNT',
  TRIAL_LESSON = 'TRIAL_LESSON',
  ADDITIONAL_FEE = 'ADDITIONAL_FEE',
  REFERRAL_DISCOUNT = 'REFERRAL_DISCOUNT',
  PACKAGE_DISCOUNT = 'PACKAGE_DISCOUNT',
}

export type StudentProps = {
  id: number
  email: string
  phone?: string
  couponCode: string
  educatorId: number
  firstName: string | null
  lastName: string | null
}
export type ClassProps = {
  checked: boolean | null
  id: number
  name: string
  createdAt: string
  originalFee: number
  payAmount: number
  currency: string
  startTime?: string
  endTime?: string
}
export type CourseProps = {
  checked: boolean | null
  id: number
  name: string
  type: string
  previewImageName: string | null
  previewImageUrl: string | null
  classes: ClassProps[]
}

export type Coupon = {
  id?: number
  siteId: number
  institutionId: number
  code: string
  discountType: DiscountType
  quota: number
  amount: number
  courseIds: number[]
  // The coupon may not expire
  expireDate?: Date
  userIds?: number[]

  status: string
  studentsAssigned: StudentProps[]
  courseAssigned: CourseProps[]
  classIds: number[]

  // For history
  usedCount: number
  usage: number
}

export type CreateCouponProps = {
  courseIds?: number[]
  userIds?: number[]
  emailNotifyOn?: boolean
  classIds: number[]
  institutionId: number
  code: string
  discountType: string
  quota: number
  amount: number
  expireDate: Date
}
export type TagProps<T> = Array<
  DynamicTypeSelectorItemProps<T> & {
    id: number
    customize: boolean
  }
>

export type CourseAndStudentProps = {
  listStudent: StudentProps[]
  listCourse: CourseProps[]
}

export type HistoryCouponProps = {
  id: number
  type: string
  detail: {
    couponCode: string
    educatorId: number
    educatorLastName: string | null
    educatorFirstName: string | null
    updateBy: {
      id: number
      name: string
    }

    studentName: string
    courseName: string
    usedStatus: string
    modifiedDate: string
  }
  createdAt: Date
}

export enum PromotionUsedStatus {
  REDEEMED = 'REDEEMED',
  USED = 'USED',
}
