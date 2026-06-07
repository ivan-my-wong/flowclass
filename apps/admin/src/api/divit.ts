import apiClient from './index'

export type DivitConfigResponse = {
  id: number
  institutionId: number
  siteId: number
  apiKeyMasked: string | null
  signatureKeyMasked: string | null
  environment: 'sandbox' | 'production'
  enabled: boolean
}

export type SaveDivitConfigPayload = {
  institutionId: number
  siteId: number
  apiKey?: string
  signatureKey?: string
  environment: 'sandbox' | 'production'
  enabled: boolean
}

export const getDivitConfig = async (
  institutionId: number
): Promise<DivitConfigResponse | null> => {
  const res = await apiClient.get({
    url: `/admin/divit/config?institutionId=${institutionId}`,
    needAuth: true,
  })
  return res.data.data as DivitConfigResponse | null
}

export const saveDivitConfig = async (
  payload: SaveDivitConfigPayload
): Promise<DivitConfigResponse> => {
  const res = await apiClient.post({
    url: '/admin/divit/config',
    needAuth: true,
    data: payload,
  })
  return res.data.data as DivitConfigResponse
}
