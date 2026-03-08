import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { School } from '../types/school'

import { persistLocalStorage } from './utils/recoilPersist'

export type Locale = {
  id: string
  offset: string
}

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
  country: string
  currency: string
  language: string
  timeZone: Locale
  defaultInstitutionId: number
  customDomain: string
  website: string
}

export type RegisterSiteResponse = {
  institution: School
} & Site

export type CustomSiteUpdateProps = {
  banner: string
  logo: string
  url?: string
  customDomain?: string
  defaultInstitutionId: number
}

type SiteState = {
  sites: Site[]
  currentSite: Site | null
  initFetch: boolean
}

const defaultSiteState: SiteState = {
  sites: [],
  currentSite: null,
  initFetch: false,
}

export const siteState = atom<SiteState>({
  key: ATOM_KEY.SiteState,
  default: defaultSiteState,
  effects: [persistLocalStorage],
})
