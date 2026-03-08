import { ListData } from '@/types/api'
import { EnrollmentForm, School, SchoolWebpageSettings } from '@/types/school'

import customFetch from './baseClient'

export const getSchools = async (siteId: number): Promise<ListData<School>> => {
  const { data: listData } = await customFetch<ListData<School>>('/admin/institutions', {
    query: { siteId: siteId.toString() },
  })
  return listData
}

export const getSchoolByUrl = async (domain: string, url: string): Promise<School> => {
  const { data } = await customFetch<School>('/student/schools/detail', {
    query: { domain, url },
  })
  return data
}

export const getSchoolWebpageSettings = async (
  schoolId: number
): Promise<SchoolWebpageSettings> => {
  const { data: listData } = await customFetch<SchoolWebpageSettings>(
    '/admin/setting-webpage-institution/detail',
    {
      query: { institutionId: schoolId.toString() },
    }
  )

  return listData
}

export const getEnrollmentFormCustom = async (id: string): Promise<EnrollmentForm> => {
  const { data } = await customFetch<EnrollmentForm>(
    `/admin/enrollment-form/form-detail?id=${id}&isDefault=false`,
    {}
  )
  return data
}
