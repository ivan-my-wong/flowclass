import { useTranslation } from 'react-i18next'
import { useInfiniteQuery, useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import {
  addCredit,
  deductCredit,
  getCreditBalance,
  getCreditHistory,
  getCreditSettings,
  updateCreditSettings,
} from '@/api/credit'
import { CreditSourceType, CreditTransactionType } from '@/types/credit'
import { FeatureEnableEnum } from '@/types/feature-enable'

import useCheckPermissionAndQuota from './useCheckPermissionAndQuota'
import useSchoolData from './useSchoolData'

const useCredit = () => {
  const { t } = useTranslation()
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''

  const useGetCreditBalance = (userAliasId: number, enabled = false) => {
    return useQuery({
      queryKey: ['creditBalance', userAliasId],
      queryFn: () => getCreditBalance(+currentInstitutionId, userAliasId),
      enabled: !!userAliasId && enabled,
    })
  }

  const useGetCreditHistory = (
    userAliasId: number,
    type?: CreditTransactionType,
    enabled = false
  ) => {
    return useInfiniteQuery({
      queryKey: ['creditHistory', userAliasId, type],
      queryFn: ({ pageParam = 1 }) =>
        getCreditHistory(+currentInstitutionId, userAliasId, type, pageParam),
      getNextPageParam: (lastPage, allPages) => {
        const loadedItems = allPages.flatMap(p => p.items).length
        return loadedItems < lastPage.total
          ? allPages.length + 1 // next page number
          : undefined // stop load more kalau sudah habis
      },
      enabled: !!userAliasId && enabled,
    })
  }

  const useAddCredit = () => {
    return useMutation({
      mutationFn: (data: {
        userAliasId: number
        amount: number
        sourceType: CreditSourceType
        description?: string
      }) => addCredit({ ...data, institutionId: +currentInstitutionId }),
      onSuccess: () => {
        toast.success(
          t('credit:success.addCredit', 'Credit added successfully')
        )
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(t('credit:errors.addCredit', 'Failed to add credit'))
      },
    })
  }

  const useDeductCredit = () => {
    return useMutation({
      mutationFn: (data: {
        userAliasId: number
        amount: number
        sourceType: CreditSourceType
        description?: string
      }) => deductCredit({ ...data, institutionId: +currentInstitutionId }),
      onSuccess: () => {
        toast.success(
          t('credit:success.deductCredit', 'Credit deducted successfully')
        )
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(t('credit:errors.deductCredit', 'Failed to deduct credit'))
      },
    })
  }

  // getCreditSettings
  const useGetCreditSettings = () => {
    return useQuery({
      queryKey: ['creditSettings', currentInstitutionId],
      queryFn: () => getCreditSettings(+currentInstitutionId),
      enabled: !!currentInstitutionId,
    })
  }

  // updateCreditSettings
  const useUpdateCreditSettings = () => {
    return useMutation({
      mutationFn: (settings: { conversionRate: number; isEnabled: boolean }) =>
        updateCreditSettings(+currentInstitutionId, settings),
      onSuccess: () => {
        toast.success(
          t('credit:success.updateSettings', 'Settings updated successfully')
        )
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(
          t('credit:errors.updateSettings', 'Failed to update settings')
        )
      },
    })
  }

  const useCheckCreditSystemActive = () => {
    const { checkPermission } = useCheckPermissionAndQuota()
    const isCreditSystemAllowed = checkPermission(
      'featureEnable',
      FeatureEnableEnum.CREDIT_SYSTEM
    )

    const { data: creditSettings, isLoading } = useGetCreditSettings()
    return {
      isActive: creditSettings?.isEnabled && isCreditSystemAllowed,
      isLoading,
    }
  }

  return {
    useGetCreditBalance,
    useGetCreditHistory,
    useAddCredit,
    useDeductCredit,
    useGetCreditSettings,
    useUpdateCreditSettings,
    useCheckCreditSystemActive,
  }
}

export default useCredit
