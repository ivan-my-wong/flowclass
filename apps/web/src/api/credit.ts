import { CreditTransaction, CreditTransactionType } from '@/types/credit'

import customFetch from './baseClient'

// get balance of user credits
export const getCreditBalance = async (
  institutionId: number,
  userAliasId: number
): Promise<number> => {
  return customFetch<{ balance: number }>('/admin/credit-management/balance', {
    method: 'GET',
    query: { institutionId: institutionId.toString(), userAliasId: userAliasId.toString() },
    needAuth: true,
  }).then(res => res.data?.balance || 0)
}

export const getCreditHistory = async (
  institutionId: number,
  userAliasId: number,
  transactionType?: CreditTransactionType,
  page = 1,
  limit = 10
): Promise<{ items: CreditTransaction[]; total: number }> => {
  return customFetch<{ items: CreditTransaction[]; total: number }>(
    '/admin/credit-management/history',
    {
      method: 'GET',
      query: {
        institutionId: institutionId.toString(),
        userAliasId: userAliasId.toString(),
        transactionType: transactionType || '',
        page: page.toString(),
        limit: limit.toString(),
      },
      needAuth: true,
    }
  ).then(res => res.data || { items: [], total: 0 })
}
