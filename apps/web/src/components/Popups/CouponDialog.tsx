import React, { useEffect, useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import useTranslation from 'next-translate/useTranslation'

import { Coupon } from '@/types/coupon'

import Button from '../Buttons/Button'
import CouponGroup from '../RadioGroup/CouponGroup'

import InfoDialog from './InfoDialog'

type CouponDialogProps = {
  title: string
  description: React.ReactNode
  trigger: React.ReactNode
  couponData?: Coupon[]
  onSubmit: (data: any) => void
  onCheckCoupon: (data: CouponValue) => void
}
export type CouponValue = {
  couponCode?: string
}

const CouponDialog = ({
  title,
  description,
  trigger,
  couponData,
  onSubmit,
  onCheckCoupon,
}: CouponDialogProps): React.ReactElement => {
  const [selectedCouponCode, setSelectedCouponCode] = useState<CouponValue>({
    couponCode: '',
  })
  const { t } = useTranslation()
  const handleCouponCodeValueChange = (value: string) => {
    setSelectedCouponCode({ couponCode: value })
  }

  useEffect(() => {
    setSelectedCouponCode({ couponCode: couponData?.[0]?.code })
  }, [couponData])

  return (
    <InfoDialog
      title={title}
      description={description}
      trigger={trigger}
      actionButtons={
        <Dialog.Close asChild>
          <Button onClick={() => onSubmit(onCheckCoupon(selectedCouponCode))}>
            {t('enrol:coupon.redeem')}
          </Button>
        </Dialog.Close>
      }
    >
      <CouponGroup
        itemValues={couponData}
        ariaLabel={'Coupon'}
        onChange={value => handleCouponCodeValueChange(value as string)}
        selectedCouponCode={selectedCouponCode}
      />
    </InfoDialog>
  )
}

export default CouponDialog
