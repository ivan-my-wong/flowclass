/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from 'react'

import { DefaultTFuncReturn, t } from 'i18next'
import { BiReceipt } from 'react-icons/bi'
import { LuPenSquare } from 'react-icons/lu'
import { TiEye } from 'react-icons/ti'

import LoadingButton from '@/components/Buttons/LoadingButton'
import Box from '@/components/Containers/Box'
import PaymentEvidenceReceiptPopup from '@/components/Popups/PaymentEvidenceReceiptPopup'
import Text from '@/components/Texts/Text'
import { ButtonVariant } from '@/components/ui/Button'
import {
  PaymentEvidenceState,
  PaymentMethodsEnum,
  PaymentState,
} from '@/constants/payment'

import { IPaymentReceiptCellProps } from './types'

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
  } = params

  const [uploadPaymentEvidenceStatus, setUploadPaymentEvidenceStatus] =
    useState<PaymentEvidenceState>(
      uploadedEvidence?.status as PaymentEvidenceState
    )

  const [paymentState, setPaymentState] = useState<PaymentState>(_paymentState)

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

  const renderTrigger =
    (buttonText: string, isDisabled = false, variant = 'subtle') =>
    (isLoading: boolean) => {
      let icon
      if (uploadedEvidence) {
        icon = <TiEye />
      } else {
        icon = <LuPenSquare />
      }

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

  const handleUpdatePyamentState = (paymentState: PaymentState) => {
    refetch?.()
    setPaymentState(paymentState)
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
      setPaymentState={handleUpdatePyamentState}
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

  if (!uploadedEvidence && isNeedToCheck) {
    return (
      <Box css={{ paddingTop: '$1' }} justify="flex-start">
        {renderPaymentPopup({
          description: t(
            'student:paymentProof.paymentProofWithoutReceiptDesc'
          ) as string,
          title: t('student:paymentProof.paymentProofWithoutReceipt'),
          buttonText: statusText,
          variant: 'link',
        })}
      </Box>
    )
  }

  if (
    uploadPaymentEvidenceStatus === PaymentEvidenceState.PROCESSING ||
    paymentState === PaymentState.PENDING
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
