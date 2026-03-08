import { useCallback } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from 'react-query'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { ErrorMessageCode } from '@/api/errors/errorMessage'
import {
  addTeachingService,
  bulkAddTeachingService,
  createStudent,
  getCurrentStudentQrCodeAttendanceData,
  getStudentDetail,
  getTeachingServiceOpts,
  sendAddLessonNotiReq,
  sendApplicationLink,
  sendChangeLessonNotiReq,
  studentAddLesson,
  studentChangeLesson,
  updateTeachingService,
} from '@/api/student'
import { STALE_TIME } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { ClassTypeEnum } from '@/types/course'
import { EnrollCourseInstance } from '@/types/enrollCourse'
import {
  CourseOpts,
  QRCodeStudentAttendanceData,
  SendAddLessonEmailParams,
  SendApplicationLinkEmailParams,
  SendChangeLessonEmailParams,
  StudentLesson,
  TypeCreateStudent,
  TypeGetTeachingServiceOpt,
  TypeGetTeachingServiceOptItem,
  TypeOpts,
} from '@/types/student'
import {
  StudentAddLessonRequestDto,
  StudentChangeLessonRequestDto,
  StudentCreateTeachingServiceRequestDto,
} from '@/types/studentAddTeachingService'
import { StudentUser } from '@/types/user'

type UseStudentCRMDataProps = {
  userAliasId: number
  userId: number
  siteId?: number
  institutionId: number
}

const useStudentCRMData = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const siteData = useRecoilValue(siteState)
  const schoolData = useRecoilValue(schoolState)
  /**
   * This is abbreviated from the original code
   */

  const timeZone = siteData.currentSite?.timeZone?.id || ''
  const currentSiteId = schoolData.currentSchool?.siteId || 0
  const currentSchoolId = schoolData.currentSchool?.id || 0

  const useStudentDetail = (
    props: UseStudentCRMDataProps,
    onSuccessCallback?: (studentDetail: StudentUser) => void
  ) => {
    return useQuery(
      [QUERY_KEY.student.getStudentDetailKey, props.userAliasId],
      () => {
        const params = {
          userAliasId: props.userAliasId,
          userId: props.userId,
          institutionId: props.institutionId,
          siteId: props.siteId,
        }

        return getStudentDetail(params)
      },
      {
        onSuccess: data => {
          onSuccessCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!props.userAliasId,
        staleTime: STALE_TIME,
      }
    )
  }
  const useFetchTeachingServiceOptions = (
    onSuccessCallback?: (data: TypeGetTeachingServiceOptItem[]) => void
  ) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.teachingService.getTeachingServiceOptsKey,
        currentSiteId,
        currentSchoolId,
      ],
      queryFn: () => {
        const params: TypeGetTeachingServiceOpt = {
          siteId: Number(currentSiteId),
          institutionId: currentSchoolId,
        }
        return getTeachingServiceOpts(params)
      },
      onSuccess: (rs: TypeGetTeachingServiceOptItem[]) => {
        onSuccessCallback?.(rs)
      },
      onError: (error: ApiError) => handleApiError({ error, t }),
      enabled: !!currentSchoolId,
      staleTime: STALE_TIME,
    })
  }
  const useAddTeachingService = () => {
    return useMutation<
      EnrollCourseInstance | { jobId: string },
      ApiError,
      {
        params: StudentCreateTeachingServiceRequestDto
        currentEnrolId?: number
      }
    >({
      mutationFn: ({
        params,
        currentEnrolId,
      }: {
        params: StudentCreateTeachingServiceRequestDto
        currentEnrolId?: number
      }) => {
        if (currentEnrolId && currentEnrolId > 0) {
          return updateTeachingService(params, currentEnrolId)
        }

        if (params?.bulkAssignCourse?.length) {
          return bulkAddTeachingService(params)
        }
        return addTeachingService(params)
      },
      onSuccess: async (data, variables) => {
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        // For bulk operations, don't show success toast here - it will be shown after progress completes
        // For single operations, show success toast
        if (!variables.params?.bulkAssignCourse?.length) {
          toast.success(
            t('student:teachingService.createTeachingServiceSuccess')
          )
        }
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // This is the function for adding an extra lesson
  const useAddExtraLesson = (onSuccess?: (token: string) => void) => {
    return useMutation({
      mutationFn: (params: StudentAddLessonRequestDto) => {
        return studentAddLesson(params)
      },
      onSuccess: async (token: string) => {
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        onSuccess?.(token)
        return token
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // This is the function for changing the single lesson
  const useChangeLesson = (onSuccess?: (data: StudentLesson) => void) => {
    return useMutation({
      mutationFn: (params: StudentChangeLessonRequestDto) =>
        studentChangeLesson(params),
      onSuccess: async (data: StudentLesson) => {
        onSuccess?.(data)
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        toast.success(t('student:teachingService.changeLessonSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const flattenDataLesson = useCallback(
    (arr: TypeGetTeachingServiceOptItem[]) => {
      const courseOpts = (arr || []).reduce<Record<string, CourseOpts>>(
        (courses, course) => {
          // eslint-disable-next-line no-param-reassign
          courses[course.id.toString()] = {
            classes: course.classes
              ?.filter(classesItem => !classesItem.isArchived)
              .map(classesItem => {
                // eslint-disable-next-line no-param-reassign

                const periods = Object.entries(classesItem?.periods || []).map(
                  lessonItem => {
                    const [recurringScheduleId, lessonDateArray] = lessonItem

                    let sortedDates: string[]
                    let dateToDisplay: string

                    if (classesItem.type === ClassTypeEnum.recurring) {
                      // For recurring: include all dates (past and future), but default to closest future date
                      // Sort all dates chronologically
                      sortedDates = [...lessonDateArray].sort((a, b) => {
                        const dateA = dayjs(a.split(' ')?.[0])
                        const dateB = dayjs(b.split(' ')?.[0])
                        return dateA.diff(dateB)
                      })

                      // Find the closest future date for display label (default selection)
                      const now = dayjs()
                      const futureDates = sortedDates.filter(date => {
                        const dateTime = dayjs(date.split(' ')?.[0])
                        return (
                          dateTime.isAfter(now, 'day') ||
                          dateTime.isSame(now, 'day')
                        )
                      })

                      // Use closest future date for display, or first date if no future dates
                      dateToDisplay =
                        futureDates.length > 0
                          ? futureDates[0]?.split(' ')?.[0]
                          : sortedDates[0]?.split(' ')?.[0]
                    } else {
                      // For non-recurring: select the earliest date
                      sortedDates = [...lessonDateArray].sort((a, b) => {
                        const dateA = dayjs(a.split(' ')?.[0])
                        const dateB = dayjs(b.split(' ')?.[0])
                        return dateA.diff(dateB)
                      })
                      dateToDisplay = sortedDates[0]?.split(' ')?.[0]
                    }

                    let newDate = ''
                    if (classesItem.type === ClassTypeEnum.recurring) {
                      newDate = dayjs(dateToDisplay)
                        .tz(timeZone)
                        .format('hh:mm a (dddd)')
                    } else {
                      newDate = dayjs(dateToDisplay)
                        .tz(timeZone)
                        .format('YYYY/MM/DD hh:mm a (dddd)')
                    }
                    return {
                      value: recurringScheduleId,
                      label: `${t(
                        'student:teachingService.startsAt'
                      )} ${newDate}`,
                      data: sortedDates,
                    }
                  }
                ) as TypeOpts[]

                return {
                  periods,
                  value: classesItem?.id.toString(),
                  label: classesItem?.name,
                  type: classesItem?.type,
                }
              }),
            value: course.id.toString(),
            label: course.name,
          }

          return courses
        },
        {}
      )

      return courseOpts
    },
    [t, timeZone]
  )

  const useCreateStudent = (
    onSuccessCallback?: (data: StudentUser) => void
  ) => {
    return useMutation<StudentUser, ApiError, Partial<TypeCreateStudent>>({
      mutationFn: (params: Partial<TypeCreateStudent>) => createStudent(params),
      onSuccess: async (data: StudentUser) => {
        // Revalidate the plan and quotas
        await queryClient.invalidateQueries([
          QUERY_KEY.plans.getPlanAndQuotasKey,
        ])
        toast.success(t('student:create.createStudentSuccess'))
        onSuccessCallback?.(data)
      },
      onError: (error: ApiError) => {
        if (error.message === ErrorMessageCode.STUDENT_ALREADY_EXIST) {
          toast.error(`${t('student:create.studentAlreadyExists')}`)
        } else {
          handleApiError({ error, t })
        }
      },
    })
  }

  const useSendApplicationLink = () => {
    return useMutation({
      mutationFn: (params: SendApplicationLinkEmailParams) =>
        sendApplicationLink(params),
      onSuccess: () => {
        toast.success(t('student:teachingService.assignLessonSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useSendChangeLessonNotif = () => {
    return useMutation({
      mutationFn: (params: SendChangeLessonEmailParams) =>
        sendChangeLessonNotiReq(params),
      onSuccess: () => {
        toast.success(t('student:teachingService.sentToStudent'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useSendAddLessonNotif = () => {
    return useMutation({
      mutationFn: (params: SendAddLessonEmailParams) =>
        sendAddLessonNotiReq(params),
      onSuccess: () => {
        toast.success(t('student:teachingService.sentToStudent'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetCurrentStudentQrCodeAttendanceData = (
    currentSchoolId: number,
    onSuccessCallback?: (data: QRCodeStudentAttendanceData[]) => void
  ): UseMutationResult<QRCodeStudentAttendanceData[], ApiError, number> => {
    return useMutation({
      mutationFn: (userId: number) => {
        return getCurrentStudentQrCodeAttendanceData(userId, currentSchoolId)
      },
      onSuccess: (data: QRCodeStudentAttendanceData[]) => {
        onSuccessCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useStudentDetail,
    useCreateStudent,
    useChangeLesson,
    useAddTeachingService,
    useAddExtraLesson,
    useFetchTeachingServiceOptions,
    useSendApplicationLink,
    useSendChangeLessonNotif,
    useSendAddLessonNotif,
    flattenDataLesson,
    useGetCurrentStudentQrCodeAttendanceData,
  }
}

export default useStudentCRMData
