import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaInfinity } from 'react-icons/fa'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import ProgressBar from '@/components/ProgressIndicator/ProgressBar'
import Separator from '@/components/Separators/Separator'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import usePromotionData from '@/hooks/usePromotionData'
import { useResponsive } from '@/hooks/useResponsive'
import { Coupon, HistoryCouponProps } from '@/types/coupon'

import CouponActivity from './CouponActivity'

type CouponInformationProps = {
  currentCoupon: Coupon
}
const CouponHistory = ({
  currentCoupon,
}: CouponInformationProps): React.ReactElement => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const { useFetchHistoryCoupon } = usePromotionData()

  const [historyData, setHistoryData] = useState<HistoryCouponProps[]>([])

  const { isSuccess } = useFetchHistoryCoupon(newCoupon => {
    if (newCoupon) {
      setHistoryData(newCoupon)
    }
  })

  return (
    <Box
      justify="flex-start"
      align="flex-start"
      padding="large"
      direction="column"
      css={{
        width: '60%',
        // paddingTop: '$8',
        '@sm': {
          width: '100% !important',
          // padding: isMobile ? '$2' : '$8',
          border: isMobile ? 'none' : '1px solid $borderColor',
        },
      }}
    >
      <Heading as="h2">{t('promotion:history')}</Heading>
      <Text bold size="medium" css={{ flexShrink: 0 }}>
        {t('promotion:totalUsage')}
      </Text>
      <Box justify="space-between">
        <ProgressBar
          percentage={
            (currentCoupon.usedCount ?? 0 / currentCoupon.quota) * 100
          }
        />
        <Button
          variants="outlined"
          css={{
            borderRadius: '$3',
            height: '30px',
            gap: '$1',
            pointerEvents: 'none',
          }}
          // css={{ color: '$primary', border: '1px solid', padding: '10' }}
        >
          {`${currentCoupon?.usedCount ?? 0} /`}
          {currentCoupon.quota > 99999 ? <FaInfinity /> : currentCoupon.quota}
        </Button>
      </Box>

      <Separator />

      <Box direction="column" justify="flex-start" align="flex-start">
        {isSuccess &&
          historyData &&
          historyData.map(history => {
            return (
              <CouponActivity
                key={history.id}
                currentCoupon={currentCoupon}
                history={history}
              />
            )
          })}
      </Box>
    </Box>
  )
}
export default CouponHistory
