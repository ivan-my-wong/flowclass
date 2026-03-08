import {
  ApplicationFormTypes,
  CreateApplicationFormTypes,
} from '../types/applicationForm'

import apiClient from './index'

export const getApplicationForms = async (
  schoolId: number,
  siteId: number
): Promise<ApplicationFormTypes[]> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/forms',
    needAuth: true,
    params: {
      institutionId: schoolId,
      siteId,
    },
  })

  return res.data.data
}

export const getCurrentAppicationForm = async (
  id: number,
  institutionId: number,
  siteId: number
): Promise<ApplicationFormTypes> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/form-detail',
    needAuth: true,
    params: {
      id,
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const createDefaultApplicationForm = async (
  institutionId: number
): Promise<ApplicationFormTypes> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/create-default-form',
    needAuth: true,
    params: {
      institutionId,
    },
  })

  return res.data.data
}

export const updateApplicationForm = async (
  field: Partial<ApplicationFormTypes>,
  institutionId: number,
  siteId: number
): Promise<ApplicationFormTypes> => {
  const res = await apiClient.post({
    needAuth: true,
    url: 'admin/enrollment-form/update-form',
    params: {
      institutionId,
      siteId,
    },
    data: field,
  })

  return res.data.data
}

export const createApplicationForm = async (
  applicationForm: Partial<CreateApplicationFormTypes>,
  institutionId: number,
  siteId: number
): Promise<ApplicationFormTypes> => {
  const res = await apiClient.post({
    url: 'admin/enrollment-form/create-form',
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
    data: { ...applicationForm },
  })

  return res.data.data
}

export const assignApplicationForm = async ({
  institutionId,
  formId,
  courseId,
  siteId,
}: {
  institutionId: number
  formId: number | null
  courseId: number
  siteId: number
}): Promise<ApplicationFormTypes> => {
  const res = await apiClient.post({
    url: 'admin/enrollment-form/assign-form-for-course',
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
    data: {
      institutionId,
      formId,
      courseId,
    },
  })

  return res.data.data
}

export const deleteApplicationForm = async (
  id: number,
  institutionId: number,
  siteId: number
): Promise<ApplicationFormTypes> => {
  const res = await apiClient.post({
    needAuth: true,
    url: 'admin/enrollment-form/delete-form',
    params: {
      institutionId,
      siteId,
    },
    data: { id },
  })

  return res.data.data
}
