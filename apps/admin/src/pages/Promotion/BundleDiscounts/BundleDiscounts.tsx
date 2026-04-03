import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Button } from '@/components/ui/Button'
import usePromotionData from '@/hooks/usePromotionData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { promotionState } from '@/stores/promotionData'
import { BundleDiscount } from '@/types/bundleDiscounts'

import BundleCardComponent from '../components/BundleCard'

const BundleDiscountsCard = ({
  currency,
  bundle,
  onRefresh,
}: {
  currency?: string
  bundle: BundleDiscount
  onRefresh?: () => void
}): JSX.Element => {
  const { useDeleteBundleDiscount } = usePromotionData()
  const navigate = useNavigate()

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const deleteBundleDiscountResult = useDeleteBundleDiscount()
  const { t } = useTranslation()

  const handleDelete = async () => {
    try {
      await deleteBundleDiscountResult.mutateAsync(bundle.id)
      setShowConfirmDelete(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting bundle discount:', error)
      toast.error(t('promotion:errors.deleteFailed'))
    }
  }

  const handleEdit = () => {
    navigate(`/promotion/bundle-discounts/edit/${bundle.id}`)
  }

  const handleDetail = () => {
    navigate(`/promotion/bundle-discounts/detail/${bundle.id}`)
  }

  return (
    <Box
      key={bundle.id}
      direction="column"
      css={{ border: '1px solid $borderColor', padding: '$4' }}
    >
      <BundleCardComponent
        bundleDiscounts={bundle}
        // bundleTable={bundle.bundleTable}
        currency={currency}
        onEdit={handleEdit}
        onDelete={() => setShowConfirmDelete(true)}
        onDetail={handleDetail}
      />

      <CustomedAlertDialog
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        description={t('promotion:bundleDiscount.deleteAction.description', {
          bundleName: bundle.name,
        })}
        title={t('promotion:bundleDiscount.deleteAction.title')}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.confirm')}
        onActionClick={handleDelete}
      />
    </Box>
  )
}

const BundleDiscountsPage = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [promotionData] = useRecoilState(promotionState)
  const { useFetchAllBundleDiscountsData } = usePromotionData()
  const fetchBundleDiscountsDataResult = useFetchAllBundleDiscountsData()
  const { siteData } = useSiteData()

  const { isLoading, isError, isSuccess, isIdle, data, refetch } =
    fetchBundleDiscountsDataResult

  const hasBundleDiscount = true

  const currency = siteData.currentSite?.currency

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.bundleDiscount'),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Button onClick={() => navigate('/promotion/bundle-discounts/add')}>
      {t('common:action.create')}
    </Button>
  )

  // Filter active and inactive bundles
  const activeBundles = data?.filter(bundle => bundle.isActive) || []
  const inactiveBundles = data?.filter(bundle => !bundle.isActive) || []

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      leftHeader={<></>}
      rightHeader={rightHeaderContent}
    >
      {isIdle && (
        <FullScreenAlertBox text={t('promotion:bundleDiscount.noBundles')} />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t('common:errors.UNKNOWN_ERROR')} />
      )}
      {isSuccess && data && data.length === 0 && (
        <FullScreenAlertBox text={t('promotion:bundleDiscount.noBundles')} />
      )}
      {isSuccess && data && data.length > 0 && (
        <Box direction="column">
          <div className="w-full p-4 space-y-6">
            {/* Active Bundles */}
            {activeBundles.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Bundle Discounts ({activeBundles.length})
                </h2>
                <div className="space-y-4">
                  {activeBundles.map(bundle => (
                    <BundleDiscountsCard
                      key={bundle.id}
                      currency={currency}
                      bundle={bundle}
                      onRefresh={() => refetch()}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Bundles */}
            {inactiveBundles.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-500">
                  Inactive Bundle Discounts ({inactiveBundles.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {inactiveBundles.map(bundle => (
                    <BundleDiscountsCard
                      key={bundle.id}
                      currency={currency}
                      bundle={bundle}
                      onRefresh={() => refetch()}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Box>
      )}
    </ContentLayout>
  )
}

export default BundleDiscountsPage
