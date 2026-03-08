import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  createWhatsappTemplate,
  deleteWhatsappTemplate,
  getDetailWhatsappTemplate,
  getListWhatsappTemplates,
  updateWhatsappTemplate,
} from '@/api/whatsappTemplate'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import {
  AboveInstructorRoles,
  userPermissionState,
} from '@/stores/userPermissionData'
import { UpdateVariablesType, WhatsappTemplate } from '@/types/whatsappTemplate'

const useWhatsappTemplateData = () => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [schoolData] = useRecoilState(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const navigate = useNavigate()

  const userPermission = useRecoilValue(userPermissionState)

  const useFetchListWhatsappTemplate = (params: Record<any, any>) => {
    return useQuery(
      [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
      () => getListWhatsappTemplates(currentSchoolId, params),
      {
        enabled: AboveInstructorRoles.includes(userPermission),
      }
    )
  }

  const useFetchDetailWhatsappTemplate = (whatsappTemplateId: number) => {
    return useQuery(
      [
        QUERY_KEY.whatsappTemplate.detailWhatsappTemplatesKey,
        whatsappTemplateId,
        currentSchoolId,
      ],
      () =>
        getDetailWhatsappTemplate(
          currentSchoolId,
          whatsappTemplateId as number
        ),
      {
        onError: (error: ApiError) => {
          return error
        },
        enabled: !!currentSchoolId && whatsappTemplateId > 0,
        cacheTime: 0,
      }
    )
  }
  const useCreateWhatsappTemplate = () => {
    return useMutation(
      [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
      (data: WhatsappTemplate) => createWhatsappTemplate(currentSchoolId, data),
      {
        onSuccess: async () => {
          toast.success(t('whatsappTemplate:message.createSuccess'))
          await queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
          })
          navigate('/whatsapp-templates')
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }
  const useUpdateWhatsappTemplate = () => {
    return useMutation(
      [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
      ({ whatsappTemplateId, data }: UpdateVariablesType) =>
        updateWhatsappTemplate(currentSchoolId, whatsappTemplateId, data),
      {
        onSuccess: async () => {
          toast.success(t('whatsappTemplate:message.updateSuccess'))
          await queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
          })
          navigate('/whatsapp-templates')
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }
  const useDeleteWhatsappTemplate = (onSuccessCallback?: () => void) => {
    return useMutation(
      [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
      (whatsappTemplateId: number) =>
        deleteWhatsappTemplate(currentSchoolId, whatsappTemplateId as number),
      {
        onSuccess: async () => {
          toast.success(t('whatsappTemplate:message.deleteSuccess').toString())
          onSuccessCallback?.()
          await queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.whatsappTemplate.whatsappTemplatesKey],
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  return {
    useUpdateWhatsappTemplate,
    useCreateWhatsappTemplate,
    useFetchDetailWhatsappTemplate,
    useFetchListWhatsappTemplate,
    useDeleteWhatsappTemplate,
  }
}
export default useWhatsappTemplateData
