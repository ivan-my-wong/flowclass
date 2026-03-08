import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getInformationFields } from '@/api/informationField'
import {
  addEnrollmentForm,
  deleteEnrollmentForm,
  GetStudentEnrollment,
} from '@/api/student'
import { STALE_TIME } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { TypeStudentEnrollment } from '@/types/student'
import {
  StudentAddEnrollmentFormRequestDto,
  StudentDeleteEnrollmentFormRequestDto,
  StudentEnrollmentRequestDto,
} from '@/types/studentAddTeachingService'

const useEnrollmentFormData = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const siteData = useRecoilValue(siteState)
  const [schoolData] = useRecoilState(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0
  const useFetchListEnrollmentFormFields = () => {
    return useQuery(
      [
        QUERY_KEY.enrollmentForm.getListEnrollmentFormFieldsKey,
        currentSchoolId,
        currentSiteId,
      ],
      () => {
        if (!schoolData.currentSchool?.id) {
          return Promise.reject(new Error('School ID tidak ditemukan'))
        }
        return getInformationFields(schoolData.currentSchool.id, currentSiteId)
      },
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentSchoolId,
        staleTime: STALE_TIME,
      }
    )
  }
  const useFetchStudentEnrollmentForm = (
    params: StudentEnrollmentRequestDto,
    onSuccessCallback?: (data: Record<string, TypeStudentEnrollment>) => void
  ) => {
    return useQuery(
      [
        QUERY_KEY.enrollmentForm.studentEnrollmentKey,
        currentSchoolId,
        currentSiteId,
      ],
      () =>
        GetStudentEnrollment({
          userId: params.userId,
          institutionId: params.institutionId,
          siteId: currentSiteId,
          userAliasId: params.userAliasId,
        }),
      {
        onSuccess: rs => {
          onSuccessCallback?.(rs)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!params.userAliasId,
      }
    )
  }
  const useAddEnrollmentForm = () => {
    return useMutation({
      mutationFn: (params: StudentAddEnrollmentFormRequestDto) =>
        addEnrollmentForm(params),
      onSuccess: async () => {
        toast.success(t('student:edit.addEnrollmentCustomFieldSuccess'))
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.enrollmentForm.studentEnrollmentKey],
        }) // call API get detail
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useDeleteEnrollmentForm = () => {
    return useMutation({
      mutationFn: (params: StudentDeleteEnrollmentFormRequestDto) =>
        deleteEnrollmentForm(params),
      onSuccess: async () => {
        toast.success(t('student:edit.deleteEnrollmentCustomFieldSuccess'))
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.enrollmentForm.studentEnrollmentKey],
        }) // call API get detail
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  return {
    useFetchListEnrollmentFormFields,
    useAddEnrollmentForm,
    useDeleteEnrollmentForm,
    useFetchStudentEnrollmentForm,
  }
}
export default useEnrollmentFormData
