import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
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
import { PackageDiscount } from '@/types/packageDiscounts'

import PackageDiscountCard from '../components/PackageDiscountCard'

const PackageDiscountListItem = ({
  currency,
  packageDiscount,
  onRefresh,
}: {
  currency?: string
  packageDiscount: PackageDiscount
  onRefresh?: () => void
}): JSX.Element => {
  const { useDeletePackageDiscount } = usePromotionData()
  const navigate = useNavigate()

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const deletePackageDiscountResult = useDeletePackageDiscount()
  const { t } = useTranslation()

  const handleDelete = async () => {
    try {
      await deletePackageDiscountResult.mutateAsync(packageDiscount.id)
      setShowConfirmDelete(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting package discount:', error)
      toast.error(t('promotion:errors.deleteFailed'))
    }
  }

  return (
    <Box
      key={packageDiscount.id}
      direction="column"
      css={{ border: '1px solid $borderColor', padding: '$4' }}
    >
      <PackageDiscountCard
        packageDiscount={packageDiscount}
        currency={currency}
        onEdit={() =>
          navigate(`/promotion/package-discounts/edit/${packageDiscount.id}`)
        }
        onDelete={() => setShowConfirmDelete(true)}
        onDetail={() =>
          navigate(`/promotion/package-discounts/detail/${packageDiscount.id}`)
        }
      />

      <CustomedAlertDialog
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        description={t('promotion:packageDiscount.deleteAction.description', {
          name: packageDiscount.name,
        })}
        title={t('promotion:packageDiscount.deleteAction.title')}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.confirm')}
        onActionClick={handleDelete}
      />
    </Box>
  )
}

const PackageDiscountsPage = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useFetchAllPackageDiscountsData } = usePromotionData()
  const fetchResult = useFetchAllPackageDiscountsData()
  const { siteData } = useSiteData()

  const { isLoading, isError, isSuccess, isIdle, data, refetch } = fetchResult
  const currency = siteData.currentSite?.currency

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.packageDiscount'),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Button onClick={() => navigate('/promotion/package-discounts/add')}>
      {t('common:action.create')}
    </Button>
  )

  const activeItems = data?.filter(pd => pd.isActive) || []
  const inactiveItems = data?.filter(pd => !pd.isActive) || []

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      leftHeader={<></>}
      rightHeader={rightHeaderContent}
    >
      {isIdle && (
        <FullScreenAlertBox
          text={t('promotion:packageDiscount.noPackageDiscounts')}
        />
      )}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t('common:errors.UNKNOWN_ERROR')} />
      )}
      {isSuccess && data && data.length === 0 && (
        <FullScreenAlertBox
          text={t('promotion:packageDiscount.noPackageDiscounts')}
        />
      )}
      {isSuccess && data && data.length > 0 && (
        <Box direction="column">
          <div className="w-full p-4 space-y-6">
            {activeItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('promotion:packageDiscount.activeCount', {
                    count: activeItems.length,
                  })}
                </h2>
                <div className="space-y-4">
                  {activeItems.map(pd => (
                    <PackageDiscountListItem
                      key={pd.id}
                      currency={currency}
                      packageDiscount={pd}
                      onRefresh={() => refetch()}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-500">
                  {t('promotion:packageDiscount.inactiveCount', {
                    count: inactiveItems.length,
                  })}
                </h2>
                <div className="space-y-4 opacity-60">
                  {inactiveItems.map(pd => (
                    <PackageDiscountListItem
                      key={pd.id}
                      currency={currency}
                      packageDiscount={pd}
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

export default PackageDiscountsPage
