import { ApiError } from 'next/dist/server/api-utils'

import { useMutation, UseMutationResult } from 'react-query'

import { checkCourseCompleted } from '@/api/enrolApi'
import { CheckEnrollCompleted, EnrollCompletedResponse } from '@/types/enrol'

export const useCheckCourseCompleted = (
  successfulCallback?: (data: EnrollCompletedResponse[]) => void
): UseMutationResult<EnrollCompletedResponse[], ApiError, CheckEnrollCompleted> => {
  const mutation = useMutation({
    mutationFn: (payload: CheckEnrollCompleted) => checkCourseCompleted(payload),
    onSuccess: data => {
      successfulCallback?.(data)
    },
    onError: (error: ApiError) => console.log(error),
  })
  return mutation
}
