import { SharedVideoStatus } from '@/constants/course'
import {
  ClassLessonType,
  CreateLessonProps,
  GetAvailableNextRecurringPayload,
  GetAvailableNextRecurringResponse,
  ParamsListStudentLessons,
  StudentLessonQrCodeResponseDto,
  StudentType,
  UpdateLessonTimePayload,
} from '@/types/lessonDateTime'
import { IPaginatedData } from '@/types/pagination'
import { ClassLessonMatrix } from '@/types/student'
import { getCurrentWeek } from '@/utils/timeFormat'

import apiClient from './index'

interface UpdateLessonLocationRoomPayload {
  locationId: number
}

export const getAllExistLessons = async (
  institutionId: string,
  siteId: string,
  startDate: Date = getCurrentWeek(true),
  endDate: Date = getCurrentWeek(false),
  classSelected?: number[],
  courseSelected?: number[],
  student?: string,
  onlyWithApplications?: boolean,
  locationIds?: number[],
  teacherIds?: number[],
  checkConflict?: boolean
): Promise<ClassLessonType[]> => {
  const queryString: string[] = []

  classSelected?.map(val => {
    return queryString.push(
      `${encodeURIComponent('classIds')}=${encodeURIComponent(val)}`
    )
  })

  courseSelected?.map(val => {
    return queryString.push(
      `${encodeURIComponent('courseIds')}=${encodeURIComponent(val)}`
    )
  })

  if (student) {
    queryString.push(
      `${encodeURIComponent('student')}=${encodeURIComponent(student)}`
    )
  }

  if (onlyWithApplications) {
    queryString.push(
      `${encodeURIComponent('onlyWithApplications')}=${encodeURIComponent(
        onlyWithApplications
      )}`
    )
  }

  if (locationIds) {
    locationIds.forEach(val => {
      queryString.push(
        `${encodeURIComponent('locationIds')}=${encodeURIComponent(val)}`
      )
    })
  }

  if (teacherIds) {
    teacherIds.forEach(val => {
      queryString.push(
        `${encodeURIComponent('teacherIds')}=${encodeURIComponent(val)}`
      )
    })
  }

  const url = `/admin/class-lesson${checkConflict ? '/check/conflict' : ''}`

  const res = await apiClient.get({
    url: `${url}?${queryString.join('&')}`,
    needAuth: true,
    params: {
      startDate,
      endDate,
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const getCurrentLesson = async (
  id: number,
  institutionId: number,
  siteId: number
): Promise<ClassLessonType> => {
  const res = await apiClient.get({
    url: `/admin/class-lesson/${id}`,
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const CreateLesson = async (
  lesson: Partial<CreateLessonProps>,
  institutionId: number,
  siteId: number
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/class-lesson',
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
    data: { ...lesson },
  })

  return res.data.data
}

export const DeleteLesson = async (
  id: number,
  institutionId: number,
  siteId: number
): Promise<ClassLessonType> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: `/admin/class-lesson/${id}`,
    params: {
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const updateTimeLesson = async (
  lessonId: number,
  data: UpdateLessonTimePayload
) => {
  const res = await apiClient.put({
    url: `/admin/class-lesson/${lessonId}/update-time`,
    needAuth: true,
    data,
  })
  return res.data.data
}

export const delayFollowingLessons = async (
  lessonId: number,
  institutionId: number
) => {
  const res = await apiClient.patch({
    url: `/admin/class-lesson/${lessonId}/delay-lessons`,
    needAuth: true,
    data: {
      institutionId,
    },
  })
  return res.data.data
}

export const fetchNextAvailableRecurringLesson = async (
  payload: GetAvailableNextRecurringPayload
): Promise<GetAvailableNextRecurringResponse> => {
  const res = await apiClient.patch({
    url: `/admin/class-lesson/available/next-lesson`,
    needAuth: true,
    data: payload,
  })
  return res.data.data
}

export const getLessonProofToken = async (
  studentLessonId: number,
  institutionId: number,
  siteId: number
): Promise<StudentLessonQrCodeResponseDto> => {
  const res = await apiClient.get({
    url: `/admin/class-lesson/${studentLessonId}/proof-token`,
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const getListStudentLesson = async (
  lessonId: number,
  institutionId: number,
  siteId: number,
  pageParams?: ParamsListStudentLessons
): Promise<IPaginatedData<StudentType>> => {
  const res = await apiClient.get({
    url: `/admin/class-lesson/${lessonId}/students`,
    needAuth: true,
    params: {
      ...pageParams,
      institutionId,
      siteId,
    },
  })
  return res?.data?.data
}

export const getAttendanceModifications = async (
  institutionId: number
): Promise<boolean> => {
  const res = await apiClient.get({
    url: `/admin/class-lesson/check-attendance-changes/${institutionId}`,
    needAuth: true,
  })
  return res.data.data
}

export const updateLessonLocationRoom = async (
  institutionId: number,
  lessonId: number,
  payload: UpdateLessonLocationRoomPayload
) => {
  const res = await apiClient.put({
    url: `/admin/class-lesson/${lessonId}/location-room`,
    needAuth: true,
    params: {
      institutionId,
    },
    data: payload,
  })
  return res.data.data
}

export const updateLessonInstructor = async (
  institutionId: number,
  lessonId: number,
  payload: { instructorId: number }
) => {
  const res = await apiClient.put({
    url: `/admin/class-lesson/${lessonId}/instructor`,
    needAuth: true,
    params: {
      institutionId,
    },
    data: payload,
  })
  return res.data.data
}

export const getListLessonMatrix = async (
  institutionId: string,
  siteId: string,
  startDate: Date = getCurrentWeek(true),
  endDate: Date = getCurrentWeek(false),
  classSelected?: number[]
): Promise<{ lessons: ClassLessonMatrix[]; studentLessons: StudentType[] }> => {
  const queryString: string[] = []

  classSelected?.map(val => {
    return queryString.push(
      `${encodeURIComponent('classIds')}=${encodeURIComponent(val)}`
    )
  })

  const res = await apiClient.get({
    url: `/admin/class-lesson/lessons-matrix?${queryString.join('&')}`,
    needAuth: true,
    params: {
      startDate,
      endDate,
      institutionId,
      siteId,
    },
  })

  return res.data.data
}

export const bulkUpdateSharedVideo = async (
  classLessonIds: number[],
  hasSharedVideo: SharedVideoStatus,
  studentLessonIds?: number[]
): Promise<void> => {
  await apiClient.patch({
    needAuth: true,
    url: '/admin/class-lesson/bulk-update-shared-video',
    data: { classLessonIds, hasSharedVideo, studentLessonIds },
  })
}
