import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'

export interface IMessageVariable {
  readonly value: string
  readonly label: string
}

export interface IMessageTemplates {
  readonly [key: string | SupportedType]: string
}
export const ADMIN_EMAIL_VAR: IMessageVariable = {
  value: '{{adminEmail}}',
  label: 'Admin Email',
} as const
export const ADMIN_NAME_VAR: IMessageVariable = {
  value: '{{adminName}}',
  label: 'Admin Name',
} as const
export const ADMIN_PHONE_VAR: IMessageVariable = {
  value: '{{adminPhone}}',
  label: 'Admin Phone',
} as const
export const CLASS_NAME_VAR: IMessageVariable = {
  value: '{{className}}',
  label: 'Class Name',
} as const
export const COURSE_NAME_VAR: IMessageVariable = {
  value: '{{courseName}}',
  label: 'Course Name',
} as const
export const INSTRUCTOR_VAR: IMessageVariable = {
  value: '{{instructor}}',
  label: 'Instructor',
} as const
export const LOCATION_VAR: IMessageVariable = { value: '{{location}}', label: 'Location' } as const
export const PAYMENT_AMOUNT_VAR: IMessageVariable = {
  value: '{{paymentAmount}}',
  label: 'Payment Amount',
} as const
export const PAYMENT_METHOD_VAR: IMessageVariable = {
  value: '{{paymentMethod}}',
  label: 'Payment Method',
} as const
export const PAYMENT_STATUS_VAR: IMessageVariable = {
  value: '{{paymentStatus}}',
  label: 'Payment Status',
} as const
export const ENROLL_ID_VAR: IMessageVariable = {
  value: '{{enrollId}}',
  label: 'Enroll Id',
} as const

export const SCHOOL_NAME_VAR: IMessageVariable = {
  value: '{{institutionName}}',
  label: 'Institution Name',
} as const

export const STUDENT_EMAIL_VAR: IMessageVariable = {
  value: '{{studentEmail}}',
  label: 'Student Email',
} as const
export const STUDENT_NAME_VAR: IMessageVariable = {
  value: '{{studentName}}',
  label: 'Student Name',
} as const
export const STUDENT_PHONE_VAR: IMessageVariable = {
  value: '{{studentPhone}}',
  label: 'Student Phone',
} as const
export const SUCCESS_PAYMENT_LINK_VAR: IMessageVariable = {
  value: '{{successPaymentLink}}',
  label: 'Success Payment Link',
} as const
export const UPLOAD_PAYMENT_URL_VAR: IMessageVariable = {
  value: '{{uploadPaymentUrl}}',
  label: 'Upload Payment Url',
} as const
export const CLASS_LESSON_DATE_VAR: IMessageVariable = {
  value: '{{classLessonDate}}',
  label: 'Class Lesson Date',
} as const
export const NEW_CLASS_LESSON_DATE_VAR: IMessageVariable = {
  value: '{{newClassLessonDate}}',
  label: 'New Class Lesson Date',
} as const
export const LESSON_TIME_VAR: IMessageVariable = {
  value: '{{lessonTime}}',
  label: 'Lesson Time',
} as const
export const DURATION_VAR: IMessageVariable = {
  value: '{{duration}}',
  label: 'Duration',
} as const

export const CLASS_DATETIME_VAR: IMessageVariable = {
  value: '{{classDateTime}}',
  label: 'Class Datetime',
} as const

export const INVOICE_DETAILS_VAR: IMessageVariable = {
  value: '{{invoiceDetails}}',
  label: 'Invoice Details (auto-generated block with classes, lessons, prices)',
} as const

export const DEFAULT_CUSTOM_MESSAGES: IMessageTemplates = {
  student_lesson_reminder:
    '📚 Attendance Reminder – {{institutionName}}\n\nDear {{studentName}},\n\nThis is a friendly reminder of your upcoming “{{className}}”.\n\n📅 Date: {{classLessonDate}}\n📍 Location: {{location}}\n🧑‍🏫 Instructor: {{instructor}}\n\nWe look forward to seeing you soon.',
  create_invoice: '{{invoiceDetails}}\n\n付款連結: {{uploadPaymentUrl}}',
}
