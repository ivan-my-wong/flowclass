import { Coupon } from './coupon'
import { ClassType } from './course'
import { EnrolCourseResponse, StudentLesson } from './enrol'
import { MediaMaterialsType } from './materials'

export type FindProfileProps = {
  id?: number
  institutionId?: number
  firstName?: string
  email?: string
  phone: string
  userAliasId?: number
  isStudentParent?: boolean
  listChildren?: FindProfileProps[]
  currentlyActiveChild?: FindProfileProps
  activeUserAliasId?: number
}

export type AuthState = FindProfileProps & {
  accessToken: string
  refreshToken: string
  institutionId: number
}

export type RefreshTokenDto = {
  refreshToken: string
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CRITICAL = 'CRITICAL',
  UNPAID = 'UNPAID',
}

export enum PaymentMethod {
  PAY_LATER = 'PAY_LATER',
  PAY_NOW = 'PAY_NOW',
}

export enum StudentNotificationType {
  PAYMENT_REMINDER = 'paymentReminder',
  OVERDUE_REMINDER = 'overdueReminder',
  LESSON_REMINDER = 'lessonReminder',
}

export enum AttendanceStatus {
  ATTENDED = 'ATTENDED',
  NOT_ATTENDED = 'NOT_ATTENDED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  POSTPONE = 'POSTPONE',
  DEDUCT = 'DEDUCT',
}

export enum SupportedType {
  // ADMIN_NOTIF_AFTER_ENROLLMENT_SUBMITTED = 'admin_notif_after_enrollment_submitted',
  STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED = 'student_notif_after_enrollment_submitted',
  STUDENT_NOTIF_AFTER_PAYMENT_APPROVED = 'student_notif_after_payment_approved',
  STUDENT_NOTIF_AFTER_PAYMENT_REJECTED = 'student_notif_after_payment_rejected',
  STUDENT_NOTIF_AFTER_APPLICATION_CONFIRMED = 'student_notif_after_application_confirmed',
  // TEACHER_NOTIF_AFTER_APPLICATION_SUBMITTED = 'teacher_notif_after_application_submitted',
  STUDENT_NOTIF_AFTER_ADD_NEW_LESSON = 'student_notif_after_add_new_lesson',
  STUDENT_NOTIF_AFTER_CHANGE_LESSON_DATE = 'student_notif_after_change_lesson_date',
  TEACHER_NOTIF_AFTER_ADD_NEW_CLASS = 'teacher_notif_after_add_new_class',
  STUDENT_NOTIF_PAYMENT_REMINDER = 'student_notif_payment_reminder',
  // STUDENT_LESSON_REMINDER = 'student_lesson_reminder',
  // CREATE_INVOICE = 'create_invoice',
}

export type StudentNotificationSettings = {
  id: number
  notificationType: SupportedType
  email: boolean
  whatsapp: boolean
}

export type PaymentReports = {
  id: number
  classes: { id: number; name: string }[]
  course: { id: number; name: string; path: string }
  createdAt: string
  paymentMethod: string
  payAmount: number
  proofToken: string
  paymentLinkId: string
  currency: string
  paymentProof?: string
  paymentState?: string
  lessons?: StudentLesson[]
  promotion?: Coupon
  paymentDate?: Date
  user?: {
    name: string
    email: string
    phone: string
    id: number
    studentId?: number
    organization?: number
    requiredNumber?: number
  }
  institutionId: number
  siteId: number
  transaction?: {
    id: number
    status: string
  }
  enrollId?: number
  enrollCourses?: EnrolCourseResponse[]
}

export type FilterPaymentReports = {
  institutionId: number
  startDate?: string
  endDate?: string
  courseId?: number
  classId?: number
  paymentState?: PaymentStatus[]
  paymentMethod?: string
  attendanceStatus?: string
  childrenId?: number
}

export interface UpcomingLesson {
  id: number
  lessonIndex: number
  totalLessons: number
  course: {
    id: number
    name: string
    path: string
    previewImageUrl?: string
  }
  class: {
    id: number
    name: string
    instructorName?: string
    locationRoomName?: string
  }
  startTime: Date
  endTime: Date
  originalStartTime: Date
  originalEndTime: Date
  hasTimeChange: boolean
  invoice: {
    id: number
    payAmount: string
    paymentState: string
    proofToken: string
    enrollId: number
    enrollCourses: EnrolCourseResponse[]
  }
  isDone: boolean
  institutionId: number
  siteId: number
  attendanceStatus: AttendanceStatus
  user: {
    name: string
    email: string
    phone: string
    id: number
  }
  periodId: number
  materials: MediaMaterialsType[]
  studentSubmissions?: MediaMaterialsType[]
  teacherResponses?: MediaMaterialsType[]

  expiryDate?: Date
}

export type StudentPortalSettings = {
  id: number
  studentLogin?: boolean
  rescheduleSettings?: RescheduleSettings
}

export enum SendPaymentActions {
  SEND_WA_REMINDER = 'resend-wa-payment-reminder',
  SEND_MAIL_REMINDER = 'resend-email-payment-reminder',
  SEND_SUCCESS_PAYMENT = 'resend-success-payment',
  SEND_QR_CODE = 'resend-qr-code',
}

export type ResendPaymentRecord = {
  invoices: {
    invoiceId: number
    proofToken: string
  }[]
}

export type PaymentFilterOption = {
  label: string
  value: string | number | undefined
}

export type PaymentRecordConfirm = {
  ids?: number[]
  siteId: number
  institutionId: number
  invoices: {
    invoiceId: number
    proofToken: string
  }[]
  action?: SendPaymentActions
}

export type SendQuestionProps = {
  institutionId?: number
  question?: string
  lessonId?: number
}

export interface LessonQuestionProps {
  institutionId: number
  studentLessonId: number
  question: string
  answer: string
  parentId?: number
  createdBy: null
  updatedBy: null
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt: null
}

export type TypeGetTeachingServiceOpt = {
  siteId?: number
  institutionId?: number
}

export type TypeGetTeachingServiceOptItemPeriods = {
  [id: string]: string[]
}

export type TypeGetTeachingServiceOptItemClasses = {
  id: number
  name: string
  periods: TypeGetTeachingServiceOptItemPeriods
  type?: ClassType
  isArchived?: boolean
}

export type TypeGetTeachingServiceOptItem = {
  id: number
  name: string
  isArchived?: boolean
  type: ClassType
  classes: TypeGetTeachingServiceOptItemClasses[]
}

export type SubmitRequestTimeChangeProps = {
  institutionId?: number
  requestStartTime?: string
  requestEndTime?: string
  reason?: string
  lessonId?: number
  classId?: number
  classType?: ClassType
}

export enum RequestTimeChangeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type RequestTimeChangeProps = {
  institutionId: number
  studentLessonId: number
  userId: number
  requestStartTime: Date
  requestEndTime: Date
  reason?: string
  status: RequestTimeChangeStatus
  studentLesson: StudentLesson
  user: {
    id: number
    name: string
    email: string
    phone: string
  }
}

export type RequestTimeChangeForm = {
  courseId?: number
  classId?: number
  periodId?: number | string
  classLessonDate?: Date
  lessonStartTime?: Date
  lessonEndTime?: Date
  reason?: string
  classType?: ClassType
}

export type StudentLoginWithAliasPasswordDto = {
  phone: string
  aliasPassword: string
  institutionId: number
  name?: string
}

export type StudentChangeAliasPasswordDto = {
  userAliasId: number
  currentAliasPassword: string
  newAliasPassword: string
}

export type RescheduleSettings = {
  id: number
  institutionId: number
  selectCourse: boolean
  selectClass: boolean
  minimumHoursBeforeRequest: number
}
