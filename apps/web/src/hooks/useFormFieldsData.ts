import { useQuery } from 'react-query'

import { getEnrollmentFormCustom } from '@/api/schoolApi'
import { QUERY_KEY } from '@/constants/queryKey'
import { EnrollmentForm } from '@/types'

const useFormFieldsData = () => {
  const useFetchFormFields = (formId: string, onSuccessCallback?: (rs: EnrollmentForm) => void) => {
    return useQuery([QUERY_KEY.getEnrollmentForm, formId], () => getEnrollmentFormCustom(formId), {
      onSuccess: async (rs: EnrollmentForm) => {
        onSuccessCallback?.(rs)
      },
      enabled: !!formId,
    })
  }
  return {
    useFetchFormFields,
  }
}

export default useFormFieldsData
