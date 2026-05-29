import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import {
  bulkUpdateSharedVideo,
  CreateLesson,
  delayFollowingLessons,
  DeleteLesson,
  fetchNextAvailableRecurringLesson,
  getAllExistLessons,
  getCurrentLesson,
  getLessonProofToken,
  getListLessonMatrix,
  getListStudentLesson,
  updateLessonInstructor,
  updateLessonLocationRoom,
  updateTimeLesson,
} from '@/api/lessonDateTime'
import {
  deleteSingleStudentLesson,
  updateAttendance,
  updateStudentLessonRemarks,
} from '@/api/student'
import { SharedVideoStatus } from '@/constants/course'
import { QUERY_KEY } from '@/constants/queryKey'
import { lessonDateTimeState } from '@/stores/lessonDateTimeData'
import {
  ClassLessonType,
  CreateLessonProps,
  GetAvailableNextRecurringPayload,
  ParamsListStudentLessons,
  StudentType,
  UpdateLessonTimePayload,
} from '@/types/lessonDateTime'
import { ClassLesson, ClassLessonMatrix, StudentLesson } from '@/types/student'
import { getFormatDate } from '@/utils/timeFormat'

import { ApiError, handleApiError } from '../api/errors/apiError'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

type FilterProps = {
  startDate?: Date
  endDate?: Date
  classIdSelected?: number[]
  courseIdSelected?: number[]
  student?: string
  onlyWithApplications?: boolean
  locationIds?: number[]
  teacherIds?: number[]
}

const useLessonDateTimeData = () => {
  const [lessonData, setLessonData] = useRecoilState(lessonDateTimeState)
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = siteData.currentSite?.id.toString() || ''
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const useFetchCurrentLesson = (
    currentLessonId: number, // Pass the currentLessonId as an argument
    successfulCallback?: (data: ClassLessonType) => void
  ): UseQueryResult<ClassLessonType, unknown> => {
    return useQuery(
      [
        QUERY_KEY.course.getLessonDateTimeKey,
        currentLessonId,
        currentInstitutionId,
        currentSiteId,
      ],
      () =>
        getCurrentLesson(
          currentLessonId,
          +currentInstitutionId,
          +currentSiteId
        ),
      {
        onSuccess: data => {
          setLessonData(prev => ({ ...prev, currentLesson: data }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentLessonId,
      }
    )
  }
  const useFetchAllLessonData = ({
    startDate,
    endDate,
    classIdSelected,
    courseIdSelected,
    student,
    onlyWithApplications,
    locationIds,
    teacherIds,
    enabled,
  }: FilterProps & { enabled?: boolean }): UseQueryResult<
    ClassLesson[],
    unknown
  > => {
    return useQuery(
      [
        QUERY_KEY.course.listLessonDateTimeKey,
        currentInstitutionId,
        getFormatDate(startDate),
        getFormatDate(endDate),
        classIdSelected,
      ],
      () =>
        getAllExistLessons(
          currentInstitutionId,
          currentSiteId,
          startDate,
          endDate,
          classIdSelected,
          courseIdSelected,
          student,
          onlyWithApplications,
          locationIds,
          teacherIds
        ),
      {
        onSuccess: data => {
          setLessonData({
            ...lessonData,
            lessons: data,
            initFetch: true,
          })
          return data
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentInstitutionId && enabled !== false,
      }
    )
  }

  const useGetLessonMatrix = (
    payload: FilterProps & { enabled?: boolean }
  ): UseQueryResult<
    { lessons: ClassLessonMatrix[]; studentLessons: StudentType[] },
    unknown
  > => {
    const { enabled, ...otherPayload } = payload
    return useQuery(
      [QUERY_KEY.course.getLessonMatrixKey, currentInstitutionId, otherPayload],
      () =>
        getListLessonMatrix(
          currentInstitutionId,
          currentSiteId,
          otherPayload.startDate,
          otherPayload.endDate,
          otherPayload.classIdSelected
        ),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentInstitutionId && enabled !== false,
      }
    )
  }

  const useCreateLesson = (
    successfulCallback?: (data: CreateLessonProps) => void
  ): UseMutationResult<
    CreateLessonProps,
    ApiError,
    Partial<CreateLessonProps>,
    unknown
  > => {
    return useMutation({
      mutationFn: (lessonData: Partial<StudentLesson>) => {
        return CreateLesson(
          {
            ...lessonData,
            classId: Number(lessonData.classId?.toString()),
            institutionId: Number(currentInstitutionId.toString()),
          },
          +currentInstitutionId,
          +currentSiteId
        )
      },
      onSuccess: data => {
        toast.success(t('lessonDateTime:createLessonSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteLesson = (
    successfulCallback?: (data: ClassLessonType) => void
  ): UseMutationResult<ClassLessonType, ApiError, number, unknown> => {
    return useMutation({
      mutationFn: (lessonId: number) =>
        DeleteLesson(lessonId, +currentInstitutionId, +currentSiteId),
      onSuccess: data => {
        setLessonData(prev => ({
          ...prev,
          lessons: prev.lessons.filter(lesson => {
            return lesson.id !== data.id
          }),
        }))
        toast.success(t('lessonDateTime:deleteLessonSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateTimeLesson = (
    lessonId: number,
    onSuccessCallback?: (data: ClassLesson) => void
  ) => {
    return useMutation({
      mutationFn: (data: UpdateLessonTimePayload) =>
        updateTimeLesson(lessonId, {
          ...data,
          institutionId: +currentInstitutionId,
        }),
      onSuccess: async data => {
        toast.success(
          t('lessonDateTime:changeEntireLesson.changeTimeLessonSuccess')
        )
        // Update current lesson
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.course.getLessonDateTimeKey, lessonId],
        })
        // Update Block list
        await queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.blockTime.blockTimeListKey,
            currentInstitutionId,
          ],
        })
        onSuccessCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDelayFollowingLessons = (
    lessonId: number,
    onSuccessCallback?: (data: StudentLesson) => void
  ) => {
    return useMutation({
      mutationFn: () => delayFollowingLessons(lessonId, +currentInstitutionId),
      onSuccess: async data => {
        toast.success(
          t('lessonDateTime:changeEntireLesson.changeTimeLessonSuccess')
        )
        // Update Block list
        await queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.blockTime.blockTimeListKey,
            currentInstitutionId,
          ],
        })
        onSuccessCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteStudentLesson = (onSuccessCallback?: () => void) => {
    return useMutation({
      mutationFn: (id: number) => deleteSingleStudentLesson(id),
      onSuccess: async () => {
        onSuccessCallback?.()

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.studentLesson.getListStudentLessonKey],
        })
        toast.success(t('student:teachingService.deleteTeachingServiceSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useUpdateAttendanceLesson = () => {
    return useMutation({
      mutationFn: (data: any) => updateAttendance(data),
      onSuccess: async data => {
        if (data) {
          // Only invalidate non-matrix queries. The matrix useEffect rebuilds
          // the entire students state from server data, which would overwrite
          // locally-set attendances for other lessons. Local state is kept
          // correct via the onChange -> setStatus callback in the cell.
          await Promise.all([
            queryClient.invalidateQueries([
              QUERY_KEY.course.getLessonDateTimeKey,
            ]),
            queryClient.invalidateQueries([
              QUERY_KEY.studentLesson.getListStudentLessonKey,
            ]),
          ])
          toast.success(t('student:attendanceStatus.attendanceUpdated'))
        } else {
          toast.success(t('student:attendanceStatus.attendanceNotUpdated'))
        }
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateStudentLessonRemarks = () => {
    return useMutation({
      mutationFn: (data: { studentLessonId: number; remarks: string | null }) =>
        updateStudentLessonRemarks(data),
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useFetchAvailableNextRecurring = () => {
    return useMutation({
      mutationFn: (data: GetAvailableNextRecurringPayload) =>
        fetchNextAvailableRecurringLesson({
          ...data,
          siteId: +currentSiteId,
          institutionId: +currentInstitutionId,
        }),
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useGetLessonProofToken = (studentLessonId?: number) => {
    return useQuery(
      [QUERY_KEY.studentLesson.getStudentLessonProofTokenKey, studentLessonId],
      {
        queryFn: () => {
          return getLessonProofToken(
            studentLessonId as number,
            +currentInstitutionId,
            +currentSiteId
          )
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!studentLessonId,
      }
    )
  }

  const useGetListStudentLesson = (
    lessonId?: number,
    pageParams?: ParamsListStudentLessons
  ) => {
    if (pageParams?.allPage) {
      // If allPage is true, set page and num to 1. because we want to get all data
      // eslint-disable-next-line no-param-reassign
      pageParams.page = 1
      // eslint-disable-next-line no-param-reassign
      pageParams.num = 10
    }
    return useQuery(
      [QUERY_KEY.studentLesson.getListStudentLessonKey, lessonId, pageParams],
      {
        queryFn: () =>
          getListStudentLesson(
            lessonId as number,
            +currentInstitutionId,
            +currentSiteId,
            pageParams
          ),
        enabled: !!lessonId && !!currentInstitutionId && !!currentSiteId,
      }
    )
  }

  const useUpdateLocationRoom = (
    lessonId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (data: any) =>
        updateLessonLocationRoom(+currentInstitutionId, lessonId, data),
      onSuccess: async data => {
        toast.success(t('lessonDateTime:updateLocationRoom.success'))
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateInstructor = (
    lessonId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (data: any) =>
        updateLessonInstructor(+currentInstitutionId, lessonId, data),
      onSuccess: async data => {
        toast.success(t('lessonDateTime:updateInstructor.success'))
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useCheckConflict = () => {
    return useMutation({
      mutationFn: (payload: FilterProps) =>
        getAllExistLessons(
          currentInstitutionId,
          currentSiteId,
          payload.startDate,
          payload.endDate,
          payload.classIdSelected,
          payload.courseIdSelected,
          payload.student,
          payload.onlyWithApplications,
          payload.locationIds,
          payload.teacherIds,
          true
        ),
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    currentInstitutionId,
    currentSiteId,
    lessonData,
    useGetLessonProofToken,
    useUpdateTimeLesson,
    useFetchAllLessonData,
    useCreateLesson,
    useDeleteLesson,
    useFetchCurrentLesson,
    useDelayFollowingLessons,
    useDeleteStudentLesson,
    useUpdateAttendanceLesson,
    useUpdateStudentLessonRemarks,
    useFetchAvailableNextRecurring,
    useGetListStudentLesson,
    useUpdateLocationRoom,
    useUpdateInstructor,
    useCheckConflict,
    useGetLessonMatrix,
    useBulkUpdateSharedVideo,
  }

  function useBulkUpdateSharedVideo(
    onSuccess?: () => void
  ): UseMutationResult<
    void,
    ApiError,
    { classLessonIds: number[]; hasSharedVideo: SharedVideoStatus; studentLessonIds?: number[] }
  > {
    return useMutation({
      mutationFn: ({ classLessonIds, hasSharedVideo, studentLessonIds }) =>
        bulkUpdateSharedVideo(classLessonIds, hasSharedVideo, studentLessonIds),
      onSuccess: () => {
        toast.success(t('lessonList:videoStatusUpdated'))
        onSuccess?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
}

export default useLessonDateTimeData
