import { FieldTypes } from '@/constants/common'

import { AddressDetail, ImageDetail } from './api'
import { SiteSettings, SocialMediaSetting } from './site'

export type SchoolLongDescription = {
  sectionTitle: string
  content: string
}

export type School = {
  id: number
  siteId: number
  name: string
  description?: SchoolLongDescription[]
  address?: AddressDetail
  phone?: string
  bannerImage?: string
  website?: string
  url?: string
  logo?: string
  email?: string
  contactPerson?: string
  phoneContactMethod?: PhoneContactMethod
  contactId?: string
  subscription?: string
  videoUrl?: string
  aiCredits?: number
  siteSetting?: SiteSettings
  institutionSetting?: SchoolWebpageSettings
  galleries: ImageDetail[]
  courseOrder?: number[]
  studentPrimaryIdentifier: StudentPrimaryIdentifier
}

export type SchoolWebpageSettings = {
  bannerImage: string
  name: string
  themeColor: string
  templates: string
  secondaryColor: string
  highlightColor: string
  email: string
  institutionId: number
  template: string
  socialMedia: SocialMediaSetting[]
  termsCondition: string
  id: number
  textVersion?: string
}

export enum EnrollmentFieldFlag {
  common = 'common',
  applicant = 'applicant',
  createAnAccount = 'createAnAccount',
}

export type EnrollmentField = {
  id: number
  institutionId: number
  question: string
  description: null
  type: FieldTypes
  status: string
  option: Array<string>
  order: number
  isRequire: boolean
  isDefault: boolean
  columnMapping?: string
  createdAt: string
  updatedAt: string
  flag?: EnrollmentFieldFlag
}

export type FieldsDefaults = {
  Name: string
  Email: string
  Phone: string
  specialStudy?: boolean
}

export type EnrollmentForm = {
  id: number
  institutionId: number
  name: string
  description: string
  status: string
  fields: EnrollmentField[]
  order: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  courses: any
}

export enum PhoneContactMethod {
  WhatsApp = 'WhatsApp',
  Line = 'Line',
  Wechat = 'Wechat',
  Signal = 'Signal',
  KakaoTalk = 'KakaoTalk',
  Telegram = 'Telegram',
  Phone = 'Phone',
}

export enum StudentPrimaryIdentifier {
  PHONE = 'phone',
  EMAIL = 'email',
}
