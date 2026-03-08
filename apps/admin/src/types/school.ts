import { InstitutionMediaUploadResponse } from './apiResponse'
import { SectionDescription } from './course'

export type AdminSchool = {
  id: number | null
  name: string | null
  email: string | null
}
export type School = {
  [key: string]:
    | string
    | number
    | null
    | number[]
    | AddressDetail
    | InstitutionMediaUploadResponse[]
    | SectionDescription[]
    | unknown[]
    | SiteSetting
    | AdminSchool[]
  id: number
  name: string
  videoUrl: string | null
  phone: string | null
  email: string | null
  bannerImage: string | null
  address: AddressDetail | null
  url: string | null
  locality: string | null
  description: SectionDescription[] | null
  slogan: string | null
  rating: number | null
  totalRating: number | null
  totalRater: number | null
  commentCount: number | null
  favoriteCount: number | null
  rankScore: number | null
  pathConfig: string | null
  displayId: string | null
  website: string | null
  logo: string | null
  contactPerson: number | null
  phoneContactMethod: string | null
  contactId: string | null
  subscription: string | null
  country: string
  galleries: InstitutionMediaUploadResponse[] | null
  siteId: number
  planId: number | null
  planExpiryDate: string | null
  planRecords: SubscriptionPlanRecord[] | null
  siteSetting: SiteSetting
  aiCredit: number
  aiCreditMax: number
  admins: AdminSchool[]
  courseOrder: number[]
  createdAt: string
  studentPrimaryIdentifier: StudentPrimaryIdentifier
}

export enum StudentPrimaryIdentifier {
  EMAIL = 'email',
  PHONE = 'phone',
}

export type AddressDetail = {
  country: string
  city: string
  state: string
  area: string
  addressLine1: string
  addressLine2: string
}
export type SectionTag =
  | 'DEFAULT'
  | 'COURSE_FEATURES'
  | 'COURSE_DESC'
  | 'COURSE_REVIEW'
  | 'COURSE_SYLLABUS'
  | 'COURSE_ARTICULATION'
  | 'COURSE_INSTRUCTOR'
  | 'COURSE_STUDENT_PERF'
  | 'COURSE_CERTIFICATION'
  | 'COURSE_APPLICATION'
  | 'COURSE_TARGET'
  | 'COURSE_LOCATION'
  | 'COURSE_ENQUIRY'
  | 'COURSE_TIMETABLE'
  | 'SCHOOL_ABOUT_US'
  | 'SCHOOL_FACILITIES'
  | 'SCHOOL_STUDENT_ACHIEVEMENT'
  | 'SCHOOL_QUALIFICATION_AWARDS'
  | 'SCHOOL_SUPPORT'
  | 'SCHOOL_FAQS'
  | 'SCHOOL_STUDENT_LIFE'
  | 'SCHOOL_AWARDS'
  | 'SCHOOL_SUCCESS_STORIES'

export type SectionEditorState = Record<SectionTag, string>

export type ImageTag =
  | 'all'
  | 'environment'
  | 'student'
  | 'courseReview'
  | 'teacherQualification'

export type LongDescriptions = {
  sectionTitle: SectionTag
  content: string
}

export type SiteSetting = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  createdBy: string
  updatedBy: string
  siteId: number
  language: string
  timeZone: string
  zoneOffset: number
  currency: string
  domain: string | null
  country: string
  countryCode: string
  displayEmailLogo: boolean
}

export enum SectionTagEnum {
  DEFAULT = 'DEFAULT',
  SCHOOL_ABOUT_US = 'SCHOOL_ABOUT_US',
}

export enum CourseSectionTagEnum {
  COURSE_FEATURES = 'COURSE_FEATURES',
}

export enum PhoneContactMethod {
  WhatsApp = 'WhatsApp',
  Line = 'Line',
  Wechat = 'Wechat',
  Signal = 'Signal',
  KakaoTalk = 'KakaoTalk',
  Telegram = 'Telegram',
}

export type CopySchool = {
  email: string
  institutionId: number
}
