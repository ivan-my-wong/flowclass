import { IPaginatedData } from '@/types/pagination'
import { WhatsappTemplate } from '@/types/whatsappTemplate'

import apiClient from './index'

export const getListWhatsappTemplates = async (
  institutionId: number,
  params?: Record<string, any>
): Promise<IPaginatedData<WhatsappTemplate>> => {
  const res = await apiClient.get({
    url: '/admin/whatsapp-template',
    needAuth: true,
    params: {
      ...params,
      institutionId,
    },
  })
  return res.data.data
}

export const createWhatsappTemplate = async (
  institutionId: number,
  data: Partial<WhatsappTemplate>
): Promise<WhatsappTemplate> => {
  const res = await apiClient.post({
    url: '/admin/whatsapp-template/create',
    needAuth: true,
    params: {
      institutionId,
    },
    data,
  })
  return res.data.data
}

export const getDetailWhatsappTemplate = async (
  institutionId: number,
  id: number
): Promise<WhatsappTemplate> => {
  const res = await apiClient.get({
    url: `/admin/whatsapp-template/${id}`,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return res.data.data
}
export const submitApprovalWhatsappTemplate = async (
  institutionId: number,
  id: number
): Promise<WhatsappTemplate> => {
  const res = await apiClient.get({
    url: `/admin/whatsapp-template/${id}/submit-approval`,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return res.data.data
}

export const updateWhatsappTemplate = async (
  institutionId: number,
  id: number,
  data: Partial<WhatsappTemplate>
): Promise<WhatsappTemplate> => {
  const res = await apiClient.put({
    url: `/admin/whatsapp-template/${id}/update`,
    needAuth: true,
    params: {
      institutionId,
    },
    data,
  })
  return res.data.data
}

export const deleteWhatsappTemplate = async (
  institutionId: number,
  id: number
): Promise<WhatsappTemplate> => {
  const res = await apiClient.delete({
    url: `/admin/whatsapp-template/${id}/delete`,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return res.data.data
}
