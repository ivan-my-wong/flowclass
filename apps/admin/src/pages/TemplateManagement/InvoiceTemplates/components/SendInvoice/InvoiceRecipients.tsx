import { useTranslation } from 'react-i18next'
import { FiUsers } from 'react-icons/fi'
import { useRecoilValue } from 'recoil'

import { invoiceStudentState } from '@/stores/studentInvoice.store'

import TableItemRecipient from './TableItemRecipient'

const InvoiceRecipients = (): JSX.Element => {
  const { t } = useTranslation()
  const allStudents = useRecoilValue(invoiceStudentState)
  return (
    <>
      <div className="flex items-center gap-2 mb-4 text-gray-900">
        <FiUsers />
        <div className="font-semibold">
          {t('invoiceCampaign:editor.recipients', {
            count: allStudents.length,
          })}
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-gray-300 overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="py-4 bg-gray-50 rounded-tl-lg text-left pl-4">
                {t('invoiceCampaign:editor.invoiceTable.customer')}
              </th>
              <th className="py-4 bg-gray-50 text-left">
                {t('invoiceCampaign:editor.invoiceTable.email')}
              </th>
              <th className="py-4 bg-gray-50 text-left">
                {t('invoiceCampaign:editor.invoiceTable.phone')}
              </th>
              <th className="py-4 bg-gray-50 rounded-tr-lg text-left">
                {t('invoiceCampaign:editor.invoicePreview.invoiceItem.total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {allStudents.map(student => (
              <TableItemRecipient key={student.id} student={student} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default InvoiceRecipients
