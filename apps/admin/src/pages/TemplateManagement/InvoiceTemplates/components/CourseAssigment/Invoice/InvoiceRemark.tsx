import { useTranslation } from 'react-i18next'
import { LuAlertTriangle, LuPencil } from 'react-icons/lu'

import TextArea from '@/components/ui/TextArea'

import { useContextInvoiceEditDialog } from './EditInvoiceContext'

const InvoiceRemark = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const { remark, setRemark } = useContextInvoiceEditDialog()
  return (
    <div className="mb-1 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
      <div className="flex items-center gap-2 mb-4 text-gray-800">
        <LuPencil aria-hidden="true" />
        <div id="invoice-remark-title" className="font-medium">
          {t('invoice.invoiceRemark.title')}
        </div>
      </div>
      <TextArea
        className="border-yellow-200 shadow-none text-gray-700"
        placeholder={t('invoice.invoiceRemark.placeholder') as string}
        rows={3}
        value={remark ?? ''}
        onChange={event => setRemark(event.target.value)}
        aria-labelledby="invoice-remark-title"
      />
      <div className="flex items-start gap-2 mt-3">
        <LuAlertTriangle
          size={20}
          className="text-yellow-800"
          aria-hidden="true"
        />
        <p className="text-xs text-yellow-700">
          {t('invoice.invoiceRemark.disclaimer')}
        </p>
      </div>
    </div>
  )
}

export default InvoiceRemark
