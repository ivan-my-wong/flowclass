import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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

const PackageDiscountRow = ({
  packageDiscount,
  currency,
  onRefresh,
}: {
  packageDiscount: PackageDiscount
  currency?: string
  onRefresh?: () => void
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useDeletePackageDiscount } = usePromotionData()
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const deleteMutation = useDeletePackageDiscount()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(packageDiscount.id)
      setShowConfirmDelete(false)
      onRefresh?.()
    } catch {
      toast.error(t('promotion:errors.deleteFailed'))
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
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
        title={t('promotion:packageDiscount.deleteAction.title')}
        description={t('promotion:packageDiscount.deleteAction.description', {
          name: packageDiscount.name,
        })}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.confirm')}
        onActionClick={handleDelete}
      />
    </div>
  )
}

const PackageDiscountsPage = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useFetchAllPackageDiscountsData } = usePromotionData()
  const { siteData } = useSiteData()
  const { isLoading, isError, isSuccess, isIdle, data, refetch } =
    useFetchAllPackageDiscountsData()

  const currency = siteData.currentSite?.currency

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.packageDiscount'),
    mode: 'add',
  }

  const active = data?.filter(pd => pd.isActive) ?? []
  const inactive = data?.filter(pd => !pd.isActive) ?? []

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      leftHeader={<></>}
      rightHeader={
        <Button onClick={() => navigate('/promotion/package-discounts/add')}>
          {t('common:action.create')}
        </Button>
      }
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
        <div className="w-full p-4 space-y-6">
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('promotion:packageDiscount.activeCount', {
                  count: active.length,
                })}
              </h2>
              {active.map(pd => (
                <PackageDiscountRow
                  key={pd.id}
                  packageDiscount={pd}
                  currency={currency}
                  onRefresh={refetch}
                />
              ))}
            </div>
          )}
          {inactive.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-500">
                {t('promotion:packageDiscount.inactiveCount', {
                  count: inactive.length,
                })}
              </h2>
              <div className="opacity-60 space-y-3">
                {inactive.map(pd => (
                  <PackageDiscountRow
                    key={pd.id}
                    packageDiscount={pd}
                    currency={currency}
                    onRefresh={refetch}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ContentLayout>
  )
}

export default PackageDiscountsPage
