import apiClient from '@/api/index'
import { IPaginatedData } from '@/types/pagination'
import { TrialLessonDto, TrialLessonResponse } from '@/types/trialLesson.type'

export type ParamsFetchingTrialLessons = {
  page: number
  num: number
  orderBy: 'createdAt' | 'updatedAt' | 'id'
  order: 'ASC' | 'DESC'
}

const fetchTrialLessons = async (
  siteId: number,
  institutionId: number,
  params: ParamsFetchingTrialLessons
): Promise<IPaginatedData<TrialLessonResponse>> => {
  const res = await apiClient.get({
    url: '/admin/trial-lesson',
    needAuth: true,
    params: {
      ...params,
      siteId,
      institutionId,
    },
  })
  return res.data?.data
}

const fetchTrialLessonsSummary = async (
  siteId: number,
  institutionId: number
): Promise<number> => {
  const res = await apiClient.get({
    url: '/admin/trial-lesson/summary',
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
  })
  return res.data?.data
}

const fetchDetailTrialLesson = async (
  siteId: number,
  institutionId: number,
  trialLessonId: string
): Promise<TrialLessonResponse> => {
  const res = await apiClient.get({
    url: `/admin/trial-lesson/${trialLessonId}`,
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
  })
  return res.data?.data
}

const createNewTrialLesson = async (
  siteId: number,
  institutionId: number,
  payload: TrialLessonDto
): Promise<TrialLessonResponse> => {
  const res = await apiClient.post({
    url: '/admin/trial-lesson/create',
    data: { ...payload, siteId, institutionId },
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
  })
  return res.data?.data
}

const updateTrialLesson = async (
  siteId: number,
  institutionId: number,
  trialLessonId: number,
  payload: TrialLessonDto
): Promise<TrialLessonResponse> => {
  const res = await apiClient.put({
    url: '/admin/trial-lesson/update',
    data: { ...payload, siteId, institutionId },
    needAuth: true,
    params: {
      siteId,
      institutionId,
      trialLessonId,
    },
  })
  return res.data?.data
}

const deleteTrialLesson = async (
  trialLessonId: number,
  siteId: number,
  institutionId: number
): Promise<TrialLessonResponse> => {
  const res = await apiClient.delete({
    url: '/admin/trial-lesson/delete',
    needAuth: true,
    params: {
      trialLessonId,
      siteId,
      institutionId,
    },
  })
  return res.data?.data
}
export {
  createNewTrialLesson,
  deleteTrialLesson,
  fetchDetailTrialLesson,
  fetchTrialLessons,
  fetchTrialLessonsSummary,
  updateTrialLesson,
}
