import { Mixin } from 'ts-mixer'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import {
  StudentCreateEnrollCourseDto,
  StudentData,
  StudentMultipleClassInfo,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { Attachment, Personalization, Variable } from '@/domain/external/email-transport.provider'
import { StudentEnrollCourseAlias } from '@/models/custom-types/enroll-course'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { PaymentMethod } from '@/models/enums'
import { Invoice } from '@/models/invoice.entity'
import { PayoutMethod } from '@/models/payout-method.entity'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { Transaction } from '@/models/transaction.entity'

import { Course } from '../courses.entity'
import { RequestTimeChangeStatus } from '../enums/status'
import { Institution } from '../institutions.entity'
import { NotificationType } from '../notification-record.entity'
import { Site } from '../site.entity'
import { UserAlias } from '../user-aliases.entity'

export class CommonEmailParams {
  studentName: string
  studentPhone: string
  emailAddress: string
  institutionName: string
  enrolId?: string
  recipientId?: number
  remark?: string
  enrollmentForm?: EnrollmentForm[]
}

export class CourseEmailParams {
  timeZone: string
  courseName: string
  className: string
  classDateTime: string
  institutionName: string
  institutionId?: number
  siteId?: number
  location: string
  adminEmail: string
  adminPhone: string
  contactPhone?: string
  contactEmail?: string
  instructor?: string
}

export class ApplicationEmailParams {
  enrolId: string
  studentName: string
  studentEmail: string
  studentPhone: string
}

export class PaymentEmailParams {
  price: string
  paymentAmount: string
  paymentMethod: string
  paymentStatus: string
  transactionId: string
  successPaymentLink?: string
  reUploadPaymentUrl?: string
  uploadPaymentUrl?: string
}

export class IdEmailParams {
  siteId: string
  institutionId: string
  courseId: number
  classId: string
  recipientUserId: string
  periodId?: string
}

export class WaitingStudentPaymentEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  PaymentEmailParams
) {
  password?: string
  paymentLink: string
  remark?: string
  enrollCourses?: {
    className: string
    courseName: string
    studentName: string
    classDateTime: string
  }[]
}

export class ClassStudentConfirmationEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  PaymentEmailParams
) {
  password?: string
  successPaymentLink: string
}

export class ClassStudentSendQrCodeEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  PaymentEmailParams
) {}

export class StudentAssignedCourseEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  IdEmailParams
) {
  courseId: number
  studentPhone: string
  applicationLink: string
}

export class ClassStudentRejectPaymentEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  PaymentEmailParams
) {
  reUploadPaymentUrl: string
}

export class ClassStudentReceiptPaymentEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  PaymentEmailParams
) {
  uploadPaymentUrl: string
}

export class ClassAdminNewRegistrationEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  ApplicationEmailParams,
  PaymentEmailParams
) {}

export class ClassAdminPaymentConfirmationEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  ApplicationEmailParams,
  PaymentEmailParams
) {}

export class ClassAdminPaymentSubmittedEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  ApplicationEmailParams,
  PaymentEmailParams
) {
  file: Buffer
  filename: string
  paymentReceipt: string
}

export class UploadPaymentReceiptEmailParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  ApplicationEmailParams,
  PaymentEmailParams
) {
  paymentReceiptUploadLink: string
}

export type SendEmailFunctionBuildParams = {
  institution: Record<string, any>
  institutionId: number
  site: Record<string, any>
  enrollCourse?: EnrollCourse
  course: Course
  invoice: Partial<Invoice>
  multipleClassInfo?: StudentMultipleClassInfo
  classDateTime: string
  enrollmentForm?: EnrollmentForm[]
  paymentReceiptUploadLink?: string
  paymentLink?: string
  paymentMethod: string
  enrollCourses?: EnrollCourse[]
  subject?: string
  attachments?: Attachment[]
}

export class ClassStudentConfirmationWhatsappParams {
  studentName: string
  courseName: string
  className: string
  classDateTime: string
  institutionName: string
  location: string
  adminPhone: string
}

export class VerificationEmailParams {
  userId: number
  firstName: string
  emailAddress: string
  verificationLink: string
  phoneNumber: string
}

export class ApplicationLinkParams extends Mixin(
  CommonEmailParams,
  CourseEmailParams,
  ApplicationEmailParams
) {
  applicationLink: string
}

export class SendEmailPayload {
  emailSubject: string
  emailAddress: string
  recipientUserId: number
  recipientName: string
  templateId: string
  notificationType: SupportedType | NotificationType
  personalization: Variable[]
  advancePersonalization?: Personalization[]
  institutionId?: number
  institutionName?: string
  siteId?: number
  attachments?: Attachment[]
}

export interface RemindPaymentT0 {
  recipientUserId: number
  institutionId: number
  siteId: number
  priceWithCurrency: string
  enrolId: number
  location: string
  timeZone: string
  className: string
  adminEmail: string
  adminPhone: string
  courseName: string
  paymentLink: string
  studentName: string
  classDateTime?: string
  paymentStatus: string
  insName: string
  studentEmail: string
}

export interface RemindPaymentT4 extends RemindPaymentT0 {
  contactUsLink?: string
}

export type EnrollmentForm = {
  question?: string
  answer?: string
}

export const defaultSettingNotifications = {
  displayEmailLogo: false,
  customEmailSender: false,
  sendReminders: false,
  sendLessonReminders: false,
  customMessage: null,
  wtsApiToken: null,
  wtsApiSid: null,
  wtsApiPhoneNumber: null,
}

export type StudentLessonReminderDataDto = {
  recipientUserId: number
  institutionId: number
  siteId: number
  courseName: string
  className: string
  studentSchedule: StudentSchedule
  timeZone: string
  institutionName: string
  location: string
  adminPhone: string
  adminEmail: string
  studentName: string
  firstLesson: string
  studentEmail: string
  enrollCourseId: number
  studentPhone?: string
  successPaymentLink: string
}

export type StudentLessonReminderDto = {
  data: StudentLessonReminderDataDto
  enrollCourse?: EnrollCourse
  customTemplateId?: string
}

export type ResetPasswordParams = {
  userId: number
  emailAddress: string
}

export type StudentPostPoneParams = {
  recipientUserId: number
  institutionId: number
  siteId: number
  schoolEmail: string
  schoolPhone: string
  studentName: string
  studentEmail: string
  courseName: string
  originalDateTime: string
  newDateTime: string
}

export type ReminderEnrollCourseParams<T> = {
  emailData: T
  enrollCourse?: EnrollCourse
}

export type SendRequestAiCreditParams = {
  institutionId: number
  aiCreditDeposit: number
}

export type SendEmailParams = {
  emailPayload: SendEmailPayload
  enrollCourse?: EnrollCourse
}

export type SendStudentConfirmCourseParams = {
  userAlias: UserAlias
  recipientUser: StudentData
  institutionId: number
  siteId: number
  payload: ClassStudentConfirmationEmailParams
  enrollCourse: EnrollCourse
  invoice: Partial<Invoice>
}

export type SendStudentPaymentRejectParams = {
  enrollCourse: EnrollCourse
  invoice: Partial<Invoice>
  transaction: Transaction
}

export type SendClassAdminRegistrationParams = {
  payload: ClassAdminNewRegistrationEmailParams
  enrollCourse?: EnrollCourse
}

export type SendClassAdminPaymentConfirmParams = {
  recipientUserId: number
  institutionId: number
  siteId: number
  payload: ClassAdminPaymentConfirmationEmailParams
  enrollCourse?: EnrollCourse
}

export type SendClassAdminConfirmedEmailParams = {
  enrollCourse: EnrollCourse
  invoice: Partial<Invoice>
  transaction: Transaction
}

export type SendClassAdminPaymentSubmittedParams = {
  recipientUserId: number
  institutionId: number
  siteId: number
  payload: ClassAdminPaymentSubmittedEmailParams
}

export type SendAssignCouponParams = {
  userId: number
  studentName: string
  studentEmail: string
  institutionName: string
  couponCode: string
  discountAmountUnit: string
  expiredDate: Date
}

export type SendForgetPasswordParams = {
  userId: number
  emailAddress: string
  resetLink: string
}

export type SendStudentPaymentConfirmedEmail = {
  userAlias?: UserAlias
  invoice: Partial<Invoice>
  transaction?: Transaction
  applicants?: StudentData[]
  enrollmentForm?: EnrollmentForm[]
}

export type GenerateQrCodeAttachment = {
  invoice: Partial<Invoice>
  enrollCourse: EnrollCourse
  studentLessonIds: Record<number, number[]>
  isForFirstApplicant?: boolean
  participantId?: number
}

export type SendClassStudentWaitingParams = {
  recipientUserId: number
  firstStudentAccount: StudentEnrollCourseAlias
  parentUserAlias?: UserAlias
  params: SendEmailFunctionBuildParams
}

export type GetPaymentMethodParams = {
  paymentMethod: PaymentMethod
  payoutMethod?: PayoutMethod
  payAmount?: number
}

export type EnrolledCourseReminderDto = {
  userAlias?: UserAlias
  classAdminPaymentConfirmation: ClassAdminNewRegistrationEmailParams
  enrollCourses: EnrollCourse[]
  invoice: Partial<Invoice>
  createEnrollCourseDto: StudentCreateEnrollCourseDto
  successfulAccounts: StudentEnrollCourseAlias[]
  enrollmentForm: EnrollmentForm[]
  institution: Institution
  site: Site
  multipleClassInfo: StudentMultipleClassInfo
  isSendEmail: boolean
  classDateTime: string
  paymentReceiptUploadLink: string
  paymentLink: string | undefined
  course?: Course
  token: string

  contactPhone: string
  studentPhone: string

  emailSubject?: string
  attachments?: Attachment[]
  isSendToParent?: boolean
}

export type SendQuestionEmailProps = {
  emailSubject: string
  studentEmail: string
  studentName: string
  question: string
  courseName: string
  institutionId: number
  className: string
  studentPhone: string
}

export type RequestTimeChangeEmailProps = {
  emailSubject: string
  studentEmail: string
  studentName: string
  status: RequestTimeChangeStatus
  institutionId: number
  institutionName: string
  newClassDateTime: string
  originalClassDateTime: string
  courseName: string
  adminEmail: string
}

export type SendCourseEmailVerificationParams = {
  courseName: string
  emailAddress: string
  applicationLink: string
  institutionName: string
  institutionId: number
}

export type SendClassMaterialsEmailProps = {
  emailAddress: string
  courseName: string
  className: string
  institutionId: number
  institutionName: string
  studentName: string
  siteLink: string
  contactEmail: string
}

export type SendTeacherUploadedSubmissionFeedback = {
  emailAddress: string
  userId: number
  institutionId: number
  siteId: number
  adminEmail: string
  className: string
  institutionName: string
  studentName: string
  fileBuffers: Buffer[]
}
