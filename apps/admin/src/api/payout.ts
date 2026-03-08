import { IPaginatedData, PaginateOptionParams } from '@/types/pagination'

import { Payout, PayoutResponse } from '../types/payout'

import ApiError from './errors/apiError'
import apiClient from './index'

export const createPayoutMethod = async (
  payout: Partial<Payout>
): Promise<PayoutResponse> => {
  const res = await apiClient.post({
    url: '/admin/payout-methods',
    needAuth: true,
    data: { ...payout },
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const getAllPayoutMethods = async (
  institutionId: number,
  getEnabledOnly: boolean,
  query?: PaginateOptionParams
): Promise<IPaginatedData<Payout>> => {
  const res = await apiClient.get({
    url: '/admin/payout-methods',
    params: {
      institutionId,
      getEnabledOnly,
      ...query,
    },
    needAuth: true,
  })
  return res.data.data
}

export const deletePayout = async ({
  id,
  siteId,
  institutionId,
}: {
  id: number
  siteId: number
  institutionId: number
}): Promise<Payout> => {
  const res = await apiClient.delete({
    url: '/admin/payout-methods/delete',
    needAuth: true,
    data: { id, siteId, institutionId },
  })
  return res.data.data
}

export const updatePayout = async ({
  id,
  siteId,
  institutionId,
}: {
  id: number
  siteId: number
  institutionId: number
}): Promise<Payout> => {
  const res = await apiClient.put({
    url: '/admin/payout-methods/edit',
    needAuth: true,
    data: { id, siteId, institutionId },
  })
  return res.data.data
}
