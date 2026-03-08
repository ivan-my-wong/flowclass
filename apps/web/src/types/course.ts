import { LongDescription } from './api'
import { Class } from './class'
import { CheckQuotaResponse } from './enrol'
import { EnrollmentField, School } from './school'
import { Site } from './site'

export enum RecruitPeriodStatus {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  ended = 'ended',
  noSuitableTimeslot = 'noSuitableTimeslot',
  noQuota = 'noQuota',
  noClasses = 'noClasses',
}

export enum ClassType {
  regular = 'regular',
  workshop = 'workshop',
  recurring = 'recurring',
  subscription = 'subscription',
  appointment = 'appointment',
  regularV2 = 'regularV2',
}

export type CourseFaq = {
  question: string
  answer: string
}

export type CourseCustomField = {
  id: string
  fieldKey?: string | [] // It should be a string but some history data is array
  fieldName?: string
  inputType: string
  description: string
  validation: string
  fieldData: any[]
}

export type Tag = {
  key: string
  value: string[]
  searchable: boolean
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
}

export type Course = {
  seoContent: {
    metaTitle: string
    metaDescription: string
  }
  id: number
  institutionId: number
  name: string

  shortDescription: string
  longDescriptions: LongDescription[]
  faq: CourseFaq[]
  onlineBooking: boolean
  registrationMes: string
  enableSchoolName: boolean
  schoolNameField?: CourseCustomField
  customFields?: CourseCustomField[]

  previewImageUrl: string

  previewVideoUrl: string

  viewLimit: number
  viewCount: number
  isValid: boolean
  rating: number

  totalRater: number
  commentCount: number
  // This is supposed to be the path to the course
  path: string
  searchAbleStart: string
  searchAbleEnd: string
  recruitStart: string | null
  recruitEnd: string | null
  createdAt: string
  updatedAt: string
  site: Site
  tags: Tag[] | null
  formId: string
  form?: {
    id: number
    name: string
    fields: EnrollmentField[]
    description: string
  }

  classes: Class[] | ClassWithQuotaValue[]

  courseActivitiesOrder: CourseActivitiesOrder | null
  useQrAttendance: boolean

  prerequisites?: {
    groups: {
      conditions: { courseId: number; classId: number; operator: string }[]
      groupOperator: string
    }[]
  }
} & {
  requireEmailVerification: boolean
  isPrivate: boolean
}

export type ClassWithQuotaValue = Class & { classQuota?: CheckQuotaResponse[] }

export type CourseWithQuotaValueClasses = Course & {
  classes?: ClassWithQuotaValue[]
}

export type CourseDetailProps = {
  school: School
  course: Course
}
