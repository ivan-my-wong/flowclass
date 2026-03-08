import { AppointmentForm } from '@/types/appointment'
import type { PriceOption } from '@/types/regularClass'

import type {
  Classes,
  DuplicateMultipleClassParams,
  PeriodLessons,
  RecurringSchedules,
  RegularPeriods,
  RegularScheduleV2,
  RepeatFormats,
  ResValidateTimeslot,
  TimeSlotClassQuota,
} from '../types/classes'
import { ClassTypeEnum, PriceType } from '../types/course'

import apiClient from './index'

export const getCurrentCourseAllClasses = async (
  courseId: number
): Promise<Classes[]> => {
  const res = await apiClient.get({
    url: '/admin/regular-course/classes',
    needAuth: true,
    params: {
      courseId,
    },
  })

  return res.data.data.content
}

export type CreateRegularPeriodsDto = {
  id?: number
  name: string
  courseId: number
  lessons: PeriodLessons[]
  duration: number
  repeatFormat?: RepeatFormats
}

export type CreateClassDto = {
  id?: number
  courseId: number

  type: ClassTypeEnum
  dropIn: boolean
  name?: string
  quota?: number
  tuition?: number

  teachingLanguage: string
  priceType: PriceType
  priceOptions: PriceOption[]
  regularPeriods?: CreateRegularPeriodsDto[]

  regularScheduleV2?: RegularScheduleV2

  recurringSchedules?: RecurringSchedules[]
  recurringFormat?: RepeatFormats

  appointment?: AppointmentForm

  applicationPeriod?: {
    startDatetime: string | null
    endDatetime: string | null
  }
}

export const createClass = async (
  classData: CreateClassDto
): Promise<Classes> => {
  const res = await apiClient.post({
    url: '/admin/classes/create',
    needAuth: true,
    data: { ...classData },
  })

  return res.data.data
}

export const updateClass = async (
  classData: Partial<Classes>
): Promise<Classes> => {
  const res = await apiClient.post({
    url: '/admin/classes/update',
    needAuth: true,
    data: classData,
  })
  return res.data.data
}

export const bulkUpdateClasses = async (
  currentSchoolId: number,
  classData: Partial<Classes>[]
): Promise<Classes[]> => {
  const res = await apiClient.post({
    url: '/admin/classes/bulk-update',
    needAuth: true,
    params: {
      institutionId: currentSchoolId,
    },
    data: { classes: classData },
  })

  return res.data.data
}

export const duplicateClass = async (
  classData: Partial<Classes>
): Promise<Classes> => {
  const res = await apiClient.post({
    url: '/admin/regular-course/classes/duplicate-with-course',
    needAuth: true,
    data: classData,
  })

  return res.data.data
}

export const duplicateMultipleClass = async (
  classData: DuplicateMultipleClassParams
): Promise<Classes[]> => {
  const res = await apiClient.post({
    url: '/admin/regular-course/multiple-classes/duplicate-with-course',
    needAuth: true,
    data: classData,
  })

  return res.data.data
}
export const deleteClass = async (classId: number): Promise<Classes> => {
  const res = await apiClient.delete({
    url: '/admin/regular-course/classes/delete',
    needAuth: true,
    params: {
      classId,
    },
  })

  return res.data.data
}

export const archiveClass = async (classId: number): Promise<Classes> => {
  const res = await apiClient.post({
    url: `/admin/regular-course/classes/${classId}/archive`,
    needAuth: true,
    params: {
      classId,
    },
  })

  return res.data.data
}

export const unarchiveClass = async (classId: number): Promise<Classes> => {
  const res = await apiClient.post({
    url: `/admin/regular-course/classes/${classId}/unarchive`,
    needAuth: true,
    params: {
      classId,
    },
  })

  return res.data.data
}

export const deleteLessonPhase = async (
  lessonId: number,
  classId: number
): Promise<RegularPeriods> => {
  const res = await apiClient.delete({
    url: '/admin/regular-course/lesson-phase/delete',
    needAuth: true,
    params: {
      lessonId,
      classId,
    },
  })

  return res.data.data
}

export const setMultipleClasses = async (classId: number): Promise<Classes> => {
  const res = await apiClient.post({
    url: '/admin/regular-course/classes/setMultipleClass',
    needAuth: true,
    data: {
      classId,
    },
  })

  return res.data.data
}

export const validateTimeslot = async (
  institutionId: number,
  classId?: number,
  lessons?: PeriodLessons[]
): Promise<ResValidateTimeslot> => {
  const res = await apiClient.post({
    url: '/admin/regular-course/classes/validate-timeslot',
    needAuth: true,
    data: { classId, lessons },
    params: { institutionId },
  })

  return res.data.data
}

export const getAllClasses = async (
  institutionId: number
): Promise<Classes[]> => {
  const res = await apiClient.get({
    url: '/admin/classes/list',
    needAuth: true,
    params: {
      institutionId,
    },
  })

  return res.data.data
}

export const getDetailClass = async (
  institutionId: number,
  classId: number
): Promise<Classes> => {
  const res = await apiClient.get({
    url: `/admin/classes/${classId}/detail`,
    needAuth: true,
    params: {
      institutionId,
    },
  })

  return res.data.data
}

export const getListClassPreviewRecurringLessons = async (
  institutionId: number,
  classId: number,
  date: string,
  lessonDateId: number
): Promise<Classes> => {
  const res = await apiClient.get({
    url: `/admin/classes/${classId}/preview-recurring-lessons`,
    needAuth: true,
    params: {
      institutionId,
      date,
      lessonDateId,
    },
  })

  return res.data.data
}

export const getAllTimeSlotClassQuota = async (
  institutionId: number,
  classId: number
): Promise<TimeSlotClassQuota> => {
  const res = await apiClient.get({
    url: `/admin/classes/${classId}/time-slot-quota`,
    needAuth: true,
    params: {
      institutionId,
    },
  })

  return res.data.data
}

/**
 * Get all classes with their lessons for a specific course
 * Used in Invoice Campaign to show all classes' lessons in one view
 * @param courseId Course ID
 * @param institutionId Institution ID
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 * @returns All classes with their lessons
 */
export const getAllClassesLessonsInCourse = async (
  courseId: number,
  institutionId: number,
  startDate?: Date,
  endDate?: Date
) => {
  const res = await apiClient.get({
    url: `/admin/classes/by-course/${courseId}/all-lessons`,
    needAuth: true,
    params: {
      institutionId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    },
  })

  return res.data.data
}
