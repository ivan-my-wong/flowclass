import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { DeleteTeachingService } from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { StudentDeleteTeachingServiceRequestDto } from '@/types/studentAddTeachingService'

const useTeachingServiceData = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const useDeleteTeachingService = () => {
    return useMutation({
      mutationFn: (params: StudentDeleteTeachingServiceRequestDto) =>
        DeleteTeachingService(params),
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          QUERY_KEY.teachingService.getTeachingServiceKey
        ) // call API get list
        toast.success(t('student:teachingService.deleteTeachingServiceSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  return {
    useDeleteTeachingService,
  }
}
export default useTeachingServiceData
