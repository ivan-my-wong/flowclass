export enum SupportedType {
  ADMIN_NOTIF_AFTER_ENROLLMENT_SUBMITTED = 'admin_notif_after_enrollment_submitted',
  STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED = 'student_notif_after_enrollment_submitted',
  STUDENT_NOTIF_AFTER_PAYMENT_APPROVED = 'student_notif_after_payment_approved',
  STUDENT_NOTIF_AFTER_PAYMENT_REJECTED = 'student_notif_after_payment_rejected',
  // STUDENT_NOTIF_AFTER_APPLICATION_CONFIRMED = 'student_notif_after_application_confirmed',
  // TEACHER_NOTIF_AFTER_APPLICATION_SUBMITTED = 'teacher_notif_after_application_submitted',
  STUDENT_NOTIF_AFTER_ADD_NEW_CLASS = 'student_notif_after_add_new_class',
  STUDENT_NOTIF_AFTER_ADD_NEW_LESSON = 'student_notif_after_add_new_lesson',
  STUDENT_NOTIF_AFTER_CHANGE_LESSON_DATE = 'student_notif_after_change_lesson_date',
  // STUDENT_NOTIF_PAYMENT_REMINDER = 'student_notif_payment_reminder',
}

export const SUPPORTED_WHATSAPP_TEMPLATE = Object.values(SupportedType)

export type CustomMessage = {
  id?: number
  name: string
  content: string
  type: SupportedType
  variables?: Record<string, any>
  emailNotification?: boolean
  whatsappNotification?: boolean

  createdAt?: string
  updatedAt?: string
}

export type CustomMessageVariable = {
  label: string
  value: string
}

export type CustomMessagePreparedData = {
  types: SupportedType[]
  variables: {
    type: SupportedType
    variables: CustomMessageVariable[]
  }[]
}
