import { useState } from 'react'

import constate from 'constate'

import { CourseWithQuotaValueClasses, School, SiteSettings } from '@/types'

type EnrolContextType = {
  school?: School
  course?: CourseWithQuotaValueClasses
  siteSetting?: SiteSettings
  originalUrl?: string
}

export const [EnrolStateProvider, useEnrolState] = constate(
  ({ value }: { value: EnrolContextType }) => {
    const [enrolStore] = useState<EnrolContextType>(value)
    return enrolStore
  }
)
