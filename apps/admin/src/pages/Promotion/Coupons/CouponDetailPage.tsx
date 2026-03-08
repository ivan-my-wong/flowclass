import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { BiSolidTrashAlt } from 'react-icons/bi'
import { BsFillMoonFill } from 'react-icons/bs'
import { useRecoilState } from 'recoil'

import Button from '@/components/Buttons/Button'
import LoadingButton from '@/components/Buttons/LoadingButton'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import usePromotionData from '@/hooks/usePromotionData'
import { useResponsive } from '@/hooks/useResponsive'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { promotionState } from '@/stores/promotionData'
import { Coupon, CouponStatusEnum } from '@/types/coupon'

import CouponHistory from '../components/CouponHistory'
import CouponInformation from '../components/CouponInformation'

const CouponDetailPage = (): JSX.Element => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const navigate = useNavigate()
  const { useFetchCurrentCoupon, useUpdateStatusCoupon } = usePromotionData()
  const { useDeleteCoupon } = usePromotionData()
  const [selectedTab, setSelectedTab] = useState<number>(1)
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [showConfirmInactivePopup, setShowConfirmInactivePopup] =
    useState<boolean>(false)
  const [couponRecoilState, setCouponRecoilState] =
    useRecoilState(promotionState)
  const [currentCoupon, setCurrentCoupon] = useState<Coupon>()

  const { isLoading, isError, isSuccess, isIdle } = useFetchCurrentCoupon(
    newCoupon => {
      const newCouponData = JSON.parse(JSON.stringify(newCoupon))
      if (!newCouponData?.usedCount && newCouponData?.usage) {
        newCouponData.usedCount = newCouponData?.usage
      }
      if (!couponRecoilState.currentCoupon) {
        setCurrentCoupon(newCouponData)
        setCouponRecoilState({
          ...couponRecoilState,
          currentCoupon: newCouponData,
        })
      } else {
        setCurrentCoupon(newCouponData)
      }
    }
  )

  const deleteCoupon = useDeleteCoupon()
  const handleDeleteCoupon = () => {
    if (currentCoupon?.id) {
      deleteCoupon.mutateAsync(currentCoupon?.id)
      setTimeout(() => {
        navigate('/promotion/coupon-code')
      }, 1000)
    }
  }
  const updateStatusCoupon = useUpdateStatusCoupon(currentCoupon?.id || 0)
  const handleInactive = () => {
    updateStatusCoupon
      .mutateAsync({
        status: CouponStatusEnum.inActive,
      })
      .then(() => {
        const newCurrentCoupon: any = {
          ...currentCoupon,
          status: CouponStatusEnum.inActive,
        }
        setCurrentCoupon(newCurrentCoupon)
      })
  }
  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:CouponCodeDetail'),
    mode: 'backWithWords',
    action: () => {
      navigate('/promotion/coupon-code')
    },
  }

  const rightHeaderContent =
    currentCoupon?.status === CouponStatusEnum.inActive ? (
      <Button
        variants="warn"
        onClick={() => setShowConfirmPopup(true)}
        iconBefore={<BiSolidTrashAlt />}
      >
        {t('common:action.delete')}
      </Button>
    ) : (
      <LoadingButton
        isLoading={isLoading}
        variant={isLoading ? undefined : 'outline'}
        disabled={isLoading}
        onClick={() => setShowConfirmInactivePopup(true)}
        iconBefore={<BsFillMoonFill />}
      >
        {t('promotion:action.setAsInactive')}
      </LoadingButton>
    )

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={rightHeaderContent}
    >
      {isIdle && <FullScreenAlertBox text={t(`promotion:noCoupon`)} />}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && currentCoupon && (
        <>
          {isMobile ? (
            <Box direction="column">
              <Box
                css={{
                  padding: ' $2 $5 0 $5',
                  borderBottom: '1px solid $backgroundLayer3',
                }}
                align="flex-start"
                justify="space-between"
                gap="none"
              >
                <Box
                  css={{
                    zIndex: 10,
                    borderRight: '1px solid $backgroundLayer3',
                    borderLeft: '1px solid $backgroundLayer3',
                    borderTop: '1px solid $backgroundLayer3',
                    background:
                      selectedTab === 1 ? '$white' : '$backgroundLayer3',
                    padding: '$3',
                    color: selectedTab === 1 ? '$primary' : '$textSubtle',
                    fontWeight: selectedTab === 1 ? 'bold' : 'normal',
                  }}
                  onClick={() => setSelectedTab(1)}
                >
                  {t('promotion:basicInfor')}
                </Box>
                <Box
                  css={{
                    borderRight: '1px solid $backgroundDisabled',
                    borderTop: '1px solid $backgroundDisabled',
                    background:
                      selectedTab === 2 ? '$white' : '$backgroundDisabled',
                    padding: '$3',
                    color: selectedTab === 2 ? '$primary' : '$textSubtle',
                    fontWeight: selectedTab === 2 ? 'bold' : 'normal',
                  }}
                  onClick={() => setSelectedTab(2)}
                >
                  {t('promotion:history')}
                </Box>
              </Box>
              {selectedTab === 1
                ? currentCoupon && (
                    <CouponInformation currentCoupon={currentCoupon} />
                  )
                : currentCoupon && (
                    <CouponHistory currentCoupon={currentCoupon} />
                  )}
            </Box>
          ) : (
            <Box css={{ flexWrap: 'wrap' }} align="flex-start">
              {currentCoupon && (
                <>
                  <CouponInformation currentCoupon={currentCoupon} />
                  <CouponHistory currentCoupon={currentCoupon} />
                </>
              )}
            </Box>
          )}
        </>
      )}
      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('promotion:dialog:descriptionAlertDialog')}
        title={`${t('promotion:dialog:titleAlertDialog')}${
          currentCoupon && currentCoupon.code
        }`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleDeleteCoupon}
      />
      <CustomedAlertDialog
        open={showConfirmInactivePopup}
        setOpen={setShowConfirmInactivePopup}
        description={`${t('promotion:dialog:descriptionInactivelog')}
				${t('promotion:dialog:descriptionAlertDialog')}`}
        title={`${t('promotion:dialog:titleInactiveDialog')}${
          currentCoupon?.code
        }`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleInactive}
      />
    </ContentLayout>
  )
}

export default CouponDetailPage
