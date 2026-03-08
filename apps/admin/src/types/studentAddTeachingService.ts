import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

import {
  CreateStudentAndAddLessonInputFields,
  InputFields,
} from '@/pages/StudentDetail/components/createTeachingService'
import { AddTeachingServiceMode } from '@/stores/studentData'
import { PriceOption } from '@/types/regularClass'
import { RegularScheduleLessonPreviewPeriodGroup } from '@/types/studentInvoice.type'

import { ClassTypeEnum } from './course'
import {
  ClassOpts,
  TypeOpts,
  TypeStudentEnrollment,
  TypeStudentEnrollmentForm,
} from './student'

export type StudentAddLessonRequestDto = {
  //  example: ['2023-08-25 11:00:00 2023-08-25 12:00:00'],
  classId: number
  extraLessons?: string[]
  enrollId: number
  numOfLesson: number
  feePerLesson: number
  isCustomised: boolean
  recurringScheduleId?: number
  studentScheduleId?: number
  isSendEmail?: boolean
}

export type StudentChangeLessonRequestDto = {
  siteId: number
  institutionId: number
  courseId: number
  classId: number
  currentLessonId: number
  lessonDateTime?: string
  isSendEmail?: boolean
}

export type StudentDeleteTeachingServiceRequestDto = {
  institutionId: number
  siteId: number
  classId: number
  enrollCourseId: number
}

export type BulkAssignCourseType = {
  userAliasId: number
  email?: string
  phone: string
  name: string
}

export type StudentCreateTeachingServiceRequestDto = {
  institutionId: number
  siteId: number

  userAliasId: number

  email?: string
  phone: string
  name: string

  courseId: number
  classId: number

  // Needed when changing a regular class or event
  periodId?: number

  // Needed when changing a recurring class
  recurringScheduleId?: number

  // Needed when changing a appointment class
  appointmentId?: number

  // It's a lesson string
  firstLessonDate?: string

  lessonPrice?: number
  redirectUrl: string

  bulkAssignCourse?: BulkAssignCourseType[]
  isSendEmail?: boolean

  priceOptionId?: number

  // For regularV2 classes
  individualPickedLessonsString?: string[]
  selectedRegularSchedulePreviewV2?: RegularScheduleLessonPreviewPeriodGroup[]
}

export type StudentUpdateTeachingServiceRequestDto = {
  siteId: number
  institutionId: number
  userId: number
  userAliasId: number
  metadata: TypeStudentEnrollment[]
  invoiceId?: number
}

export type StudentAddEnrollmentFormRequestDto = {
  userId: number
  institutionId: number
  userAliasId: number
  fields: TypeStudentEnrollmentForm
}

export type StudentDeleteEnrollmentFormRequestDto = {
  userId: number
  institutionId: number
  userAliasId: number
  fieldId: number
  invoiceId?: number
}

export type StudentEnrollmentRequestDto = {
  userId: number
  institutionId: number
  siteId: number
  userAliasId: number
}

export type FormTeachingServiceProps = {
  currentDetail: {
    institutionId: number
    name: string
    email: string
    phone: string
    siteId: number
    userAliasId: number
    redirectUrl: string
  }
  form: UseFormReturn<CreateStudentAndAddLessonInputFields, any, undefined>
  isFreeLesson: boolean
  setIsFreeLesson: (value: boolean) => void
  priceType: string
  onValueChangeSelectCourse: (val: string) => void
  courseOpts: TypeOpts[]
  classesOptions: TypeOpts[]
  onValueChangeSelectClass: (val: string) => void
  classOpts?: ClassOpts[]
  currentClassType?: ClassTypeEnum
  onValueChangeSelectPeriod: (val: string) => void
  periodOpts: TypeOpts[]
  dateTimePickerOpts: string[]
  selectedDate?: Date | null
  handleSelectDate: (date: Date | null) => void
  currentClassId?: number
  mode?: AddTeachingServiceMode
  bulkAssignCourse?: BulkAssignCourseType[]
  isSendEmail: boolean
  setIsSendEmail: (value: boolean) => void
  timeZone: string
  skipLink?: string
  handleSubmit?: (
    onValid: SubmitHandler<InputFields | CreateStudentAndAddLessonInputFields>,
    onInvalid?:
      | SubmitErrorHandler<InputFields | CreateStudentAndAddLessonInputFields>
      | undefined
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>
  handleSendEmailClick?: (data: InputFields) => void
  selectedCourseName?: any
  selectedClassName?: any
  currentEnrolId?: number
  numberOfLessons?: number
  selectedPriceOption?: string | number
  priceOptions?: PriceOption[]
  onValueChangeSelectPriceOption?: (val: string) => void
  show5PeriodLimitNotice?: boolean
  isLoadingCourseOptions?: boolean
}
