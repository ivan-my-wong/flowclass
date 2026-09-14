import { TFunction } from 'i18next'

import { PaymentProofTableItem } from '@/types/enrollCourse'
import { formatCurrency } from '@/utils/currency'

interface PromotionCellProps {
  t: TFunction
  currency: string
  data?: PaymentProofTableItem
}

export const PromotionCell: React.FC<PromotionCellProps> = ({
  data,
  currency,
  t,
}) => {
  const coupon = data?.promotionUsed?.coupon
  const additionalFee = Number(data?.additionalFee ?? 0)

  if (!coupon && !additionalFee) return null

  return (
    <div className="text-sm list-disc">
      {coupon && (
        <p>
          {t('promotion:titles.couponCode')}: {coupon.code},{' '}
          {formatCurrency(Number(data?.discountAmount), currency)}{' '}
          {t('student:paymentProof.discounted')}
        </p>
      )}
      {additionalFee > 0 && (
        <p>
          {t('setting:additionalFee.title')}:{' '}
          {formatCurrency(additionalFee, currency)}{' '}
          {t('student:paymentProof.included')}
        </p>
      )}
    </div>
  )
}
