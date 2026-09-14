import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  completeMetaEmbeddedSignup,
  getMetaCoexistenceSyncStatus,
  getMetaEmbeddedSignup,
  getMetaWhatsAppProfile,
  initiateMetaEmbeddedSignup,
  registerMetaPhoneNumber,
  retryMetaEmbeddedSignup,
  triggerMetaCoexistenceSync,
  updateMetaWhatsAppProfile,
} from '@/api/meta'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import {
  MetaCoexistenceSyncStatus,
  MetaEmbeddedSignupCompletePayload,
  MetaEmbeddedSignupInitiatePayload,
  MetaEmbeddedSignupRecord,
  MetaWhatsAppProfile,
  UpdateMetaWhatsAppProfileDto,
} from '@/types/meta'

export const useMetaEmbeddedSignup = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [schoolData] = useRecoilState(schoolState)
  const currentInstitutionId = schoolData.currentSchool?.id || 0

  const useInitiateEmbeddedSignup = () => {
    return useMutation(
      (payload: MetaEmbeddedSignupInitiatePayload) =>
        initiateMetaEmbeddedSignup(payload),
      {
        onSuccess: () => {
          queryClient.invalidateQueries([
            QUERY_KEY.meta.embeddedSignupKey,
            currentInstitutionId,
          ])
          toast.success(
            t(
              'setting:whatsappSetting.metaEmbeddedSignupInitiated',
              'WhatsApp onboarding initiated'
            )
          )
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useCompleteEmbeddedSignup = () => {
    return useMutation(
      (payload: MetaEmbeddedSignupCompletePayload) =>
        completeMetaEmbeddedSignup(payload),
      {
        onSuccess: () => {
          queryClient.invalidateQueries([
            QUERY_KEY.meta.embeddedSignupKey,
            currentInstitutionId,
          ])
          queryClient.invalidateQueries([
            QUERY_KEY.meta.whatsappProfileKey,
            currentInstitutionId,
          ])
          toast.success(
            t(
              'setting:whatsappSetting.metaEmbeddedSignupCompleted',
              'WhatsApp connected successfully'
            )
          )
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useGetEmbeddedSignup = () => {
    return useQuery<MetaEmbeddedSignupRecord | null>(
      [QUERY_KEY.meta.embeddedSignupKey, currentInstitutionId],
      async () => {
        if (!currentInstitutionId) return null
        try {
          return await getMetaEmbeddedSignup(currentInstitutionId)
        } catch (error: any) {
          if (error?.status === 404 || error?.statusCode === 404) {
            return null
          }
          throw error
        }
      },
      {
        enabled: !!currentInstitutionId,
        refetchInterval: data =>
          [
            'meta_auth_completed',
            'provisioning',
            'phone_registration_pending',
          ].includes(data?.status || '')
            ? 3000
            : false,
      }
    )
  }

  const useRetryEmbeddedSignup = () => {
    return useMutation(() => retryMetaEmbeddedSignup(currentInstitutionId), {
      onSuccess: () => {
        queryClient.invalidateQueries([
          QUERY_KEY.meta.embeddedSignupKey,
          currentInstitutionId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetCoexistenceSyncStatus = () => {
    return useQuery<MetaCoexistenceSyncStatus>(
      [QUERY_KEY.meta.coexistenceSyncStatusKey, currentInstitutionId],
      () => getMetaCoexistenceSyncStatus(currentInstitutionId),
      {
        enabled: !!currentInstitutionId,
        refetchInterval: data =>
          data?.checkpoints?.some(c => c.status === 'in_progress')
            ? 5000
            : false,
      }
    )
  }

  const useTriggerCoexistenceSync = () => {
    return useMutation(() => triggerMetaCoexistenceSync(currentInstitutionId), {
      onSuccess: () => {
        queryClient.invalidateQueries([
          QUERY_KEY.meta.coexistenceSyncStatusKey,
          currentInstitutionId,
        ])
        toast.success(
          t('setting:whatsappSetting.syncStarted', 'Coexistence sync triggered')
        )
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetWhatsAppProfile = () => {
    return useQuery<MetaWhatsAppProfile>(
      [QUERY_KEY.meta.whatsappProfileKey, currentInstitutionId],
      () => getMetaWhatsAppProfile(currentInstitutionId),
      {
        enabled: !!currentInstitutionId,
      }
    )
  }

  const useUpdateWhatsAppProfile = () => {
    return useMutation(
      (data: UpdateMetaWhatsAppProfileDto) =>
        updateMetaWhatsAppProfile(currentInstitutionId, data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries([
            QUERY_KEY.meta.whatsappProfileKey,
            currentInstitutionId,
          ])
          toast.success(
            t('common:action.saveSuccess', 'Profile updated successfully')
          )
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useRegisterPhoneNumber = () => {
    return useMutation(
      (pin: string) => registerMetaPhoneNumber(currentInstitutionId, pin),
      {
        onSuccess: () => {
          queryClient.invalidateQueries([
            QUERY_KEY.meta.embeddedSignupKey,
            currentInstitutionId,
          ])
          toast.success('Phone number registered successfully.')
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  return {
    currentInstitutionId,
    useInitiateEmbeddedSignup,
    useCompleteEmbeddedSignup,
    useGetEmbeddedSignup,
    useRetryEmbeddedSignup,
    useGetCoexistenceSyncStatus,
    useTriggerCoexistenceSync,
    useGetWhatsAppProfile,
    useUpdateWhatsAppProfile,
    useRegisterPhoneNumber,
  }
}

export default useMetaEmbeddedSignup
