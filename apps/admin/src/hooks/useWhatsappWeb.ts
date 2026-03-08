import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  getSession,
  getSessionStatus,
  initializeSession,
  removeSession,
} from '@/api/whatsappWeb'
import { QUERY_KEY } from '@/constants/queryKey'

import useSchoolData from './useSchoolData'

export const useWhatsappWeb = () => {
  const { currentSchool } = useSchoolData()
  const institutionId = currentSchool?.id || 0
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const useGetSession = () => {
    const query = useQuery({
      queryKey: [QUERY_KEY.whatsappWeb.getSessionKey, institutionId],
      queryFn: () => getSession(institutionId),
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!institutionId && institutionId > 0,
      retry: 2,
    })
    return query
  }

  const useInitializeSession = (onSuccessCallback?: () => void) => {
    const query = useMutation({
      mutationFn: () => initializeSession(institutionId),
      onSuccess: () => {
        toast.success(
          t('customMessage:modalCreateWhatsappAccount.initializeSessionSuccess')
        )
        onSuccessCallback?.()
        queryClient.invalidateQueries([
          QUERY_KEY.whatsappWeb.getSessionKey,
          institutionId,
        ])
        queryClient.invalidateQueries([
          QUERY_KEY.whatsappWeb.getSessionStatusKey,
          institutionId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return query
  }

  const useGetSessionStatus = (enablePolling = false) => {
    const query = useQuery({
      queryKey: [QUERY_KEY.whatsappWeb.getSessionStatusKey, institutionId],
      queryFn: () => getSessionStatus(institutionId),
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!institutionId && institutionId > 0,
      retry: 2,
      refetchInterval: enablePolling ? 1000 : false, // Poll every 1 second when enabled
    })

    return query
  }

  const useRemoveSession = (successCallback?: () => void) => {
    return useMutation(() => removeSession(institutionId), {
      onSuccess: () => {
        toast.success(t('customMessage:whatsappWeb.removeSessionSuccess'))

        successCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useGetSession,
    useGetSessionStatus,
    useRemoveSession,
    useInitializeSession,
  }
}
