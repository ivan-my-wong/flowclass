/* eslint-disable no-underscore-dangle */
import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '../api/errors/apiError'
import {
  createWorkshopSession,
  deleteWorkshopSession,
  duplicateMultipleWorkshopSession,
  duplicateWorkshopSession,
  getCurrentWorkshopAllSessions,
  getWorkshops,
  updateWorkshopSession,
} from '../api/workshop'
import { QUERY_KEY } from '../constants/queryKey'
import { courseState } from '../stores/courseData'
import { schoolState } from '../stores/schoolData'
import { Workshop, workshopState } from '../stores/workshopData'

import useAuth from './useAuth'

const useWorkshopData = () => {
  const schoolData = useRecoilValue(schoolState)
  const courseData = useRecoilValue(courseState)
  const [workshopData, setWorkshopData] = useRecoilState(workshopState)
  const { t } = useTranslation()
  const { isLogin } = useAuth()
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentCourseId = courseData.currentCourse?.id || 0

  const useFetchAllWorkshopData = (): UseQueryResult<Workshop[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.getWorkshopSchoolKey, currentSchoolId],
      () => getWorkshops(currentSchoolId),
      {
        onSuccess: data => {
          setWorkshopData({
            currentWorkshop: data.length > 0 ? data[0] : null,
            workshops: data,
            initFetch: true,
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
      }
    )
    return result
  }

  // const setCurrentInstitution = (id: number | string) => {
  //   const currentInstitution = institutionData.institutions.find(
  //     // eslint-disable-next-line eqeqeq
  //     (institution: Institution) => institution.id == id
  //   )
  //   if (currentInstitution) {
  //     setInstitutionData(prev => ({
  //       ...prev,
  //       currentInstitution,
  //     }))
  //   }
  // }
  const duplicateWorkshopSessionFunction = async (
    sessionData: Partial<any>
  ): Promise<any> => {
    const duplicatedSession = sessionData.sessionDates?.map((session: any) => {
      return {
        ...session,
        id: null,
      }
    })
    const newSession = await duplicateWorkshopSession({
      ...sessionData,
      sessionDates: duplicatedSession,
    })
    return newSession
  }

  const duplicateMultipleWorkshopSessionFunction = async (
    args: any
  ): Promise<any[]> => {
    const duplicatedSession = await duplicateMultipleWorkshopSession(args)
    return duplicatedSession
  }

  const useDuplicateWorkshopSession = (
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, Partial<any>, unknown> => {
    const mutation = useMutation({
      mutationFn: (sessionData: Partial<any>) =>
        duplicateWorkshopSessionFunction({
          courseId: currentCourseId,
          ...sessionData,
        }),
      onSuccess: data => {
        toast.success(t('teachingService:session.duplicateSessionSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDuplicateMultipleWorkshopSession = (
    successfulCallback?: (data: any[]) => void
  ): UseMutationResult<any[], ApiError, any, unknown> => {
    const mutation = useMutation({
      mutationFn: (sessionData: any) =>
        duplicateMultipleWorkshopSessionFunction(sessionData),
      onSuccess: data => {
        toast.success(t('teachingService:session.duplicateSessionSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useFetchCurrentWorkshopAllSessions = (
    successfulCallback?: (data: any[]) => void
  ): UseQueryResult<any[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.getWorkshopAllSessionsCourseKey, currentCourseId],
      () => getCurrentWorkshopAllSessions(currentCourseId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentCourseId,
      }
    )
    return result
  }

  const useCreateWorkshopSession = (
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, Partial<any>, unknown> => {
    const mutation = useMutation({
      mutationFn: (sessionData: Partial<any>) =>
        createWorkshopSession({
          courseId: currentCourseId,
          ...sessionData,
        }),
      onSuccess: data => {
        toast.success(t('teachingService:session.createSessionSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateWorkshopSession = (
    workshopSessionId?: number,
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, Partial<any>, unknown> => {
    const mutation = useMutation({
      mutationFn: (sessionData: Partial<any>) =>
        updateWorkshopSession(workshopSessionId ?? (sessionData.id as number), {
          courseId: currentCourseId,
          ...sessionData,
        }),
      onSuccess: data => {
        toast.success(t('teachingService:session.updateSessionSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteWorkshopSession = (
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (workshopSessionId: number) =>
        deleteWorkshopSession(workshopSessionId),
      onSuccess: data => {
        toast.success(t('teachingService:session.deleteSessionSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  return {
    workshopData,
    useFetchAllWorkshopData,
    // setCurrentInstitution,
    useFetchCurrentWorkshopAllSessions,
    useCreateWorkshopSession,
    useUpdateWorkshopSession,
    useDeleteWorkshopSession,
    useDuplicateWorkshopSession,
    useDuplicateMultipleWorkshopSession,
  }
}

export default useWorkshopData
