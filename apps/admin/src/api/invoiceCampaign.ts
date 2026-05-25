import type {
  InvoiceCampaignDto,
  ResendInvoiceDto,
  SendingResponse,
  SendInvoiceDirectlyDto,
  SyncEnrollCoursesDiffItemDto,
} from '@/types/studentInvoice.type'
import type { InvoiceCampaign } from '@/types/templateManagement'

import apiClient from '.'

export type SearchParams = {
  search?: string
  status?: string
  page?: number
  limit?: number
}
export const fetchInvoiceCampaigns = async (
  institutionId: number,
  params: SearchParams = {}
): Promise<{ data: InvoiceCampaign[]; total: number }> => {
  const res = await apiClient.get({
    url: '/admin/invoice-campaign/list',
    params: {
      institutionId,
      ...params,
    },
  })
  return res?.data?.data ?? []
}

export const createInvoiceCampaign = async (
  institutionId: number,
  payload: InvoiceCampaignDto
): Promise<InvoiceCampaign> => {
  const res = await apiClient.post({
    url: '/admin/invoice-campaign/create-campaign',
    params: {
      institutionId,
    },
    data: payload,
  })
  return res?.data?.data ?? []
}

export const sendInvoiceCampaign = async (
  institutionId: number,
  documentId: string,
  payload: InvoiceCampaignDto
): Promise<SendingResponse> => {
  const response = await apiClient.patch({
    url: `/admin/invoice-campaign/${documentId}/send-campaign`,
    params: { institutionId },
    data: payload,
  })
  return response?.data?.data
}

/** Re-send a completed invoice campaign, preserving the original amountPaid. */
export const editAndResendInvoiceCampaign = async (
  institutionId: number,
  documentId: string,
  payload: InvoiceCampaignDto
): Promise<SendingResponse> => {
  const response = await apiClient.patch({
    url: `/admin/invoice-campaign/${documentId}/edit-and-resend`,
    params: { institutionId },
    data: payload,
  })
  return response?.data?.data
}

export const fetchDetailInvoiceCampaign = async (
  institutionId: number,
  documentId: string
): Promise<InvoiceCampaign> => {
  const res = await apiClient.get({
    url: `/admin/invoice-campaign/${documentId}/detail`,
    params: {
      institutionId,
    },
  })
  return res?.data?.data ?? {}
}

export const updateInvoiceCampaign = async (
  institutionId: number,
  documentId: string,
  payload: InvoiceCampaignDto
): Promise<InvoiceCampaign> => {
  const res = await apiClient.put({
    url: `/admin/invoice-campaign/${documentId}/update-campaign`,
    params: {
      institutionId,
    },
    data: payload,
  })
  return res?.data?.data ?? []
}

export const duplicateInvoiceCampaign = async (
  institutionId: number,
  documentId: number
): Promise<InvoiceCampaign> => {
  const res = await apiClient.patch({
    url: `/admin/invoice-campaign/${documentId}/duplicate`,
    params: {
      institutionId,
    },
  })
  return res?.data?.data ?? {}
}

export const deleteInvoiceCampaign = async (
  institutionId: number,
  documentId: number
): Promise<void> => {
  await apiClient.delete({
    url: `/admin/invoice-campaign/${documentId}`,
    params: {
      institutionId,
    },
  })
}

export const resendInvoiceRecipient = async (
  institutionId: number,
  dto: ResendInvoiceDto
): Promise<void> => {
  await apiClient.post({
    url: `/admin/invoice-campaign/${dto.recipientId}/resend`,
    params: {
      institutionId,
    },
    data: dto,
  })
}

export const sendInvoiceDirectly = async (
  institutionId: number,
  dto: SendInvoiceDirectlyDto
): Promise<void> => {
  await apiClient.post({
    url: `/admin/invoice-campaign/invoice/${dto.invoiceId}/send`,
    params: {
      institutionId,
    },
    data: dto,
  })
}

export const syncEnrollCourses = async (
  institutionId: number,
  documentId: string | number,
  diffs: SyncEnrollCoursesDiffItemDto[]
): Promise<void> => {
  await apiClient.patch({
    url: `/admin/invoice-campaign/${documentId}/sync-enroll-courses`,
    params: { institutionId },
    data: { diffs },
  })
}

export const fetchInvoicePdf = async (
  institutionId: number,
  invoiceId: number
): Promise<string> => {
  const res = await apiClient.get({
    url: `/admin/invoice-campaign/invoice/${invoiceId}/pdf`,
    params: {
      institutionId,
    },
  })
  return (res?.data?.data as string) ?? ''
}
