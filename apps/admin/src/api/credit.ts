import {
  AddOrDeductCredit,
  CreditTransaction,
  CreditTransactionType,
} from '@/types/credit'

import apiClient from '.'

// get balance of user credits
export const getCreditBalance = async (
  institutionId: number,
  userAliasId: number
): Promise<number> => {
  return apiClient
    .get({
      url: `/admin/credit-management/balance`,
      params: { institutionId, userAliasId },
      needAuth: true,
    })
    .then(res => res.data?.data?.balance || 0)
}

export const getCreditHistory = async (
  institutionId: number,
  userAliasId: number,
  transactionType?: CreditTransactionType,
  page = 1,
  limit = 10
): Promise<{ items: CreditTransaction[]; total: number }> => {
  return apiClient
    .get({
      url: `/admin/credit-management/history`,
      params: { institutionId, userAliasId, transactionType, page, limit },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const addCredit = async (
  data: AddOrDeductCredit & { institutionId: number }
): Promise<CreditTransaction> => {
  return apiClient
    .post({
      url: `/admin/credit-management/add`,
      params: { institutionId: data.institutionId },
      data,
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const deductCredit = async (
  data: AddOrDeductCredit & { institutionId: number }
): Promise<CreditTransaction> => {
  return apiClient
    .post({
      url: `/admin/credit-management/deduct`,
      params: { institutionId: data.institutionId },
      data,
      needAuth: true,
    })
    .then(res => res.data?.data)
}

// admin/credit-management/settings
export const getCreditSettings = async (
  institutionId: number
): Promise<{ conversionRate: number; isEnabled: boolean }> => {
  return apiClient
    .get({
      url: `/admin/credit-management/settings`,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const updateCreditSettings = async (
  institutionId: number,
  settings: { conversionRate: number; isEnabled: boolean }
): Promise<{ conversionRate: number; isEnabled: boolean }> => {
  return apiClient
    .patch({
      url: `/admin/credit-management/settings`,
      params: { institutionId },
      data: settings,
      needAuth: true,
    })
    .then(res => res.data?.data)
}

export const hasCreditRecords = async (
  institutionId: number
): Promise<{ hasRecords: boolean }> => {
  return apiClient
    .get({
      url: `/admin/credit-management/has-records`,
      params: { institutionId },
      needAuth: true,
    })
    .then(res => res.data?.data)
}
