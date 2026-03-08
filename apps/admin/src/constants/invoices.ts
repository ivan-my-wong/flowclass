import { Course } from '@/types/course'

export const DEFAULT_CURRENCY = 'USD'

type PayoutMethodDetailsType = {
  bankName?: boolean
  accountId?: boolean
  payoutImg?: boolean
  payoutUrl?: boolean
  bankBranch?: boolean
  accountName?: boolean
  successMessage?: boolean
  receiptRequired?: boolean
  paymentMethodName?: boolean
}

type CourseType = {
  id: boolean
  name: boolean
  path: boolean
} & Partial<Record<keyof Course, boolean>>

export type PayLaterMethodType = {
  id?: boolean
  siteId?: boolean
  enabled?: boolean
  methodName?: boolean
  methodType?: boolean
  description?: boolean
  payoutMethodDetails?: PayoutMethodDetailsType
}

type EnrollCourseType = {
  id?: boolean
  name?: boolean
  phone?: boolean
  email?: boolean
  currency?: boolean
  confirmState?: boolean
  paymentAmount?: boolean
  enrollInto?: {
    id?: boolean
    secondLevelName?: boolean
    thirdLevelName?: boolean
  }
  registrationForm?: boolean
  userId?: boolean
  userAlias?: boolean
  userAliasId?: boolean
}

type StudentSchedulesType = {
  id?: boolean
  classId?: boolean
  class?: {
    id?: boolean
    name?: boolean
    instructorId?: boolean
  }
  firstStudentLesson?: {
    id?: boolean
    startTime?: boolean
    endTime?: boolean
    changeStartTime?: boolean
    changeEndTime?: boolean
  }
  studentLessons?: {
    id?: boolean
    startTime?: boolean
    endTime?: boolean
    changeStartTime?: boolean
    changeEndTime?: boolean
  }
}

type PaymentEvidenceType = {
  id?: boolean
  status?: boolean
}

type PromotionUsedType = {
  id?: boolean
  coupon?: boolean
}

interface IInvoiceFieldsType {
  payLaterMethod?: PayLaterMethodType
  course?: CourseType
  enrollCourse?: EnrollCourseType
  studentSchedules?: StudentSchedulesType
  paymentEvidence?: PaymentEvidenceType
  promotionUsed?: PromotionUsedType
  [key: string]: any
}
