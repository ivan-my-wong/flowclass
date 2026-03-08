import { PrerequisiteCourseDto } from '@/api/courses'

import { Classes } from './classes'
import { SectionTag } from './school'
import { SEOContent } from './seoSettings.type'

// export type CourseType = 'regular' | 'appointment' | 'workshop' | 'recurring'

export enum ClassTypeEnum {
  regular = 'regular',
  regularV2 = 'regularV2',
  appointment = 'appointment',
  workshop = 'workshop',
  recurring = 'recurring',
  subscription = 'subscription',
}

export type SectionDescription = {
  sectionTitle: SectionTag | string
  content: string
}

export type faqType = {
  question: string
  answer: string
}

export type FieldData = {
  label: string
  name: string
}

export type Tag = {
  key: string
  value: string[]
  searchable: boolean
}

export type QuestionData = {
  id: string
  description: string
  fieldData: FieldData[]
  inputType:
    | 'input_short_answer'
    | 'input_paragraph'
    | 'input_number'
    | 'input_multiple_choice'
    | 'input_checkbox'
    | 'input_dropdown'
    | 'input_toggle_switch'
    | 'input_date'
    | 'input_time'
    | 'input_phone'
    | 'input_file'
    | 'display_header'
    | string
  validation:
    | 'validation_optional'
    | 'validation_required'
    | 'email'
    | 'phonenumber'
    | 'not_empty'
    | 'date'
  fieldKey?: string[]
  fieldName?: 'fieldName'
}

export type CourseActivitiesOrder = {
  id: number
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
  createdBy: string | null
  updatedBy: string | null
  courseId: number
  activityOrder: number[]
  courseOrder: number[]
}

export type Course = {
  id: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  createdBy: string | null
  updatedBy: string | null
  siteId: number
  institutionId: number
  name: string | null
  courseCode?: string
  // type: CourseType
  shortDescription: string | null
  longDescriptions: SectionDescription[] | null
  faqs: faqType[] | null
  onlineBooking: boolean
  registrationMes: string | null
  enableSpecialStudy: boolean
  specialStudy: QuestionData | null
  enableSchoolName: boolean
  schoolNameField: QuestionData | null
  customFields: QuestionData[] | null
  coverImageURL: string | null
  previewImageName: string | null
  previewImageUrl: string | null
  previewVideoName: string | null
  previewVideoUrl: string | null
  favoriteCount: number
  viewLimit: number
  viewCount: number
  published: boolean
  rating: number
  totalRating: number
  totalRater: number
  commentCount: number
  displayId: string | null
  recruitStart: string | null
  recruitEnd: string | null
  formId: number | null
  path: string | null
  tags: Tag[] | null
  useQrAttendance: boolean
  classes: Classes[]

  courseActivitiesOrder: CourseActivitiesOrder | null
  seoContent: SEOContent | null
  prerequisites: PrerequisiteCourseDto
  isArchived?: boolean
  emailSettings?: EmailSettings
} & {
  // Following for course settings
  requireEmailVerification: boolean
  blockDuplicateEmailEnrollment: boolean
  isPrivate: boolean
}

export type UpdateCourseTagsProps = {
  courseId: number
  institutionId: number
  tags: Tag[]
}
export type TypeEnrollmentForm = {
  id: number
  institutionId: number
  name: string
  description: string
  status: string
  fields: number[]
  order: number
  createdAt: string
  updatedAt: string
}

export type TypeEnrollmentFormField = {
  id: number
  institutionId: number
  question: string
  description: string
  type: string
  status: string
  option: string[]
  order: number
  isRequire: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}
export type TypeEnrollmentFormDetail = {
  id: number
  institutionId: number
  name: string
  description: string
  status: string
  fields: TypeEnrollmentFormField[]
  order: number
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export enum ChargeModeOptValue {
  OneOff = 'oneOff',
  Recurring = 'recurring',
}

export enum PriceType {
  PER_LESSON = 'PER_LESSON',
  PER_CLASS = 'PER_CLASS',
  MULTIPLE_OPTIONS = 'MULTIPLE_OPTIONS',
}

export type FormCourseMessage = {
  useQrAttendance: boolean
  registrationMes: string
}

export type FormCourseDescription = {
  longDescriptions: SectionDescription[]
}

export type EmailSettings = {
  emailTitle?: string
  emailId?: string
}

export interface UpdateCourseEmailSettingsProps {
  courseId: number
  emailTitle?: string
  emailId?: string
  institutionId: number
  siteId: number
}
