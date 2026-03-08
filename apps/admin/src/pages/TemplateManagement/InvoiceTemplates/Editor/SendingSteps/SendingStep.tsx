import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import {
  SendingCampaignStatus,
  SendingInvoiceData,
} from '@/types/studentInvoice.type'

import { InvoiceCard } from './InvoiceCard'
import { SendingProgress } from './SendingProgress'

interface SendingStepProps {
  invoices: SendingInvoiceData[]
  sentCount: number
  totalCount: number
}

export function SendingStep({
  invoices,
  sentCount,
  totalCount,
}: SendingStepProps) {
  const { t } = useTranslation()
  const toBeSendingInvoices = invoices.reduce<SendingInvoiceData[]>(
    (acc, p) => {
      if (
        [SendingCampaignStatus.SENT, SendingCampaignStatus.SENDING].includes(
          p.status
        ) &&
        p.invoiceNumber &&
        !acc.some(i => i.invoiceNumber === p.invoiceNumber)
      ) {
        acc.push(p)
      }
      return acc
    },
    []
  )
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('invoiceCampaign:editor.send.sendProgress')}
        </h2>
        <span className="text-gray-500 font-medium" aria-live="polite">
          {sentCount}/{totalCount}
        </span>
      </div>

      <SendingProgress
        current={sentCount}
        total={totalCount}
        className="mb-8"
      />

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {t('invoiceCampaign:editor.send.sentInvoices')}
        </h3>
        <div className="space-y-4">
          <AnimatePresence>
            {toBeSendingInvoices.map(invoice => (
              <motion.div
                key={`sent-${invoice.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <InvoiceCard
                  invoice={invoice}
                  variant={invoice.status}
                  showAnimation={false}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
