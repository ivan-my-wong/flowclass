import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import {
  deleteCustomMessage,
  getCustomMessageById,
  getCustomMessageData,
  getPreparedData,
  updateOrCreateCustomMessage,
} from '@/api/customMessage'
import { handleApiError } from '@/api/errors/apiError'
import { QUERY_KEY } from '@/constants/queryKey'
import { CustomMessage } from '@/types/customMessage'

import useSchoolData from './useSchoolData'

const useCustomMessageData = () => {
  const { currentSchool } = useSchoolData()
  const institutionId = currentSchool?.id || 0
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const FETCH_CUSTOM_MESSAGE_DATA_KEY = [
    QUERY_KEY.customMessage.customMessageDataKey,
    institutionId,
  ]
  const FETCH_CUSTOM_MESSAGE_PREPARED_DATA_KEY = [
    QUERY_KEY.customMessage.customMessagePreparedDataKey,
    institutionId,
  ]
  const useFetchCustomMessageData = () => {
    return useQuery({
      queryKey: FETCH_CUSTOM_MESSAGE_DATA_KEY,
      queryFn: () => getCustomMessageData(institutionId),
      enabled: !!institutionId,
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateOrCreateCustomMessage = () => {
    return useMutation({
      mutationFn: (data: CustomMessage) =>
        updateOrCreateCustomMessage(institutionId, data),
      onSuccess: () => {
        queryClient.invalidateQueries(FETCH_CUSTOM_MESSAGE_DATA_KEY)
        queryClient.invalidateQueries(FETCH_CUSTOM_MESSAGE_PREPARED_DATA_KEY)
        toast.success(t('customMessage:form.updateSuccess'))
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteCustomMessage = () => {
    return useMutation({
      mutationFn: (id: number) => deleteCustomMessage(institutionId, id),
      onSuccess: () => {
        queryClient.invalidateQueries(FETCH_CUSTOM_MESSAGE_DATA_KEY)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetCustomMessageById = (id: number) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.customMessage.customMessageDataKey,
        institutionId,
        id,
      ],
      queryFn: () => getCustomMessageById(institutionId, id),
      enabled: !!institutionId && id > 0,
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetPreparedData = () => {
    return useQuery({
      queryKey: FETCH_CUSTOM_MESSAGE_PREPARED_DATA_KEY,
      queryFn: () => getPreparedData(institutionId),
      enabled: !!institutionId,
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useFetchCustomMessageData,
    useUpdateOrCreateCustomMessage,
    useDeleteCustomMessage,
    useGetCustomMessageById,
    useGetPreparedData,
  }
}

export default useCustomMessageData
