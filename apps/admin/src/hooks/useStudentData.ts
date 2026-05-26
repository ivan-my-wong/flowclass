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

import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  addToParentGroup,
  changeParentGroup,
  checkImportStudentDataValid,
  getAllStudentsOfInstitutionNew,
  getCurrentStudentQrCodeAttendanceData,
  getDetailAccountGroup,
  getParentAccount,
  getStudentEnrollLesson,
  getStudentFormFieldsValue,
  getStudentNotification,
  getStudentsByCustomFieldFilter,
  getStudentsByPhone,
  mergeStudent,
  mergeStudent,
  removeFromParentGroup,
  setParentAccount,
  submitStudentNotification,
  updateAttendance,
} from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { CustomFieldFilterOption } from '@/pages/StudentCRM/components/CustomFormFieldFilter'
import { schoolState } from '@/stores/schoolData'
import { studentState } from '@/stores/studentData'
import { StudentFormResponse } from '@/types/enrollCourse'
import { FilterMatchMode } from '@/types/options'
import {
  CheckImportStudentType,
  QRCodeStudentAttendanceData,
  StudentEnrolmentRecord,
  StudentLesson,
  StudentNotificationResponse,
  SubmitStudentNotification,
  UpdateAttendanceDto,
} from '@/types/student'
import { UserAlias } from '@/types/studentMemo'

import useAuth from './useAuth'
import useSiteData from './useSiteData'

const useStudentData = () => {
  const [studentData, setStudentData] = useRecoilState(studentState)
  const { t } = useTranslation()
  const [schoolData] = useRecoilState(schoolState)
  const { isLogin } = useAuth()
  const currentStudentId = studentData.currentStudent?.id || 0
  const { siteData } = useSiteData()
  const currentSiteId = siteData.currentSite?.id || 0
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const queryClient = useQueryClient()

  const useFetchAllStudentData = (
    type = 'ALL'
  ): UseQueryResult<StudentEnrolmentRecord[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.student.studentListKey, currentSchoolId],
      () =>
        getAllStudentsOfInstitutionNew({
          id: currentSchoolId,
          siteId: currentSiteId,
          type,
        }),
      {
        onSuccess: data => {
          setStudentData(prev => ({
            ...prev,
            currentStudent: null,
            students: data,
            initFetch: true,
          }))
          // set subscription plan
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId && !!currentSiteId,
      }
    )
    return result
  }

  const useFetchCustomFieldFilterStudentData = (
    successfulCallback?: (data: StudentLesson[]) => void
  ): UseMutationResult<
    any,
    ApiError,
    {
      id: number
      siteId: number
      type: string
      matchMode: FilterMatchMode
      customFieldFilterList: CustomFieldFilterOption[]
    },
    unknown
  > => {
    const result = useMutation({
      mutationFn: ({
        id,
        siteId,
        type,
        matchMode,
        customFieldFilterList,
      }: {
        id: number
        siteId: number
        type: string
        matchMode: FilterMatchMode
        customFieldFilterList: CustomFieldFilterOption[]
      }) =>
        getStudentsByCustomFieldFilter(
          id,
          siteId,
          type,
          matchMode,
          customFieldFilterList
        ),
      onSuccess: (data: any) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return result
  }

  const useFetchCurrentStudentQrCodeAttendanceData = (
    successfulCallback?: (data: QRCodeStudentAttendanceData[]) => void
  ): UseQueryResult<QRCodeStudentAttendanceData[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.student.currentStudentKey, currentStudentId],
      () =>
        getCurrentStudentQrCodeAttendanceData(
          currentStudentId,
          currentSchoolId
        ),
      {
        onSuccess: async currentSchool => {
          setStudentData(prev => ({ ...prev, currentSchool }))
          successfulCallback?.(currentSchool)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentStudentId,
      }
    )
    return result
  }

  const useFetchStudentEnrollLessonsForScanning = (
    successfulCallback?: (data: StudentLesson[]) => void,
    errorCallback?: (error: ApiError) => void
  ): UseMutationResult<
    any,
    ApiError,
    {
      studentLessonIds: number[]
      invoiceId: number
    },
    unknown
  > => {
    const result = useMutation({
      mutationFn: (params: { studentLessonIds: number[]; invoiceId: number }) =>
        getStudentEnrollLesson(params.studentLessonIds, params.invoiceId),
      onSuccess: (data: any) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
        errorCallback?.(error)
      },
    })
    return result
  }

  const useCheckImportCsvData = (
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, CheckImportStudentType, unknown> => {
    const result = useMutation({
      mutationFn: (params: CheckImportStudentType) =>
        checkImportStudentDataValid(params),
      onSuccess: (data: any) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return result
  }

  const useFetchStudentFormFieldsValue = (
    institutionId: number,
    studentId: number
    // successfulCallback?: (data: StudentFormResponse[]) => void
  ): UseQueryResult<StudentFormResponse[], unknown> => {
    return useQuery(
      [QUERY_KEY.student.formFieldsKey, studentId],
      () => getStudentFormFieldsValue(institutionId, studentId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        // cacheTime: 0,
        enabled: !!studentId && !!institutionId, // Ensure both IDs are valid
      }
    )
  }

  const useStudentTakeAttendance = (
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, UpdateAttendanceDto, unknown> => {
    const result = useMutation({
      mutationFn: (params: UpdateAttendanceDto) => updateAttendance(params),
      onSuccess: (data: any) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return result
  }

  const useGetStundentNotification = (
    institutionId: number,
    studentId: number
  ): UseQueryResult<StudentNotificationResponse[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.notificationLog.studentNotificationKey, studentId],
      () => getStudentNotification(institutionId, studentId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!studentId && !!institutionId, // Ensure both IDs are valid
      }
    )
    return result
  }

  const useSubmitStudentNotification = (
    successfulCallback?: (data: any) => void
  ): UseMutationResult<any, ApiError, SubmitStudentNotification, unknown> => {
    const result = useMutation({
      mutationFn: (params: SubmitStudentNotification) =>
        submitStudentNotification(params),
      onSuccess: (data: StudentNotificationResponse[]) => {
        if (data.length === 0) return
        const { studentId } = data[0]
        queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.notificationLog.studentNotificationKey,
            studentId,
          ],
        })
        toast.success(t('student:notificationSettings.successUpdated'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return result
  }

  const useGetParentAccount = (
    enabled = false
  ): UseQueryResult<UserAlias[], unknown> => {
    return useQuery(
      [QUERY_KEY.student.parentAccountKey, currentSchoolId],
      () => getParentAccount(currentSchoolId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentSchoolId && enabled, // Ensure institutionId is valid
      }
    )
  }

  // setParentAccount
  const useSetParentAccount = () => {
    return useMutation({
      mutationFn: (data: { isParent: boolean; userAliasId: number }) =>
        setParentAccount({ ...data, institutionId: currentSchoolId }),
      onSuccess: () => {
        toast.success(t('student:parentAccount.successSetParentAccount'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // addToParentGroup
  const useAddToParentGroup = () => {
    return useMutation({
      mutationFn: (data: { parentId: number; userAliasId: number }) =>
        addToParentGroup({ ...data, institutionId: currentSchoolId }),
      onSuccess: () => {
        toast.success(t('student:parentAccount.successAddToParentGroup'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useMergeStudent = () => {
    return useMutation({
      mutationFn: (data: {
        sourceUserAliasId: number
        targetUserAliasId: number
      }) =>
        mergeStudent({
          ...data,
          institutionId: currentSchoolId,
          siteId: currentSiteId,
        }),
      onSuccess: () => {
        toast.success(t('student:merge.successMerge'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // changeParentGroup
  const useChangeParentGroup = () => {
    return useMutation({
      mutationFn: (data: {
        oldParentId: number
        newParentId: number
        userAliasId: number
      }) => changeParentGroup({ ...data, institutionId: currentSchoolId }),
      onSuccess: () => {
        toast.success(t('student:parentAccount.successChangeParentGroup'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // removeFromParentGroup
  const useRemoveFromParentGroup = () => {
    return useMutation({
      mutationFn: (data: {
        oldParentId: number
        newParentId?: number
        userAliasId: number
        isDeleted: boolean
      }) => removeFromParentGroup({ ...data, institutionId: currentSchoolId }),
      onSuccess: () => {
        toast.success(t('student:parentAccount.successRemoveFromParentGroup'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // getDetailAccountGroup
  const useGetDetailAccountGroup = (userAliasId: number, enabled = false) => {
    return useQuery(
      [
        QUERY_KEY.student.getParentAccountDetailKey,
        currentSchoolId,
        userAliasId,
      ],
      () => getDetailAccountGroup(userAliasId, currentSchoolId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentSchoolId && !!userAliasId && enabled, // Ensure both IDs are valid
      }
    )
  }

  // getStudentsByPhone
  const useGetStudentsByPhone = () => {
    return useMutation({
      mutationFn: (phone: string) => getStudentsByPhone(phone, currentSchoolId),
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useFetchCustomFieldFilterStudentData,
    useFetchAllStudentData,
    useFetchCurrentStudentQrCodeAttendanceData,
    useCheckImportCsvData,
    useFetchStudentEnrollLessonsForScanning,
    useFetchStudentFormFieldsValue,
    useStudentTakeAttendance,
    useGetStundentNotification,
    useSubmitStudentNotification,
    useGetParentAccount,
    useSetParentAccount,
    useAddToParentGroup,
    useChangeParentGroup,
    useRemoveFromParentGroup,
    useGetDetailAccountGroup,
    useGetStudentsByPhone,
    useMergeStudent,
  }
}

export default useStudentData
