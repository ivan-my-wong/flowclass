import { SocialMediaSetting } from './settingSocialMedia'

export enum TextVersion {
  SCHOOL = 'school',
  EVENT = 'event',
  SERVICE = 'service',
}
export type WebpageInstitutionSettingProps = {
  bannerImage?: string
  phoneNumber?: string
  name?: string
  themeColor: string
  templates: string
  secondaryColor: string
  highlightColor: string
  email?: string
  institutionId?: number
  id: number
  socialMedia?: SocialMediaSetting[]
  termsCondition: string
  siteSetting: RegionLanguageSettingResponse
  studentLogin?: boolean
  textVersion?: TextVersion
}

export type UpdateWebpageInstitutionSettingProps = {
  institutionId?: number
  bannerImage?: string
  themeColor?: string
  templates?: string
  secondaryColor?: string
  highlightColor?: string
  socialMedia?: SocialMediaSetting[]
  termsCondition?: string
  studentLogin?: boolean
  textVersion?: TextVersion
}

export type RegionLanguageSettingProps = {
  language?: string
  timeZone?: string
  currency?: string
  domain?: string
  country?: string
  countryCode?: string
  siteId?: number
  id?: number
  displayEmailLogo?: boolean
}

export type RegionLanguageSettingResponse = {
  language: string
  timeZone: string
  currency: string
  domain: string
  country: string
  countryCode: string
  siteId: number
  id: number
  displayEmailLogo: boolean
}
