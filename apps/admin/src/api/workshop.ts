import { Workshop } from '../stores/workshopData'

import apiClient from './index'

export const getWorkshops = async (schoolId: number): Promise<Workshop[]> => {
  const res = await apiClient.get({
    url: '/admin/workshop',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })

  return res.data.data.content
}

// edit or delete later
export const getCurrentWorkshopAllSessions = async (
  id: number
): Promise<any[]> => {
  const res = await apiClient.get({
    url: '/admin/workshop/sessions',
    needAuth: true,
    params: {
      courseId: id,
    },
  })

  return res.data.data.content
}

// edit or delete later
export const createWorkshopSession = async (
  sessionData: Partial<any>
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/workshop/sessions/create-with-course',
    needAuth: true,
    data: { ...sessionData },
  })

  return res.data.data
}

// edit or deleted
export const duplicateWorkshopSession = async (
  sessionData: Partial<any>
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/workshop/sessions/duplicate-with-course',
    needAuth: true,
    data: sessionData,
  })

  return res.data.data
}

export const duplicateMultipleWorkshopSession = async (
  args: any
): Promise<any[]> => {
  const res = await apiClient.post({
    url: '/admin/workshop/multipleSessions/duplicate-with-course',
    needAuth: true,
    data: args,
  })

  return res.data.data
}

export const updateWorkshopSession = async (
  workshopSessionId: number,
  sessionData: Partial<any>
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/workshop/sessions/update',
    needAuth: true,
    data: sessionData,
    params: {
      workshopSessionId,
    },
  })

  return res.data.data
}

export const deleteWorkshopSession = async (
  workshopSessionId: number
): Promise<any> => {
  const res = await apiClient.delete({
    url: '/admin/workshop/sessions/delete',
    needAuth: true,
    params: {
      workshopSessionId,
    },
  })

  return res.data.data
}
