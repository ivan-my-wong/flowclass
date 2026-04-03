import { Invoice } from '@/types/enrollCourse'
import {
  LessonDetailParams,
  LessonListParams,
  StatFilter,
  StatType,
} from '@/types/statistics'

import apiClient from '.'

export const getInvoiceStatistics = async <T = any>({
  type,
  filter,
  startDate,
  endDate,
  siteId,
  institutionId,
}: {
  type: StatType
  filter: StatFilter
  startDate?: string
  endDate?: string
  siteId: number
  institutionId: number
}): Promise<T> => {
  const res = await apiClient.get({
    url: '/admin/invoices/statistic/metrics',
    needAuth: true,
    params: {
      type,
      filter,
      start: startDate, // e.g., "2025-04-01"
      end: endDate, // e.g., "2025-05-01"
      siteId,
      institutionId,
    },
  })

  if (res.data.error) {
    throw new Error(res.data.error)
  }

  return res.data.data
}

export const getLessonList = async (params: LessonListParams) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const res = await apiClient.get({
    url: '/admin/invoices/statistic/lessons',
    needAuth: true,
    params: {
      ...params,
      start: formatDate(params.startDate),
      end: formatDate(params.endDate),
    },
  })

  return res.data.data
}

export const getLessonDetail = async (params: LessonDetailParams) => {
  const { lessonId, institutionId, siteId } = params
  const res = await apiClient.get({
    url: `/admin/invoices/statistic/lessons/${lessonId}`,
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
  })

  return res.data
}

export const updateInvoiceRemark = async (
  invoiceId: number,
  remark: string | null
): Promise<void> => {
  await apiClient.put({
    needAuth: true,
    url: `/admin/invoices/remark/${invoiceId}`,
    data: { remark },
  })
}

/**
 * Fetches student statistics (overview, by-student, etc.)
 */
export const getStudentStatistics = async <T = any>({
  filter,
  startDate,
  endDate,
  siteId,
  institutionId,
}: {
  filter: StatFilter
  startDate?: string
  endDate?: string
  siteId: number
  institutionId: number
}): Promise<T> => {
  const res = await apiClient.get({
    url: '/admin/invoices/statistic/metrics',
    needAuth: true,
    params: {
      type: 'student',
      filter,
      start: startDate,
      end: endDate,
      siteId,
      institutionId,
    },
  })

  return res.data.data
}

/**
 * Fetches list of students who dropped out from a specific class in given period
 */
export interface DropoutStudent {
  name: string
  phone: string
  email: string
  lastAttendance: string
}

export const getDropoutStudents = async ({
  classId,
  startDate,
  endDate,
  siteId,
  institutionId,
}: {
  classId: number
  startDate: string
  endDate: string
  siteId: number
  institutionId: number
}): Promise<{ students: DropoutStudent[] }> => {
  const res = await apiClient.get({
    url: `/admin/invoices/statistic/dropouts`,
    needAuth: true,
    params: {
      classId,
      start: startDate,
      end: endDate,
      siteId,
      institutionId,
    },
  })

  return res.data.data
}

/**
 * Get invoice statistics by date range
 * Returns array of Invoice objects
 */
export const findInvoiceStatisticsByDateRange = async ({
  startDate,
  endDate,
  siteId,
  institutionId,
}: {
  startDate?: string | Date
  endDate?: string | Date
  siteId: number
  institutionId: number
}): Promise<Invoice[]> => {
  const params: Record<string, unknown> = {
    siteId,
    institutionId,
  }

  if (startDate) {
    params.startDate =
      typeof startDate === 'string' ? startDate : startDate.toISOString()
  }
  if (endDate) {
    params.endDate =
      typeof endDate === 'string' ? endDate : endDate.toISOString()
  }

  const res = await apiClient.get({
    url: '/admin/invoices/statistics/basic',
    needAuth: true,
    params,
  })

  return res.data.data
}
