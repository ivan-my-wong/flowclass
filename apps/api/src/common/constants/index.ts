import { FieldMapping, FieldType } from '@/models/common-field.entity'

export const ROLES_KEY = 'roles'
export const REQUIRE_PARAM_KEY = 'requireParams'

export const FEATURE_FLAG = {
  CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES: true,
  DO_NOT_ALLOW_DUPLICATE_ENROLL_COURSE: false,
  ENABLE_STUDENT_NOTIFICATION_SETTING: false,
}

export const COUNTRIES = {
  HONG_KONG: 'Hong Kong',
}

export const UploadFile = {
  NUMBER_OF_FILES: 20,
}

export const ISO_8601_REGEX =
  /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):?[0-5]\d)$/

export const VALID_PATH_PATTERN = /^[a-zA-Z0-9\-_/]*(%[0-9a-fA-F]{2}[a-zA-Z0-9\-_/]*)*$/

export const VALID_DOMAIN_PATTERN =
  /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.(flowclass\.io|staging\.flowclass\.io|flowclass\.site|course\.site|educator\.site|staging\.flowclass\.site|staging\.course\.site|staging\.educator\.site)$/

/** Free-form domain: localhost, example.com, my-school.local, etc. */
export const VALID_FREE_FORM_DOMAIN_PATTERN =
  /^(localhost|[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+)$/

export const VALID_CUSTOM_DOMAIN_PATTERN =
  /^(?:[a-z0-9]+(?:[-.][a-z0-9]+)*\.[a-z0-9]+(?:[-.][a-z0-9]+)*|)$/
export const DEFAULT_AI_CREDIT = 0
export const DEFAULT_AI_CREDIT_MAX = 10
export const DB = 'FLOWCLASS_DB'

export const JOB_NAME_CLASS_LESSON = 'class-lesson-job'
export type DefaultFieldType = {
  question: string
  type: FieldType
  isDefault: boolean
  columnMapping: FieldMapping
}
export const DEFAULT_FIELD: DefaultFieldType[] = [
  {
    question: 'Name',
    columnMapping: FieldMapping.NAME,
    type: FieldType.SHORT_ANSWER,
    isDefault: true,
  },
  {
    question: 'Phone',
    columnMapping: FieldMapping.PHONE,
    type: FieldType.PHONE,
    isDefault: true,
  },
  {
    question: 'Email',
    type: FieldType.EMAIL,
    columnMapping: FieldMapping.EMAIL,
    isDefault: true,
  },
]

export const KEY_DEFAULT = {
  name: {
    field: 'Name',
  },
  email: {
    field: 'Email',
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  phone: {
    field: 'Phone',
    regex: /^[0-9]{5,50}$/,
  },
  courseName: {
    field: 'Course Name',
  },
  amountCharged: {
    field: 'Amount Charged',
  },
  firstChargeDate: {
    field: 'First Charge Date',
  },
  chargeFrequency: {
    field: 'Charge Frequency',
  },
}

export const REMIND_RULE = {
  T0: 'T+0',
  T4: 'T+4',
  T8: 'T+8',
  Lesson: 'Lesson',
}

export const QUEUE_UPDATE_APPROVAL = 'queue-update-approval'
