import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import {
  createBulkSendDocument,
  createDocumentTemplate,
  deleteDocumentTemplate,
  getBulkSendDocumentById,
  getBulkSendDocuments,
  getDocumentTemplateById,
  getDocumentTemplates,
  getFieldsTemplate,
  getRecipientsListCampaign,
  resendDocumentCampaign,
  updateDocumentTemplate,
} from '@/api/templateManagement'
import { BulkSendDocument, DocumentTemplate } from '@/types/templateManagement'

import useSchoolData from './useSchoolData'

const useTemplateManagement = () => {
  const { t } = useTranslation()

  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''

  const useGetDocumentTemplates = () => {
    return useQuery({
      queryKey: ['documentTemplates'],
      queryFn: () => getDocumentTemplates(+currentInstitutionId),
    })
  }

  const useGetDocumentTemplateById = (id?: number) => {
    return useQuery({
      queryKey: ['documentTemplate', id],
      queryFn: () => getDocumentTemplateById(id ?? 0, +currentInstitutionId),
      enabled: !!id,
    })
  }

  const useCreateDocumentTemplate = () => {
    return useMutation({
      mutationFn: (
        template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>
      ) =>
        createDocumentTemplate({
          ...template,
          institutionId: +currentInstitutionId,
        }),
      onSuccess: () => {
        toast.success(t('templateManagement:success.createTemplate'))
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(t('templateManagement:errors.createTemplate'))
      },
    })
  }

  const useUpdateDocumentTemplate = () => {
    return useMutation({
      mutationFn: (payload: Partial<DocumentTemplate> & { id: number }) =>
        updateDocumentTemplate({
          ...payload,
          institutionId: +currentInstitutionId,
        }),
      onSuccess: () => {
        toast.success(t('templateManagement:success.updateTemplate'))
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(t('templateManagement:errors.updateTemplate'))
      },
    })
  }

  const useDeleteDocumentTemplate = (
    showSuccess?: boolean,
    showError?: boolean
  ) => {
    return useMutation({
      mutationFn: (templateId: number) =>
        deleteDocumentTemplate(templateId, +currentInstitutionId),
      onSuccess: () => {
        if (showSuccess !== false) {
          toast.success(t('templateManagement:success.deleteTemplate'))
        }
      },
      onError: (error: any) => {
        if (showError !== false) {
          console.error(error)
          toast.error(t('templateManagement:errors.deleteTemplate'))
        }
      },
    })
  }

  const useGetFieldsTemplate = () => {
    return useQuery({
      queryKey: ['fieldsTemplate'],
      queryFn: () => getFieldsTemplate(+currentInstitutionId),
    })
  }

  const useGetBulkSendDocuments = () => {
    return useQuery({
      queryKey: ['bulkSendDocuments'],
      queryFn: () => getBulkSendDocuments(+currentInstitutionId),
    })
  }

  const useGetBulkSendDocumentById = (id?: number) => {
    return useQuery({
      queryKey: ['bulkSendDocumentsbyId', id],
      queryFn: () => getBulkSendDocumentById(id ?? 0, +currentInstitutionId),
      enabled: !!id,
    })
  }

  const useCreateBulkSendDocument = () => {
    return useMutation({
      mutationFn: (
        data: Omit<
          BulkSendDocument,
          'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId'
        >
      ) =>
        createBulkSendDocument({
          ...data,
          institutionId: +currentInstitutionId,
        }),
      onSuccess: () => {
        toast.success(t('templateManagement:success.createBulkSendDocument'))
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(t('templateManagement:errors.createBulkSendDocument'))
      },
    })
  }

  const useGetRecipientsListByCampaignd = (id?: number) => {
    return useQuery({
      queryKey: ['recipientsListCampaign', id],
      queryFn: () => getRecipientsListCampaign(+currentInstitutionId, id ?? 0),
      enabled: !!id,
    })
  }

  const useResendDocumentCampaign = () => {
    return useMutation({
      mutationFn: (data: { recipientId: number }) =>
        resendDocumentCampaign(+currentInstitutionId, data.recipientId),
      onSuccess: () => {
        toast.success(t('templateManagement:success.resendDocumentCampaign'))
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(t('templateManagement:errors.resendDocumentCampaign'))
      },
    })
  }

  return {
    useGetDocumentTemplates,
    useGetDocumentTemplateById,
    useCreateDocumentTemplate,
    useUpdateDocumentTemplate,
    useDeleteDocumentTemplate,
    useGetFieldsTemplate,
    useGetBulkSendDocuments,
    useCreateBulkSendDocument,
    useGetRecipientsListByCampaignd,
    useGetBulkSendDocumentById,
    useResendDocumentCampaign,
  }
}

export default useTemplateManagement
