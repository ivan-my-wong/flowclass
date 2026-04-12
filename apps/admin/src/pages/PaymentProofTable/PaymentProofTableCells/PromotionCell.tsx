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
  const couponPromotion = data?.invoicePromotionsUsed?.find(
    p => p.promotionType === 'COUPON_DISCOUNT'
  )
  const additionalFee = Number(data?.additionalFee ?? 0)

  if (!couponPromotion && !additionalFee) return null

  return (
    <div className="text-sm list-disc">
      {couponPromotion && (
        <p>
          {t('promotion:titles.couponCode')}: {couponPromotion.name},{' '}
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
