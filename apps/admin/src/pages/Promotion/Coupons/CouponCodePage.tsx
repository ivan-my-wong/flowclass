import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'

import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import usePromotionData from '@/hooks/usePromotionData'
import ContentLayout from '@/layouts/ContentLayout'
import { promotionState } from '@/stores/promotionData'
import { CouponStatusEnum, DiscountType, PromotionType } from '@/types/coupon'

import CouponCard from '../components/CouponCard'

import CreateCouponCode from './CreateCouponCode'

const CouponCodePage = (): JSX.Element => {
  const { t } = useTranslation()
  const [couponData] = useRecoilState(promotionState)
  const { useFetchAllCouponData } = usePromotionData()
  const fetchCouponDataResult = useFetchAllCouponData()
  const [isOpenCreatePage, setIsOpenCreatePage] = useState<boolean>(false)
  const { isLoading, isError, isSuccess, isIdle, data } = fetchCouponDataResult
  const hasCouponAccess = true

  const [searchParams] = useSearchParams()
  const idStudent = searchParams.get('student')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (idStudent) {
      setIsOpenCreatePage(true)
    }
  }, [idStudent])

  useEffect(() => {
    if (!isOpenCreatePage) {
      queryClient.invalidateQueries(QUERY_KEY.promotion.promotionListCouponKey)
    }
  }, [isOpenCreatePage])

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.promotion'),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Box>
      <Button
        data-testid="add-coupon-btn"
        onClick={() => setIsOpenCreatePage(!isOpenCreatePage)}
      >
        {t('common:action.add')}
      </Button>
    </Box>
  )
  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      leftHeader={<></>}
      rightHeader={rightHeaderContent}
    >
      {isIdle && (
        <FullScreenAlertBox text={t(`promotion:couponCodeNotFound`)} />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && data && data.length === 0 && (
        <FullScreenAlertBox text={t(`promotion:couponCodeNotFound`)} />
      )}
      {isSuccess && couponData.coupons && couponData.coupons.length > 0 && (
        <Box
          padding="medium"
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            width: '100%',
            '@md': { gridTemplateColumns: '1fr 1fr' },
            '@sm': { gridTemplateColumns: '1fr' },
          }}
        >
          {couponData.coupons.map(coupon => {
            return (
              <CouponCard
                id={coupon.id || 0}
                key={coupon.id}
                code={coupon.code}
                quota={coupon.quota}
                amount={
                  coupon.discountType === DiscountType.PERCENTAGE
                    ? `${coupon.amount} %`
                    : `$ ${coupon.amount}`
                }
                isActive={coupon.status === CouponStatusEnum.active}
                description=""
                usage={coupon.usedCount ?? 0}
                date={coupon.expireDate ? coupon.expireDate.toString() : ''}
                handleReload={() => {
                  queryClient.invalidateQueries(
                    QUERY_KEY.promotion.promotionListCouponKey
                  )
                }}
              />
            )
          })}
        </Box>
      )}
      <CreateCouponCode
        open={isOpenCreatePage}
        handleClose={() => setIsOpenCreatePage(false)}
      />
    </ContentLayout>
  )
}

export default CouponCodePage
