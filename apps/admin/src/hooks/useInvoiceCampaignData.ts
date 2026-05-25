import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { handleApiError } from '@/api/errors/apiError'
import {
  createInvoiceCampaign,
  deleteInvoiceCampaign,
  duplicateInvoiceCampaign,
  editAndResendInvoiceCampaign,
  fetchDetailInvoiceCampaign,
  fetchInvoiceCampaigns,
  fetchInvoicePdf,
  resendInvoiceRecipient,
  type SearchParams,
  sendInvoiceCampaign,
  sendInvoiceDirectly,
  syncEnrollCourses,
  updateInvoiceCampaign,
} from '@/api/invoiceCampaign'
import type {
  InvoiceCampaignDto,
  ResendInvoiceDto,
  SendingResponse,
  SendInvoiceDirectlyDto,
  SyncEnrollCoursesDiffItemDto,
} from '@/types/studentInvoice.type'
import type { InvoiceCampaign } from '@/types/templateManagement'

import useSchoolData from './useSchoolData'

const useInvoiceCampaignData = () => {
  const { currentSchool } = useSchoolData()
  const currentSchoolId = currentSchool?.id || 0
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const useFetchInvoiceCampaigns = (params: SearchParams) => {
    return useQuery({
      queryKey: ['invoiceCampaigns', currentSchoolId, params],
      queryFn: () => fetchInvoiceCampaigns(currentSchoolId, params),
      enabled: !!currentSchoolId,
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  const useCreateInvoiceCampaign = (
    onSuccess?: (document: InvoiceCampaign) => void
  ) => {
    return useMutation({
      mutationFn: (data: InvoiceCampaignDto) =>
        createInvoiceCampaign(currentSchoolId, data),
      onSuccess: (document: InvoiceCampaign) => {
        queryClient.invalidateQueries(['invoiceCampaigns', currentSchoolId])
        toast.success(t('invoiceCampaign:editor.createSuccess'))
        onSuccess?.(document)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  const useFetchDetailInvoiceCampaign = (
    documentId?: string,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: ['invoiceCampaigns', currentSchoolId, documentId],
      queryFn: () =>
        fetchDetailInvoiceCampaign(currentSchoolId, documentId as string),
      enabled: !!currentSchoolId && !!documentId && (options?.enabled ?? true),
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  const useFetchInvoicePdf = (invoiceId: number) => {
    return useQuery({
      queryKey: ['invoicePdf', currentSchoolId, invoiceId],
      queryFn: () => fetchInvoicePdf(currentSchoolId, invoiceId),
      enabled: !!currentSchoolId && !!invoiceId,
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  const useUpdateInvoiceCampaign = (
    documentId?: string | number,
    onSuccess?: (document: InvoiceCampaign) => void
  ) => {
    return useMutation({
      mutationFn: (data: InvoiceCampaignDto) =>
        updateInvoiceCampaign(currentSchoolId, documentId as string, data),
      onSuccess: (document: InvoiceCampaign) => {
        queryClient.invalidateQueries([
          'invoiceCampaigns',
          currentSchoolId,
          documentId,
        ])
        toast.success(t('invoiceCampaign:editor.updateSuccess'))
        onSuccess?.(document)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useSendInvoiceCampaign = (onSuccess?: (SendingResponse) => void) => {
    return useMutation({
      mutationFn: (data: InvoiceCampaignDto) =>
        sendInvoiceCampaign(currentSchoolId, (data?.id || 0).toString(), data),
      onSuccess: (res: SendingResponse) => {
        queryClient.invalidateQueries([
          'invoiceCampaigns',
          currentSchoolId,
          res.document.id,
        ])
        toast.success(t('invoiceCampaign:editor.send.sendProgress'))
        onSuccess?.(res)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  /** Re-send a completed campaign. Preserves amountPaid on the existing invoices. */
  const useEditAndResendCampaign = (
    onSuccess?: (res: SendingResponse) => void
  ) => {
    return useMutation({
      mutationFn: (data: InvoiceCampaignDto) =>
        editAndResendInvoiceCampaign(
          currentSchoolId,
          (data?.id || 0).toString(),
          data
        ),
      onSuccess: (res: SendingResponse) => {
        queryClient.invalidateQueries([
          'invoiceCampaigns',
          currentSchoolId,
          res.document.id,
        ])
        toast.success(t('invoiceCampaign:editor.send.sendProgress'))
        onSuccess?.(res)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useDuplicateInvoiceCampaign = (
    onSuccess?: (invoiceCampaign: InvoiceCampaign) => void
  ) => {
    return useMutation({
      mutationFn: (documentId: number) =>
        duplicateInvoiceCampaign(currentSchoolId, documentId),
      onSuccess: (invoiceCampaign: InvoiceCampaign) => {
        queryClient.invalidateQueries([
          'invoiceCampaigns',
          currentSchoolId,
          invoiceCampaign.id,
        ])
        toast.success(t('invoiceCampaign:duplicate.duplicateSuccess'))
        onSuccess?.(invoiceCampaign)
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  const useDeleteInvoiceCampaign = (onSuccess?: () => void) => {
    return useMutation({
      mutationFn: (documentId: number) =>
        deleteInvoiceCampaign(currentSchoolId, documentId),
      onSuccess: () => {
        queryClient.invalidateQueries(['invoiceCampaigns', currentSchoolId])
        toast.success(t('invoiceCampaign:delete.deleteSuccess'))
        onSuccess?.()
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useResendInvoiceRecipient = (onSuccess?: () => void) => {
    return useMutation({
      mutationFn: (dto: ResendInvoiceDto) =>
        resendInvoiceRecipient(currentSchoolId, dto),
      onSuccess: () => {
        queryClient.invalidateQueries(['invoiceCampaigns', currentSchoolId])
        toast.success(t('invoiceCampaign:editor.send.sendProgress'))
        onSuccess?.()
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  const useSyncEnrollCourses = (documentId?: string | number) => {
    return useMutation({
      mutationFn: (diffs: SyncEnrollCoursesDiffItemDto[]) =>
        syncEnrollCourses(currentSchoolId, documentId as string, diffs),
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }

  const useSendInvoiceDirectly = (onSuccess?: () => void) => {
    return useMutation({
      mutationFn: (dto: SendInvoiceDirectlyDto) =>
        sendInvoiceDirectly(currentSchoolId, dto),
      onSuccess: () => {
        toast.success(t('invoiceCampaign:editor.send.sendProgress'))
        onSuccess?.()
      },
      onError: error => {
        handleApiError({ error, t })
      },
    })
  }
  return {
    useFetchInvoiceCampaigns,
    useCreateInvoiceCampaign,
    useFetchDetailInvoiceCampaign,
    useUpdateInvoiceCampaign,
    useSendInvoiceCampaign,
    useEditAndResendCampaign,
    useDuplicateInvoiceCampaign,
    useDeleteInvoiceCampaign,
    useResendInvoiceRecipient,
    useFetchInvoicePdf,
    useSendInvoiceDirectly,
    useSyncEnrollCourses,
  }
}
export default useInvoiceCampaignData
