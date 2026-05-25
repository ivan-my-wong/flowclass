import type {
  Classes,
  PeriodLessons,
  RecurringSchedules,
  RepeatFormats,
} from './classes'
import { type Coupon } from './coupon'
import { ClassTypeEnum, PriceType } from './course'
import {
  EnrollConfirmState,
  type EnrollIntoInfo,
  type MultipleClassMapping,
} from './enrollCourse'
import { type PriceOption } from './regularClass'
import { type StudentSchedule } from './student'
import { BulkSendDocumentStatus } from './templateManagement'

// Minimal interface to break circular reference with templateManagement.ts
export interface PickedInvoiceCampaign {
  id?: number
  title: string
  isDraft: boolean
  sendViaEmail: boolean
  emailSubject: string
  emailBody: string
  sendViaWhatsapp: boolean
  whatsappContent: string
  isCombined: boolean
  invoiceIds: number[]
  invoices: any[] // Using any to avoid circular reference
}

export enum NotificationChannel {
  WhatsApp = 'whatsapp',
  Email = 'email',
}

export type InvoiceStudent = {
  /** userAliasId (primary identity used across invoice flows) */
  id: number
  /** userId (account identifier) */
  userId: number
  invoiceId?: number
  name: string
  email: string
  phone: string
  subTotal?: number
  /** Actual stored discount amount from the linked invoice row (edit mode only) */
  discountAmount?: number
  /** Actual stored additional fee from the linked invoice row (edit mode only) */
  additionalFee?: number
  totalDiscount?: number
  total: number
  invoiceRemark: string
  appliedPromotions: AppliedPromotion[]
  invoiceSplitType: InvoiceSplitType
  invoiceSplitItems: InvoiceSplit[]
  isSendToParent: boolean
  isSendToStudent?: boolean
  isPayByCredit: boolean
  usedBalance: number
  isStudentParent: boolean
  childOfUserAliasId: number | null
  enrollMetaId?: string
  paymentDate?: Date | null
  invoicePromotionsUsed?: Array<{
    promotionType: string
    promotionId: number | null
    amount: number
  }>
}

export type InvoiceClassType = {
  type: ClassTypeEnum
  studentItem: InvoiceStudent
  courseId?: number
  classId: number
  courseName?: string
  priceType?: PriceType
  price: number | string
  priceOption?: PriceOption
  remark?: string
  sessionLength?: number
  dropIn?: boolean
  recurringFormat?: RepeatFormats
}

export type InvoiceSessionType = {
  studentItem: InvoiceStudent | null
  classItem: InvoiceClassType | null
  date: string
  endTime: string
  id: number
  isBlocked: boolean
  isOverride: boolean
  lessonNumber: number
  period?: number
  startTime: string
  isRecurring?: boolean
}

export type ManualDiscount = {
  name: string
  discountType: DiscountType
  amount: number
}

export enum PromotionTypeItem {
  COUPON = 'coupon',
  BUNDLE = 'bundle',
  REFERRAL = 'referral',
  MANUAL = 'manual',
  PACKAGE = 'package',
}
export enum InvoiceSplitType {
  SINGLE = 'single',
  DUAL_SPLIT = 'dual-split',
  CUSTOM_SPLIT = 'custom-split',
}

export type InvoiceSplit = {
  description: string
  percentage: number
  dueDate: Date
  invoiceId?: number
}

export type PossiblePromotionsDto = {
  userId: number
  classId?: number
}

export type DiscountType = 'fixedAmount' | 'percentage'

export type AppliedPromotion = {
  id: number | string | null
  studentId?: number | null
  parentId?: number | null
  name: string
  type: PromotionTypeItem
  discountType: DiscountType
  amount: number
  order: number
  minQty?: number
  feeType?: string
  isApplicable?: boolean
  parentCredit?: number
  // Bundle discount specific fields
  retroactiveDiscount?: number // Discount amount on past payments
  courseNames?: string[] // List of course names used for the discount
  // Package discount specific fields
  packageDiscountPerLesson?: number // Per-lesson discount amount
  classId?: number // Class this package discount applies to
  qualifiedLessonCount?: number // Number of lessons that qualified for package discount
}

export type AllPromotionsType = PossiblePromotionsType

export type PossiblePromotionsType = {
  name: string
  amount: number
  code?: string
  discountType: DiscountType
  expireDate: string
  forBundle: boolean
  forTrialLesson: boolean
  id: number
  institutionId: number
  quota: number
  siteId: number
  status: string
  usedCount: number

  promotionType: PromotionTypeItem
}

export type CourseUsedDto = {
  id: number
  name: string
}

export type BundleDiscountDto = {
  bundleId: number
  name: string
  type: DiscountType
  potentialDiscount: number
  requiredAmount: number
  classIdsUsed: number[]
  isAutoApply?: boolean
  isRetroactive?: boolean
  isStackable?: boolean
  minQty?: number
  isAllItems?: boolean
}

export type BundleDiscountAvailabilityResponse = {
  bundleId: number
  name: string
  courseUsed: CourseUsedDto[]
  minAdditionalCoursesNeeded?: number
  totalPaymentDone?: number
}

export interface LessonPreviewDto {
  id: number
  date: string
  period: number
  lessonNumber: number
  startTime: string
  endTime: string
  isOverride: boolean
  isBlocked: boolean
}
export type RegularScheduleLessonPreviewPeriodGroup = {
  period: number
  lessons: LessonPreviewDto[]
}

export interface MetaRef {
  type: ClassTypeEnum
  coupon?: Coupon | null
  bundleId?: number | null
  directDiscount?: number | null
  courseId?: number
  classId: number
  periodId?: number | null
  pickedFirstDate?: string
  pickedClass?: Classes
  userAliasId?: number
  // This is for regular class as it is periodLessons in the type
  pickedLessons?: PeriodLessons[]
  individualPickedLessonsString?: string[]
  pickedRecurringSchedule?: RecurringSchedules | null
  selectedRegularSchedulePreviewV2?: RegularScheduleLessonPreviewPeriodGroup[]
  lessonPrice: number
  priceOptionId?: number
  billingFormatId?: number
  billingStartDate?: string
  billingEndDate?: string
  billingNextDate?: string
  isRecurring?: boolean
  remark?: string
}

export type InvoiceClassDto = {
  courseId: number
  classId: number
  periodId: number | null // for regular class v1
  recurringScheduleId: number | null // for recurring class
  appointmentId: number | null // for appointment class
  firstLessonDate: string | null // for regular class v1
  individualPickedLessonsString: string[]
  priceOptionId: number
  lessonPrice: number
  remark: string
}

export type InvoiceCampaignDetailDto = {
  institutionId: number
  siteId: number
  name: string
  email: string
  phone: string
  userId: number
  userAliasId: number
  discounts: AppliedPromotion[]
  invoiceRemark: string
  isPayByCredit: boolean
  usedBalance: number
  classes: MetaRef[]
  splitType?: InvoiceSplitType
  splitItems?: InvoiceSplit[]
  total?: number
  childOfUserAliasId: number | null
  isStudentParent: boolean
  isSendToParent: boolean
  childs?: {
    id: number
    name: string
    email: string
    phone: string
    userId: number
    userAliasId: number
  }[]
  paymentDate?: string | null
}

export interface RecipientDto {
  userAliasId?: number
  name: string
  email?: string
  phone: string
  isSendToParent: boolean
}

export type SendInvoiceBaseDto = {
  sendViaEmail: boolean
  emailSubject?: string
  emailBody?: string
  sendViaWhatsapp: boolean
  whatsappContent?: string
}

export type InvoiceCampaignDto = SendInvoiceBaseDto & {
  id?: number
  isCombined: boolean
  title: string
  isDraft: boolean
  status?: BulkSendDocumentStatus
  invoices: InvoiceCampaignDetailDto[]
  combinedInvoice?: InvoiceCampaignDetailDto
  splitType?: InvoiceSplitType
  splitItems?: InvoiceSplit[]
  recipients?: RecipientDto[]
  invoiceIds?: number[]
  jobId?: string | null
}

export enum SendingCampaignStatus {
  PENDING = 'pending',
  CREATING = 'creating',
  CREATED = 'created',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}
export enum SendingProcessPhase {
  CREATING_INVOICES = 'CREATING_INVOICES',
  SENDING_INVOICES = 'SENDING_INVOICES',
  COMPLETE = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface SendingInvoiceData {
  id?: string | null
  name: string
  email: string
  phone: string
  invoiceNumber?: string
  amount?: string
  status: SendingCampaignStatus
  message?: string
  invoiceId?: number
  proofToken?: string
  userAliasId?: number
  userId?: number
  institutionId?: number
}
export interface SendingInvoiceCampaignState {
  eventSource: EventSource | null
  data?: SendingInvoiceData[]
  currentPhase?: SendingProcessPhase
  processingData?: SendingInvoiceData | null
}

export type SendingResponse = {
  jobId: string
  document: PickedInvoiceCampaign
}

export type InvoiceStudentConfig = {
  invoiceRemark: string
  appliedPromotions: AppliedPromotion[]
  invoiceSplitType: InvoiceSplitType
  invoiceSplitItems: InvoiceSplit[]
}

export type CurrentlyEnrolledClass = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  createdBy: number | null
  updatedBy: number | null
  siteId: number
  institutionId: number
  userId: number
  userAliasId: number
  courseId: number
  confirmState: EnrollConfirmState
  name: string
  email: string
  phone: string
  enrollInto: EnrollIntoInfo[]
  billingFormatId: number | null
  billingStartDate: string | null
  billingEndDate: string | null
  billingNextDate: string | null
  registrationForm: string | null
  priceOptionId: number | null
  currency: string
  paymentAmount: string
  multipleClassMapping: MultipleClassMapping[]
  studentSchedule: StudentSchedule[]
  preferredEmail: string
  preferredName: string
  preferredPhone: string
}

export type VariableItem = {
  name: string
  value: string
}

export type ResendInvoiceDto = {
  recipientId: number
  name?: string
  email?: string
  phone?: string
  channel?: NotificationChannel
  message?: string
  subject?: string
  isEnabled?: boolean
}

export type SendInvoiceDirectlyDto = SendInvoiceBaseDto & {
  invoiceId: number
}

export type SyncEnrollCoursesDiffItemDto = {
  invoiceId: number
  addedClasses?: MetaRef[]
  removedClassIds?: number[]
}
