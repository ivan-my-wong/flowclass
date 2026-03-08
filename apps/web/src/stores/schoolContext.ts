import { useState } from 'react'

import { atom } from 'recoil'

import constate from 'constate'

import ATOM_KEY from '@/constants/atomKey'
import { Course, CourseComment, School, SchoolWebpageSettings, Site, SiteSettings } from '@/types'
import { WebsiteTemplate } from '@/types/websiteTemplate'

type SchoolContextType = {
  school?: School
  courses?: Course[]
  schoolComments?: CourseComment[]
  webpageSettings?: SchoolWebpageSettings
  site?: Site
  siteSettings?: SiteSettings
  baseUrl?: string
}

const [SchoolStateProvider, useSchoolState] = constate(() => {
  const [schoolContext, setSchoolContext] = useState<SchoolContextType>({})
  return { schoolContext, setSchoolContext }
})

export { SchoolStateProvider as SchoolProvider, useSchoolState as useSchoolContext }

export const currentWebsiteTheme = atom<string>({
  key: ATOM_KEY.websiteTheme,
  default: WebsiteTemplate.Hero,
})
