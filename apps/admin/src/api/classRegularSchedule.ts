import { RepeatUnit } from '@/constants/course'
import type { DateOverride } from '@/types/availability.type'
import type {
  Classes,
  ClassRegularPeriodsSelectionMode,
  RegularScheduleV2,
} from '@/types/classes'
import type {
  RegularClassV2,
  RegularV2SchedulePreview,
} from '@/types/regularClass'

import apiClient from './index'

export interface CreateClassRegularScheduleV2Dto {
  classId: number
  siteId: number
  institutionId: number
  courseId: number
  weekDay: number
  startTime: string
  endTime: string
  periodRepeatFormat: {
    every: number
    unit: RepeatUnit
    startTime: string
  }
  gapBetweenPeriods: {
    every: number
    unit: RepeatUnit
  }
  periodRepeatCount: number
  selectionMode: ClassRegularPeriodsSelectionMode
}

export interface CreateClassRegularPeriodV2Dto {
  startTime: Date
  endTime: Date
  lessonRepeatFormat: {
    repeat: boolean
    every: number
    unit: RepeatUnit
    times: number
    weekDay?: number
    weekdayOccurrence?: number
  }
}

// Schedule Management
export const findSchedulesByClassId = async (
  classId: number
): Promise<RegularScheduleV2[]> => {
  const res = await apiClient.get({
    url: `/admin/class-regular-schedules/class/${classId}`,
    needAuth: true,
  })
  return res.data.data
}

export const findScheduleById = async (
  id: number
): Promise<RegularScheduleV2> => {
  const res = await apiClient.get({
    url: `/admin/class-regular-schedules/${id}`,
    needAuth: true,
  })
  return res.data.data
}

export const createSchedule = async (
  data: CreateClassRegularScheduleV2Dto
): Promise<RegularScheduleV2> => {
  const res = await apiClient.post({
    url: '/admin/class-regular-schedules',
    needAuth: true,
    data,
  })
  return res.data.data
}

export const updateSchedule = async (
  id: number,
  data: Partial<CreateClassRegularScheduleV2Dto>
): Promise<RegularScheduleV2> => {
  const res = await apiClient.patch({
    url: `/admin/class-regular-schedules/${id}`,
    needAuth: true,
    data,
  })
  return res.data.data
}

export const deleteSchedule = async (id: number): Promise<void> => {
  await apiClient.delete({
    url: `/admin/class-regular-schedules/${id}`,
    needAuth: true,
  })
}

// Period Management
export const addPeriod = async (
  scheduleId: number,
  data: CreateClassRegularPeriodV2Dto
): Promise<RegularScheduleV2> => {
  const res = await apiClient.post({
    url: `/admin/class-regular-schedules/${scheduleId}/periods`,
    needAuth: true,
    data,
  })
  return res.data.data
}

export const updatePeriod = async (
  scheduleId: number,
  periodId: number,
  data: Partial<CreateClassRegularPeriodV2Dto>
): Promise<RegularScheduleV2> => {
  const res = await apiClient.patch({
    url: `/admin/class-regular-schedules/${scheduleId}/periods/${periodId}`,
    needAuth: true,
    data,
  })
  return res.data.data
}

export const deletePeriod = async (
  scheduleId: number,
  periodId: number
): Promise<RegularScheduleV2> => {
  const res = await apiClient.delete({
    url: `/admin/class-regular-schedules/${scheduleId}/periods/${periodId}`,
    needAuth: true,
  })
  return res.data.data
}

// Date Override Management
export const addDateOverride = async (
  scheduleId: number,
  data: DateOverride
): Promise<RegularScheduleV2> => {
  const res = await apiClient.post({
    url: `/admin/class-regular-schedules/${scheduleId}/date-overrides`,
    needAuth: true,
    data,
  })
  return res.data.data
}

export const updateDateOverrides = async (
  scheduleId: number,
  data: DateOverride[]
): Promise<RegularScheduleV2> => {
  const res = await apiClient.patch({
    url: `/admin/class-regular-schedules/${scheduleId}/date-overrides`,
    needAuth: true,
    data,
  })
  return res.data.data
}

export const deleteDateOverride = async (
  scheduleId: number,
  date: string
): Promise<RegularScheduleV2> => {
  const res = await apiClient.delete({
    url: `/admin/class-regular-schedules/${scheduleId}/date-overrides/${date}`,
    needAuth: true,
  })
  return res.data.data
}

export const getRegularClassesV2 = async (
  institutionId: number
): Promise<RegularClassV2[]> => {
  const res = await apiClient.get({
    url: `/admin/admin/class-regular-schedules/classes`,
    needAuth: true,
    params: { institutionId },
  })
  return res.data?.data
}

export const getDetailRegularClass = async (
  institutionId: number,
  classId: number
): Promise<Classes> => {
  const res = await apiClient.get({
    url: `/admin/admin/class-regular-schedules/classes/${classId}/detail`,
    needAuth: true,
    params: { institutionId, classId },
  })
  return res.data?.data
}
export const previewRegularClassLessons = async (
  institutionId: number,
  classId: number
): Promise<RegularV2SchedulePreview> => {
  const res = await apiClient.get({
    url: `/admin/class-regular-schedules/classes/${classId}/preview-lessons`,
    needAuth: true,
    params: { institutionId, classId },
  })
  return res.data?.data
}
