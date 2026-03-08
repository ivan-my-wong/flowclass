import { SchoolWebpageSettings } from './school'

export type Site = {
  id: number
  name: string
  description: string
  url: string
  siteAdmin: number
  email: string
  phone: string
  logo: string
  banner: string
  subscription: string
  institutionSetting: SchoolWebpageSettings
  currency: string
  country: string
  language: string
  timeZone: TimeZoneSettings
  defaultInstitutionId: number
  customDomain: string
  socialMedia: SocialMediaSetting[]
}

export type SocialMediaSetting = {
  id: string
  name: string
  link: string
}
export type TimeZoneSettings = {
  id: string
  offset: number
}

export type SiteSettings = {
  language: string
  timeZone: string
  currency: string
  countryCode: string
  zoneOffset?: number
  domain: string
  country: string
  siteId: number
}

export type SiteMap = {
  url: string
  lastmod: string
}
