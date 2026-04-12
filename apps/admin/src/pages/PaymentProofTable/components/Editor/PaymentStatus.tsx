import { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { handleStatusPayment } from '@/pages/StudentCRM/components/TeachingServiceEnrolledRow'
import { Invoice, PaymentProofTableItem } from '@/types/enrollCourse'

import PaymentReceiptStatusCell from '../../PaymentProofTableCells/PaymentReceiptStatusCell'

import UpdateAmountPaid from './UpdateAmountPaid'
import UpdateInvoiceDateField from './UpdateInvoiceDateField'
import UpdatePayAmount from './UpdatePayAmount'
import UpdatePayLeterMethod from './UpdatePayLeterMethod'
import UpdatePaymentDate from './UpdatePaymentDate'
import UploadPaymentProof from './UploadPaymentProof'

interface Props {
  invoiceData: Invoice
  refetch: () => void
}

const PaymentStatus: FC<Props> = ({ invoiceData, refetch }): JSX.Element => {
  const { t } = useTranslation()

  const { useFetchPaymentEvidence } = usePaymentEvidenceData()
  const { data: paymentEvidences, refetch: refetchPaymentEvidences } =
    useFetchPaymentEvidence(invoiceData.id)
  const paymentEvidenceList = useMemo(
    () => paymentEvidences || [],
    [paymentEvidences]
  )
  return (
    <div className="space-y-3 border border-gray-300 p-4 rounded-lg">
      <div className="font-semibold text-lg">
        {t('student:paymentProof.paymentStatusLabel')}
      </div>
      <div className="space-y-5">
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">{t('student:paymentProof.totalAmount')}</div>
          <UpdatePayAmount data={invoiceData} refetch={refetch} />
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">{t('student:paymentProof.amountPaid')}</div>
          <UpdateAmountPaid data={invoiceData} refetch={refetch} />
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">{t('student:paymentProof.status')}</div>
          <div className="flex items-center gap-2">
            <div className="mt-1 flex-shrink-0">
              {handleStatusPayment(invoiceData.paymentState, t)}
            </div>
            <PaymentReceiptStatusCell
              params={invoiceData}
              paymentEvidenceList={paymentEvidenceList}
              refetch={refetch}
            />
          </div>
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">{t('student:paymentProof.paymentDate')}</div>
          <UpdatePaymentDate
            data={invoiceData as unknown as PaymentProofTableItem}
            refetch={refetch}
          />
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">{t('student:paymentProof.method')}</div>
          <UpdatePayLeterMethod data={invoiceData} refetch={refetch} />
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">
            {t('student:paymentProof.paymentProofLabel')}
          </div>
          <UploadPaymentProof
            data={invoiceData}
            paymentEvidence={paymentEvidenceList?.[0]}
            refetch={() => {
              refetch()
              refetchPaymentEvidences()
            }}
          />
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">{t('student:paymentProof.createdDate')}</div>
          <UpdateInvoiceDateField
            data={invoiceData}
            field="createdAt"
            refetch={refetch}
          />
        </div>
        <div className="flex items-center justify-between font-medium">
          <div className="text-sm">
            {t('student:paymentProof.lastUpdatedDate')}
          </div>
          <UpdateInvoiceDateField
            data={invoiceData}
            field="updatedAt"
            refetch={refetch}
          />
        </div>
      </div>
    </div>
  )
}

export default PaymentStatus
