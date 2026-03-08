import { t } from 'i18next'
import { AiOutlineStop } from 'react-icons/ai'
import { BiTimeFive } from 'react-icons/bi'
import { HiOutlineHandThumbUp } from 'react-icons/hi2'
import { TbPhotoOff } from 'react-icons/tb'

import Box from '@/components/Containers/Box'
import {
  PaymentEvidenceState,
  PaymentMethodsEnum,
  PaymentState,
} from '@/constants/payment'

import { IPaymentReceiptCellProps } from './types'

export const PaymentReceiptCell = ({
  params,
  paymentEvidenceList,
}: IPaymentReceiptCellProps): JSX.Element => {
  if (!params) return <></>

  const isPayLater = params.paymentMethod === PaymentMethodsEnum.PAY_LATER
  const isPaid = params.paymentState === PaymentState.PAID
  const uploadedEvidence = paymentEvidenceList?.find(
    e => e.invoiceId === params?.id
  )

  return (
    <>
      {!isPayLater && <div>----</div>}
      {isPayLater && !isPaid && !uploadedEvidence && (
        <Box justify="flex-start">
          <TbPhotoOff />
          <div>{t('student:notUploaded')}</div>
        </Box>
      )}

      {uploadedEvidence?.status === PaymentEvidenceState.ACCEPTED && (
        <Box justify="space-between">
          <Box direction="row" fitContent>
            <span className="text-primary">
              <HiOutlineHandThumbUp color="currentColor" />
            </span>
            <div>{t('student:paymentStatus.ACCEPTED')}</div>
          </Box>
        </Box>
      )}
      {uploadedEvidence?.status === PaymentEvidenceState.REJECTED && (
        <Box justify="space-between">
          <Box direction="row" fitContent>
            <span className="text-secondary">
              <AiOutlineStop color="currentColor" />
            </span>
            <div>{t('student:paymentStatus.REJECTED')}</div>
          </Box>
        </Box>
      )}
      {uploadedEvidence?.status === PaymentEvidenceState.PROCESSING && (
        <Box justify="space-between" className="text-warn">
          <Box direction="row" fitContent>
            <BiTimeFive />
            <div>{t('student:waitingForReview')}</div>
          </Box>
        </Box>
      )}
    </>
  )
}

export default PaymentReceiptCell
