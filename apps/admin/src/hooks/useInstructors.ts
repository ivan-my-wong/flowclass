import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  createOrUpdateInstructorRates,
  getInstructorAnalytics,
  getInstructorRates,
  getInstructors,
  updateInstructorRatesEnabled,
} from '@/api/instructors'
import { QUERY_KEY } from '@/constants/queryKey'
import {
  InstructorDataDto,
  InstructorRate,
  InstructorRatesResponse,
  UpdateInstructorRateDto,
  UpdateInstructorRatesEnabledDto,
} from '@/types/instructorProfiles'
import { InstructorAnalyticsResponse, StaffUserType } from '@/types/user'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

const useInstructorRates = () => {
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const { t } = useTranslation()
  const currentSiteId = siteData?.currentSite?.id || 0
  const currentSchoolId = schoolData?.currentSchool?.id || 0
  const queryClient = useQueryClient()

  const useGetInstructors = (
    onSuccessCallback?: (data: StaffUserType[]) => void
  ) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.user.getInstructorsKey,
        currentSiteId,
        currentSchoolId,
      ],
      queryFn: () => getInstructors(currentSiteId, currentSchoolId),
      onSuccess: (data: StaffUserType[]) => {
        onSuccessCallback?.(data)
      },
    })
  }

  const useGetInstructorAnalytics = (
    params: Omit<InstructorDataDto, 'siteId' | 'institutionId'>,
    onSuccessCallback?: (data: InstructorAnalyticsResponse) => void
  ) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.user.getInstructorAnalyticsKey,
        currentSiteId,
        currentSchoolId,
        params,
      ],
      queryFn: () =>
        getInstructorAnalytics({
          ...params,
          siteId: currentSiteId,
          institutionId: currentSchoolId,
        }),
      onSuccess: (data: InstructorAnalyticsResponse) => {
        onSuccessCallback?.(data)
      },
    })
  }

  const useGetInstructorRates = (
    userRoleId: number,
    options?: {
      enabled?: boolean
      onSuccessCallback?: (data: InstructorRatesResponse) => void
    }
  ) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.user.getInstructorRatesKey,
        userRoleId,
        currentSchoolId,
      ],
      queryFn: () => getInstructorRates(userRoleId, currentSchoolId),
      enabled: options?.enabled !== false && !!userRoleId,
      onSuccess: (data: InstructorRatesResponse) => {
        options?.onSuccessCallback?.(data)
      },
    })
  }

  const useUpdateInstructorRatesEnabled = (
    userRoleId: number,
    onSuccessCallback?: (data: boolean) => void
  ) => {
    return useMutation<boolean, ApiError, UpdateInstructorRatesEnabledDto>({
      mutationFn: (params: UpdateInstructorRatesEnabledDto) =>
        updateInstructorRatesEnabled(userRoleId, params),
      onSuccess: (data: boolean) => {
        onSuccessCallback?.(data)
        toast.success(
          t('setting:userManagement.hourlyRates.ratesEnabledUpdatedSuccess')
        )
        queryClient.invalidateQueries([
          QUERY_KEY.user.getInstructorRatesKey,
          userRoleId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useCreateOrUpdateInstructorRates = (
    userRoleId: number,
    onSuccessCallback?: (data: InstructorRate[]) => void
  ) => {
    return useMutation<InstructorRate[], ApiError, UpdateInstructorRateDto[]>({
      mutationFn: (rates: UpdateInstructorRateDto[]) =>
        createOrUpdateInstructorRates(userRoleId, currentSchoolId, rates),
      onSuccess: (data: InstructorRate[]) => {
        onSuccessCallback?.(data)
        toast.success(
          t('setting:userManagement.hourlyRates.ratesUpdatedSuccess')
        )
        queryClient.invalidateQueries([
          QUERY_KEY.user.getInstructorRatesKey,
          userRoleId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useGetInstructors,
    useGetInstructorAnalytics,
    useGetInstructorRates,
    useUpdateInstructorRatesEnabled,
    useCreateOrUpdateInstructorRates,
  }
}

export default useInstructorRates
