import customFetch from './baseClient'

export type DivitConnectionResponse = {
  enabled: boolean
}

export type DivitOrderResponse = {
  redirectUrl: string
  invoiceId: number
  divitOrderId: string
}

export type DivitPaymentStatus = {
  paid: boolean
  status: string
}

export const getDivitConnection = async (institutionId: number): Promise<DivitConnectionResponse> => {
  const { data } = await customFetch<DivitConnectionResponse>('/student/divit/connection', {
    method: 'GET',
    query: { institutionId: String(institutionId) },
  })
  return data
}

export const createDivitOrder = async (invoiceId: number, token: string): Promise<DivitOrderResponse> => {
  const { data } = await customFetch<DivitOrderResponse>('/student/divit/create-order', {
    method: 'POST',
    query: { token },
    body: { invoiceId },
  })
  return data
}

export const getDivitPaymentStatus = async (invoiceId: number, token: string): Promise<DivitPaymentStatus> => {
  const { data } = await customFetch<DivitPaymentStatus>('/student/divit/payment-status', {
    method: 'GET',
    query: { invoiceId: String(invoiceId), token },
  })
  return data
}
