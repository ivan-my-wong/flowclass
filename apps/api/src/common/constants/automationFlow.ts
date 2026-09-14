export type AutomationFunction = {
  name: string
  description: string
  functionName: string
  functionInterval?: string | null
  intervalLabel?: string | null
  labelPosition?: string | null
  whatsappTemplateRequired?: boolean
  variables?: Record<string, any> | null
}

export type CustomMessageType = {
  name: string
  value: string
}

export enum AutomationFunctionNames {
  SEND_COURSE_REMINDER = 'sendCourseReminder',
  SEND_PAYMENT_REMINDER = 'sendPaymentReminder',
  CREATE_INVOICE = 'createInvoice',
  SEND_CHANGE_SCHEDULE_LESSON = 'sendChangeScheduleLesson',
  SEND_UPLOAD_PAYMENT_RECEIPT = 'sendUploadPaymentReceipt',
  SEND_AFTER_FINISH_APPLICATION = 'sendAfterFinishApplication',
  SEND_AFTER_APPROVE_PAYMENT = 'sendAfterApprovePayment',
  SEND_ADD_LESSON_REMINDER = 'sendAddLessonReminder',
  SEND_ADD_CLASS_REMINDER = 'sendAddClassReminder',
}

export enum CustomMessageVariable {
  STUDENT_NAME = '{{studentName}}',
  SCHOOL_NAME = '{{institutionName}}',
  CLASS_NAME = '{{className}}',
  COURSE_NAME = '{{courseName}}',
  LOCATION = '{{location}}',
  ADMIN_PHONE = '{{adminPhone}}',
  CLASS_LESSON_DATE = '{{classLessonDate}}',
  NEW_CLASS_LESSON_DATE = '{{newClassLessonDate}}',
  UPLOAD_PAYMENT_URL = '{{uploadPaymentUrl}}',
  SUCCESS_PAYMENT_LINK = '{{successPaymentLink}}',
}

export type customMessageKeys =
  | 'studentName'
  | 'institutionName'
  | 'className'
  | 'courseName'
  | 'location'
  | 'adminPhone'
  | 'classLessonDate'
  | 'newClassLessonDate'
  | 'uploadPaymentUrl'
  | 'uploadPaymentUrl'
  | 'successPaymentLink'

export const customMessageOptions: Record<customMessageKeys, string> = {
  studentName: CustomMessageVariable.STUDENT_NAME,
  institutionName: CustomMessageVariable.SCHOOL_NAME,
  className: CustomMessageVariable.CLASS_NAME,
  courseName: CustomMessageVariable.COURSE_NAME,
  location: CustomMessageVariable.LOCATION,
  adminPhone: CustomMessageVariable.ADMIN_PHONE,
  classLessonDate: CustomMessageVariable.CLASS_LESSON_DATE,
  newClassLessonDate: CustomMessageVariable.NEW_CLASS_LESSON_DATE,
  uploadPaymentUrl: CustomMessageVariable.UPLOAD_PAYMENT_URL,
  successPaymentLink: CustomMessageVariable.SUCCESS_PAYMENT_LINK,
}

export const automationFunctions: Record<AutomationFunctionNames, AutomationFunction> = {
  [AutomationFunctionNames.CREATE_INVOICE]: {
    name: 'Create Invoice',
    description: 'Create invoice for students who have not paid for their courses',
    functionName: AutomationFunctionNames.CREATE_INVOICE,
    functionInterval: null,
    intervalLabel: null,
    labelPosition: null,
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.uploadPaymentUrl,
      customMessageOptions.courseName,
      customMessageOptions.className,
      customMessageOptions.institutionName,
    ],
  },
  [AutomationFunctionNames.SEND_PAYMENT_REMINDER]: {
    name: 'Send Payment Reminder',
    description: 'Send payment reminder to students who have not paid for their courses',
    functionName: AutomationFunctionNames.SEND_PAYMENT_REMINDER,
    functionInterval: '1 day',
    intervalLabel: 'form.labelUnpaidFor',
    labelPosition: 'end',
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.uploadPaymentUrl,
      customMessageOptions.institutionName,
    ],
  },
  [AutomationFunctionNames.SEND_COURSE_REMINDER]: {
    name: 'Send Course Reminder',
    description: 'Send course reminder to students who have not completed their courses',
    functionName: AutomationFunctionNames.SEND_COURSE_REMINDER,
    functionInterval: '1 day',
    intervalLabel: 'form.labelBeforeLesson',
    labelPosition: 'start',
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
    ],
  },
  [AutomationFunctionNames.SEND_CHANGE_SCHEDULE_LESSON]: {
    name: 'Send Change Schedule Lesson',
    description: 'Send change schedule lesson reminder to students',
    functionName: AutomationFunctionNames.SEND_CHANGE_SCHEDULE_LESSON,
    functionInterval: null,
    intervalLabel: null,
    labelPosition: null,
    whatsappTemplateRequired: false,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
      customMessageOptions.classLessonDate,
      customMessageOptions.newClassLessonDate,
      customMessageOptions.location,
      customMessageOptions.adminPhone,
    ],
  },
  [AutomationFunctionNames.SEND_UPLOAD_PAYMENT_RECEIPT]: {
    name: 'Send Upload Payment Receipt',
    description: 'Send whatsapp for upload payment receipt',
    functionName: AutomationFunctionNames.SEND_UPLOAD_PAYMENT_RECEIPT,
    functionInterval: null,
    intervalLabel: null,
    labelPosition: null,
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
      customMessageOptions.location,
      customMessageOptions.adminPhone,
      customMessageOptions.uploadPaymentUrl,
    ],
  },
  [AutomationFunctionNames.SEND_AFTER_FINISH_APPLICATION]: {
    name: 'Send Reminder After Student Finish Application',
    description: 'Send whatsapp for reminding the student after finish the application form',
    functionName: AutomationFunctionNames.SEND_AFTER_FINISH_APPLICATION,
    functionInterval: '5 minute',
    intervalLabel: 'form.afterRegistered',
    labelPosition: 'start',
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
      customMessageOptions.location,
      customMessageOptions.adminPhone,
      customMessageOptions.uploadPaymentUrl,
    ],
  },
  [AutomationFunctionNames.SEND_AFTER_APPROVE_PAYMENT]: {
    name: 'Send Reminder After Admin Approve',
    description: 'Send whatsapp for reminding the student after admin approved the payment',
    functionName: AutomationFunctionNames.SEND_AFTER_APPROVE_PAYMENT,
    functionInterval: '5 minute',
    intervalLabel: 'form.afterApproved',
    labelPosition: 'start',
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
      customMessageOptions.location,
      customMessageOptions.adminPhone,
      customMessageOptions.successPaymentLink,
    ],
  },
  [AutomationFunctionNames.SEND_ADD_CLASS_REMINDER]: {
    name: 'Send Reminder After Add New Class',
    description: 'Send for reminding the student after admin add new class',
    functionName: AutomationFunctionNames.SEND_ADD_CLASS_REMINDER,
    functionInterval: null,
    intervalLabel: null,
    labelPosition: null,
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
      customMessageOptions.location,
      customMessageOptions.adminPhone,
      customMessageOptions.successPaymentLink,
    ],
  },
  [AutomationFunctionNames.SEND_ADD_LESSON_REMINDER]: {
    name: 'Send Reminder After Add New Lesson',
    description: 'Send for reminding the student after admin add new lesson',
    functionName: AutomationFunctionNames.SEND_ADD_LESSON_REMINDER,
    functionInterval: null,
    intervalLabel: null,
    labelPosition: null,
    whatsappTemplateRequired: true,
    variables: [
      customMessageOptions.studentName,
      customMessageOptions.institutionName,
      customMessageOptions.className,
      customMessageOptions.courseName,
      customMessageOptions.location,
      customMessageOptions.adminPhone,
      customMessageOptions.successPaymentLink,
    ],
  },
}

// Check this ticket for more details
// https://flowclass.atlassian.net/browse/FLOW-1280
export const defaultBeforeLessonReminderFunctions = [
  automationFunctions[AutomationFunctionNames.SEND_COURSE_REMINDER],
]

export const defaultPaymentReminderFunctions: AutomationFunction[] = [
  automationFunctions[AutomationFunctionNames.CREATE_INVOICE],
  {
    ...automationFunctions[AutomationFunctionNames.SEND_PAYMENT_REMINDER],
    functionInterval: '4 day',
  },
  {
    ...automationFunctions[AutomationFunctionNames.SEND_PAYMENT_REMINDER],
    functionInterval: '3 day',
  },
  {
    ...automationFunctions[AutomationFunctionNames.SEND_PAYMENT_REMINDER],
    functionInterval: '2 day',
  },
]

export const defaultAfterFinishApplicationFunctions: AutomationFunction[] = [
  {
    ...automationFunctions[AutomationFunctionNames.SEND_AFTER_FINISH_APPLICATION],
  },
]

export const defaultAfterAfterApprovePaymentFunctions: AutomationFunction[] = [
  {
    ...automationFunctions[AutomationFunctionNames.SEND_AFTER_APPROVE_PAYMENT],
  },
]

export const defaultAddLessonReminderFunctions: AutomationFunction[] = [
  {
    ...automationFunctions[AutomationFunctionNames.SEND_ADD_LESSON_REMINDER],
  },
]

export const defaultAddClassReminderFunctions: AutomationFunction[] = [
  {
    ...automationFunctions[AutomationFunctionNames.SEND_ADD_CLASS_REMINDER],
  },
]

export enum ActionTypeLessonWts {
  ADD_LESSON = 'addLesson',
  CHANGE_LESSON = 'changeLesson',
  ADD_CLASS = 'addClass',
}
