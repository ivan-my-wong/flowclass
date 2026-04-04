import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import usePromotionData from '@/hooks/usePromotionData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { formatCurrency } from '@/utils/currency'

const PackageDiscountDetail = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { packageDiscountId } = useParams<{ packageDiscountId: string }>()

  const {
    useFetchPackageDiscountById,
    useDeletePackageDiscount,
    useTogglePackageDiscountStatus,
  } = usePromotionData()

  const { siteData } = useSiteData()
  const currency = siteData.currentSite?.currency ?? 'HK$'

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const {
    data: packageData,
    isLoading,
    isError,
    refetch,
  } = useFetchPackageDiscountById(parseInt(packageDiscountId || '0', 10))

  const deleteMutation = useDeletePackageDiscount()
  const toggleStatusMutation = useTogglePackageDiscountStatus()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(parseInt(packageDiscountId || '0', 10))
      navigate('/promotion/package-discounts')
    } catch (error) {
      console.error('Error deleting package discount:', error)
      toast.error(t('promotion:errors.deleteFailed'))
    }
  }

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync(
        parseInt(packageDiscountId || '0', 10)
      )
      refetch()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: packageData?.name || t('promotion:packageDiscount.detailTitle'),
    mode: 'back',
  }

  const rightHeaderContent = packageData && (
    <Box css={{ gap: '$2' }}>
      <Button
        onClick={handleToggleStatus}
        disabled={toggleStatusMutation.isLoading}
      >
        {packageData.isActive
          ? t('common:action.deactivate')
          : t('common:action.activate')}
      </Button>
      <Button
        onClick={() =>
          navigate(`/promotion/package-discounts/edit/${packageDiscountId}`)
        }
      >
        {t('common:action.edit')}
      </Button>
      <Button onClick={() => setShowConfirmDelete(true)}>
        {t('common:action.delete')}
      </Button>
    </Box>
  )

  if (isLoading) return <FullScreenLoading />

  if (isError || !packageData) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <FullScreenAlertBox text={t('promotion:packageDiscount.notFound')} />
      </ContentLayout>
    )
  }

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={rightHeaderContent}
    >
      <Box
        direction="column"
        justify="flex-start"
        align="flex-start"
        css={{ padding: '$8', '@md': { padding: '$4' } }}
      >
        <div className="w-full max-w-2xl space-y-6">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{packageData.name}</h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  packageData.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {packageData.isActive
                  ? t('common:status.active')
                  : t('common:status.inactive')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">
                  {t('promotion:packageDiscount.form.amountPerLesson')}
                </span>
                <p className="font-semibold">
                  {formatCurrency(packageData.amountPerLesson, currency)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">
                  {t('promotion:packageDiscount.applicableTo')}
                </span>
                <p className="font-semibold">
                  {packageData.isAllClasses
                    ? t('promotion:packageDiscount.allClasses')
                    : `${packageData.applicableClassIds?.length ?? 0} ${t(
                        'promotion:packageDiscount.classes'
                      )}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Box>

      <CustomedAlertDialog
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        description={t('promotion:packageDiscount.deleteAction.description', {
          name: packageData.name,
        })}
        title={t('promotion:packageDiscount.deleteAction.title')}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.delete')}
        onActionClick={() => {
          handleDelete()
          setShowConfirmDelete(false)
        }}
      />
    </ContentLayout>
  )
}

export default PackageDiscountDetail
