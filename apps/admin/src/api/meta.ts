import {
  MetaCoexistenceSyncStatus,
  MetaEmbeddedSignupCompletePayload,
  MetaEmbeddedSignupInitiatePayload,
  MetaEmbeddedSignupInitiateResponse,
  MetaEmbeddedSignupRecord,
  MetaWhatsAppProfile,
  UpdateMetaWhatsAppProfileDto,
} from '@/types/meta'

import apiClient from './index'

export const initiateMetaEmbeddedSignup = async (
  payload: MetaEmbeddedSignupInitiatePayload
): Promise<MetaEmbeddedSignupInitiateResponse> => {
  const response = await apiClient.post({
    url: '/admin/meta/embedded-signup/initiate',
    data: payload,
    needAuth: true,
  })
  return response.data?.data ?? response.data
}

export const completeMetaEmbeddedSignup = async (
  payload: MetaEmbeddedSignupCompletePayload
): Promise<MetaEmbeddedSignupRecord> => {
  const response = await apiClient.post({
    url: '/admin/meta/embedded-signup/complete',
    data: payload,
    needAuth: true,
  })
  return response.data?.data ?? response.data
}

export const getMetaEmbeddedSignup = async (
  institutionId: number
): Promise<MetaEmbeddedSignupRecord> => {
  const response = await apiClient.get({
    url: `/admin/meta/embedded-signup/${institutionId}`,
    needAuth: true,
  })
  return response.data?.data ?? response.data
}

export const retryMetaEmbeddedSignup = async (
  institutionId: number
): Promise<MetaEmbeddedSignupRecord> => {
  const response = await apiClient.post({
    url: `/admin/meta/embedded-signup/${institutionId}/retry`,
    needAuth: true,
  })
  return response.data?.data ?? response.data
}

export const getMetaCoexistenceSyncStatus = async (
  institutionId: number
): Promise<MetaCoexistenceSyncStatus> => {
  const response = await apiClient.get({
    url: `/admin/meta/coexistence/${institutionId}/sync-status`,
    needAuth: true,
  })
  return response.data?.data ?? response.data
}

export const triggerMetaCoexistenceSync = async (
  institutionId: number
): Promise<void> => {
  await apiClient.post({
    url: `/admin/meta/coexistence/${institutionId}/sync`,
    needAuth: true,
  })
}

export const getMetaWhatsAppProfile = async (
  institutionId: number
): Promise<MetaWhatsAppProfile> => {
  const response = await apiClient.get({
    url: '/admin/meta/whatsapp/profile',
    needAuth: true,
    params: { institutionId },
  })
  return response.data?.data ?? response.data
}

export const updateMetaWhatsAppProfile = async (
  institutionId: number,
  data: UpdateMetaWhatsAppProfileDto
): Promise<MetaWhatsAppProfile> => {
  const response = await apiClient.put({
    url: '/admin/meta/whatsapp/profile',
    needAuth: true,
    params: { institutionId },
    data,
  })
  return response.data?.data ?? response.data
}

export const registerMetaPhoneNumber = async (
  institutionId: number,
  pin: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post({
    url: '/admin/meta/register-phone-number',
    needAuth: true,
    data: { institutionId, pin },
  })
  return response.data?.data ?? response.data
}
