import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import {
  SendingCampaignStatus,
  SendingInvoiceData,
} from '@/types/studentInvoice.type'

import { InvoiceCard } from './InvoiceCard'
import { SendingProgress } from './SendingProgress'

interface CreatingStepProps {
  invoices: SendingInvoiceData[]
  createdCount: number
  totalCount: number
}

export function CreatingStep({
  invoices,
  createdCount,
  totalCount,
}: CreatingStepProps) {
  const { t } = useTranslation()
  const creatingInvoices = invoices.filter(inv =>
    [SendingCampaignStatus.CREATING, SendingCampaignStatus.FAILED].includes(
      inv.status
    )
  )
  const createdInvoices = invoices.filter(inv =>
    [SendingCampaignStatus.CREATED, SendingCampaignStatus.FAILED].includes(
      inv.status
    )
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('invoiceCampaign:editor.send.createdInvoices')}
        </h2>
        <span className="text-gray-500 font-medium">
          {createdCount}/{totalCount}
        </span>
      </div>

      <SendingProgress
        current={createdCount}
        total={totalCount}
        className="mb-8"
      />

      {/* Currently Creating */}
      <AnimatePresence>
        {creatingInvoices.map(invoice => (
          <div key={`creating-${invoice.id}`} className="mb-8">
            <InvoiceCard invoice={invoice} variant={invoice.status} />
          </div>
        ))}
      </AnimatePresence>

      {/* Created Invoices */}
      {createdCount > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('invoiceCampaign:editor.send.createdInvoices')}
          </h3>
          <div className="space-y-4">
            <AnimatePresence>
              {createdInvoices.map(invoice => (
                <motion.div
                  key={`created-${invoice.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4"
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
      )}
    </motion.div>
  )
}
