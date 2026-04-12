import { useTranslation } from 'react-i18next'

import Box from '../../../components/Containers/Box'
import { PaymentState } from '../../../constants/payment'

interface PaymentStatusCellProps {
  value: string
}

const PaymentStatusCell = ({ value }: PaymentStatusCellProps) => {
  const { t } = useTranslation()
  return (
    <Box justify="flex-start">
      {(() => {
        switch (value) {
          case PaymentState.PAID:
            return t('student:statusPaid')
          case PaymentState.CRITICAL:
            return t('student:statusCritical')
          case PaymentState.SUBMITTED:
            return t('student:statusUploaded')
          case PaymentState.PARTIALLY_PAID:
            return (
              <span className="text-amber-600 font-medium">
                {t('student:statusPartiallyPaid')}
              </span>
            )
          default:
            return t('student:statusUnPaid')
        }
      })()}
      {/* <div>{paymentStatusFormatter(value)}</div> */}
    </Box>
  )
}

export default PaymentStatusCell
