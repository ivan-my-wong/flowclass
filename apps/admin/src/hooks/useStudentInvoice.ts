import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilValue } from 'recoil'

import { getEnrolledClassesOfStudentByDate } from '@/api/courses'
import { getCreditBalance } from '@/api/credit'
import type { ApiError } from '@/api/errors/apiError'
import { handleApiError } from '@/api/errors/apiError'
import {
  fetchBundleDiscountAvailability,
  fetchPossiblePromotions,
  getAllBundleDiscounts,
  getAllPackageDiscounts,
} from '@/api/promotion'
import { getAllStudentsOfInstitutionNew } from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { BundleDiscount, CheckEligibleDto } from '@/types/bundleDiscounts'
import { PackageDiscount } from '@/types/packageDiscounts'
import { StudentEnrolmentRecord } from '@/types/student'
import {
  BundleDiscountAvailabilityResponse,
  CurrentlyEnrolledClass,
  PossiblePromotionsType,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'

import useAuth from './useAuth'

interface HookResult {
  useGetAllStudents: () => UseQueryResult<StudentEnrolmentRecord[]>

  useGetAllPromotions: () => UseQueryResult<
    (
      | PossiblePromotionsType
      | BundleDiscount
      | (PackageDiscount & { promotionType: PromotionTypeItem })
    )[],
    ApiError
  >

  useGetBundleAvailabilities: () => UseMutationResult<
    BundleDiscountAvailabilityResponse[],
    unknown,
    CheckEligibleDto,
    unknown
  >

  useGetCreditBalance: (
    onSuccess?: (balance: number) => void
  ) => UseMutationResult<number, unknown, { userAliasId: number }, unknown>

  useGetAllCurrentlyEnrolledClassesOfStudent: (
    onSuccess?: (enrolledClasses: CurrentlyEnrolledClass[]) => void
  ) => UseMutationResult<
    CurrentlyEnrolledClass[],
    ApiError,
    { userAliasId: number; date: string },
    unknown
  >
}
const useStudentInvoice = (): HookResult => {
  const { t } = useTranslation()
  const schoolData = useRecoilValue(schoolState)
  const siteData = useRecoilValue(siteState)
  const { isLogin } = useAuth()
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0

  const useGetAllStudents = () => {
    const result = useQuery(
      [QUERY_KEY.studentInvoice.getAllStudents],
      () =>
        getAllStudentsOfInstitutionNew({
          siteId: currentSiteId,
          id: currentSchoolId,
          type: 'ALL',
        }),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
      }
    )
    return result
  }

  const useGetAllPromotions = () => {
    const result = useQuery(
      [QUERY_KEY.studentInvoice.getCouponAndBundle],
      async () => {
        const [coupon, bundle, packageDiscount] = await Promise.all([
          fetchPossiblePromotions(currentSchoolId),
          getAllBundleDiscounts(
            currentSiteId.toString(),
            currentSchoolId.toString()
          ),
          getAllPackageDiscounts(
            currentSiteId.toString(),
            currentSchoolId.toString()
          ),
        ])
        return [
          ...(coupon ?? []).map(c => ({
            ...c,
            promotionType: PromotionTypeItem.COUPON,
          })),
          ...(bundle ?? []).map(d => ({
            ...d,
            promotionType: PromotionTypeItem.BUNDLE,
          })),
          ...(packageDiscount ?? []).map(p => ({
            ...p,
            promotionType: PromotionTypeItem.PACKAGE,
          })),
        ]
      },
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentSchoolId,
      }
    )
    return result
  }

  const useGetBundleAvailabilities = () => {
    return useMutation({
      mutationFn: ({ bundleId, userAliasIds }: CheckEligibleDto) => {
        if (bundleId <= 0) return Promise.resolve([])
        return fetchBundleDiscountAvailability(
          currentSchoolId,
          currentSiteId,
          bundleId,
          userAliasIds
        )
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetCreditBalance = (onSuccess?: (balance: number) => void) => {
    return useMutation({
      mutationFn: ({ userAliasId }: { userAliasId: number }) => {
        return getCreditBalance(currentSchoolId, userAliasId)
      },
      onSuccess: (balance: number) => {
        onSuccess?.(balance)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetAllCurrentlyEnrolledClassesOfStudent = (
    onSuccess?: (enrolledClasses: CurrentlyEnrolledClass[]) => void
  ) => {
    return useMutation({
      mutationFn: ({
        userAliasId,
        date,
      }: {
        userAliasId: number
        date: string
      }) => {
        if (!userAliasId || !date) return Promise.resolve([])
        return getEnrolledClassesOfStudentByDate(
          currentSchoolId,
          userAliasId,
          date
        )
      },
      onSuccess: (enrolledClasses: CurrentlyEnrolledClass[]) => {
        onSuccess?.(enrolledClasses)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useGetAllPromotions,
    useGetAllStudents,
    useGetBundleAvailabilities,
    useGetCreditBalance,
    useGetAllCurrentlyEnrolledClassesOfStudent,
  }
}

export default useStudentInvoice
