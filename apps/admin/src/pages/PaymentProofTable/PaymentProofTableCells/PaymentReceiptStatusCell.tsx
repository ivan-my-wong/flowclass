/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from 'react'

import { DefaultTFuncReturn, t } from 'i18next'
import { BiReceipt } from 'react-icons/bi'
import { LuPenSquare } from 'react-icons/lu'
import { TiEye } from 'react-icons/ti'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { updateAmountPaid, updateInvoicePaymentState } from '@/api/student'
import LoadingButton from '@/components/Buttons/LoadingButton'
import Box from '@/components/Containers/Box'
import PaymentEvidenceReceiptPopup from '@/components/Popups/PaymentEvidenceReceiptPopup'
import Text from '@/components/Texts/Text'
import { Button, ButtonVariant } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  PaymentEvidenceState,
  PaymentMethodsEnum,
  PaymentState,
} from '@/constants/payment'

import { IPaymentReceiptCellProps } from './types'

// Payment states the admin can manually assign when no receipt is uploaded
const MANUAL_STATE_OPTIONS: Array<{
  state: PaymentState
  labelKey: string
}> = [
  { state: PaymentState.PAID, labelKey: 'student:paymentProof.approved' },
  {
    state: PaymentState.PARTIALLY_PAID,
    labelKey: 'student:statusPartiallyPaid',
  },
  {
    state: PaymentState.SUBMITTED,
    labelKey: 'student:paymentProof.paymentStatusOptions.awaitingReviewProof',
  },
  { state: PaymentState.PENDING, labelKey: 'student:statusUnPaid' },
  { state: PaymentState.REJECTED, labelKey: 'student:paymentProof.rejected' },
  { state: PaymentState.REFUNDED, labelKey: 'student:statusRefunded' },
]

export const PaymentReceiptStatusCell = ({
  params,
  paymentEvidenceList,
  onPaymentStateUpdate,
  refetch,
}: IPaymentReceiptCellProps & {
  refetch?: () => void
}): JSX.Element => {
  const {
    id,
    siteId,
    institutionId,
    paymentState: _paymentState,
    paymentMethod,
    paymentEvidence: uploadedEvidence,
    payAmount,
  } = params

  const [uploadPaymentEvidenceStatus, setUploadPaymentEvidenceStatus] =
    useState<PaymentEvidenceState>(
      uploadedEvidence?.status as PaymentEvidenceState
    )

  const [paymentState, setPaymentState] = useState<PaymentState>(_paymentState)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isPaidConfirmOpen, setIsPaidConfirmOpen] = useState(false)

  const isNeedToCheck = useMemo(() => {
    if (paymentMethod === PaymentMethodsEnum.PAY_NOW) return false
    return true
  }, [paymentMethod])

  const statusText = useMemo(() => {
    if (paymentState === PaymentState.PAID) {
      return t('student:paymentProof.confirmed')
    }
    if (paymentState === PaymentState.SUBMITTED) {
      return t('student:statusUploaded')
    }
    return t('student:paymentProof.updatePaymentStatus')
  }, [paymentState])

  const { mutate: applyState, isLoading: isApplyingState } = useMutation(
    (state: PaymentState) =>
      updateInvoicePaymentState({
        invoiceId: id,
        siteId,
        institutionId,
        paymentState: state,
      }),
    {
      onSuccess: (_data, state) => {
        setPaymentState(state)
        setIsManualModalOpen(false)
        refetch?.()
        onPaymentStateUpdate?.()
      },
      onError: () => {
        toast.error(t('common:error.unexpectedError'))
      },
    }
  )

  const { mutate: confirmMarkAsPaid, isLoading: isMarkingAsPaid } = useMutation(
    async () => {
      const amount = Number(payAmount ?? 0)
      await updateAmountPaid(institutionId, {
        invoiceId: id,
        amountPaid: amount,
      })
      await updateInvoicePaymentState({
        invoiceId: id,
        siteId,
        institutionId,
        paymentState: PaymentState.PAID,
      })
    },
    {
      onSuccess: () => {
        setPaymentState(PaymentState.PAID)
        setIsPaidConfirmOpen(false)
        setIsManualModalOpen(false)
        refetch?.()
        onPaymentStateUpdate?.()
      },
      onError: () => {
        toast.error(t('common:error.unexpectedError'))
      },
    }
  )

  const handleStateClick = (state: PaymentState) => {
    if (state === PaymentState.PAID) {
      setIsPaidConfirmOpen(true)
    } else {
      applyState(state)
    }
  }

  const renderTrigger =
    (buttonText: string, isDisabled = false, variant = 'subtle') =>
    (isLoading: boolean) => {
      const icon = uploadedEvidence ? <TiEye /> : <LuPenSquare />
      return (
        <LoadingButton
          isLoading={isLoading}
          disabled={isDisabled || isLoading}
          variant={variant as ButtonVariant}
          size="sm"
          iconAfter={icon}
          dataTestId="payment-receipt-status-cell"
        >
          <Text css={{ display: 'block' }}>{buttonText}</Text>
        </LoadingButton>
      )
    }

  const handleUpdatePaymentState = (state: PaymentState) => {
    refetch?.()
    setPaymentState(state)
    onPaymentStateUpdate?.()
  }

  const renderPaymentPopup = (options: {
    title?: string | undefined | DefaultTFuncReturn
    actionType?: string
    description?: string
    buttonText: string
    isDisabled?: boolean
    variant?: ButtonVariant
    proofToken?: string
  }) => (
    <PaymentEvidenceReceiptPopup
      invoiceId={id ?? 0}
      siteId={siteId ?? 0}
      institutionId={institutionId ?? 0}
      paymentEvidenceList={paymentEvidenceList ?? []}
      disabled={false}
      proofToken={params.proofToken}
      {...options}
      trigger={renderTrigger(
        options.buttonText,
        options.isDisabled,
        options.variant
      )}
      setUploadPaymentEvidenceStatus={setUploadPaymentEvidenceStatus}
      setPaymentState={handleUpdatePaymentState}
    />
  )

  if (!params) return <></>

  if (
    uploadPaymentEvidenceStatus === PaymentEvidenceState.ACCEPTED ||
    paymentState === PaymentState.PAID
  ) {
    return (
      <Box justify="flex-start">
        {renderPaymentPopup({
          description: t('student:paymentProof.approvedDesc') as string,
          buttonText: t('student:paymentProof.approved'),
          isDisabled: false,
          actionType: 'reset',
        })}
        <BiReceipt />
      </Box>
    )
  }

  if (
    uploadPaymentEvidenceStatus === PaymentEvidenceState.REJECTED ||
    paymentState === PaymentState.REJECTED
  ) {
    return (
      <Box justify="flex-start">
        {renderPaymentPopup({
          title: uploadedEvidence
            ? undefined
            : t('student:paymentProof.paymentProofWithoutReceipt'),
          buttonText: statusText,
          actionType: 'reject',
        })}
        <BiReceipt />
      </Box>
    )
  }

  // No receipt uploaded — show direct state-setting buttons in a modal
  if (!uploadedEvidence && isNeedToCheck) {
    return (
      <Box css={{ paddingTop: '$1' }} justify="flex-start">
        <LoadingButton
          isLoading={false}
          variant="link"
          size="sm"
          iconAfter={<LuPenSquare />}
          dataTestId="payment-receipt-status-cell"
          onClick={() => setIsManualModalOpen(true)}
        >
          <Text css={{ display: 'block' }}>
            {t('student:paymentProof.updatePaymentStatus')}
          </Text>
        </LoadingButton>

        <ModalDialog
          open={isManualModalOpen}
          onOpenChange={setIsManualModalOpen}
          title={t('student:paymentProof.paymentProofWithoutReceipt') as string}
          className="max-w-sm"
        >
          <p className="text-sm text-gray-500 mb-4 px-1">
            {t('student:paymentProof.paymentProofWithoutReceiptDesc')}
          </p>
          <div className="flex flex-col gap-3 px-1 pb-2">
            {MANUAL_STATE_OPTIONS.map(({ state, labelKey }) => (
              <Button
                key={state}
                variant="outline"
                className="w-full justify-center py-2"
                loading={isApplyingState}
                onClick={() => handleStateClick(state)}
              >
                {t(labelKey)}
              </Button>
            ))}
          </div>
        </ModalDialog>

        <ModalDialog
          open={isPaidConfirmOpen}
          onOpenChange={setIsPaidConfirmOpen}
          title={t('student:paymentProof.approved') as string}
          className="max-w-sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsPaidConfirmOpen(false)}
              >
                {t('common:action.cancel')}
              </Button>
              <Button
                variant="default"
                loading={isMarkingAsPaid}
                onClick={() => confirmMarkAsPaid()}
              >
                {t('common:action.confirm')}
              </Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 px-1">
            {t('student:paymentProof.confirmMarkAsPaidDesc', {
              amount: payAmount ?? 0,
              defaultValue:
                `The amount paid will be set to ${payAmount ?? 0}.` +
                ' The invoice will be marked as fully paid.',
            })}
          </p>
        </ModalDialog>
      </Box>
    )
  }

  if (
    uploadPaymentEvidenceStatus === PaymentEvidenceState.PROCESSING ||
    paymentState === PaymentState.PENDING ||
    paymentState === PaymentState.PARTIALLY_PAID
  ) {
    return (
      <Box css={{ paddingTop: '$1' }} justify="flex-start">
        {renderPaymentPopup({
          title: t('student:paymentProof.paymentProofWithoutReceipt'),
          buttonText: statusText,
          variant: 'link',
        })}
      </Box>
    )
  }

  return <></>
}

export default PaymentReceiptStatusCell
