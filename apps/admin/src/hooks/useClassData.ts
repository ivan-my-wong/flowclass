/* eslint-disable no-underscore-dangle */
import { useCallback } from 'react'

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
  archiveClass,
  bulkUpdateClasses,
  createClass,
  CreateClassDto,
  deleteClass,
  deleteLessonPhase,
  duplicateClass,
  duplicateMultipleClass,
  getAllClasses,
  getAllTimeSlotClassQuota,
  getCurrentCourseAllClasses,
  getDetailClass,
  getListClassPreviewRecurringLessons,
  setMultipleClasses,
  unarchiveClass,
  updateClass,
  validateTimeslot,
} from '@/api/class'
import { getEnrolledClassesCount } from '@/api/courses'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import { STALE_TIME } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import { courseState } from '@/stores/courseData'
import { schoolState } from '@/stores/schoolData'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
} from '@/stores/userPermissionData'
import {
  Classes,
  DuplicateMultipleClassParams,
  PeriodLessons,
  RecurringSchedules,
  RegularPeriods,
  ReqValidateTimeslot,
  ResValidateTimeslot,
} from '@/types/classes'
import { ClassTypeEnum, Course } from '@/types/course'

export type PreviewRecurringLessonsDto = {
  classId: number
  date: string
  lessonDateId: number
}
const useClassData = () => {
  const [courseData, setCourseData] = useRecoilState(courseState)
  const currentUser = useRecoilValue(userState)
  const userPermission = useRecoilValue(userPermissionState)

  const { t } = useTranslation()
  const currentCourseId = courseData.currentCourse?.id || 0
  const queryClient = useQueryClient()
  const schoolData = useRecoilValue(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const institutionId = courseData.currentCourse?.institutionId

  const updateSingleClass = (classes: Classes) => {
    const allCourses = courseData.courses

    // Find the index of the current course
    const courseIndex = allCourses.findIndex(
      course => course.id === currentCourseId
    )

    // If the course is found, proceed with the updates
    if (courseIndex !== -1 && courseData.currentCourse) {
      const currentCourseClasses = courseData.currentCourse.classes ?? []

      const classIndex = courseData.currentCourse.classes?.findIndex(
        cls => cls.id === classes.id
      )

      if (classIndex > -1) {
        // Create a new array of courses with the updated classes for the current course
        const updatedCourses = allCourses.map((course, idx) => {
          if (idx === courseIndex) {
            return {
              ...course,
              classes: course.classes.map((cls, clsIdx) =>
                clsIdx === classIndex ? classes : cls
              ),
            }
          }
          return course
        })

        // Clone the currentCourse.classes array and update the specific class
        const updatedClasses = currentCourseClasses.map((cls, idx) =>
          idx === classIndex ? classes : cls
        )

        // Update courseData with the new courses array and currentCourse
        setCourseData(prev => ({
          ...prev,
          courses: updatedCourses,
          currentCourse: {
            ...prev.currentCourse!,
            classes: updatedClasses,
          },
        }))
      }
    }
  }

  const replaceAllClasses = (classes: Classes[]) => {
    const allCourses = courseData.courses

    // Find the index of the current course
    const courseIndex = allCourses.findIndex(
      course => course.id === currentCourseId
    )

    // If the course is found, proceed with the updates
    if (courseIndex !== -1 && courseData.currentCourse) {
      // Create a new array of courses with the updated classes for the current course
      const updatedCourses = [...allCourses]
      updatedCourses[courseIndex] = {
        ...updatedCourses[courseIndex],
        classes,
      }

      // Update courseData with the new courses array and currentCourse
      setCourseData(prev => ({
        ...prev,
        courses: updatedCourses,
        currentCourse: prev.currentCourse
          ? {
              ...prev.currentCourse,
              classes,
            }
          : null,
      }))
    }
  }

  const setCurrentClass = useCallback(
    (newClassId: number) => {
      if (!newClassId) return

      const newClass = (courseData.currentCourse?.classes || []).find(
        cls => cls.id === newClassId
      )

      if (newClass) {
        setCourseData(prev => ({
          ...prev,
          currentClass: newClass,
        }))
      }
    },
    [courseData.currentCourse?.classes, setCourseData]
  )

  const useFetchAllClasses = () => {
    return useQuery(
      [QUERY_KEY.course.getAllClassesKey, currentSchoolId],
      () => getAllClasses(currentSchoolId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
      }
    )
  }

  const useFetchDetailClass = (classId: number) => {
    return useQuery(
      [QUERY_KEY.course.getDetailClassKey, currentSchoolId, classId],
      () => getDetailClass(currentSchoolId, classId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentSchoolId && !!classId,
      }
    )
  }

  const useFetchClassPreviewRecurringLessons = (
    onSuccess?: (data: any) => void
  ) => {
    return useMutation(
      ({ classId, date, lessonDateId }: PreviewRecurringLessonsDto) =>
        getListClassPreviewRecurringLessons(
          currentSchoolId,
          classId,
          date,
          lessonDateId
        ),
      {
        onSuccess: data => {
          onSuccess?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useFetchCurrentCourseAllClasses = (
    successfulCallback?: (data: Classes[]) => void
  ): UseQueryResult<Classes[], unknown> => {
    return useQuery(
      [QUERY_KEY.course.getCourseAllClassesKey, currentCourseId],
      () => getCurrentCourseAllClasses(currentCourseId),
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
  }

  const mapClassToTuplicate = (classes: Partial<Classes>): Partial<Classes> => {
    const cleanedClass = { ...classes }

    // For regular classes (regular, regularV2, workshop), remove recurringFormat
    // since they shouldn't have it
    if (
      cleanedClass.type === ClassTypeEnum.regular ||
      cleanedClass.type === ClassTypeEnum.regularV2 ||
      cleanedClass.type === ClassTypeEnum.workshop
    ) {
      // Remove recurringFormat for regular classes
      delete cleanedClass.recurringFormat
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

    const updatedSchedules = cleanedClass.regularPeriods?.map(
      (schedule: RegularPeriods) => {
        const updatedLessonDates = schedule.lessons?.map(
          (lessonChoice: PeriodLessons) => {
            return {
              startTime: lessonChoice.startTime,
              endTime: lessonChoice.endTime,
            }
          }
        )

        const updatedSchedule = {
          ...schedule,
          lessons: updatedLessonDates,
          duration: schedule.duration,
          repeatFormat: schedule.repeatFormat,
        }

        // Ensure repeatFormat.times is a valid integer
        if (updatedSchedule.repeatFormat) {
          updatedSchedule.repeatFormat = {
            ...updatedSchedule.repeatFormat,
            times: updatedSchedule.repeatFormat.times ?? 1,
          }
        }

        return updatedSchedule
      }
    )

    const updatedLessonDates = cleanedClass.recurringSchedules?.map(
      (lessonDate: RecurringSchedules) => ({
        ...lessonDate,
        classId: lessonDate.classId,
        weekDay: lessonDate.weekDay,
        startTime: lessonDate.startTime,
        endTime: lessonDate.endTime,
      })
    )

    return {
      ...cleanedClass,
      courseId: currentCourseId,
      recurringSchedules: updatedLessonDates ?? [],
      regularPeriods: updatedSchedules,
    }
  }

  const useDuplicateClass = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, Partial<Classes>, unknown> => {
    return useMutation({
      mutationFn: (classes: Partial<Classes>) => {
        const newClass = mapClassToTuplicate(classes)
        return duplicateClass(newClass)
      },
      onSuccess: async data => {
        // await queryClient.invalidateQueries([
        //   QUERY_KEY.course.getCourseAllClassesKey,
        //   currentCourseId,
        // ])
        toast.success(t('teachingService:class.duplicateClassSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDuplicateMultipleClass = (
    successfulCallback?: (data: Classes[]) => void
  ): UseMutationResult<
    Classes[],
    ApiError,
    DuplicateMultipleClassParams,
    unknown
  > => {
    return useMutation({
      mutationFn: (args: DuplicateMultipleClassParams) => {
        const newClassArray = args.classes.map(cls => mapClassToTuplicate(cls))

        return duplicateMultipleClass({
          courseId: args.courseId,
          classes: newClassArray,
        })
      },
      onSuccess: data => {
        toast.success(t('teachingService:class.duplicateClassSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useCreateClass = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, CreateClassDto, unknown> => {
    return useMutation({
      mutationFn: (classData: CreateClassDto) => {
        return createClass({
          ...classData,
          courseId: classData.courseId || currentCourseId,
        })
      },
      onSuccess: async data => {
        await queryClient.invalidateQueries([
          QUERY_KEY.course.getCourseAllClassesKey,
          currentCourseId,
        ])
        toast.success(t('teachingService:class.createClassSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateClass = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, Partial<Classes>, unknown> => {
    return useMutation({
      mutationFn: (classData: Partial<Classes>) => {
        return updateClass(classData)
      },
      onSuccess: (data: Classes) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useBulkUpdateClasses = (
    successfulCallback?: (data: Classes[]) => void
  ): UseMutationResult<Classes[], ApiError, Partial<Classes>[], unknown> => {
    return useMutation({
      mutationFn: (classData: Partial<Classes>[]) => {
        return bulkUpdateClasses(currentSchoolId, classData)
      },
      onSuccess: (data: Classes[]) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteClass = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, number, unknown> => {
    return useMutation({
      mutationFn: (classId: number) => deleteClass(classId),
      onSuccess: async data => {
        await queryClient.invalidateQueries([
          QUERY_KEY.course.getCourseAllClassesKey,
          currentCourseId,
        ])
        toast.success(t('teachingService:class.deleteClassSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteLessonPhase = (
    successfulCallback?: (data: RegularPeriods) => void
  ): UseMutationResult<
    RegularPeriods,
    ApiError,
    {
      lessonId: number
      classId: number
    },
    unknown
  > => {
    return useMutation({
      mutationFn: ({
        lessonId,
        classId,
      }: {
        lessonId: number
        classId: number
      }) => deleteLessonPhase(lessonId, classId),
      onSuccess: data => {
        toast.success(t('teachingService:class.phases.deletePhaseSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useSetMultipleClasses = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, { classId: number }, unknown> => {
    return useMutation({
      mutationFn: ({ classId }: { classId: number }) =>
        setMultipleClasses(classId),
      onSuccess: data => {
        if (data.setMultipleClass) {
          toast.success(t('teachingService:class.setMultipleClassesSuccess'))
        } else {
          toast.success(t('teachingService:class.unSetMultipleClassesSuccess'))
        }
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useEnrolledClassCount = () => {
    return useQuery(
      [QUERY_KEY.course.getEnrolledClassCountKey, currentSchoolId],
      () => getEnrolledClassesCount(currentSchoolId),
      {
        enabled:
          !!currentSchoolId && AboveInstructorRoles.includes(userPermission),
        staleTime: STALE_TIME,
      }
    )
  }

  const useEnrolledClassCountOfOwnUser = () => {
    return useQuery(
      [QUERY_KEY.course.getEnrolledClassCountKey, currentSchoolId],
      () => getEnrolledClassesCount(currentSchoolId, currentUser.id),
      {
        enabled: !!currentSchoolId && !!currentUser.id,
        staleTime: STALE_TIME,
      }
    )
  }

  const updateCurrentCourse = (course: Course) => {
    setCourseData(prev => ({ ...prev, currentCourse: course }))
  }

  const useValidateTimeslots = (
    successfulCallback?: (data: ResValidateTimeslot) => void
  ): UseMutationResult<
    ResValidateTimeslot,
    ApiError,
    ReqValidateTimeslot,
    unknown
  > => {
    return useMutation({
      mutationFn: ({ classId, lessons }: ReqValidateTimeslot) =>
        validateTimeslot(institutionId ?? 0, classId, lessons),
      onSuccess: data => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetTimeSlotClassQuota = (classId?: number) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.course.getTimeSlotClassQuotaKey,
        currentSchoolId ?? institutionId,
        classId,
      ],
      queryFn: () =>
        getAllTimeSlotClassQuota(
          currentSchoolId ?? institutionId,
          classId as number
        ),
      enabled: !!(currentSchoolId ?? institutionId) && !!classId,
    })
  }

  const useArchiveClass = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, number, unknown> => {
    return useMutation({
      mutationFn: (classId: number) => archiveClass(classId),
      onSuccess: async data => {
        updateSingleClass(data)
        toast.success(t('teachingService:class.archiveClassSuccess'))
        successfulCallback?.(data)

        queryClient.invalidateQueries([
          QUERY_KEY.course.getCourseAllClassesKey,
          currentCourseId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUnarchiveClass = (
    successfulCallback?: (data: Classes) => void
  ): UseMutationResult<Classes, ApiError, number, unknown> => {
    return useMutation({
      mutationFn: (classId: number) => unarchiveClass(classId),
      onSuccess: async data => {
        updateSingleClass(data)
        toast.success(t('teachingService:class.unarchiveClassSuccess'))
        successfulCallback?.(data)

        queryClient.invalidateQueries([
          QUERY_KEY.course.getCourseAllClassesKey,
          currentCourseId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    currentCourse: courseData.currentCourse,
    currentClass: courseData.currentClass,
    setCurrentClass,
    updateSingleClass,
    replaceAllClasses,
    useFetchCurrentCourseAllClasses,
    useFetchAllClasses,
    useFetchDetailClass,
    useCreateClass,
    useUpdateClass,
    // useDeleteClass,
    useDeleteLessonPhase,
    useDuplicateClass,
    useDuplicateMultipleClass,
    useSetMultipleClasses,
    useEnrolledClassCount,
    updateCurrentCourse,
    useBulkUpdateClasses,
    useValidateTimeslots,
    useEnrolledClassCountOfOwnUser,
    useFetchClassPreviewRecurringLessons,
    useGetTimeSlotClassQuota,
    useArchiveClass,
    useUnarchiveClass,
    useDeleteClass,
  }
}

export default useClassData
