import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuCheckCircle, LuLoader2, LuUser, LuXCircle } from 'react-icons/lu'

import { Card, CardContent } from '@/components/ui/Card'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useSiteData from '@/hooks/useSiteData'
import {
  SendingCampaignStatus,
  SendingInvoiceData,
} from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'

interface InvoiceCardProps {
  invoice: SendingInvoiceData
  variant?: SendingCampaignStatus
  showAnimation?: boolean
}

export function InvoiceCard({
  invoice,
  variant = SendingCampaignStatus.CREATED,
  showAnimation = true,
}: InvoiceCardProps) {
  const amountNum = Number.parseFloat(String(invoice?.amount))
  const { currentSite } = useSiteData()
  const { t } = useTranslation(['invoiceCampaign'])
  const getCardStyles = () => {
    switch (variant) {
      case SendingCampaignStatus.PENDING:
        return 'border bg-gray-50 border-gray-200'
      case SendingCampaignStatus.CREATING:
        return 'border-l-4 border-l-blue-500 bg-blue-50'
      case SendingCampaignStatus.SENDING:
        return 'border-l-4 border-l-blue-500 bg-blue-50'
      case SendingCampaignStatus.CREATED:
        return 'border bg-green-50 border-green-200'
      case SendingCampaignStatus.SENT:
        return 'border bg-green-50 border-green-200'
      case SendingCampaignStatus.FAILED:
        return 'border bg-red-50 border-red-200'
      default:
        return ''
    }
  }

  const getIconStyles = () => {
    switch (variant) {
      case SendingCampaignStatus.CREATING:
        return 'w-12 h-12 bg-blue-100'
      case SendingCampaignStatus.SENDING:
        return 'w-12 h-12 bg-blue-100'
      case SendingCampaignStatus.CREATED:
        return 'w-10 h-10 bg-green-100'
      case SendingCampaignStatus.SENT:
        return 'w-10 h-10 bg-green-100'
      case SendingCampaignStatus.PENDING:
        return 'w-10 h-10 bg-gray-100'
      default:
        return 'w-10 h-10 bg-red-100'
    }
  }

  const CardWrapper: React.ElementType = showAnimation ? motion.div : 'div'
  const animationProps = showAnimation
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      }
    : {}
  const isCreating = variant === SendingCampaignStatus.CREATING
  return (
    <CardWrapper {...animationProps}>
      <Card className={getCardStyles()}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`${getIconStyles()} rounded-full flex items-center justify-center`}
              >
                {isCreating && (
                  <LuUser
                    className="w-6 h-6 text-blue-600"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
                {[
                  SendingCampaignStatus.CREATED,
                  SendingCampaignStatus.SENT,
                ].includes(variant) && (
                  <LuCheckCircle
                    className="w-6 h-6 text-green-600"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
                {variant === SendingCampaignStatus.FAILED && (
                  <LuXCircle className="w-6 h-6 text-red-500" />
                )}
                {[
                  SendingCampaignStatus.SENDING,
                  SendingCampaignStatus.PENDING,
                ].includes(variant) && (
                  <LuLoader2
                    className="w-6 h-6 text-slate-600 animate-spin"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
              </div>
              <div>
                <h3
                  className={`font-semibold text-gray-900 ${
                    isCreating ? 'text-lg' : ''
                  }`}
                >
                  {invoice.name}
                </h3>
                <p className={`text-gray-600 ${isCreating ? '' : 'text-sm'}`}>
                  {invoice.email}
                </p>
                <p className={`text-gray-600 ${isCreating ? '' : 'text-sm'}`}>
                  {invoice.phone}
                </p>
                <p className="text-gray-500 text-sm">{invoice.invoiceNumber}</p>
              </div>
            </div>
            {Number.isFinite(amountNum) && (
              <div
                className={`font-bold text-green-600 ${
                  isCreating ? 'text-2xl' : 'text-xl'
                }`}
              >
                {formatCurrency(
                  amountNum,
                  currentSite?.currency ?? DEFAULT_CURRENCY
                )}
              </div>
            )}
          </div>
          {invoice.status === SendingCampaignStatus.FAILED && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">
                {t(
                  `common:errors.${invoice.message}`,
                  'Failed to process this invoice. Please try again.'
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
