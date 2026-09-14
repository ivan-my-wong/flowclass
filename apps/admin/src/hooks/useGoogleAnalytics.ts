import { useQuery, UseQueryResult } from 'react-query'
import { useRecoilValue } from 'recoil'

import { getRevenueAnalyticsData } from '@/api/dataAnalytics'
import ApiError from '@/api/errors/apiError'
import { getGoogleAnalyticsData } from '@/api/googleAnalytics'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import {
  SchoolCourseRevenueAmount,
  SchoolCourseRevenueDto,
} from '@/types/dataAnalytics'
import {
  GoogleAnalyticsBodyParams,
  GoogleAnalyticsDataResponse,
} from '@/types/googleAnalytics'

const useGoogleAnalytics = (): {
  useFetchRevenueAnalytics: (
    params: SchoolCourseRevenueDto
  ) => UseQueryResult<SchoolCourseRevenueAmount[], unknown>
  useFetchGoogleAnalytics: (
    params: Omit<GoogleAnalyticsBodyParams, 'institutionId'>
  ) => UseQueryResult<GoogleAnalyticsDataResponse, unknown>
} => {
  const schoolData = useRecoilValue(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0

  const useFetchRevenueAnalytics = (
    params: SchoolCourseRevenueDto
  ): UseQueryResult<SchoolCourseRevenueAmount[], unknown> => {
    const result = useQuery(
      [
        QUERY_KEY.googleAnalytics.schoolRevenueKey,
        params.institutionId,
        ...(params?.courseId
          ? [QUERY_KEY.googleAnalytics.courseRevenueKey, params.courseId]
          : []),
      ],
      () => {
        return getRevenueAnalyticsData(params)
      },
      {
        onError: (error: ApiError) => {
          return error
        },
        enabled: !!params.institutionId,
        refetchOnMount: false,
      }
    )
    return result
  }

  const useFetchGoogleAnalytics = (
    params: Omit<GoogleAnalyticsBodyParams, 'institutionId'>
  ): UseQueryResult<GoogleAnalyticsDataResponse, unknown> => {
    const result = useQuery(
      [
        QUERY_KEY.googleAnalytics.googleAnalyticsSchoolKey,
        currentSchoolId,
        ...(params?.courseId
          ? [
              QUERY_KEY.googleAnalytics.googleAnalyticsCourseKey,
              params.courseId,
            ]
          : []),
        params.dataType,
        params.startDate,
        params.endDate,
      ],
      () => {
        return getGoogleAnalyticsData({
          ...params,
          institutionId: currentSchoolId,
        })
      },
      {
        onError: (error: ApiError) => {
          return error
        },
        enabled: !!currentSchoolId,
        refetchOnMount: false,
      }
    )
    return result
  }
  return {
    useFetchGoogleAnalytics,
    useFetchRevenueAnalytics,
  }
}

export default useGoogleAnalytics
