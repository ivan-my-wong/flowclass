import { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCopy, LuDownload, LuSend } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import PaymentReceiptStatusCell from '@/pages/PaymentProofTable/PaymentProofTableCells/PaymentReceiptStatusCell'
import { Invoice, PaymentEvidence } from '@/types/enrollCourse'
import { InvoiceSplit } from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'

type Props = {
  invoice: Invoice
  splitItems: InvoiceSplit[]
  index: number
  isShowCopyLink?: boolean
  isShowSendBtn?: boolean
  isShowUpdatePaymentStatusBts?: boolean
  onDownload: (pdfUrl: string) => void
  onSend?: () => void
  onCopyLink?: () => void
  paymentEvidenceList?: PaymentEvidence[]
  onPaymentStateUpdate?: () => void
}
const InvoiceInstallmentItem: FC<Props> = ({
  invoice,
  splitItems,
  index,
  isShowCopyLink,
  isShowSendBtn,
  isShowUpdatePaymentStatusBts,
  onDownload,
  onSend,
  onCopyLink,
  paymentEvidenceList,
  onPaymentStateUpdate,
}) => {
  const { t } = useTranslation('invoiceCampaign')
  const { useFetchInvoicePdf } = useInvoiceCampaignData()
  const { data } = useFetchInvoicePdf(invoice.id)
  const splitItem = useMemo(() => {
    if (splitItems && Array.isArray(splitItems))
      return splitItems.find(item => item.invoiceId === invoice.id)
    return undefined
  }, [invoice.id, splitItems])

  return (
    <div className="border border-slate-100 flex rounded-md p-4 justify-between">
      <div className="flex flex-row justify-start items-center gap-4 w-full">
        <div className="rounded-full bg-slate-100 h-10 w-10 flex justify-center items-center">
          {index + 1}
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-medium">{splitItem?.description}</div>
          <span className="text-sm text-gray-600">
            {t('invoice.installment.dueDate')}:{' '}
            {dayjs(splitItem?.dueDate).format('YYYY-MM-DD')}
          </span>
          <span className="text-sm text-gray-600">
            {t('invoice.installment.invoiceId', { invoiceId: invoice.id })}
          </span>
        </div>
      </div>
      <div className="flex justify-end items-center gap-x-3">
        {data && (
          <Button
            size="sm"
            variant="outline"
            iconBefore={<LuDownload />}
            onClick={() => {
              onDownload(data)
            }}
          >
            {t('invoice.installment.download')}
          </Button>
        )}
        {isShowSendBtn && (
          <Button
            size="sm"
            variant="outline"
            iconBefore={<LuSend />}
            onClick={onSend}
          >
            {t('invoice.installment.send')}
          </Button>
        )}
        {isShowUpdatePaymentStatusBts && (
          <PaymentReceiptStatusCell
            params={invoice}
            paymentEvidenceList={paymentEvidenceList}
            onPaymentStateUpdate={onPaymentStateUpdate}
          />
        )}
        {isShowCopyLink && (
          <Button size="sm" variant="outline" onClick={onCopyLink}>
            <LuCopy />
          </Button>
        )}
        <div className="flex flex-col items-center space-y-3">
          <span className="mx-2 font-semibold">
            {formatCurrency(invoice.payAmount, invoice.currency)}
          </span>
          <Badge className="w-fit">{invoice.paymentState}</Badge>
        </div>
      </div>
    </div>
  )
}
export default InvoiceInstallmentItem
