import {
  InvoicePayloadConfirm,
  SendPaymentReminderPayload,
} from '@/types/paymentProof'

import { PaymentEvidenceState } from '../constants/payment'
import {
  PaymentEvidence,
  PreviewInvoiceResponse,
  UploadReceiptData,
  UploadReceiptResponse,
} from '../types/enrollCourse'

import apiClient from './index'

export const getPaymentEvidenceList = async (
  siteId: number,
  institutionId: number,
  invoiceId?: number
): Promise<PaymentEvidence[]> => {
  const res = await apiClient.get({
    url: `/admin/payment-evidence`,
    needAuth: true,
    params: {
      siteId,
      institutionId,
      invoiceId,
    },
  })

  return res.data.data.content
}

export const confirmPayment = async (
  siteId: number,
  institutionId: number,
  ids: number[],
  invoices?: InvoicePayloadConfirm[]
): Promise<PaymentEvidence> => {
  const res = await apiClient.post({
    url: '/admin/payment-evidence/confirm',
    needAuth: true,
    data: {
      siteId,
      institutionId,
      ids,
      invoices,
      status: PaymentEvidenceState.ACCEPTED,
    },
  })
  return res.data.data.content
}

export const rejectPayment = async (
  siteId: number,
  institutionId: number,
  ids: number[],
  invoices?: InvoicePayloadConfirm[]
): Promise<PaymentEvidence> => {
  const res = await apiClient.post({
    url: '/admin/payment-evidence/reject',
    needAuth: true,
    data: {
      siteId,
      institutionId,
      ids,
      invoices,
      status: PaymentEvidenceState.REJECTED,
    },
  })
  return res.data.data.content
}

export const resetPayment = async (
  siteId: number,
  institutionId: number,
  ids: number[],
  invoices?: InvoicePayloadConfirm[]
): Promise<PaymentEvidence> => {
  const res = await apiClient.post({
    url: '/admin/payment-evidence/reset',
    needAuth: true,
    data: {
      siteId,
      institutionId,
      ids,
      invoices,
      status: PaymentEvidenceState.PROCESSING,
    },
  })
  return res.data.data.content
}

export const deletePaymentEvidence = async (
  siteId: number,
  institutionId: number,
  ids: number[],
  invoices?: InvoicePayloadConfirm[]
): Promise<void> => {
  const res = await apiClient.post({
    url: `/admin/payment-evidence/delete`,
    needAuth: true,
    data: {
      siteId,
      institutionId,
      ids,
      invoices,
    },
  })
  return res.data.data
}

export const sendPaymentProofReminder = async (
  siteId: number,
  institutionId: number,
  payload: SendPaymentReminderPayload
): Promise<void> => {
  const res = await apiClient.post({
    url: `/admin/payment-evidence/send-reminder`,
    needAuth: true,
    data: {
      ...payload,
      siteId,
      institutionId,
    },
  })
  return res.data.data
}

export const getPreviewNextInvoice = async (
  institutionId: number,
  classIds: number[]
): Promise<PreviewInvoiceResponse> => {
  const res = await apiClient.post({
    url: `/admin/invoices/generate-invoice/preview`,
    params: {
      institutionId,
    },
    data: {
      classIds,
    },
    needAuth: true,
  })
  return res.data.data
}

export const generateNextMonthInvoice = async (
  institutionId: number,
  classIds: number[]
): Promise<any> => {
  const res = await apiClient.post({
    url: `/admin/invoices/generate-invoice`,
    params: {
      institutionId,
    },
    data: {
      classIds,
    },
    needAuth: true,
  })
  return res.data.data
}

export const uploadPaymentProof = async ({
  siteId,
  institutionId,
  token,
  enrollId,
  invoiceId,
  file,
  payLaterMethod,
}: UploadReceiptData): Promise<UploadReceiptResponse> => {
  const formData = new FormData()
  formData.append('enrollId', enrollId.toString())
  formData.append('invoiceId', invoiceId.toString())
  formData.append('payLaterMethod', JSON.stringify(payLaterMethod))
  formData.append('file', file)

  const res = await apiClient.post({
    url: `/student/payment-evidence/token`,
    params: {
      siteId,
      institutionId,
      token,
    },
    data: formData,
    needAuth: true,
  })
  return res.data.data
}
