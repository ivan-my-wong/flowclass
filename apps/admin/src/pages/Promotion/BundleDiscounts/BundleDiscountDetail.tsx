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
import BundleDetailView from '@/pages/Promotion/components/BundleDetail'
import { AlertTypes } from '@/reducers/confirm.reducers'

const BundleDiscountDetail = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bundleId } = useParams<{ bundleId: string }>()

  const {
    useFetchBundleDiscountById,
    useDeleteBundleDiscount,
    useToggleBundleDiscountStatus,
  } = usePromotionData()

  const { siteData } = useSiteData()
  const currency = siteData.currentSite?.currency

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const {
    data: bundleData,
    isLoading: isFetchingBundle,
    isError: fetchError,
    refetch,
  } = useFetchBundleDiscountById(parseInt(bundleId || '0', 10))

  const deleteBundleMutation = useDeleteBundleDiscount()
  const toggleStatusMutation = useToggleBundleDiscountStatus()

  const handleEdit = () => {
    navigate(`/promotion/bundle-discounts/edit/${bundleId}`)
  }

  const handleDelete = async () => {
    try {
      await deleteBundleMutation.mutateAsync(parseInt(bundleId || '0', 10))
      navigate('/promotion/bundle-discounts')
    } catch (error) {
      console.error('Error deleting bundle discount:', error)
      toast.error('Failed to delete bundle discount. Please try again.')
    }
  }

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync(parseInt(bundleId || '0', 10))
      refetch()
    } catch (error) {
      console.error('Error toggling bundle status:', error)
      toast.error(t('bundleDiscount.error.toggleStatus'))
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: bundleData?.name || t('bundleDiscount.details.title'),
    mode: 'back',
  }

  const rightHeaderContent = bundleData && (
    <Box css={{ gap: '$2' }}>
      <Button
        onClick={handleToggleStatus}
        disabled={toggleStatusMutation.isLoading}
      >
        {bundleData.isActive
          ? t('common:action.deactivate')
          : t('common:action.activate')}
      </Button>
      <Button onClick={handleEdit}>{t('common:action.edit')}</Button>
      <Button onClick={() => setShowConfirmDelete(true)}>
        {t('common:action.delete')}
      </Button>
    </Box>
  )

  if (isFetchingBundle) {
    return <FullScreenLoading />
  }

  if (fetchError || !bundleData) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <FullScreenAlertBox text={t('bundleDiscount.error.notFound')} />
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
        css={{
          padding: '$8',
          '@md': { padding: '$4' },
        }}
      >
        <BundleDetailView
          bundle={bundleData}
          currency={currency}
          onEdit={handleEdit}
          showActions={false}
        />
      </Box>

      <CustomedAlertDialog
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        description={t('bundleDiscount.deleteAction.description', {
          name: bundleData.name,
        })}
        title={t('bundleDiscount.deleteAction.title')}
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

export default BundleDiscountDetail
