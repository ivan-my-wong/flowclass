import { useMemo } from 'react'

import Heading from '@/components/Texts/Heading'
import { InvoiceState } from '@/types/enrol'
import { getPriceWithCurrency } from '@/utils/string.utils'

const FinalPrice = ({
  invoicesData,
  currency,
}: {
  invoicesData: InvoiceState[]
  currency: string
}): JSX.Element => {
  const { originalFee, additionalFee, paymentAmount, totalDiscount, couponDiscount } =
    useMemo(() => {
      return invoicesData.reduce(
        (acc, invoice) => {
          acc.originalFee += Number(invoice.originalFee)
          acc.additionalFee += Number(invoice.additionalFee)
          acc.paymentAmount += Number(invoice.paymentAmount)
          acc.totalDiscount += Number(invoice.totalDiscount)
          acc.couponDiscount += Number(invoice.couponDiscount)
          return acc
        },
        { originalFee: 0, additionalFee: 0, paymentAmount: 0, totalDiscount: 0, couponDiscount: 0 }
      )
    }, [invoicesData])

  const actualCouponDiscount =
    (totalDiscount && Number(totalDiscount) > 0 ? Number(totalDiscount) : couponDiscount) ?? 0

  const PriceHeading = ({
    price,
    currency,
    className,
    'data-testid': dataTestId,
  }: {
    price: number
    currency: string
    className: string
    ['data-testid']?: string
  }) => (
    <Heading
      id={`price-${price}`}
      data-testid={dataTestId}
      aria-placeholder={price.toString()}
      className={`text-center text-xl lg:text-left ${className}`}
    >
      {getPriceWithCurrency(currency, price)}
    </Heading>
  )

  const priceDisplayLogic = {
    additionalFee: () => (
      <PriceHeading
        price={Number(originalFee) + Number(additionalFee)}
        currency={currency}
        className="text-2xl"
        data-testid={'additional-fee-price'}
      />
    ),
    defaultFeeAndDiscount: () => (
      <>
        <PriceHeading
          price={Number(originalFee)}
          currency={currency}
          className="text-xl font-normal line-through"
          data-testid={'original-fee-price'}
        />
        <PriceHeading
          price={Number(paymentAmount)}
          currency={currency}
          className="text-2xl"
          data-testid={'payment-amount-price'}
        />
      </>
    ),
    additionalFeeAndDiscount: () => (
      <>
        <PriceHeading
          price={Number(originalFee) + Number(additionalFee)}
          currency={currency}
          className="text-xl font-normal line-through"
          data-testid={'original-fee-price'}
        />
        <PriceHeading
          price={Number(paymentAmount)}
          currency={currency}
          className="text-2xl"
          data-testid={'payment-amount-price'}
        />
      </>
    ),
    default: () => (
      <PriceHeading
        price={Number(paymentAmount) ?? 0}
        currency={currency}
        className="text-2xl"
        data-testid={'payment-amount-price'}
      />
    ),
  }

  const finalHeadingArray = () => {
    if (actualCouponDiscount > 0 && Number(additionalFee) > 0) {
      return priceDisplayLogic.additionalFeeAndDiscount()
    } else if (actualCouponDiscount > 0) {
      return priceDisplayLogic.defaultFeeAndDiscount()
    } else if (Number(additionalFee) > 0) {
      return priceDisplayLogic.additionalFee()
    }
    return priceDisplayLogic.default()
  }

  return <div className="box-col-full">{finalHeadingArray()}</div>
}

export default FinalPrice
