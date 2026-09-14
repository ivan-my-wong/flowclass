import {
  GoogleAnalyticsBodyParams,
  GoogleAnalyticsDataResponse,
} from '../types/googleAnalytics'

import apiClient from '.'

export const getGoogleAnalyticsData = async ({
  startDate,
  endDate,
  dataType,
  institutionId,
  courseId,
}: GoogleAnalyticsBodyParams): Promise<GoogleAnalyticsDataResponse> => {
  const res = await apiClient.get({
    url: '/admin/google-analytics',
    needAuth: true,
    params: {
      startDate,
      endDate,
      dataType,
      institutionId,
      courseId,
    },
  })

  return res.data.data
}
