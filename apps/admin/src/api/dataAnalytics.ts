import { t } from 'i18next'

import {
  SchoolCourseRevenueAmount,
  SchoolCourseRevenueDto,
} from '../types/dataAnalytics'

import apiClient from './index'

export const getRevenueAnalyticsData = async ({
  institutionId,
  courseId,
  startDate,
  endDate,
}: SchoolCourseRevenueDto): Promise<SchoolCourseRevenueAmount[]> => {
  const res = await apiClient.get({
    url: '/admin/enroll-courses/school-revenue',
    needAuth: true,
    params: {
      institutionId,
      courseId,
      startDate,
      endDate,
    },
  })
  if (!res.data) {
    const message = t(`common:errors.SCHOOL_REVENUE_DATA_NOT_FOUND`)
    throw new Error(message)
  }
  return res.data.data
}
