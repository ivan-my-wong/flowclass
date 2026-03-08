import { useMemo } from 'react'

import { DefaultTFuncReturn, t } from 'i18next'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  confirmPayment,
  rejectPayment,
  resetPayment,
} from '@/api/paymentEvidence'
import { PaymentEvidenceState, PaymentState } from '@/constants/payment'
import { DataTestId } from '@/types/common'
import { PaymentEvidence } from '@/types/enrollCourse'
import { ConfirmPaymentPayload } from '@/types/paymentProof'

import ConfirmPopup from './ConfirmPopup'

type PaymentEvidenceReceiptPopupProps = {
  invoiceId: number
  siteId: number
  institutionId: number
  actionType?: string
  paymentEvidenceList: PaymentEvidence[]
  disabled: boolean
  trigger?: JSX.Element | ((isLoading: boolean) => JSX.Element)
  title?: string | DefaultTFuncReturn
  proofToken?: string
  description?: string
  setUploadPaymentEvidenceStatus: (status: PaymentEvidenceState) => void
  setPaymentState: (status: PaymentState) => void
} & DataTestId

export const PaymentEvidenceReceiptPopup: React.FC<
  PaymentEvidenceReceiptPopupProps
> = ({
  invoiceId,
  siteId,
  institutionId,
  actionType,
  paymentEvidenceList,
  // disabled,
  title,
  trigger,
  proofToken,
  description,
  setUploadPaymentEvidenceStatus,
  setPaymentState,
}) => {
  // get the single payment evidence receipt
  const singlePaymentEvidence = useMemo(
    () =>
      paymentEvidenceList.find((p: PaymentEvidence) => {
        return invoiceId === p.invoiceId
      }),
    [paymentEvidenceList, invoiceId]
  )
  const payload = useMemo(() => {
    return {
      siteId,
      institutionId,
      ids: singlePaymentEvidence ? [singlePaymentEvidence?.id] : [],
      invoices: proofToken
        ? [
            {
              invoiceId,
              proofToken,
            },
          ]
        : undefined,
    }
  }, [siteId, institutionId, singlePaymentEvidence, proofToken, invoiceId])

  // const refreshData = (): void => {
  //   queryClient.invalidateQueries({
  //     queryKey: [QUERY_KEY.paymentEvidence.checkPaymentEvidenceKey],
  //   })
  //   queryClient.invalidateQueries({
  //     queryKey: [QUERY_KEY.course.classListCourseKey],
  //   })
  //   queryClient.invalidateQueries({
  //     queryKey: [QUERY_KEY.course.studentListCourseKey],
  //   })
  // }

  const { mutateAsync: mutateAsyncConfirm, isLoading: isLoadingConfirm } =
    useMutation({
      mutationFn: ({
        siteId,
        institutionId,
        ids,
        invoices,
      }: ConfirmPaymentPayload) =>
        confirmPayment(siteId, institutionId, ids, invoices),
      onSuccess: () => {
        setUploadPaymentEvidenceStatus(PaymentEvidenceState.ACCEPTED)
        setPaymentState(PaymentState.PAID)
        toast.success(t('teachingService:confirmReceiptSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })

  const { mutateAsync: mutateAsyncReject, isLoading: isLoadingReject } =
    useMutation({
      mutationFn: ({
        siteId,
        institutionId,
        ids,
        invoices,
      }: ConfirmPaymentPayload) =>
        rejectPayment(siteId, institutionId, ids, invoices),
      onSuccess: () => {
        setUploadPaymentEvidenceStatus(PaymentEvidenceState.REJECTED)
        setPaymentState(PaymentState.REJECTED)
        toast.success(t('teachingService:rejectReceiptSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })

  const { mutateAsync: mutateAsyncReset, isLoading: isLoadingReset } =
    useMutation({
      mutationFn: ({
        siteId,
        institutionId,
        ids,
        invoices,
      }: ConfirmPaymentPayload) =>
        resetPayment(siteId, institutionId, ids, invoices),
      onSuccess: () => {
        setUploadPaymentEvidenceStatus(PaymentEvidenceState.PROCESSING)
        setPaymentState(PaymentState.PENDING)
        toast.success(t('teachingService:resetReceiptSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })

  const rejectPaymentReceipt = (): void => {
    mutateAsyncReject(payload)
  }

  const confirmPaymentReceipt = (): void => {
    mutateAsyncConfirm(payload)
  }

  const resetPaymentReceipt = (): void => {
    mutateAsyncReset(payload)
  }

  const isLoading = isLoadingConfirm || isLoadingReject || isLoadingReset

  const commonProps = {
    title: title || 'Payment Receipt',
    imgUrl: singlePaymentEvidence ? singlePaymentEvidence.image : undefined,
    trigger: typeof trigger === 'function' ? trigger(isLoading) : trigger,
    objectFit: 'contain' as const,
    description,
    className: 'max-w-3xl',
  }

  let confirmPopupProps
  switch (actionType) {
    case 'reset':
      confirmPopupProps = {
        ...commonProps,
        onConfirm: resetPaymentReceipt,
        confirmText: t('common:action.resetStatus') as string,
        dataTestId: 'reset-payment-receipt',
      }
      break
    case 'reject':
      confirmPopupProps = {
        ...commonProps,
        onReject: resetPaymentReceipt,
        rejectText: t('common:action.resetStatus') as string,
        dataTestId: 'reject-payment-receipt',
      }
      break
    default:
      confirmPopupProps = {
        ...commonProps,
        onConfirm: confirmPaymentReceipt,
        onReject: rejectPaymentReceipt,
        dataTestId: 'confirm-payment-receipt',
      }
  }

  return <ConfirmPopup {...confirmPopupProps} />
}

export default PaymentEvidenceReceiptPopup
