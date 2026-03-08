import {
  CreateInformationFieldTypes,
  InformationFieldTypes,
} from '../types/applicationForm'

import apiClient from './index'

export const getInformationFields = async (
  schoolId: number,
  siteId: number
): Promise<InformationFieldTypes[]> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/fields',
    needAuth: true,
    params: {
      institutionId: schoolId,
      siteId,
    },
  })

  return res.data.data
}
export const reOrderFields = async (
  siteId: number,
  institutionId: number,
  ids: number[]
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/enrollment-form/order-field',
    needAuth: true,
    data: {
      siteId,
      institutionId,
      order: ids,
    },
  })

  return res.data.data
}
export const getCurrentInformationField = async (
  id: number,
  institutionId: number,
  siteId: number
): Promise<InformationFieldTypes> => {
  const res = await apiClient.get({
    url: '/admin/enrollment-form/field-detail',
    needAuth: true,
    params: {
      id,
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const createInformationField = async (
  informationField: Partial<CreateInformationFieldTypes>,
  siteId: number,
  institutionId: number
): Promise<InformationFieldTypes> => {
  const res = await apiClient.post({
    url: '/admin/enrollment-form/create-field',
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
    data: { ...informationField },
  })

  return res.data.data
}
export const updateInformationField = async (
  field: Partial<InformationFieldTypes>,
  siteId: number,
  institutionId: number
): Promise<InformationFieldTypes> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/enrollment-form/update-field',
    params: {
      institutionId,
      siteId,
    },
    data: field,
  })

  return res.data.data
}

export const deleteInformationField = async (
  id: number,
  institutionId: number,
  siteId: number
): Promise<InformationFieldTypes> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/enrollment-form/delete-field',
    params: {
      institutionId,
      siteId,
    },
    data: { id },
  })

  return res.data.data
}
