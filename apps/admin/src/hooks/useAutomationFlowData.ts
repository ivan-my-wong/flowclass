import { useTranslation } from 'react-i18next'
import { useQuery, UseQueryResult } from 'react-query'

import { getAutomationFunctions } from '@/api/automationFlow'
import ApiError, { handleApiError } from '@/api/errors/apiError'
import { QUERY_KEY } from '@/constants/queryKey'
import { AutomationFunction } from '@/types/automationFlow'

const useAutomationFlowData = () => {
  const { t } = useTranslation()

  const useFetchAutomationFunctions = (
    successfulCallback?: (data: AutomationFunction[]) => void
  ): UseQueryResult<AutomationFunction[], unknown> => {
    return useQuery(
      [QUERY_KEY.automationFlow.automationFunctionsKey],
      () => getAutomationFunctions(),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
      }
    )
  }

  return {
    useFetchAutomationFunctions,
  }
}

export default useAutomationFlowData
