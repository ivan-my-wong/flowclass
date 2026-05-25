/* eslint-disable camelcase */

import { AttendanceStatus } from '@/constants/course'

import { FieldTypes } from '../constants/enrollmentFormFieldNames'
import { PaymentState } from '../constants/payment'

import { MediaMaterialsType, StudentMediaMaterialsType } from './class-material'
import { RepeatFormats } from './classes'
import { BaseModelWithTimestamps } from './common'
import { ClassTypeEnum } from './course'
import { SupportedType } from './customMessage'
import {
  EnrollConfirmState,
  Invoice,
  StudentFormListResponse,
  StudentFormResponse,
} from './enrollCourse'
import { StudentType } from './lessonDateTime'
import {
  StudentSubmissionType,
  TeacherFeedbackType,
} from './student-submission'
import { UserAlias } from './studentMemo'

export type EnrolInto = {
  type: ClassTypeEnum
  courseName: string
  secondLevelName: string
}
export type EnrolledClassEnrollmentDatabase = {
  id: number
  institution_id: number
  course_id: number
  token: string
  enroll_into: EnrolInto
  deleted_at: string | null
}

export type ValueTypes = string[] | string | number | boolean | Date

export enum ImportError {
  EMAIL_ALREADY_EXIST = 'EMAIL_ALREADY_EXIST',
  INVALID_FILE_CSV = 'INVALID_FILE_CSV',
  INVALID_CSV_DATA = 'INVALID_CSV_DATA',
  INVALID_NAME = 'INVALID_NAME',
  EMPTY_NAME = 'EMPTY_NAME',
  EMPTY_EMAIL = 'EMPTY_EMAIL',
  EMPTY_PHONE = 'EMPTY_PHONE',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE_NUM = 'INVALID_PHONE_NUM',
  INVALID_CHARGED_AMOUNT = 'INVALID_CHARGED_AMOUNT',
  FILE_CSV_HAVE_SAME_HEADER = 'FILE_CSV_HAVE_SAME_HEADER',
  INVALID_CHARGE_FREQUENCY_VALUE = 'INVALID_CHARGE_FREQUENCY_VALUE',
}

export type PickedClass = {
  id: number
  name: string
  type: ClassTypeEnum
}

export type PickedCourse = {
  id: number
  name: string
  path: string
}

export type SingleStudentCrmRecordEnrolledClassesInvoice = {
  id: number
  payAmount: number
  paymentState: PaymentState
  // ISO-4217 currency code, e.g. 'USD'
  currency: string
  // is a date string
  createdAt: string
  updatedAt: string
  usedBalance: number
  proofToken?: string
  remark?: string | null
  documentCampaignId?: number | null
  /** userId of the admin/instructor who created this invoice */
  createdBy?: number | null
  /** User who created this invoice — populated when backend joins the users table */
  createdByUser?: { id: number; email: string } | null
}

export type SingleStudentCrmRecordEnrolledClassesStudentSchedule = {
  id: number
  class: PickedClass
  studentLessons: {
    id: number
    attendance: AttendanceStatus
    endTime: string
    changeEndTime: string
  }[]
}

export type SingleStudentCrmRecordEnrollCourse = {
  id: number
  studentSchedule: SingleStudentCrmRecordEnrolledClassesStudentSchedule[]
  invoice?: SingleStudentCrmRecordEnrolledClassesInvoice
  // @deprecated Use invoice instead. Kept for backward compatibility.
  invoices?: SingleStudentCrmRecordEnrolledClassesInvoice[]
  course: PickedCourse
  registrationForm: StudentFormResponse[]
  isPaused?: boolean
}

export type SingleStudentCrmRecord = {
  email: string
  phone: string
  // firstName: string
  status?: string
  createdAt?: string
  updatedAt?: string
  enrollCourses?: SingleStudentCrmRecordEnrollCourse[]
  // studentLessons?: StudentLesson[]
}

export type StudentEnrolmentRecord = {
  id: number // userAliasId
  name: string
  email: string
  secondaryEmail?: string | null
  phone: string
  // status?: string
  userId: number
  // fullName?: string
  user: SingleStudentCrmRecord
  enrollCourses?: SingleStudentCrmRecordEnrollCourse[]
  remarks?: string | null
  studentForms: StudentFormListResponse[]
  isStudentParent?: boolean
  childOfUserAliasId?: number
  usedBalance?: number
} & BaseModelWithTimestamps

export type CreateStudentProps = {
  id: number // enroll Id
  siteId: number
  institutionId: number
  userId: number
  classId: number
  sessionId: number
  appointmentId: number
  courseId: number
  enrollInto: string
  confirmState: string
  paymentMethod: string
  paymentState: string
  paymentAmount: string
  currency: string
  name: string
  school: string
  course: object
  phone: string
  email: string
  className: string
  period: string
}

export type TypeCreateStudent = {
  name: string
  email?: string
  secondaryEmail?: string
  phone: string
  institutionId: number
  siteId: number
  isSendEmail?: boolean
}

export type TypeUpdateEnrollCourse = {
  institutionId: number
  siteId: number
  enrollCourseId: number
  confirmState: string
  isPaused?: boolean
}

export type UpdateInvoicePaymentStateDto = {
  institutionId: number
  siteId: number
  invoiceId: number
  paymentState: string
}

export type TypeEditStatusStudentParams = {
  status: string
  institutionId: number
  siteId: number
  userId: number
}

export type TypeDeleteStudentParams = {
  institutionId: number
  siteId: number
  userAliasIds: number[]
}

export type TypeEditStudent = {
  name: string
  email: string
  phone: string
  institutionId: number
  siteId: number
  userId: number
}

export type TypeGetStudentDetail = {
  userAliasId: number
  userId: number
  siteId?: number
  institutionId: number
}

export type TypeGetCouponParams = {
  institutionId: number
  siteId: number
  userId: number
}

export type TypeUserIdAndInstitutionId = {
  userId: number
  siteId: number
  institutionId: number
  userAliasId?: number
  invoiceId?: number
}

export type StudentLesson = {
  studentId: number
  id: string

  institutionId: number
  courseId: number
  classId: number

  classLessonId: number
  startTime: string
  endTime: string

  changeClassLessonId?: number
  changeEndTime: string | null
  changeStartTime: string | null

  userId: number
  // field custom to show date on calendar
  start?: string
  end?: string

  enrollCourseId: number
  studentScheduleId: number
  attendance?: AttendanceStatus

  studentSchedule?: StudentSchedule
  class?: PickedClass
  course?: PickedCourse
  enrollCourse?: SingleStudentCrmRecordEnrollCourse

  updatedAt?: string
  userAlias?: UserAlias
  studentSubmissions?: StudentSubmissionType[]
  teacherFeedbacks?: TeacherFeedbackType[]
}

/**
 * Represents a class lesson in the calendar view.
 * Used for displaying and managing lessons in the calendar interface.
 */
export type ClassLesson = {
  id: number
  courseName: string
  class: string
  start: string // ISO 8601 date-time string
  end: string // ISO 8601 date-time string

  startTime: string // ISO 8601 date-time string
  endTime: string // ISO 8601 date-time string
  changeStartTime?: string
  changeEndTime?: string
  status?: 'scheduled' | 'cancelled' | 'completed'
  location?: string
  instructor?: string

  instructorEmail?: string
  instructorId?: number
  instructorName?: string
  locationId?: number
  locationName?: string

  studentCount?: string
  attendedCount?: string // number of attendance with status not PENDING
  studentLessons?: StudentLesson[]
}

export type ClassLessonMatrix = Omit<ClassLesson, 'studentLessons'> & {
  studentLessons: StudentType[]
}

export type QRCodeStudentAttendanceData = {
  studentLesson: StudentLesson
  registrationForm: StudentFormResponse[]
  studentId: number
  name: string
  email: string
  phone: string
  courseName: string
  className: string
}

export type UpdateAttendanceDto = {
  studentLessonId: number
  attendance: AttendanceStatus
}

export type TeachingServiceSingleInvoice = {
  invoiceId: number
  // lessons: StudentLesson[]
  paymentState: PaymentState
}

export type TypeTeachingServiceDetail = {
  courseId: number
  courseName: string
  classId: number
  className: string
  courseImg: string
  enrollCourseId: number
  registrationForm: StudentFormResponse[]
  confirmState: EnrollConfirmState
  invoice?: TeachingServiceSingleInvoice
  // @deprecated Use invoice instead. Kept for backward compatibility.
  invoices?: TeachingServiceSingleInvoice[]
  classType?: ClassTypeEnum
  lessons: StudentLesson[]
  isPaused?: boolean
  /** Period identifier for change-lesson init (from lesson matrix). Recurring: recurringScheduleId; Regular v1: periodId; Regular v2: regularScheduleId. */
  recurringScheduleId?: number
  regularScheduleId?: number
  /** Period identifier for regular/workshop (v1) classes. */
  periodId?: number
  /** ISO start time of the lesson being changed — used to pre-select the matching date. */
  originalLessonStart?: string
}

export type TypeTeachingServiceEnrollCourse = Omit<
  TypeTeachingServiceDetail,
  'invoices'
>

export type TypeTeachingServiceInvoiceGroup = {
  invoiceId: number
  paymentState: PaymentState
  enrollCourses: TypeTeachingServiceEnrollCourse[]
}

export type TypeGetTeachingServiceOpt = {
  siteId: number
  institutionId: number
}

export type TypeGetTeachingServiceOptItemPeriods = {
  [id: string]: string[]
}

export type TypeGetTeachingServiceOptItemClasses = {
  id: number
  name: string
  periods: TypeGetTeachingServiceOptItemPeriods
  type?: ClassTypeEnum
  isArchived?: boolean
}

export type TypeGetTeachingServiceOptItem = {
  id: number
  name: string
  type: ClassTypeEnum
  isArchived?: boolean
  classes: TypeGetTeachingServiceOptItemClasses[]
}

export type TypeOpts = {
  value: string | null
  label: React.ReactNode | string
  data?: string[]
  isDisabled?: boolean
  type?: ClassTypeEnum
}
/* 1524: classes: 1844: label: "Reglare" periods: (3) [{…}, {…}, {…}] value: "1844" [[Prototype]]: Object 1846: {periods: Array(1), value: '1846', label: 'Drop In Event'} 1847: {periods: Array(1), value: '1847', label: 'Recurring'} [[Prototype]]: Object label: "Second Course" value: "1524" */

export type CourseOpts = TypeOpts & {
  classes: ClassOpts[]
  isDisabled?: boolean
}

export type ClassOpts = TypeOpts & {
  periods?: TypeOpts[]
}

export type TypeFormTeachingServiceSetup = {
  courseId: number
  classId: number
  classLessonDate: string
}

export type TypeGetLessonOpt = {
  studentLessonId: number
  institutionId: number
  siteId: number
}

export type StudentSchedule = {
  id: number
  type: ClassTypeEnum

  classId: number
  class?: PickedClass
  enrollCourseId: number

  periodId: number
  recurringScheduleId: number
  recurringSchedules: RepeatFormats[]

  studentLessons: StudentLesson[]
  firstStudentLesson: StudentLesson

  invoiceId: number

  invoice?: Invoice
}

export type TypeParamsGetColumnName = {
  siteId?: number
  institutionId?: number
  file: File
}

export type TypeCommonFieldItem = {
  id: number
  institutionId: number
  question: string
  description: string
  type: FieldTypes
  status: string
  option: string[]
  order: number
  isRequire: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}
export type TypeDataColumnName = {
  clientColHeaders: string[]
  // commonFields: TypeCommonFieldItem[]
}
export type RelatedFieldToColumn = {
  field: string
  column: string
  type: FieldTypes
}

export type CsvValueToDbValue = {
  csvValue: string
  dbValue: string
}

export type TypeFieldExportStudent = {
  id: number
  type: string
  field: string
  column: ValueTypes
}

export type TypeParamsImportStudent = {
  convertedData: ImportResultResponseDto[]
  siteId: number
  institutionId: number
  handleDataMethod?: string
}

export type DbMapping = {
  headerMap: RelatedFieldToColumn[]
  chargeFreqValMap?: CsvValueToDbValue[]
  defaultChargeFreqValue?: ChargeFrequency
}

export type GetChargeFrequencyValues = {
  fields: RelatedFieldToColumn[]
  // siteId: number
  // institutionId: number
  file: File
}

export type CheckImportStudentType = {
  mapDbValue: DbMapping
  siteId?: number
  institutionId?: number
  file: File
}

export type TypeParamsExportStudent = {
  fields: any[]
  institutionId: number
  siteId: number
}

export type TypeStudentEnrollment = {
  id: string | number
  type: FieldTypes
  isDefault?: boolean
  value: ValueTypes
  question: string
}
export type TypeStudentEnrollmentForm = {
  id: number | string
  question: string
  type: FieldTypes
  value: ValueTypes
}

export type EmailRequiredParams = {
  recipientUserId: number
  institutionId: number
  siteId: number
  courseId: number
  classId: number

  periodId: number
  adminEmail: string
  adminPhone: string
  studentFirstName: string
  studentEmail: string
  studentPhone?: string
}

export type EmailRequiredCourseDataParams = {
  periodId: number
  className?: string
  price?: number
  courseName?: string
  classLessonDate?: string
  timeZone: string
  schoolName: string
  location?: string
}

export type SendApplicationLinkEmailParams = EmailRequiredParams &
  EmailRequiredCourseDataParams & {
    applicationLink: string
  }

export type SendChangeLessonEmailParams = EmailRequiredParams &
  EmailRequiredCourseDataParams & {
    newClassLessonDate: string
  }

export type SendAddLessonEmailParams = EmailRequiredParams &
  EmailRequiredCourseDataParams & {
    extraClassLessonDate: string
  }

export enum ChargeFrequency {
  monthly = 'monthly',
  weekly = 'weekly',
  biWeekly = 'biWeekly',
  biMonthly = 'biMonthly',
  annually = 'annually',
}

export enum StudentNotificationType {
  PAYMENT_REMINDER = 'paymentReminder',
  OVERDUE_REMINDER = 'overdueReminder',
  LESSON_REMINDER = 'lessonReminder',
}

export enum NotificationType {
  STUDENT_NOTIF_PAYMENT_REMINDER = 'student_notif_payment_reminder',
}

export type StudentNotificationResponse = {
  id: number
  studentId: number
  notificationType: SupportedType | NotificationType
  email: boolean
  whatsapp: boolean
}

export type SubmitStudentNotification = {
  institutionId: number
  userId: number
  data: StudentNotificationResponse[]
}

export type ImportStudentResponse = {
  user: {
    id: number
    email: string
    phone: string
    firstName: string
  }

  userAlias: UserAlias

  customFields: StudentFormResponse[]
}

export type ImportResultResponseDto = {
  StudentEmail: string
  StudentName: string
  StudentPhone: string
  StudentId: number
  [id: number]: any
}

export type ImportResultDatabaseResponseDto = ImportResultResponseDto & {
  dataFoundInDb: {
    studentName: string
    studentEmail: string
    studentPhone: string
    [id: number]: any
  }
  importError: string[]
}
