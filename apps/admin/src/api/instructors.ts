import {
  InstructorDataDto,
  InstructorRate,
  InstructorRatesResponse,
  UpdateInstructorRateDto,
  UpdateInstructorRatesEnabledDto,
} from '@/types/instructorProfiles'
import { InstructorAnalyticsResponse, StaffUserType } from '@/types/user'

import apiClient from './index'

export const getInstructors = async (
  siteId: number,
  institutionId: number
): Promise<StaffUserType[]> => {
  const res = await apiClient.get({
    url: `/admin/instructors`,
    needAuth: true,
    params: { siteId, institutionId },
  })
  return res.data.data
}

export const getInstructorAnalytics = async (
  params: InstructorDataDto
): Promise<InstructorAnalyticsResponse> => {
  const res = await apiClient.get({
    url: `/admin/instructors/analytics`,
    needAuth: true,
    params,
  })
  return res.data.data
}

export const updateInstructorRatesEnabled = async (
  userRoleId: number,
  params: UpdateInstructorRatesEnabledDto
): Promise<boolean> => {
  const res = await apiClient.put({
    url: `/admin/instructors/${userRoleId}/rates/enabled`,
    needAuth: true,
    data: params,
  })
  return res.data.data
}

export const getInstructorRates = async (
  userRoleId: number,
  institutionId: number
): Promise<InstructorRatesResponse> => {
  const res = await apiClient.get({
    url: `/admin/instructors/${userRoleId}/rates`,
    needAuth: true,
    params: { institutionId },
  })
  return res.data.data
}

export const createOrUpdateInstructorRates = async (
  userRoleId: number,
  institutionId: number,
  rates: UpdateInstructorRateDto[]
): Promise<InstructorRate[]> => {
  const res = await apiClient.post({
    url: `/admin/instructors/${userRoleId}/rates`,
    needAuth: true,
    params: { institutionId },
    data: rates,
  })
  return res.data.data
}
