import { CopySchool, School } from '../types/school'

import apiClient from './index'

export const getSchools = async (siteId: number): Promise<School[]> => {
  const res = await apiClient.get({
    url: '/admin/institutions',
    needAuth: true,
    params: {
      siteId,
    },
  })

  return res?.data?.data?.content ?? []
}

export const getCurrentSchool = async (id: number): Promise<School> => {
  const res = await apiClient.get({
    url: '/admin/institutions/detail',
    needAuth: true,
    params: {
      institutionId: id,
    },
  })

  return res.data.data
}

export const createSchool = async (
  id: number,
  data: Partial<School>
): Promise<School> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/institutions/create',
    data: { siteId: id, ...data },
  })

  return res.data.data
}

export const updateSchool = async (
  id: number,
  school: Partial<School>
): Promise<School> => {
  const res = await apiClient.patch({
    needAuth: true,
    url: '/admin/institutions/update',
    params: { institutionId: id },
    data: { ...school },
  })

  return res.data.data
}

export const deleteSchool = async (id: number): Promise<School> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: '/admin/institutions/delete',
    params: { institutionId: id },
  })

  return res.data.data
}

export const getDemoSchool = async (email: string): Promise<School[]> => {
  const res = await apiClient.get({
    url: '/admin/institutions/demo-school',
    needAuth: true,
    params: { email },
  })

  return res.data.data
}

export const copySchool = async (payload: CopySchool): Promise<School[]> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/institutions/copy',
    data: payload,
  })

  return res.data.data
}
