import { ApiResponse } from '@/types/apiResponse'
import { CustomMessage, CustomMessagePreparedData } from '@/types/customMessage'

import apiClient from './index'

export const getCustomMessageData = async (
  institutionId: number
): Promise<ApiResponse<CustomMessage[]>> => {
  const response = await apiClient.get({
    url: '/admin/custom-message',
    params: {
      institutionId,
    },
  })
  return response.data
}

export const updateOrCreateCustomMessage = async (
  institutionId: number,
  data: CustomMessage
): Promise<ApiResponse<CustomMessage>> => {
  const response = await apiClient.post({
    url: '/admin/custom-message',
    params: {
      institutionId,
    },
    data,
  })
  return response.data
}

export const deleteCustomMessage = async (
  institutionId: number,
  id: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete({
    url: `/admin/custom-message/${id}/detail`,
    params: {
      institutionId,
    },
  })
  return response.data
}

export const getCustomMessageById = async (
  institutionId: number,
  id: number
): Promise<ApiResponse<CustomMessage>> => {
  const response = await apiClient.get({
    url: `/admin/custom-message/${id}/detail`,
    params: {
      institutionId,
    },
  })
  return response.data
}

export const getPreparedData = async (
  institutionId: number
): Promise<ApiResponse<CustomMessagePreparedData>> => {
  const response = await apiClient.get({
    url: '/admin/custom-message/prepared-data',
    params: {
      institutionId,
    },
  })
  return response.data
}
