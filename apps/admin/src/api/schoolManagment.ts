import { AdminSchool, School } from '../types/school'

import apiClient from './index'

export const getSchools = async ({
  page = 1,
  limit = 9,
  siteId,
}: {
  page: number
  limit: number
  siteId: number
}): Promise<School[]> => {
  const res = await apiClient.get({
    url: '/admin/master-admin/institutions',
    needAuth: true,
    params: {
      page,
      limit,
      siteId,
    },
  })

  return res.data.data
}

export const getAdmin = async (keyword: string): Promise<AdminSchool[]> => {
  const res = await apiClient.get({
    url: '/admin/master-admin/search-user',
    needAuth: true,
    params: {
      keyword,
    },
  })

  return res.data.data
}

export const assignAdmin = async (
  institutionId: number,
  userId: number
): Promise<School> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/master-admin/assign-management',
    data: { institutionId, userId },
  })

  return res.data.data
}

export const removeAssignAdmin = async (
  institutionId: number,
  userId: number
): Promise<School> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/master-admin/remove-assign-management',
    data: { institutionId, userId },
  })

  return res.data.data
}
