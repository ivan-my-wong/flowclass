import apiClient from './index'

export enum WhatsAppConnectionStatus {
  DISCONNECTED = 'disconnected',

  // CONNECTED IS FOR WHEN THE SESSION IS CONNECTED BUT NOT READY TO SEND
  CONNECTED = 'connected',
  ERROR = 'error',
  INITIALIZING = 'initializing',
  QR_CODE = 'qr_code',

  // USE READY INSTEAD OF CONNECTED IF THE API IS NOW READY TO SEND
  READY = 'ready',
}
type WhatsAppResponse<T> = {
  data: T
  statusCode: number
  message: string
}

export type WhatsAppConnection = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  accountId: number
  phoneNumber: string | null
  status:
    | 'connected'
    | 'disconnected'
    | 'connecting'
    | 'error'
    | 'expired'
    | string
  sessionName: string
  accessToken: string
  lastConnectedAt: string | null
  lastDisconnectedAt: string | null
  webhookUrl: string
}

export type WhatsAppStatusResponse = WhatsAppResponse<{
  status: WhatsAppConnectionStatus
  qrCode: string
  message: string
}>

export interface IWhatsAppSessionData {
  message: string
  sessionId: string
  token: string
  whatsAppConnection: WhatsAppConnection
}

export type WhatsAppSession = {
  sessionId: string
  sessionData: IWhatsAppSessionData
}
export type WhatsAppSessionResponse = WhatsAppResponse<WhatsAppSession>

export const getSession = async (
  institutionId: number
): Promise<WhatsAppSessionResponse> => {
  const res = await apiClient.get({
    url: `/admin/whatsapp/session`,
    params: { institutionId },
    needAuth: true,
  })
  return res.data
}

export const initializeSession = async (
  institutionId: number
): Promise<IWhatsAppSessionData> => {
  const res = await apiClient.get({
    url: `/admin/whatsapp/session/initialize`,
    params: { institutionId },
    needAuth: true,
  })
  return res.data
}
export const getSessionStatus = async (
  institutionId: number
): Promise<WhatsAppStatusResponse> => {
  const res = await apiClient.get({
    url: `/admin/whatsapp/status`,
    params: { institutionId },
    needAuth: true,
  })
  return res.data
}

export const removeSession = async (
  institutionId: number
): Promise<WhatsAppStatusResponse> => {
  const res = await apiClient.delete({
    url: `/admin/whatsapp/session/remove`,
    params: { institutionId },
    needAuth: true,
  })
  return res.data
}
