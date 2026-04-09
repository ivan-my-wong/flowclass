import { useTranslation } from 'react-i18next'
import { GrNotes } from 'react-icons/gr'

import useSiteData from '@/hooks/useSiteData'
import { formatCurrency } from '@/utils/currency'

import { useContextInvoiceEditDialog } from './EditInvoiceContext'

const SingleInvoiceSummary = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const { currentSite } = useSiteData()
  const currency = currentSite?.currency ?? 'HKD'
  const { finalPrice, totalPrice, calculatedDiscount, usedBalance } =
    useContextInvoiceEditDialog()
  return (
    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg mb-6">
      <div className="mb-4 flex items-center gap-2 text-gray-800">
        <GrNotes />
        <div className="font-medium">{t('invoice.invoiceSummary.title')}</div>
      </div>
      <div className="text-sm">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="text-gray-700">{t('invoice.discount.subtotal')}</div>
          <div className="font-semibold">{totalPrice?.totalPriceLabel}</div>
        </div>
        <div className="flex items-center justify-between text-sm mb-1">
          <div className="text-gray-700">
            {t('invoice.discount.totalDiscount')}
          </div>
          <div className="font-semibold text-red-600">
            {`-${formatCurrency(calculatedDiscount.totalDiscount, currency)}`}
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <div>{t('invoice.applyCreditBalance.creditApplied')}</div>
          <div className="text-red-600 font-semibold">{usedBalance.label}</div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-gray-900 font-semibold">
            {t('invoice.invoiceSummary.total')}
          </div>
          <div className="text-blue-800 text-right font-semibold">
            {finalPrice.currentLabel}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleInvoiceSummary
