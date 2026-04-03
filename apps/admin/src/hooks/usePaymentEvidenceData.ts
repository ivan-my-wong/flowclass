import { utcToZonedTime } from 'date-fns-tz'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getInvoiceStatistics } from '@/api/invoice'
import {
  confirmPayment,
  deletePaymentEvidence,
  generateNextMonthInvoice,
  getPaymentEvidenceList,
  getPreviewNextInvoice,
  rejectPayment,
  sendPaymentProofReminder,
  uploadPaymentProof,
} from '@/api/paymentEvidence'
import {
  deleteRemarkInvoice,
  getStudentInvoiceList,
  getStudentInvoiceStatistics,
  getStudentSingleInvoice,
  sendInvoiceCustomMessage,
  updateAmountPaid,
  updatePayLaterMethod,
  updatePaymentAmount,
  updatePaymentDate,
  updateRemarkInvoice,
} from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
  UserRole,
} from '@/stores/userPermissionData'
import {
  Invoice,
  PayLaterMethod,
  RevenueByItem,
  RevenueOverview,
  SendCustomMessage,
  StudentByStudent,
  StudentOverview,
  UploadReceiptData,
} from '@/types/enrollCourse'
import {
  DeletePaymentPayload,
  SendPaymentReminderPayload,
} from '@/types/paymentProof'

const usePaymentEvidenceData = () => {
  const { t } = useTranslation()
  const { currentSite } = useRecoilValue(siteState)
  const { currentSchool } = useRecoilValue(schoolState)
  const currentUser = useRecoilValue(userState)
  const userPermission = useRecoilValue(userPermissionState)
  const currentSiteId = currentSite?.id || 0
  const currentSchoolId = currentSchool?.id || 0

  const queryClient = useQueryClient()

  const useFetchStudentInvoices = (
    courseId: number | undefined,
    params?: Record<string, any>,
    onSuccessCallback?: (result: Invoice[]) => void,
    options?: { enabled: boolean }
  ) => {
    return useQuery(
      [
        QUERY_KEY.course.studentListCourseKey,
        currentSiteId,
        currentSchoolId,
        params,
      ],
      () => {
        // No need check userId for admin
        if (
          currentUser.isLogin &&
          (AboveInstructorRoles.includes(userPermission) ||
            userPermission === UserRole.Guest)
        ) {
          return getStudentInvoiceList({
            siteId: currentSiteId,
            schoolId: currentSchoolId,
            courseId,
            payload: {
              ...params,
              siteId: currentSiteId,
              courseId,
            },
          })
        }
        return getStudentInvoiceList({
          siteId: currentSiteId,
          schoolId: currentSchoolId,
          courseId,
          payload: {
            ...params,
            siteId: currentSiteId,
            courseId,
          },
          userId: currentUser.id,
        })
      },
      {
        enabled: options?.enabled ?? true,
        onSuccess: result => {
          if (result) {
            return onSuccessCallback?.(result)
          }
          return result
        },
        onError: (error: ApiError) => {
          toast.error(error.message)
        },
      }
    )
  }

  const useFetchStudentSingleInvoice = (invoiceId: number) => {
    return useQuery(
      [QUERY_KEY.student.studentSingleInvoiceKey, currentSchoolId, invoiceId],
      () => getStudentSingleInvoice(currentSchoolId, invoiceId),
      {
        enabled: !!currentSchoolId && !!invoiceId,
      }
    )
  }

  const useFetchStudentInvoiceStatistics = ({
    startDate,
    endDate,
  }: {
    startDate: string | undefined
    endDate: string | undefined
  }) => {
    return useQuery(
      [
        QUERY_KEY.student.studentInvoiceStatisticsKey,
        currentSchoolId,
        startDate,
        endDate,
      ],
      () =>
        getStudentInvoiceStatistics({
          // We need to convert the date in the format of YYYY-MM-DD to ISO string, taking the site's timezone into account
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSiteId,
          institutionId: currentSchoolId,
        }),
      {
        enabled: !!currentSiteId && !!currentSchoolId,
      }
    )
  }

  const useFetchPaymentEvidence = (invoiceId?: number) => {
    return useQuery(
      [
        QUERY_KEY.paymentEvidence.checkPaymentEvidenceKey,
        currentSiteId,
        currentSchoolId,
        invoiceId,
      ],
      () => getPaymentEvidenceList(currentSiteId, currentSchoolId, invoiceId),
      {
        onSuccess: data => {
          return data
        },
        onError: (err: unknown) => {
          handleApiError({ error: err as ApiError, t })
        },
        cacheTime: 0,
        enabled: !!currentSiteId && !!currentSchoolId,
      }
    )
  }

  const useDeletePayment = () => {
    return useMutation({
      mutationFn: ({ ids, invoices }: DeletePaymentPayload) =>
        deletePaymentEvidence(currentSiteId, currentSchoolId, ids, invoices),
      onSuccess: async () => {
        toast.success(t('student:paymentProof.deleteSuccess'))
        await queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.paymentEvidence.checkPaymentEvidenceKey,
            currentSiteId,
            currentSchoolId,
          ],
        })
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.course.classListCourseKey],
        })
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.course.studentListCourseKey],
        })
      },
      onError: (err: unknown) => {
        handleApiError({ error: err as ApiError, t })
      },
    })
  }
  const useApprovePaymentProof = (onSuccessCallback?: () => void) => {
    return useMutation({
      mutationFn: (ids: number[]) =>
        confirmPayment(currentSiteId, currentSchoolId, ids),
      onSuccess: () => {
        onSuccessCallback?.()
        toast.success(t('teachingService:confirmReceiptSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useRejectPaymentProof = (onSuccessCallback?: () => void) => {
    return useMutation({
      mutationFn: (ids: number[]) =>
        rejectPayment(currentSiteId, currentSchoolId, ids),
      onSuccess: () => {
        onSuccessCallback?.()
        toast.success(t('teachingService:rejectReceiptSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUploadPaymentProof = (onSuccessCallback?: () => void) => {
    return useMutation({
      mutationFn: (payload: UploadReceiptData) => uploadPaymentProof(payload),
      onSuccess: () => {
        onSuccessCallback?.()
        toast.success(t('student:paymentProof.updatePaymentProofSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useSendReminderPayment = () => {
    return useMutation({
      mutationFn: (payload: SendPaymentReminderPayload) =>
        sendPaymentProofReminder(currentSiteId, currentSchoolId, payload),
      onSuccess: () => {
        toast.success(
          t('student:paymentProof.confirmReminder.notificationSendSuccessfully')
        )
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const usePreviewNextInvoice = (classIds: number[]) => {
    return useQuery(
      [
        QUERY_KEY.paymentEvidence.previewNextInvoiceKey,
        currentSiteId,
        classIds.map(d => d.toString()).join(','),
      ],
      () => {
        return getPreviewNextInvoice(currentSchoolId, classIds)
      },
      {
        enabled: !!currentSiteId && !!currentSchoolId && classIds.length > 0,
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useGenerateNextMonthInvoice = () => {
    return useMutation({
      mutationFn: (classIds: number[]) =>
        generateNextMonthInvoice(currentSchoolId, classIds),
      onSuccess: () => {
        toast.success(t('student:automations.generateNextMonthInvoiceSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useSendInvoiceCustomMessage = () => {
    return useMutation({
      mutationFn: (payload: SendCustomMessage) =>
        sendInvoiceCustomMessage(currentSchoolId, payload),
      onSuccess: () => {
        toast.success(t('student:paymentProof.sendCustomMessagesSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const usePaymentAmountUpdate = () => {
    return useMutation({
      mutationFn: (payload: { invoiceId: number; paymentAmount: number }) =>
        updatePaymentAmount(currentSchoolId, payload),
      onSuccess: () => {
        toast.success(t('student:paymentProof.updatePaymentAmountSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useAmountPaidUpdate = () => {
    return useMutation({
      mutationFn: (payload: { invoiceId: number; amountPaid: number }) =>
        updateAmountPaid(currentSchoolId, payload),
      onSuccess: () => {
        toast.success(t('student:paymentProof.updateAmountPaidSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const usePayLaterMethodUpdate = () => {
    return useMutation({
      mutationFn: (payload: {
        invoiceId: number
        payLaterMethod?: PayLaterMethod
      }) => updatePayLaterMethod(currentSchoolId, payload),
      onSuccess: () => {
        toast.success(t('student:paymentProof.updatePayLaterMethodSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateRemarkInvoice = () => {
    return useMutation({
      mutationFn: (payload: { invoiceId: number; remark: string }) =>
        updateRemarkInvoice(currentSchoolId, payload),
      onSuccess: () => {
        toast.success(t('student:paymentProof.updateRemarkSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // delete remark
  const useDeleteRemarkInvoice = () => {
    return useMutation({
      mutationFn: (invoiceId: number) =>
        deleteRemarkInvoice(currentSchoolId, invoiceId),
      onSuccess: () => {
        toast.success(t('student:paymentProof.deleteRemarkSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useInvoiceOverview = ({
    startDate,
    endDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    return useQuery<RevenueOverview>(
      [QUERY_KEY.statistics.overview, currentSchoolId, startDate, endDate],
      () =>
        getInvoiceStatistics({
          type: 'revenue',
          filter: 'overview',
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSite?.id ?? 0,
          institutionId: currentSchoolId ?? 0,
        }),
      {
        enabled: !!currentSite && !!currentSchoolId && !!startDate && !!endDate,
        onError: (error: unknown) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useRevenueByCourse = ({
    startDate,
    endDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    return useQuery<RevenueByItem[]>(
      [QUERY_KEY.statistics.byCourse, currentSchoolId, startDate, endDate],
      () =>
        getInvoiceStatistics({
          type: 'revenue',
          filter: 'by-course',
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSite?.id ?? 0,
          institutionId: currentSchoolId ?? 0,
        }),
      {
        enabled: !!currentSite && !!currentSchoolId && !!startDate && !!endDate,
      }
    )
  }

  const useRevenueByClass = ({
    startDate,
    endDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    return useQuery<RevenueByItem[]>(
      [QUERY_KEY.statistics.byClass, currentSchoolId, startDate, endDate],
      () =>
        getInvoiceStatistics({
          type: 'revenue',
          filter: 'by-class',
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSite?.id ?? 0,
          institutionId: currentSchoolId ?? 0,
        }),
      {
        enabled: !!currentSite && !!currentSchoolId && !!startDate && !!endDate,
      }
    )
  }

  const useRevenueByInstructor = ({
    startDate,
    endDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    return useQuery<RevenueByItem[]>(
      [QUERY_KEY.statistics.byInstructor, currentSchoolId, startDate, endDate],
      () =>
        getInvoiceStatistics({
          type: 'revenue',
          filter: 'by-instructor',
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSite?.id ?? 0,
          institutionId: currentSchoolId ?? 0,
        }),
      {
        enabled: !!currentSite && !!currentSchoolId && !!startDate && !!endDate,
      }
    )
  }

  const useStudentOverview = ({
    startDate,
    endDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    return useQuery<StudentOverview>(
      [
        QUERY_KEY.statistics.studentOverview,
        currentSchoolId,
        startDate,
        endDate,
      ],
      () =>
        getInvoiceStatistics({
          type: 'student',
          filter: 'overview',
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSite?.id ?? 0,
          institutionId: currentSchoolId ?? 0,
        }),
      {
        enabled: !!currentSite && !!currentSchoolId && !!startDate && !!endDate,
      }
    )
  }

  const useStudentByStudent = ({
    startDate,
    endDate,
  }: {
    startDate?: string
    endDate?: string
  }) => {
    return useQuery<StudentByStudent[]>(
      [QUERY_KEY.statistics.byStudent, currentSchoolId, startDate, endDate],
      () =>
        getInvoiceStatistics({
          type: 'student',
          filter: 'by-student',
          startDate: startDate
            ? utcToZonedTime(
                new Date(startDate),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          endDate: endDate
            ? utcToZonedTime(
                new Date(new Date(endDate).getTime() + 86400000),
                currentSite?.timeZone.id ?? ''
              ).toISOString()
            : undefined,
          siteId: currentSite?.id ?? 0,
          institutionId: currentSchoolId ?? 0,
        }),
      {
        enabled: !!currentSite && !!currentSchoolId && !!startDate && !!endDate,
      }
    )
  }

  const usePaymentDateUpdate = () => {
    return useMutation({
      mutationFn: (payload: {
        invoiceId: number
        paymentDate?: string
        createdAt?: string
        updatedAt?: string
      }) => updatePaymentDate(currentSchoolId, payload),
      onSuccess: () => {
        toast.success(t('student:paymentProof.updatePaymentDateSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useDeletePaymentProof: useDeletePayment,
    useApprovePaymentProof,
    useRejectPaymentProof,
    useFetchStudentInvoices,
    useFetchStudentSingleInvoice,
    useFetchPaymentEvidence,
    useSendReminderPayment,
    useFetchStudentInvoiceStatistics,
    usePreviewNextInvoice,
    useGenerateNextMonthInvoice,
    useSendInvoiceCustomMessage,
    usePaymentAmountUpdate,
    useAmountPaidUpdate,
    useUpdateRemarkInvoice,
    useDeleteRemarkInvoice,
    useInvoiceOverview,
    useRevenueByCourse,
    useRevenueByClass,
    useRevenueByInstructor,
    useStudentOverview,
    useStudentByStudent,
    usePayLaterMethodUpdate,
    useUploadPaymentProof,
    usePaymentDateUpdate,
  }
}
export default usePaymentEvidenceData
