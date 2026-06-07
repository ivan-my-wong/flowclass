import { FieldTypes } from '@/constants/common'

import { Class, Period, RecurringSchedule, TuitionMode } from './class'
import { ClassType, Course } from './course'
import { InvoiceResponse } from './receipt'

export enum CustomDataFieldColumnMapping {
  NAME = 'name',
  PHONE = 'phone',
  EMAIL = 'email',
}

export type FieldAnswer = {
  id: string
  question?: string
  type?: string
  value?: string
  isDefault?: boolean
  columnMapping?: CustomDataFieldColumnMapping
}

export enum PaymentMethods {
  PAY_LATER = 'PAY_LATER',
  PAY_NOW = 'PAY_NOW',
  PAY_NOW_DIVIT = 'PAY_NOW_DIVIT',
}

export enum EnrollConfirmState {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum PaymentState {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  SUBMITTED = 'SUBMITTED',
}

export type ClientSecret = {
  clientSecret: string
  id: string
}

export type EnrolCourseResponse = {
  url?: string
  id: number
  siteId: number
  institutionId: number

  userId: number
  classId: number
  sessionId: number
  appointmentId: number
  courseId: number

  enrollInto: EnrollIntoInfo
  registrationForm: FieldAnswer[]

  billingStartDate: string
  billingNextDate: string
  billingEndDate: string
  name: string
  email: string
  schoolName: string
  phone: string

  preferredEmail?: string
  preferredName?: string
  preferredPhone?: string

  clientSecret: ClientSecret

  paymentAmount: number

  confirmState: EnrollConfirmState

  currency: string
  course: Course
  invoice: InvoiceResponse
}

export type UpdateEnrolCourseResponse = {
  invoice: InvoiceResponse
} & EnrolCourseResponse

export type StudentLesson = {
  id: number
  institutionId: number
  classLessonId: number
  courseId: number
  enrollCourseId: number
  studentScheduleId: number
  classId?: number
  userId: number
  date: Date
  isCheckin: boolean
  periodId?: number
  appointmentId?: number
  sessionId?: number
  isExtra: boolean

  startTime: Date
  endTime: Date
  changeStartTime?: Date
  changeEndTime?: Date

  class?: {
    id: number
    name: string
    instructorName?: string
    locationRoomName?: string
  }
}

export type StudentSchedule = {
  id: number

  type: ClassType
  classId: number
  class: Class

  enrollCourseId: number
  periodId: number

  recurringScheduleId: number
  studentScheduleId: number
  invoiceId?: number

  recurringSchedules: RecurringSchedule[]

  studentLessons: StudentLesson[]
  firstStudentLesson: StudentLesson
}

export type EnrolCourseMetaData = {
  type?: ClassType

  bundleId?: number
  coupon?: string
  classId?: number
  periodId?: number
  sessionId?: number
  appointmentSchedule?: string[]
  pickedLessons?: {
    classId: number
    periodId?: number
    startTime: Date
    endTime: Date
  }[]
  pickedFirstDate?: string
  lessonPrice?: number
  priceOptionId?: number
  numberOfLessons?: number
}

export type StudentData = {
  studentName: string
  email: string
  phoneNumber: string
  createAnAccount?: boolean
}

export type EnrolCourseData = {
  courseId?: number
  // meta: EnrolCourseMetaData
  selectedClassMeta: EnrolCourseMetaData[]
  paymentMethod?: PaymentMethods
  payLaterMethod?: PaymentDetailType
  redirectUrl?: string
  registrationForm: Record<string, any>[]
  setMultipleClass: boolean
  invoiceId?: number
  coupon?: string
  studentData?: StudentData[]
  numOfApplicant?: number
  classTrialLessonId?: number
}

export type UpdateInvoicePaymentData = {
  invoiceId: number
  paymentMethod?: PaymentMethods
  payLaterMethod?: PaymentDetailType
  coupon?: string
  redirectUrl?: string
  selectedClassMeta?: EnrolCourseMetaData[]
}

export type ReCreateStripeClientSecret = {
  invoiceId: number
  courseId: number
  institutionId: number
  paymentAmount: number
  redirectUrl?: string
}

export type GetEnrolPriceData = {
  meta: EnrolCourseMetaData
  courseId: number
  coupon?: string
  price: number
  quantity?: number
  lessonCount?: number
}

export type GetEnrolPriceResponse = {
  courseId: number
  classId: number
  sessionId: number
  appointmentId: number
  numberOfLesson: number
  feePerLesson: number
  period: Period[]
  discountInfo?: string
} & Tuition

export type InvoiceState = {
  id: number
  numberOfLesson: number
  numOfApplicant: number
  feePerLesson: number
  discountInfo?: Array<string>
  couponCode?: string
  bundleDiscountId?: number
  additionalFee?: number | string
  autoCouponApplied?: boolean
} & Tuition

export type Tuition = {
  originalFee: number | string
  couponDiscount: number
  directDiscount: number
  bundleDiscount: number
  recurringDiscount: number
  totalDiscount: number
  paymentAmount: number | string
  currency: string
  feePerLesson: number
}

// query params get from url will be string
export type uploadReceiptData = {
  siteId: string
  institutionId: string
  token: string
  enrollId: string
  file: File
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

// Below is for stripe connect responses

export enum StripeConnectStatus {
  RESTRICTED = 'RESTRICTED',
  RESTRICTED_SOON = 'RESTRICTED_SOON',
  PENDING = 'PENDING',
  ENABLED = 'ENABLED',
  COMPLETE = 'COMPLETE',
  NOTFOUND = 'NOTFOUND',
}

export type StripeConnectionResponse = {
  institutionId: number
  status?: string
  stripeAccountId: string
  enabled: boolean
}

export type PaymentDetailType = {
  id?: number
  siteId?: number
  institutionId?: number
  description?: string
  methodName?: string
  enabled?: boolean
  payoutMethodDetails?: PayoutMethodDetail
}

export type PayoutMethodDetail = {
  bankName?: string
  bankBranch?: string
  accountName?: string
  accountNumber?: string
  payoutDetails?: string
  payoutImg?: string
  payoutUrl?: string
  receiptRequired?: boolean
  successMessage?: string
}

export type EnrollmentRecord = {
  email: string
  fullName: string
  phone: string
  courseId: number
}

export type EnrollIntoInfo = {
  type: ClassType

  // Course, Workshop, Appointment
  courseName: string

  // Class, Session, Lesson, etc.
  secondLevelName: string

  // Period, etc.
  thirdLevelName?: string

  // Class, Session, Lesson, etc.
  lessonCount: number
  /** Base unit price (per lesson or flat package) */
  price: number
  // whether price is per-lesson vs per-class or multiple.
  priceType: TuitionMode
  // computed client-side (not persisted)
  totalPrice?: number
}

export type FormFieldValue = {
  id: string
  type: FieldTypes
  columnMapping?: CustomDataFieldColumnMapping
  value: Record<string, any> | string[] | string | boolean
  question: string
}

export type CustomFormFieldValue = string | FormFieldValue

export type FieldNameWithValue = {
  label: string
  value?: string
  type?: string
}

export type CheckEnrollCompleted = {
  name: string
  email: string
  phone: string
  courseId: number
}

export type EnrollCompletedResponse = {
  course?: {
    id: number
    path: string
    name: string
  }
  class?: {
    id: number
    name: string
  }
  status: boolean
}

export type EnrollTriggerData = {
  id: string
}

export enum EnrollCourseStreamStatus {
  STARTED = 'started',
  VALIDATING_COURSE = 'validating_course',
  CHECKING_SEAT_AVAILABILITY = 'checking_seat_availability',
  CHECKING_SCHEDULE_AVAILABILITY = 'checking_schedule_availability',
  CREATING_STUDENT = 'creating_student',
  CREATING_MULTIPLE_CLASS_INFORMATION = 'creating_multiple_class_information',
  CREATING_APPLICATION_FORM = 'creating_application_form',
  ENROLLING_COURSE = 'enrolling_course',
  PREPARING_PAYMENT = 'preparing_payment',
  CREATING_INVOICE = 'creating_invoice',
  CREATING_STUDENT_SCHEDULE = 'creating_student_schedule',
  SENDING_REMINDER = 'sending_reminder',
  DONE = 'done',
  FAILED = 'failed',
}

export type EnrollCourseStreamData = {
  status: EnrollCourseStreamStatus
  data?: EnrolCourseResponse | EnrolCourseResponse[]
  error?: string
}

export type EnrollCourseStreamWithIdType = {
  id: string
  status: EnrollCourseStreamStatus
  data?: EnrolCourseResponse | EnrolCourseResponse[]
  error?: string
}

export type CheckQuotaDto = {
  lessonIds: number[]
  date: Date
  classId?: number
  timeslots?: string[]
}

export type CheckQuotaResponse = {
  lessonId: number
  remainingQuota: number
  quota: number
  conflict?: any[]
}
