export enum RecordLogType {
  CREATE_COUPON = 'CREATE_COUPON',
  USAGE_COUPON = 'USAGE_COUPON',
  CONFIRM_USAGE_COUPON = 'CONFIRM_USAGE_COUPON',
  DELETE_COUPON = 'DELETE_COUPON',
  STUDENT_CHANGE_INFOMATION = 'STUDENT_CHANGE_INFOMATION',
  STUDENT_ADD_CLASS = 'STUDENT_ADD_CLASS',
  STUDENT_CHANGE_TIME_TABLE = 'STUDENT_CHANGE_TIME_TABLE',
  ADDING_CLASS = 'ADDING_CLASS',
  RESCHEDULE_LESSON = 'RESCHEDULE_LESSON',
}

export enum STUDENT_TABS {
  ALL = 'ALL',
  BIN = 'BIN',
}

export const TimeFormat = {
  activityDateTime: 'DD MMM YYYY | hh:mm',
  DD_MM_YYYY: 'DD MMM YYYY',
  HH_mm: 'HH:mm',
  DD_MM_YYYY_DEFAULT: 'DD/MM/YYYY',
  default: 'DD/MM/YYYY hh:mm',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CustomMessageVariable {
  STUDENT_NAME = '{{studentName}}',
  SCHOOL_NAME = '{{schoolName}}',
  CLASS_NAME = '{{className}}',
  COURSE_NAME = '{{courseName}}',
  LOCATION = '{{location}}',
  ADMIN_PHONE = '{{adminPhone}}',
  CLASS_LESSON_DATE = '{{classLessonDate}}',
  NEW_CLASS_LESSON_DATE = '{{newClassLessonDate}}',
  PAYMENT_LINK = '{{paymentLink}}',
  PERIOD = '{{period}}',
  PAY_AMOUNT = '{{payAmount}}',
  UPLOAD_PAYMENT_URL = '{{uploadPaymentUrl}}',
  COURSE_ITEMS = '{{courseItems}}',
  LESSON_ITEMS = '{{lessonItems}}',
  // Repeater item variables (for courseItems)
  COURSE_INDEX = '{{courseIndex}}',
  COURSE_SCHEDULE = '{{schedule}}',
  LESSON_COUNT = '{{lessonCount}}',
  TEACHER_NAME = '{{teacherName}}',
  LESSON_DATES_LABEL = '{{lessonDatesLabel}}',
  LESSON_DATES = '{{lessonDates}}',
  COURSE_PRICE = '{{coursePrice}}',
  // Repeater item variables (for lessonItems)
  LESSON_INDEX = '{{lessonIndex}}',
  LESSON_DATE = '{{lessonDate}}',
  LESSON_TIME = '{{lessonTime}}',
}

export enum ImportRequiredFieldsV2 {
  userId = 'userId',
  userEmail = 'userEmail',
  userPhone = 'userPhone',
  userFirstName = 'userFirstName',
  notApplicable = 'NotApplicable',
  studentName = 'StudentName',
  studentEmail = 'StudentEmail',
  studentPhone = 'StudentPhone',
}

export const CUSTOM_DATA_FIELD_THRESHOLD = 3
export const STALE_TIME = 1000 * 60 * 1 // 1 minute
export const TIMEOUT_TIME = 1000
export const CACHE_TIME: number = 5 * 60 * 1000
export const DEBOUNCE_TIME = 500
// Common page size options following industry standards
// Ordered from smallest to largest for intuitive selection
export const ROWS_OPTIONS: number[] = [5, 10, 20, 50, 100]
export const DEFAULT_ROWS_PER_PAGE = 10
// Maximum number of page buttons to display in pagination
export const MAX_PAGES_TO_SHOW = 5
// Header and row height for consistent UI
export const HEADER_HEIGHT = 48
export const ROW_HEIGHT = 48
export const DEFAULT_TABLE_HEIGHT = '500px'
// Text ellipsis for truncated content
export const ELLIPSIS_TEXT = '...'
// Viewport height offsets for different device sizes
export const VIEWPORT_OFFSETS = {
  smallMobile: 'clamp(16rem, 19rem, 20rem)',
  mobile: 'clamp(18rem, 20rem, 22rem)',
  tablet: 'clamp(15rem, 17rem, 19rem)',
} as const

// External URLs
export const REGISTRATION_URL = 'https://app.flowclass.io/register'
