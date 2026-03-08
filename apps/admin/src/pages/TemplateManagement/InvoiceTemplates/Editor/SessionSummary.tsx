import { useTranslation } from 'react-i18next'

import useInvoiceSummary from '@/hooks/useInvoiceSummary'
import { formatCurrency } from '@/utils/currency'

type ItemProps = {
  label: React.ReactNode
  value: React.ReactNode
}

const SessionSummaryItem = ({ label, value }: ItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const SessionSummary = () => {
  const { t } = useTranslation('invoiceCampaign')
  const { pricePerLesson, countLessons, currency } = useInvoiceSummary()
  return (
    <div className="flex flex-col gap-4">
      <SessionSummaryItem
        label={t('invoiceCampaign:editor.totalSessions')}
        value={countLessons}
      />
      <SessionSummaryItem
        label={t('invoiceCampaign:editor.perSession')}
        value={formatCurrency(pricePerLesson, currency)}
      />
    </div>
  )
}
export default SessionSummary
