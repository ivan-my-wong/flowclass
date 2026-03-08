import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import {
  archiveCourse,
  createCourse,
  CreateCourseDto,
  createUpdateEmailSettings,
  deleteCourse,
  deletePrerequisiteCourse,
  duplicateCourse,
  duplicateCourseToAnotherInstitution,
  getCourses,
  getCurrentCourse,
  getPrerequisiteCourse,
  hasInvoice,
  PrerequisiteCourseDto,
  publishCourseDeprecated,
  unarchiveCourse,
  unpublishCourseDeprecated,
  updateCourseActivitiesOrder,
  UpdateCourseActivitiesOrderDto,
  updateCourseBasic,
  updateCourseDescription,
  updateCourseEnrollment,
  updateCourseFaq,
  updateCourseMessage,
  updateCourseRecruitment,
  updateCourseSettings,
  updateCourseTags,
  updatePrerequisiteCourse,
} from '@/api/courses'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import { updateCourseSEOSettings } from '@/api/seoSettings'
import { QUERY_KEY } from '@/constants/queryKey'
import { initializeCourseSectionValues } from '@/pages/TeachingService/EditCourse/PageContent'
import { courseState } from '@/stores/courseData'
import { siteState } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
  UserRole,
} from '@/stores/userPermissionData'
import { Classes } from '@/types/classes'
import {
  ClassTypeEnum,
  Course,
  CourseActivitiesOrder,
  UpdateCourseEmailSettingsProps,
  UpdateCourseTagsProps,
} from '@/types/course'
import { CourseSelectorItem } from '@/types/courseSelector.type'
import { UpdateCourseSEOSettingsTypes } from '@/types/seoSettings.type'
import { siteDomainIfCustom } from '@/utils/string'

import useAuth from './useAuth'
import useClassData from './useClassData'
import useSchoolData from './useSchoolData'

const useCourseData = () => {
  const { schoolData, schoolBaseUrl } = useSchoolData()
  const [courseData, setCourseData] = useRecoilState(courseState)
  const siteData = useRecoilValue(siteState)
  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)
  const { t } = useTranslation()
  const { isLogin } = useAuth()
  const queryClient = useQueryClient()
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentCourseId = courseData.currentCourse?.id || 0
  const currentInstitutionId = courseData.currentCourse?.institutionId || 0

  const courseBaseUrl = `${schoolBaseUrl}/${encodeURI(
    courseData.currentCourse?.path ?? ''
  )}`

  const { useDuplicateMultipleClass } = useClassData()
  const duplicateMultipleClass = useDuplicateMultipleClass()

  const domain = siteDomainIfCustom(
    siteData.currentSite?.customDomain,
    siteData.currentSite?.url
  )

  const courseEnrolUrl = `https://${domain}/enrol?school=${
    schoolData.currentSchool?.url ?? ''
  }&course=${encodeURIComponent(courseData.currentCourse?.path ?? '')}`

  const setCurrentCourse = (id: number) => {
    const currentCourse = courseData.courses.find(
      // eslint-disable-next-line eqeqeq
      (course: Course) => course.id == id
    )
    if (currentCourse) {
      setCourseData(prev => ({
        ...prev,
        currentCourse,
      }))
    }
  }

  const updateCurrentCourse = (data: Course) => {
    setCourseData(prev => ({
      ...prev,
      courses: prev.courses.map(course =>
        course.id === data.id ? data : course
      ),
      currentCourse: {
        ...prev.currentCourse,
        ...data,
      },
    }))
  }

  const useFetchAllCourseData = (): UseQueryResult<Course[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.getCourseSchoolKey, currentSchoolId],
      () => {
        // Not the best practice to hard code guest but easier solution so the API gets 403 instead of using the one which requires user ID
        if (
          isLogin &&
          (AboveInstructorRoles.includes(userPermission) ||
            userPermission === UserRole.Guest)
        ) {
          return getCourses(currentSchoolId)
        }
        return getCourses(currentSchoolId, currentUser.id)
      },
      {
        onSuccess: data => {
          const currentCourse =
            data.find(coruse => coruse.id === courseData.currentCourse?.id) ||
            (data.length > 0 ? data[0] : null)

          setCourseData({
            currentCourse,
            currentClass: null,
            courses: data,
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

  const useFetchCurrentCourse = (
    successfulCallback?: (data: Course) => void
  ): UseQueryResult<Course, unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.getCourseKey, currentCourseId],
      () => getCurrentCourse(currentCourseId),
      {
        onSuccess: data => {
          setCourseData(prev => ({ ...prev, currentCourse: data }))
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

  const useDuplicateCourseData = (
    successfulCallback?: (success: Course) => void
  ): UseMutationResult<Course, unknown, Course, unknown> => {
    const mutation = useMutation({
      mutationFn: async (course: Course) => {
        const newCourse = await duplicateCourse({
          ...course,
          name: `${course.name ?? 'new-course'}`,
          path: `${course.path ?? 'new-course'}-copy`,
        })

        // Clean up classes before duplication to fix validation issues
        const cleanedClasses = (course.classes || []).map(classItem => {
          const cleanedClass = { ...classItem }

          // For regular classes (regular, regularV2, workshop), remove recurringFormat
          // and ensure regularPeriods[].repeatFormat.times is valid
          if (
            cleanedClass.type === ClassTypeEnum.regular ||
            cleanedClass.type === ClassTypeEnum.regularV2 ||
            cleanedClass.type === ClassTypeEnum.workshop
          ) {
            // Remove recurringFormat for regular classes
            delete cleanedClass.recurringFormat

            // Ensure regularPeriods[].repeatFormat.times is a valid integer
            if (cleanedClass.regularPeriods) {
              cleanedClass.regularPeriods = cleanedClass.regularPeriods.map(
                period => {
                  if (period.repeatFormat) {
                    return {
                      ...period,
                      repeatFormat: {
                        ...period.repeatFormat,
                        times: period.repeatFormat.times ?? 1,
                      },
                    }
                  }
                  return period
                }
              )
            }
          }

          // For recurring classes, ensure recurringFormat.times is valid
          if (cleanedClass.type === ClassTypeEnum.recurring) {
            if (cleanedClass.recurringFormat) {
              cleanedClass.recurringFormat = {
                ...cleanedClass.recurringFormat,
                times: cleanedClass.recurringFormat.times ?? 1,
              }
            }
          }

          return cleanedClass
        })

        const duplicateClassParam = {
          courseId: newCourse.id,
          classes: cleanedClasses,
        }
        const duplicatedClassList: Classes[] =
          await duplicateMultipleClass.mutateAsync(duplicateClassParam)

        return { ...newCourse, classes: duplicatedClassList }
      },
      onSuccess: async data => {
        setCourseData(prev => ({
          ...prev,
          courses: [...prev.courses, data],
          currentCourse: data,
        }))
        // Invalidate the query for the list of courses
        await queryClient.invalidateQueries([
          QUERY_KEY.course.getCourseSchoolKey,
          currentSchoolId,
        ])
        toast.success(t('teachingService:createCourseModal.successCreate'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDuplicateCourseToAnotherInstitution = (
    successfulCallback?: (success: Course) => void
  ): UseMutationResult<
    Course,
    unknown,
    { course: Course; institutionId: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: async ({
        course,
        institutionId,
      }: {
        course: Course
        institutionId: number
      }) => {
        const newCourse = await duplicateCourseToAnotherInstitution(
          course,
          institutionId
        )

        const duplicateClassParam = {
          courseId: newCourse.id,
          classes: course.classes.map(cls => ({
            ...cls,
            courseId: newCourse.id,
            institutionId,
            siteId: newCourse.siteId,
          })),
        }
        const duplicatedClassList: Classes[] =
          await duplicateMultipleClass.mutateAsync(duplicateClassParam)

        return { ...newCourse, classes: duplicatedClassList }
      },
      onSuccess: data => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })

    return mutation
  }

  const useCreateCourse = (
    successfulCallback?: (success: Course) => void
  ): UseMutationResult<Course, unknown, CreateCourseDto, unknown> => {
    const mutation = useMutation({
      mutationFn: (course: CreateCourseDto) =>
        createCourse(currentSchoolId, course),
      onSuccess: data => {
        setCourseData(prev => ({
          ...prev,
          courses: [...prev.courses, data],
          currentCourse: data,
        }))
        toast.success(t('teachingService:createCourseModal.successCreate'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseBasic = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    Partial<Course> & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: Partial<Course>) => updateCourseBasic(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:updateBasicSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseSettings = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    {
      courseId: number
      isPrivate?: boolean
      requireEmailVerification?: boolean
    },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: ({
        courseId,
        isPrivate,
        requireEmailVerification,
        blockDuplicateEmailEnrollment,
      }: {
        courseId: number
        isPrivate?: boolean
        requireEmailVerification?: boolean
        blockDuplicateEmailEnrollment?: boolean
      }) =>
        updateCourseSettings(courseId, {
          isPrivate,
          requireEmailVerification,
          blockDuplicateEmailEnrollment,
        }),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:privacySettings.updateSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseFaq = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    Partial<Course> & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: Partial<Course>) => updateCourseFaq(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:updateFaqSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseDescription = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    Partial<Course> & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: Partial<Course>) => {
        const newCourse = course
        if (!newCourse?.longDescriptions) {
          newCourse.longDescriptions = initializeCourseSectionValues()
        }

        return updateCourseDescription(newCourse)
      },
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:updateDescriptionSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        if (
          error.statusCode === 400 &&
          error.message.some((field: Record<string, string>) =>
            Object.values(field).includes('longDescriptions')
          )
        ) {
          toast.error(t('teachingService:publishCourse.remindLongDescriptions'))
        } else {
          handleApiError({ error, t })
        }
      },
    })
    return mutation
  }

  const useUpdateCourseEnrollment = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    Partial<Course> & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: Partial<Course>) => updateCourseEnrollment(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:updateEnrollmentSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseMessage = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    Partial<Course> & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: Partial<Course>) => updateCourseMessage(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:updateMessageSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseRecruitment = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    Partial<Course> & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: Partial<Course>) => updateCourseRecruitment(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        toast.success(t('teachingService:updateRecruitmentSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteCourse = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<Course, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (id: number) => deleteCourse(id),
      onSuccess: (data: Course) => {
        setCourseData(prev => ({
          ...prev,
          courses: prev.courses.filter(course => course.id !== data.id),
          currentCourse:
            prev.currentCourse?.id === data.id ? null : prev.currentCourse,
        }))
        successfulCallback?.(data)
        toast.success(t('teachingService:deleteCourseModal.successDelete'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const usePublishCourseDeprecated = (
    successfulCallback?: (data: string) => void
  ): UseMutationResult<string, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (courseId: number) => publishCourseDeprecated(courseId),
      onSuccess: (data: string) => {
        successfulCallback?.(data)
        toast.success(
          t('teachingService:publishCourse.publishCourseSuccessfully')
        )
      },
      onError: (error: ApiError) => {
        if (error.statusCode === 400) {
          if (
            error.message.some((field: Record<string, string>) =>
              Object.values(field).includes('longDescriptions')
            )
          ) {
            toast.error(
              t('teachingService:publishCourse.remindLongDescriptions')
            )
          } else if (
            error.message.some((field: Record<string, string>) =>
              Object.values(field).includes('recruitEnd')
            )
          ) {
            toast.error(t('teachingService:publishCourse.recruitmentTimeEnded'))
          }
        } else {
          handleApiError({ error, t })
        }
      },
    })
    return mutation
  }

  const useUnPublishCourseDeprecated = (
    successfulCallback?: (data: string) => void
  ): UseMutationResult<string, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (courseId: number) => unpublishCourseDeprecated(courseId),
      onSuccess: (data: string) => {
        successfulCallback?.(data)
        toast.success(
          t('teachingService:publishCourse.unpublishCourseSuccessfully')
        )
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useArchiveCourse = (
    successfulCallback?: (data: string) => void
  ): UseMutationResult<string, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (courseId: number) => archiveCourse(courseId),
      onSuccess: (data: string) => {
        successfulCallback?.(data)
        toast.success(t('teachingService:publishCourse.archiveSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUnArchiveCourse = (
    successfulCallback?: (data: string) => void
  ): UseMutationResult<string, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (courseId: number) => unarchiveCourse(courseId),
      onSuccess: (data: string) => {
        successfulCallback?.(data)
        toast.success(
          t('teachingService:publishCourse.unarchiveCourseSuccessfully')
        )
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCourseTags = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    UpdateCourseTagsProps & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: UpdateCourseTagsProps) => updateCourseTags(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        successfulCallback?.(data)
        toast.success(t('teachingService:tag.updateTagsSuccess'))
      },
      onError: (error: ApiError) => console.log(error),
    })
    return mutation
  }

  const useUpdateCourseActivitiesOrder = (
    successfulCallback?: (data: CourseActivitiesOrder) => void
  ): UseMutationResult<
    CourseActivitiesOrder,
    ApiError,
    UpdateCourseActivitiesOrderDto,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (data: UpdateCourseActivitiesOrderDto) =>
        updateCourseActivitiesOrder(data),
      onSuccess: (data: CourseActivitiesOrder) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdatePrerequisiteCourse = (
    successfulCallback?: (success: Course) => void
  ) => {
    const mutation = useMutation({
      mutationFn: ({
        courseId,
        ...data
      }: PrerequisiteCourseDto & { courseId: number }) =>
        updatePrerequisiteCourse(courseId, data, currentInstitutionId),
      onSuccess: (data: Course) => {
        successfulCallback?.(data)
        toast.success(t('teachingService:prerequisites.successUpdate'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeletePrerequisiteCourse = (
    successfulCallback?: (success: Course) => void
  ) => {
    const mutation = useMutation({
      mutationFn: (id: number) =>
        deletePrerequisiteCourse(id, currentInstitutionId),
      onSuccess: data => {
        successfulCallback?.(data)
        toast.success(t('teachingService:prerequisites.successDelete'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useGetPrerequisiteCourse = (
    successfulCallback?: (data: PrerequisiteCourseDto) => void
  ) => {
    const result = useQuery(
      [QUERY_KEY.course.prerequisiteCourseKey, currentCourseId],
      () => getPrerequisiteCourse(currentCourseId, currentInstitutionId),
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

  const useUpdateCourseSEOSettings = (
    successfulCallback?: (data: Course) => void
  ) => {
    return useMutation({
      mutationFn: (data: UpdateCourseSEOSettingsTypes) =>
        updateCourseSEOSettings(data),
      onSuccess: (data: Course) => {
        toast.success(t('teachingService:SEO.createSuccess'))
        updateCurrentCourse(data)
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useCourseHasInvoice = (
    courseId: number,
    successfulCallback?: (data: {
      hasInvoices: boolean
      courseId: number
    }) => void
  ): UseQueryResult<{ hasInvoices: boolean; courseId: number }, unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.hasInvoiceKey, courseId], // Use specific key for invoice check
      () => hasInvoice(courseId), // Pass the specific courseId
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!courseId,
      }
    )
    return result
  }

  const useCreateUpdateEmailSettings = (
    successfulCallback?: (data: Course) => void
  ): UseMutationResult<
    Course,
    ApiError,
    UpdateCourseEmailSettingsProps & { courseId?: number },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (course: UpdateCourseEmailSettingsProps) =>
        createUpdateEmailSettings(course),
      onSuccess: (data: Course) => {
        updateCurrentCourse(data)
        successfulCallback?.(data)
        toast.success(t('teachingService:emailSettings.createUpdateSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const getFilteredCourseOptions = (): CourseSelectorItem[] => {
    const courses = courseData?.courses ?? []
    return courses
      .filter(course => !course.isArchived && Array.isArray(course.classes))
      .flatMap(course => {
        const filteredClasses = (course.classes ?? []).filter(
          cls => !cls.isArchived
        )
        if (filteredClasses.length === 0) return []
        return [
          {
            label: course.name || 'Unknown Course',
            options: filteredClasses.map(cls => ({
              value: cls.id,
              label: cls.name || 'Unknown Class',
              course: course.name || 'Unknown Course',
              courseId: course.id,
              previewImageUrl: course.previewImageUrl ?? null,
            })),
          },
        ]
      })
  }

  return {
    courseData,
    setCourseData,
    currentCourse: courseData.currentCourse,
    setCurrentCourse,

    courseBaseUrl,
    courseEnrolUrl,

    useFetchAllCourseData,
    useFetchCurrentCourse,
    useCreateCourse,
    useUpdateCourseBasic,
    useUpdateCourseFaq,
    useUpdateCourseDescription,
    useUpdateCourseEnrollment,
    useUpdateCourseRecruitment,
    useUpdateCourseMessage,
    useDeleteCourse,
    usePublishCourseDeprecated,
    useUnPublishCourseDeprecated,
    useUpdateCourseTags,
    useDuplicateCourseData,
    useDuplicateCourseToAnotherInstitution,
    useUpdateCourseActivitiesOrder,
    useUpdateCourseSettings,

    useUpdatePrerequisiteCourse,
    useDeletePrerequisiteCourse,
    useGetPrerequisiteCourse,
    useUpdateCourseSEOSettings,

    useArchiveCourse,
    useUnArchiveCourse,
    useCourseHasInvoice,

    useCreateUpdateEmailSettings,

    getFilteredCourseOptions,
  }
}

export default useCourseData
