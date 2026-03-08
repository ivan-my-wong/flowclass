import { useMemo } from 'react'

import { useRecoilValue } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { FaCircle, FaRegCalendarAlt } from 'react-icons/fa'

import { currentWebsiteTheme } from '@/stores/schoolContext'
import { PaymentState } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'
import { templateSectionBgColor } from '@/types/websiteTemplate'
import { getDateTimeByAmPm } from '@/utils/calculateTime'

interface Props {
  invoice: InvoiceResponse
}

const PaymentStatusCard: React.FC<Props> = ({ invoice }): JSX.Element => {
  const { t } = useTranslation('enrol')
  const currentTheme = useRecoilValue(currentWebsiteTheme)

  const statusColor = useMemo(() => {
    let color
    switch (invoice.paymentState) {
      case PaymentState.PAID:
        color = 'text-success'
        break
      case PaymentState.PENDING:
        color = 'text-secondarySubtle'
        break
      case PaymentState.SUBMITTED:
        color = 'text-primary'
        break
      case PaymentState.REFUNDED:
        color = 'text-warn'
        break
      default:
        color = 'text-secondary'
        break
    }

    return color
  }, [invoice.paymentState])
  return (
    <div
      className={`w-full rounded-md border border-gray-100 ${templateSectionBgColor(
        currentTheme
      )} p-4`}
    >
      <div className="flex items-center gap-3">
        <FaCircle size={45} className={`${statusColor}`} />
        <div className="space-y-1">
          <div className={`font-semibold`}>
            {`${
              Number(invoice?.payAmount) === 0
                ? t('paymentStatus.ApplicationTitle')
                : t('paymentStatus.title')
            }: ${t(`paymentStatus.${invoice?.paymentState}`)}`}
          </div>
          {/* <div className="ring-offset-dark-text-contrast flex items-center gap-1">
            <FaRegCalendarAlt />
            <div>
              {t('paymentStatus.createdAt')}:{' '}
              {invoice?.createdAt && getDateTimeByAmPm(invoice?.createdAt)}
            </div>
          </div> */}
          <div className="flex items-center gap-1">
            <FaRegCalendarAlt />
            <div>
              {t('paymentStatus.updatedAt')}:{' '}
              {invoice?.updatedAt && getDateTimeByAmPm(invoice?.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatusCard
