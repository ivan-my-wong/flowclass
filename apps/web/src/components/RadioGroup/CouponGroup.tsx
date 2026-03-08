import React, { ComponentProps } from 'react'

import { Indicator, Item, Root } from '@radix-ui/react-radio-group'
import moment from 'moment'
import useTranslation from 'next-translate/useTranslation'
import { RiCoupon3Fill } from 'react-icons/ri'

import { Coupon } from '@/types/coupon'

import { CouponValue } from '../Popups/CouponDialog'

import { radioIndicatorClasses, radioItemClasses } from '.'

export type RadioGroupProps = {
  ariaLabel?: string
  itemValues?: Coupon[]
  onChange: (value: string) => any
  selectedCouponCode: CouponValue
} & ComponentProps<typeof Root>

const CouponGroup = ({
  itemValues,
  ariaLabel,
  onChange,
  selectedCouponCode,
  ...props
}: RadioGroupProps) => {
  const { t } = useTranslation()
  return (
    <Root
      className="flex max-h-80 flex-col gap-2.5 overflow-y-auto px-2"
      value={selectedCouponCode.couponCode}
      aria-label={ariaLabel}
      onValueChange={onChange}
      {...props}
    >
      {itemValues?.map((item: Coupon, idx) => {
        const amountInString =
          item.discountType === 'percentage' ? `${item.amount}%` : `$${item.amount}`

        return (
          <Item
            className=" border-backgroundLayer3 radix-state-checked:border-overlayColor
          group flex items-center rounded-md border-2 p-4"
            key={idx}
            value={item.code}
            id={item.code}
          >
            <div className={radioItemClasses}>
              <Indicator className={radioIndicatorClasses} />
            </div>
            <label
              htmlFor={item.code}
              className="ml-4 flex flex-col items-start gap-1 break-words text-start"
            >
              <p className="text-lg font-medium">{`${amountInString} ${t(
                'enrol:coupon.discount'
              )}`}</p>
              <p className="input-label -ml-2 text-lg font-medium">{`${t(
                'enrol:coupon.discountCode'
              )}: ${item.code}`}</p>
              <p className=" text-textSubtle text-xs">
                {`${t('enrol:coupon.validDate')} ${moment(item.expireDate?.toString()).format(
                  'DD MMM YYYY'
                )}`}
              </p>
              <p className=" text-textSubtle text-xs">{`${t('enrol:coupon.quota')}: ${
                item.quota
              }`}</p>
            </label>
            <RiCoupon3Fill className="group-radix-state-checked:-rotate-45 group-radix-state-checked:text-text text-textDisabled ml-auto rotate-0 self-start text-xl" />
          </Item>
        )
      })}
    </Root>
  )
}

export default CouponGroup
