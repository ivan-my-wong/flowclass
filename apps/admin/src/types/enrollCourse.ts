import { FieldTypes } from '@/constants/enrollmentFormFieldNames'

import { PaymentState } from '../constants/payment'

import { RepeatFormats } from './classes'
import { BaseModelWithTimestamps } from './common'
import { PromotionType } from './coupon'
import { ClassTypeEnum, Course } from './course'
import { StudentLesson, StudentSchedule } from './student'
import {
  AppliedPromotion,
  InvoiceSplit,
  InvoiceSplitType,
} from './studentInvoice.type'
import { UserAlias } from './studentMemo'
import { BaseUser } from './user'

export enum EnrollConfirmState {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',

  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export enum CustomDataFieldColumnMapping {
  NAME = 'name',
  PHONE = 'phone',
  EMAIL = 'email',
}

export type PaymentEvidence = {
  id: number
  siteId: number
  institutionId: number
  userId: number
  enrollCourseId: number
  image: string
  status: string
  invoiceId: number
}

export type Tuition = {
  originalFee: number
  couponDiscount: number
  directDiscount: number
  bundleDiscount: number
  recurringDiscount: number
  totalDiscount: number
  paymentAmount: number
  currency: string
}

type PayoutMethodDetails = {
  payoutImg: string
  payoutUrl: string
  accountName: string
  accountId: string
  receiptRequired?: boolean
}

export type PayLaterMethod = {
  id: number
  siteId: number
  enabled: boolean
  createdAt: string
  createdBy: string | null
  updatedAt: string
  updatedBy: string | null
  methodName: string
  methodType: string
  description: string
  institutionId: number
  payoutMethodDetails: Partial<PayoutMethodDetails>
}

export type PricingInfo = {
  id: number

  numberOfLesson: number
  feePerLesson: number
  discountInfo?: Array<string>
  couponCode?: string
  bundleDiscountId?: number
  // eslint-disable-next-line camelcase
  updated_at: string
} & Tuition

export type Invoice = {
  id: number
  siteId: number
  institutionId: number
  userId: number
  courseId?: number
  enrollId: number

  payLaterMethod?: PayLaterMethod
  paymentMethod: string
  paymentState: PaymentState
  paymentLinkId: string
  paymentEvidence: PaymentEvidence

  feePerLesson: number
  numOfLesson: number
  originalFee: number
  payAmount: number
  amountPaid: number
  currency: string
  course: Course
  payBy: string
  payById: number

  usedBalance: number

  enrollInto?: EnrollIntoInfo[] | EnrollIntoInfo
  discountAmount: number
  additionalFee: number

  reviewed: boolean
  approvedBy?: string
  approverId?: number

  proofToken: string
  transactionId?: number

  userAlias: UserAlias
  // @deprecated
  enrollCourse: EnrollCourseInstance
  enrollCourses: EnrollCourseInstance[]
  studentSchedules: StudentSchedule[]
  isParent?: boolean
  discounts?: PromotionType[]
  adminDiscounts?: AppliedPromotion[]
  splitType?: InvoiceSplitType
  splitItems?: InvoiceSplit[]
  childInvoices?: Pick<
    Invoice,
    'id' | 'payAmount' | 'payBy' | 'payById' | 'currency'
  >[]
  invoiceParentId?: number
  documentCampaignId?: number
  createdBy?: number
  createdByUser?: { id: number; email: string }
  invoicePromotionsUsed?: InvoicePromotionUsedItem[]
} & BaseModelWithTimestamps

export type InvoicePromotionUsedItem = {
  promotionType: string
  promotionId: number | null
  name: string | null
  amount: number
  usedStatus: string | null
}

export type StudentFormResponse = {
  id: string | number
  type: string
  value: string | number | string[] | null
  question: string
  isDefault?: boolean
  order: number
  columnMapping?: string
}

export type StudentFormListResponse = {
  fieldId: number
  formFieldColumnMapping: CustomDataFieldColumnMapping | null
  formFieldId: string
  formFieldIsDefault: boolean | null
  formFieldQuestion: string
  formFieldType: FieldTypes
  formFieldValue: string | number | string[] | null
  formId: number | null
}

export type EditStudentFormResponse = {
  institutionId: number
  userId: number
  userAliasId: number
  fieldId: string

  formId?: number | null
  metadata?: StudentFormResponse
}

export type EnrollIntoInfo = {
  type: ClassTypeEnum

  // Course, Workshop, Appointment
  courseName: string

  // Class, Session, Lesson, etc.
  secondLevelName: string

  // Period, etc.
  thirdLevelName?: string

  // Class, Session, Lesson, etc.
  lessonCount: number
}

type PaymentProofTableSendWhatsapp = {
  phone: string
  course: string
  enrolId: string
  token: string
  name: string
}

export type PaymentProofTableUserAlias = {
  id: number
  userId: number
  name: string
  email: string
  isStudentParent: boolean
  user: {
    id: number
    phone: string
  }
}

export type PaymentProofTableEnrollCourse = {
  id: number
  name: string
  phone: string
  email: string
  currency: string
  confirmState: EnrollConfirmState
  paymentAmount: number
  registrationForm: StudentFormResponse[]
  preferredName: string
  preferredPhone: string
  preferredEmail: string
  enrollInto: EnrollIntoInfo[]
  course: {
    path: string
  }
}

export type PaymentProofStudentSchedule = {
  id: number
  classId: number
  enrollCourseId: number
  courseId: number
  studentLessons: StudentLesson[]
}

export type PaymentProofTableItem = {
  additionalFee: string
  approvedBy: null
  approverId: null
  courseId: number
  createdAt: string
  createdBy: null
  currency: string
  discountAmount: string
  discounts: string
  enrollCourses: PaymentProofTableEnrollCourse[]

  enrollId: number
  feePerLesson: string
  id: number
  institutionId: number
  numOfLesson: number
  originalFee: string
  payAmount: string
  paymentDate: Date
  payBy: string
  payById: number
  payLaterMethod?: {
    methodName: string
  }
  divitOrder?: {
    id: number
    divitOrderId: string
    environment: 'sandbox' | 'production'
  } | null
  paymentEvidenceId: number | null
  paymentEvidence: PaymentEvidence
  paymentLink: string
  paymentLinkId: string
  paymentMethod: string
  paymentState: PaymentState
  proofToken: string
  reviewed: boolean
  sendWhatsapp: PaymentProofTableSendWhatsapp
  siteId: number
  studentSchedules: PaymentProofStudentSchedule[]
  transactionId: null
  updatedAt: string
  updatedBy: null
  userId: number

  userAlias: PaymentProofTableUserAlias
  childInvoices?: Pick<
    Invoice,
    'id' | 'payAmount' | 'payBy' | 'payById' | 'currency'
  >[]
  splitItems?: InvoiceSplit[]

  remark?: string
  invoicePromotionsUsed?: InvoicePromotionUsedItem[]
}

export type MultipleClassMapping = {
  classId: number
  enrollCourseId: number
  id?: number
}

export type EnrollCourseInstance = {
  id: number

  siteId: number
  institutionId: number
  userId: number
  classId?: number
  courseId: number
  course: Course

  confirmState: EnrollConfirmState
  enrollInto?: EnrollIntoInfo | EnrollIntoInfo[]

  name: string
  email: string
  phone: string

  preferredName: string
  preferredPhone: string
  preferredEmail: string

  billingStartDate?: Date
  billingEndDate?: Date
  billingNextDate?: Date

  registrationForm?: StudentFormResponse[]

  currency: string
  paymentAmount?: number

  invoice?: Invoice
  // @deprecated Use invoice instead. Kept for backward compatibility.
  invoices?: Invoice[]

  studentSchedule: StudentSchedule[]
  repeatFormat: RepeatFormats
  multipleClassMapping?: MultipleClassMapping[]

  userAlias?: UserAlias
}

export type PreviewInvoiceResponse = {
  studentScheduleId?: number
  invoiceId?: number
  student?: BaseUser
  lessons: string[]
  payAmount: number
}

export type StudentWithEnrollInfo = {
  enrollInfo: EnrollIntoInfo[]
  payAmount: number
} & UserAlias

export type GroupedStudentWithEnrollInfo = {
  [key: string]: {
    enrollInfo: {
      payAmount: number
      enrollInfo: EnrollIntoInfo[]
    }[]
  } & UserAlias
}

export type SendCustomMessage = {
  invoiceIds: number[]
  message: string
  variables: Record<string, string>
}

export interface RevenueByItem {
  name: string
  totalRevenue: number
  lessons: number
  students: number
}

// types/enrollCourse.ts
export interface StudentOverview {
  summary: {
    activeStudents: number
    newStudentsThisMonth: number
    totalDropouts: number
    dropoutRate: number
  }
  classes: {
    classId: number
    courseName: string
    className: string
    teacherName: string
    totalStudents: number
    newStudents: number
    dropouts: number
    dropoutRate: number
  }[]
}

export interface StudentByItem {
  name: string
  totalRevenue: number
  lessons: number
  courses: number
}

export interface RevenueOverview {
  totalRevenue: number
  completedLessons: number
  activeStudents: number
  lessons: LessonItem[]
}

export interface LessonItem {
  date: string
  time: string
  course: string
  class: string
  lesson: string
  teacher: string
  students: number
  status: 'Completed' | 'Scheduled' | 'Cancelled'
  revenue: string
  payments: PaymentItem[]
}

export interface PaymentItem {
  name: string
  phone: string
  total: string
  credit: string
  net: string
  status: 'Paid' | 'Pending' | 'Refunded'
  attendance: 'Present' | 'Absent'
}
export type PaymentDetailType = {
  id?: number
  siteId?: number
  institutionId?: number
  description?: string
  methodName?: string
  enabled?: boolean
  payoutMethodDetails?: PayoutMethodDetails
}

export type UploadReceiptData = {
  siteId: number
  institutionId: number
  token: string
  enrollId: number
  invoiceId: number
  file: File
  payLaterMethod: Partial<PayLaterMethod>
}

export type UploadReceiptResponse = {
  id: number
  siteId: number
  institutionId: number
  userId: number
  enrollCourseId: number
  image: string
  status: string
}

export type StudentByStudent = {
  start: string

  end: string

  institutionId: number

  siteId: number

  studentName?: string

  classId?: number

  teacherId?: number
}
