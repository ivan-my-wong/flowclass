import { useMemo } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { FaChevronDown } from 'react-icons/fa'

import Button from '@/components/Buttons/Button'
import { SiteSettings } from '@/types'
import { EnrolledClassAndPrice, InvoiceDiscounts, InvoiceSplit } from '@/types/receipt'
import { getPriceWithCurrency } from '@/utils/string.utils'

interface Props {
  paid: boolean
  siteSetting: SiteSettings
  additionalFee: string | number
  classesAndPrice: EnrolledClassAndPrice
  invoiceDiscounts: InvoiceDiscounts
  invoiceInstallment?: InvoiceSplit | null
  finalAmount: number
  onScrollTo: (elementId: string) => void
  couponDiscount?: {
    code: string
    amount: number
  }
  usedBalance?: number
}

const PaymentSummaryCard: React.FC<Props> = ({
  paid,
  siteSetting,
  additionalFee,
  classesAndPrice,
  invoiceDiscounts,
  invoiceInstallment,
  finalAmount,
  onScrollTo,
  couponDiscount,
  usedBalance,
}): JSX.Element => {
  const { t } = useTranslation('enrol')

  const safeAdditionalFee = useMemo(() => {
    const parsed = typeof additionalFee === 'string' ? parseFloat(additionalFee) : additionalFee
    return isNaN(parsed) ? 0 : parsed
  }, [additionalFee])

  return (
    <div className="w-full rounded-md p-4">
      <div className="mb-2 flex flex-row flex-nowrap items-start justify-between gap-2 md:items-center">
        <div className="text-xl font-bold">
          {t(paid ? 'paymentSummary.titleApplication' : 'paymentSummary.title')}
        </div>
      </div>
      {/* <div className="box-col-full mt-4 items-start">
        <div className="text-lg font-medium">{t('paymentSummary.courses')}</div>
        {classesAndPrice.enrolledClasses.map(classItem => (
          <div
            key={`${classItem.courseName}#${classItem.secondLevelName}`}
            className="flex w-full items-center justify-between"
          >
            <div>
              {classItem.secondLevelName} */}
      {/* {t('paymentSummary.lessonCount', { count: classItem.lessonCount })} */}
      {/* </div>
            <div className="font-medium">
              {getPriceWithCurrency(siteSetting.currency, classItem?.totalPrice ?? 0)}
            </div>
          </div>
        ))}
      </div> */}
      {safeAdditionalFee > 0 && (
        <div className="mt-4">
          <div className="text-lg font-medium">{t('uploadReceipt.additionalFee.title')}</div>
          <div className="flex items-center justify-between">
            <div>{t('uploadReceipt.additionalFee.newStudentFee')}</div>
            {getPriceWithCurrency(siteSetting.currency, safeAdditionalFee)}
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between pt-2 text-lg font-medium">
        <div>{t('paymentSummary.subtotal')}</div>
        <div>{getPriceWithCurrency(siteSetting.currency, classesAndPrice.subtotalPrice)}</div>
      </div>

      {couponDiscount && couponDiscount.amount > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between rounded bg-green-50 p-2">
            <div className="text-green-700">
              {t('enrol:coupon.applied')}: {couponDiscount.code}
            </div>
            <div className="font-medium text-green-700">
              -{getPriceWithCurrency(siteSetting.currency, couponDiscount.amount)}
            </div>
          </div>
        </div>
      )}
      {invoiceDiscounts.discounts.length > 0 && (
        <div className="mt-4">
          {invoiceDiscounts.discounts.map(discount => (
            <div
              key={discount.id}
              className="mb-2 flex items-center justify-between rounded bg-green-50 p-2"
            >
              <div className="text-green-700">
                {discount.name}
                {discount.discountType === 'percentage' && discount.type !== 'bundle' && (
                  <span>{` (${discount.amount}%)`}</span>
                )}
              </div>
              <div className="font-medium text-green-700">
                {discount.feeType === 'add' ? '+' : '-'}
                {getPriceWithCurrency(siteSetting.currency, discount.discountPrice)}
              </div>
            </div>
          ))}
        </div>
      )}
      {!!usedBalance && usedBalance > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between rounded bg-green-50 p-2">
            <div className="text-green-700">{t('paymentSummary.creditsUsed')}</div>
            <div className="font-medium text-green-700">
              -{getPriceWithCurrency(siteSetting.currency, usedBalance)}
            </div>
          </div>
        </div>
      )}
      {invoiceInstallment && (
        <div className="mt-4 space-y-2">
          <div className="flex rounded-lg bg-gray-50 p-3">
            <div>{invoiceInstallment.description}</div>
            {invoiceInstallment.percentage !== null && (
              <div className="ml-auto font-medium">{invoiceInstallment.percentage}%</div>
            )}
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-lg font-semibold">
        <div>{t('paymentSummary.totalAmount')}</div>
        <div>{getPriceWithCurrency(siteSetting.currency, finalAmount)}</div>
      </div>

      <Button
        variant="outlined"
        iconBefore={<FaChevronDown />}
        className="mt-4 !py-1"
        onClick={() => onScrollTo('time-slots-box')}
      >
        {t('paymentSummary.viewTimeSlotBtn')}
      </Button>
    </div>
  )
}

export default PaymentSummaryCard
