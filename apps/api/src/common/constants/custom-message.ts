import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'

export interface IMessageVariable {
  readonly value: string
  readonly label: string
}

export interface IMessageTemplates {
  readonly [key: string | SupportedType]: string
}
export const ADMIN_EMAIL_VAR: IMessageVariable = {
  value: '[adminEmail]',
  label: 'Admin Email',
} as const
export const ADMIN_NAME_VAR: IMessageVariable = {
  value: '[adminName]',
  label: 'Admin Name',
} as const
export const ADMIN_PHONE_VAR: IMessageVariable = {
  value: '[adminPhone]',
  label: 'Admin Phone',
} as const
export const CLASS_NAME_VAR: IMessageVariable = {
  value: '[className]',
  label: 'Class Name',
} as const
export const COURSE_NAME_VAR: IMessageVariable = {
  value: '[courseName]',
  label: 'Course Name',
} as const
export const INSTRUCTOR_VAR: IMessageVariable = {
  value: '[instructor]',
  label: 'Instructor',
} as const
export const LOCATION_VAR: IMessageVariable = { value: '[location]', label: 'Location' } as const
export const PAYMENT_AMOUNT_VAR: IMessageVariable = {
  value: '[paymentAmount]',
  label: 'Payment Amount',
} as const
export const PAYMENT_METHOD_VAR: IMessageVariable = {
  value: '[paymentMethod]',
  label: 'Payment Method',
} as const
export const PAYMENT_STATUS_VAR: IMessageVariable = {
  value: '[paymentStatus]',
  label: 'Payment Status',
} as const
export const ENROLL_ID_VAR: IMessageVariable = { value: '[enrollId]', label: 'Enroll Id' } as const

export const SCHOOL_NAME_VAR: IMessageVariable = {
  value: '[institutionName]',
  label: 'Institution Name',
} as const

export const STUDENT_EMAIL_VAR: IMessageVariable = {
  value: '[studentEmail]',
  label: 'Student Email',
} as const
export const STUDENT_NAME_VAR: IMessageVariable = {
  value: '[studentName]',
  label: 'Student Name',
} as const
export const STUDENT_PHONE_VAR: IMessageVariable = {
  value: '[studentPhone]',
  label: 'Student Phone',
} as const
export const SUCCESS_PAYMENT_LINK_VAR: IMessageVariable = {
  value: '[successPaymentLink]',
  label: 'Success Payment Link',
} as const
export const UPLOAD_PAYMENT_URL_VAR: IMessageVariable = {
  value: '[uploadPaymentUrl]',
  label: 'Upload Payment Url',
} as const
export const CLASS_LESSON_DATE_VAR: IMessageVariable = {
  value: '[classLessonDate]',
  label: 'Class Lesson Date',
} as const
export const NEW_CLASS_LESSON_DATE_VAR: IMessageVariable = {
  value: '[newClassLessonDate]',
  label: 'New Class Lesson Date',
} as const
export const LESSON_TIME_VAR: IMessageVariable = {
  value: '[lessonTime]',
  label: 'Lesson Time',
} as const
export const DURATION_VAR: IMessageVariable = { value: '[duration]', label: 'Duration' } as const

export const CLASS_DATETIME_VAR: IMessageVariable = {
  value: '[classDateTime]',
  label: 'Class Datetime',
} as const

export const DEFAULT_CUSTOM_MESSAGES: IMessageTemplates = {
  admin_notif_after_enrollment_submitted:
    '📥 [institutionName] – New Application Received\n\nDear [adminName],\n\nA new application has been submitted by [studentName] for the course “[courseName]”.\n\n📧 Email: [studentEmail]\n📞 Phone: [studentPhone]\n\nPlease log in to your admin dashboard to review the application.\nThank you for your attention.',
  student_notif_after_enrollment_submitted:
    '✅ Application Received – [institutionName]\n\nDear [studentName],\n\nThank you for applying for the “[courseName]” program at [institutionName].\nWe have received your application and our team will review it shortly.\n\nShould you need any assistance, feel free to contact us at [adminPhone].\nWe appreciate your interest.',
  student_notif_after_payment_approved:
    '🎉 Payment Confirmed – [institutionName]\n\nDear [studentName],\n\nWe are pleased to inform you that your payment for “[courseName]” has been successfully confirmed.\n\n💰 Amount: [paymentAmount]\n💳 Method: [paymentMethod]\n📄 Status: [paymentStatus]\n🔗 [successPaymentLink]\n\nWelcome to the program, and thank you for choosing [institutionName].',
  student_notif_after_payment_rejected:
    '⚠️ Payment Rejected – Action Required\n\nDear [studentName],\n\nWe regret to inform you that your payment for “[courseName]” could not be processed.\nPlease kindly re-upload your payment receipt via the link below:\n\n🔁 [uploadPaymentUrl]\n\nIf you have any questions, please do not hesitate to contact us at [adminPhone].\nThank you for your cooperation.',
  // student_notif_after_application_confirmed:
  //   '🎊 Application Confirmed – [institutionName]\n\nDear [studentName],\n\nCongratulations! Your application for “[courseName]” at [institutionName] has been officially confirmed.\n\n🧑‍🏫 Instructor: [instructor]\n📍 Location: [location]\n\nWe look forward to seeing you soon.\nPlease do not hesitate to reach out should you require any assistance.',
  // teacher_notif_after_application_submitted:
  //   '📋 New Application Submitted\n\nDear [instructor],\n\nA new person named [studentName] has submitted an application for “[className]”.\n\nKindly review the details through your Flowclass dashboard.\nThank you for your continued dedication.',
  student_notif_after_add_new_lesson:
    '🆕 New Time Slot Added to Your Schedule – [institutionName]\n\nDear [studentName],\n\nA new lesson has been added to “[className]”.\n\n📅 Date: [classLessonDate]\n⏰ Time: [lessonTime]\n🕒 Duration: [duration]\n🧑‍🏫 Instructor: [instructor]\n🔗 [successPaymentLink]\n\nPlease make sure to check your schedule regularly.\nThank you and see you soon.',
  student_notif_after_change_lesson_date:
    '📆 Time Slot Rescheduled Notification - \n\nDear [studentName],\n\nPlease be informed that the schedule for your “[className]” has been updated.\n\n📌 Previous Date: [classLessonDate]\n📆 New Date: [newClassLessonDate]\n\nWe apologize for any inconvenience and thank you for your understanding.',
  student_notif_payment_reminder:
    '💳 Payment Reminder – [institutionName]\n\nDear [studentName],\n\nThis is a kind reminder to complete your payment for the “[courseName]” program.\n\n💰 Amount Due: [paymentAmount]\n💳 Payment Method: [paymentMethod]\n📤 Upload Receipt: [uploadPaymentUrl]\n\nWe appreciate your prompt attention to this matter.',
  student_lesson_reminder:
    '📚 Attendance Reminder – [institutionName]\n\nDear [studentName],\n\nThis is a friendly reminder of your upcoming “[className]”.\n\n📅 Date: [classLessonDate]\n📍 Location: [location]\n🧑‍🏫 Instructor: [instructor]\n\nWe look forward to seeing you soon.',
  create_invoice:
    '🧾 Payment Request – [institutionName]\n\nDear [studentName],\n\nA payment request has been generated for your application in “[courseName]”.\n\n💳 Total Amount: [paymentAmount]\n🔗 Payment Link: [uploadPaymentUrl]\n\nPlease proceed with the payment at your earliest convenience.\nThank you for your cooperation.',
}
