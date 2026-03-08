import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { updateEnrollCourse, updateInvoicePaymentState } from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { EnrollCourseInstance } from '@/types/enrollCourse'
import {
  TypeUpdateEnrollCourse,
  UpdateInvoicePaymentStateDto,
} from '@/types/student'

const useEnrollCourseData = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const useUpdateEnrollCourse = (
    onSuccessCallback?: (enrollCourse: EnrollCourseInstance) => void
  ) => {
    return useMutation({
      mutationFn: (params: Partial<TypeUpdateEnrollCourse>) =>
        updateEnrollCourse(params),
      onSuccess: async (data: EnrollCourseInstance) => {
        onSuccessCallback?.(data)
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        toast.success(
          t('teachingService:updateStatus.changeSttEnrollmentSuccess')
        )
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdatePaymentInvoiceState = () => {
    return useMutation({
      mutationFn: (params: Partial<UpdateInvoicePaymentStateDto>) =>
        updateInvoicePaymentState(params),
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API list
        toast.success(
          t('teachingService:updateStatus.updateInvoicePaymentStatusSuccess')
        )
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  return {
    useUpdateEnrollCourse,
    useUpdatePaymentInvoiceState,
  }
}
export default useEnrollCourseData
