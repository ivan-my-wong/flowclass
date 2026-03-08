import { useTranslation } from 'react-i18next'
import { GrNotes } from 'react-icons/gr'
import { useRecoilValue } from 'recoil'

import {
  currentActiveParentState,
  currentActiveStudentState,
  invoiceClassesSelector,
} from '@/stores/studentInvoice.store'

import {
  InvoiceSplitTypeLabel,
  useContextInvoiceEditDialog,
} from './EditInvoiceContext'

const InvoiceSummary = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const currentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: currentActiveParent?.id ?? null,
    })
  )
  const { invoiceSplitType, finalPrice } = useContextInvoiceEditDialog()
  return (
    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg mb-6">
      <div className="mb-4 flex items-center gap-2 text-gray-800">
        <GrNotes />
        <div className="font-medium">{t('invoice.invoiceSummary.title')}</div>
      </div>
      <div className="text-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="text-gray-500">
            {t('invoice.invoiceSummary.student')}
          </div>
          <div className="text-gray-700 text-right">
            {currentActiveStudent?.name}
          </div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-gray-500">
            {t('invoice.invoiceSummary.courses')}
          </div>
          <div className="text-gray-700 text-right">
            {t('invoice.invoiceSummary.coursesCount', {
              count: currentClasses.length,
            })}
          </div>
        </div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-gray-500">
            {t('invoice.invoiceSummary.installment')}
          </div>
          <div className="text-gray-700 text-right">
            {InvoiceSplitTypeLabel[invoiceSplitType] ?? '—'}
          </div>
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

export default InvoiceSummary
