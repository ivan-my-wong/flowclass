import { MultiValue } from 'react-select'

import { SelectItemValuesProps } from '@/components/Selector/Select'

import { Classes } from './classes'

export type InvoicePayloadConfirm = {
  proofToken: string
  isSendToParent?: boolean
  invoiceId: number
}

export type ConfirmPaymentPayload = {
  siteId: number
  institutionId: number
  ids: number[]
  invoices?: InvoicePayloadConfirm[] | undefined
}

export type DeletePaymentPayload = {
  ids: number[]
  invoices?: InvoicePayloadConfirm[] | undefined
}

export type SendPaymentReminderPayload = {
  ids: number[]
  invoices?: InvoicePayloadConfirm[] | undefined
  action: SendPaymentActions
}

export interface IPaymentProofFilterCriteria {
  selectedPaymentMethod: MultiValue<SelectItemValuesProps>
  selectedPaymentStatus: MultiValue<SelectItemValuesProps>
  selectedCourse: MultiValue<SelectItemValuesProps>
  selectedClass: MultiValue<SelectItemValuesProps>
  selectedPromotion: MultiValue<SelectItemValuesProps>
}

export enum SendPaymentActions {
  RESEND_PAYMENT_REMINDER = 'resend-payment-reminder',
  RESEND_SUCCESS_PAYMENT_REMINDER = 'resend_success_payment-reminder',
  SEND_WA_REMINDER = 'resend-wa-payment-reminder',
  SEND_MAIL_REMINDER = 'resend-email-payment-reminder',
  SEND_SUCCESS_PAYMENT = 'resend-success-payment',
  SEND_WA_SUCCESS_PAYMENT = 'resend-wa-success-payment',
  SEND_QR_CODE = 'resend-qr-code',
}

export enum StatusPaymentProof {
  awaitingReviewWithoutProof = 'awaitingReviewWithoutProof',
  awaitingReviewProof = 'awaitingReviewProof',
  confirmed = 'confirmed',
  approved = 'approved',
  rejected = 'rejected',
}

export type ResendPaymentProofReminderDto = {
  action: SendPaymentActions
} & ConfirmPaymentPayload

export type StudentLessonInfo = {
  student: {
    id: number
    email: string
    firstName: string
    lastName: string
    phone: string
    fullName: string
  }
  studentScheduleId: number
  classId: number
  invoiceId: number
  payAmount: number
  lessons: string[]
}

export type PreviewLessonsType = {
  class: Classes | undefined
  lessons: StudentLessonInfo[]
}
