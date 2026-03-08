import { CoursePromotionUsed } from './coupon'
import { Course } from './course'
import {
  EnrolCourseResponse,
  EnrollIntoInfo,
  PaymentDetailType,
  PaymentState,
  StudentSchedule,
} from './enrol'

export type PartialUser = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type InvoiceSplit = {
  description: string
  dueDate: string
  invoiceId: number
  percentage?: number
}

export type InvoiceResponse = {
  id: number
  siteId: number
  institutionId: number
  userId: number

  // There will be a list of user Ids if there are multiple applicants
  applicants?: PartialUser[]

  enrollId: number
  course: Course
  courseId: number

  payLaterMethod?: PaymentDetailType
  paymentMethod: string
  paymentState: PaymentState
  paymentLinkId: string
  paymentEvidenceId: string

  feePerLesson: number
  numOfLesson: number
  numOfApplicant: number
  originalFee: number
  payAmount: number
  currency: string

  payBy: string
  payById: number

  enrollInto?: EnrollIntoInfo[] | EnrollIntoInfo
  discounts: string
  discountAmount: number
  additionalFee: number | string

  usedBalance: number
  reviewed: boolean
  approvedBy?: string
  approverId?: number

  proofToken: string
  transactionId?: number

  enrollCourses: EnrolCourseResponse[]
  studentSchedules?: StudentSchedule[]
  documentCampaignId: number

  createdAt: string
  updatedAt: string
  promotionUsed?: CoursePromotionUsed

  adminDiscounts: AdminDiscount[]
  parentInvoice?: ParentInvoice
  isParent?: boolean
  splitType?: 'custom-split' | 'dual-split' | 'single'
  splitItems?: InvoiceSplit[]
}

export type ParentInvoice = {
  id: number
  paymentState: PaymentState
  payAmount: string
  splitItems: InvoiceSplit[]
  adminDiscounts: AdminDiscount[]
}

export type PromotionType = 'bundle' | 'coupon' | 'manual'
export type DiscountType = 'fixedAmount' | 'percentage'

export type AdminDiscount = {
  id: number | string | null
  name: string
  type: PromotionType
  discountType: DiscountType
  // absolute or percentage-based depending on discountType.
  feeType: 'add' | 'subtract'
  amount: number
  order?: number
  minQty?: number
}

export type AdminDiscountWithPrice = AdminDiscount & { discountPrice: number }

export type EnrolledClassAndPrice = {
  enrolledClasses: EnrollIntoInfo[]
  subtotalPrice: number
}

export type InvoiceDiscounts = {
  discounts: AdminDiscountWithPrice[]
  totalDiscount: number
}

// query params get from url will be string
export type uploadReceiptData = {
  siteId: string
  institutionId: string
  token: string
  enrollId: string
  invoiceId: number
  file: File
  payLaterMethod: PaymentDetailType
}

export type uploadReceiptResponse = {
  id: number
  siteId: number
  institutionId: number
  userId: number
  enrollCourseId: number
  image: string
  status: string
}
