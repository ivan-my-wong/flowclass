import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  createNewTrialLesson,
  deleteTrialLesson,
  fetchDetailTrialLesson,
  fetchTrialLessons,
  fetchTrialLessonsSummary,
  ParamsFetchingTrialLessons,
  updateTrialLesson,
} from '@/api/trialLesson'
import { QUERY_KEY } from '@/constants/queryKey'
import useAuth from '@/hooks/useAuth'
import useSiteData from '@/hooks/useSiteData'
import { schoolState } from '@/stores/schoolData'
import { TrialLessonDto, TrialLessonResponse } from '@/types/trialLesson.type'

const useTrialLessonData = () => {
  const { t } = useTranslation()
  const [schoolData] = useRecoilState(schoolState)
  const { isLogin } = useAuth()
  const { siteData } = useSiteData()
  const queryClient = useQueryClient()
  const currentSiteId = siteData.currentSite?.id || 0
  const currentSchoolId = schoolData.currentSchool?.id || 0

  const useFetchTrialLesson = (params: ParamsFetchingTrialLessons) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.trialLesson.fetchTrialLessonsKey,
        currentSiteId,
        currentSchoolId,
      ],
      queryFn: () => fetchTrialLessons(currentSiteId, currentSchoolId, params),
      enabled: isLogin && !!currentSiteId && !!currentSchoolId,
    })
  }
  const useFetchTrialLessonSummary = () => {
    return useQuery({
      queryKey: [
        QUERY_KEY.trialLesson.fetchTrialSummaryKey,
        currentSiteId,
        currentSchoolId,
      ],
      queryFn: () => fetchTrialLessonsSummary(currentSiteId, currentSchoolId),
      enabled: isLogin && !!currentSiteId && !!currentSchoolId,
    })
  }
  const useFetchDetailTrialLesson = (
    trialLessonId?: string,
    onSuccessCallback?: (data: TrialLessonResponse) => void
  ) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.trialLesson.fetchDetailTrialLessonsKey,
        trialLessonId,
      ],
      queryFn: () =>
        fetchDetailTrialLesson(
          currentSiteId,
          currentSchoolId,
          trialLessonId ||
            (() => {
              throw new Error(
                t('promotion:errors.trialLessonIdRequired').toString()
              )
            })()
        ),
      onSuccess: data => {
        onSuccessCallback?.(data)
      },
      enabled:
        isLogin && !!currentSiteId && !!currentSchoolId && !!trialLessonId,
    })
  }

  const useCreateTrialLesson = (
    onSuccessCallback?: (data: TrialLessonResponse) => void
  ) => {
    return useMutation({
      mutationFn: (payload: TrialLessonDto) =>
        createNewTrialLesson(currentSiteId, currentSchoolId, payload),
      onSuccess: async (data: TrialLessonResponse) => {
        onSuccessCallback?.(data)
        await queryClient.invalidateQueries([
          QUERY_KEY.trialLesson.fetchTrialLessonsKey,
          currentSiteId,
          currentSchoolId,
        ])

        toast.success(t('promotion:trialLesson.successAddMessage'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateTrialLesson = (
    trialLessonId: number,
    onSuccessCallback?: (data: TrialLessonResponse) => void
  ) => {
    return useMutation({
      mutationFn: (payload: TrialLessonDto) =>
        updateTrialLesson(
          currentSiteId,
          currentSchoolId,
          trialLessonId,
          payload
        ),
      onSuccess: async (data: TrialLessonResponse) => {
        onSuccessCallback?.(data)
        await queryClient.invalidateQueries([
          QUERY_KEY.trialLesson.fetchTrialLessonsKey,
          currentSiteId,
          currentSchoolId,
        ])
        toast.success(t('promotion:trialLesson.successUpdateMessage'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteTrialLesson = (
    trialLessonId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: () =>
        deleteTrialLesson(trialLessonId, currentSiteId, currentSchoolId),
      onSuccess: async () => {
        onSuccessCallback?.()
        await queryClient.invalidateQueries([
          QUERY_KEY.trialLesson.fetchTrialLessonsKey,
          currentSiteId,
          currentSchoolId,
        ])
        toast.success(t('promotion:trialLesson.deleteAction.message'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useFetchTrialLesson,
    useCreateTrialLesson,
    useUpdateTrialLesson,
    useFetchDetailTrialLesson,
    useDeleteTrialLesson,
    useFetchTrialLessonSummary,
  }
}
export default useTrialLessonData
