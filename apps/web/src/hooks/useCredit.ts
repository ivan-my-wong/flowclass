import { useInfiniteQuery, useQuery } from 'react-query'

import { getCreditBalance, getCreditHistory } from '@/api/credit'
import { CreditTransactionType } from '@/types/credit'

const useCredit = () => {
  const useGetCreditBalance = (institutionId: number, userAliasId: number) => {
    return useQuery({
      queryKey: ['creditBalance', userAliasId],
      queryFn: () => getCreditBalance(institutionId, userAliasId),
      enabled: !!userAliasId,
    })
  }

  const useGetCreditHistory = (
    institutionId: number,
    userAliasId: number,
    type?: CreditTransactionType
  ) => {
    return useInfiniteQuery({
      queryKey: ['creditHistory', userAliasId, type],
      queryFn: ({ pageParam = 1 }) => getCreditHistory(institutionId, userAliasId, type, pageParam),
      getNextPageParam: (lastPage, allPages) => {
        const loadedItems = allPages.flatMap(p => p.items).length
        return loadedItems < lastPage.total
          ? allPages.length + 1 // next page number
          : undefined // stop loading more when all items are loaded
      },
      enabled: !!userAliasId,
    })
  }

  return {
    useGetCreditBalance,
    useGetCreditHistory,
  }
}

export default useCredit
