import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { CourseSelectorItem } from '@/components/Selector/CourseSelector'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useCourseData from '@/hooks/useCourseData'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { BundleTable } from '@/types/bundleDiscounts'
import { DiscountType } from '@/types/coupon'
import { Course } from '@/types/course'

import { BundleFormData } from './CreateBundleDiscount'
import CreateBundleForm from './CreateBundleForm'

// Helper function to convert classes to selector items with filtering
const classesToSelectorItems = (
  courses: Course[],
  currentSiteId: number,
  currentInstitutionId: number
): CourseSelectorItem[] => {
  const classes: CourseSelectorItem[] = []

  courses.forEach(course => {
    if (
      course.siteId === currentSiteId &&
      course.institutionId === currentInstitutionId
    ) {
      if (course.classes && course.classes.length > 0) {
        course.classes.forEach(classItem => {
          if (
            classItem.siteId === currentSiteId &&
            classItem.institutionId === currentInstitutionId
          ) {
            classes.push({
              value: classItem.id.toString(),
              label: `${classItem.name} - ${course.name} (${classItem.tuition} ${classItem.priceType})`,
            })
          }
        })
      }
    }
  })

  return classes
}

const EditBundleDiscount = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bundleId } = useParams<{ bundleId: string }>()
  const parsedBundleId = parseInt(bundleId ?? '0', 10)

  const {
    useFetchBundleDiscountById,
    useUpdateBundleDiscount,
    useToggleBundleDiscountStatus,
  } = usePromotionData()

  const { schoolData } = useSchoolData()
  const { courseData } = useCourseData()
  const { siteData } = useSiteData()

  const currentInstitutionId = schoolData.currentSchool?.id ?? 0
  const currentSiteId = schoolData.currentSchool?.siteId ?? 0

  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [formData, setFormData] = useState<BundleFormData>({
    name: '',
    minQty: 3,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 12,
    applyToAll: true,
    selectedItems: [],
    startDate: null,
    endDate: null,
    autoApply: false,
    retroactive: false,
  })

  // Fetch bundle data
  const {
    data: bundleData,
    isLoading: isFetchingBundle,
    isError: fetchError,
  } = useFetchBundleDiscountById(parsedBundleId, data => {
    // Populate form with existing data
    setFormData({
      name: data.name,
      minQty: data.bundleTable?.at(0)?.amount ?? 3,
      discountType: data.discountType as DiscountType,
      discountValue: data.bundleTable?.at(0)?.discount ?? 0,
      applyToAll: data.isAllItems,
      selectedItems: data.applicableItemIds?.map(id => id.toString()) ?? [],
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      autoApply: data.isAutoApply,
      retroactive: data.isRetroactive,
    })
  })

  const updateBundleMutation = useUpdateBundleDiscount()
  const toggleStatusMutation = useToggleBundleDiscountStatus()

  // Convert classes
  const classSelectorOptions = classesToSelectorItems(
    courseData.courses,
    currentSiteId,
    currentInstitutionId
  )

  // Generate bundle table based on form data
  const generateBundleTable = (): BundleTable => {
    return [{ amount: formData.minQty, discount: formData.discountValue }]
  }

  // Generate applicable item IDs based on form data
  const getApplicableItemIds = (): number[] => {
    if (formData.applyToAll) {
      return []
    }
    return formData.selectedItems.map(id => parseInt(id, 10))
  }

  const handleUpdateBundle = async () => {
    // Validation
    if (!formData.applyToAll && formData.selectedItems.length === 0) {
      toast.error(t('bundleDiscount.validation.selectClass'))
      return
    }

    if (!formData.name.trim()) {
      toast.error(t('bundleDiscount.validation.nameRequired'))
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error(t('bundleDiscount.validation.datesRequired'))
      return
    }

    if (formData.startDate >= formData.endDate) {
      toast.error(t('bundleDiscount.validation.datesInvalid'))
      return
    }

    try {
      await updateBundleMutation.mutateAsync({
        bundleId: parsedBundleId,
        patch: {
          siteId: currentSiteId,
          institutionId: currentInstitutionId,
          name: formData.name,
          discountType: formData.discountType,
          applicableItemIds: getApplicableItemIds(),
          bundleTable: generateBundleTable(),
          isAllItems: formData.applyToAll,
          isAutoApply: formData.autoApply,
          isRetroactive: formData.retroactive,
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
      })

      toast.success(t('bundleDiscount.success.updateBundle'))
      navigate('/promotion/bundle-discounts')
    } catch (error) {
      console.error('Error updating bundle discount:', error)
      toast.error(t('bundleDiscount.error.updateFailed'))
    }
  }

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync(parsedBundleId)
    } catch (error) {
      console.error('Error toggling bundle status:', error)
      toast.error(t('bundleDiscount.error.toggleFailed'))
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('bundleDiscount.edit.title'),
    mode: 'back',
  }

  if (isFetchingBundle) {
    return <FullScreenLoading />
  }

  if (fetchError || !bundleData) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <Box css={{ padding: '$8', textAlign: 'center' }}>
          <p>{t('promotion:errors.notFoundOrLoadError')}</p>
          <Button onClick={() => navigate('/promotion/bundle-discounts')}>
            {t('bundleDiscount.action.backToList')}
          </Button>
        </Box>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout headerBackButton={headerBackButton}>
      <Box
        direction="column"
        justify="flex-start"
        align="flex-start"
        css={{
          padding: '$8',
          '@md': { padding: '$4' },
        }}
      >
        <CreateBundleForm
          setConfirmCreate={setConfirmUpdate}
          classes={classSelectorOptions}
          formData={formData}
          setFormData={setFormData}
          isEditing
          submitButtonText={t('promotion:bundleDiscount.action.updateCampaign')}
        />
      </Box>

      <CustomedAlertDialog
        open={confirmUpdate}
        setOpen={setConfirmUpdate}
        description={t('promotion:bundleDiscount.confirmUpdateBundle')}
        title={t('promotion:bundleDiscount.confirmUpdate')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.update')}
        onActionClick={() => {
          handleUpdateBundle()
          setConfirmUpdate(false)
        }}
      />
    </ContentLayout>
  )
}

export default EditBundleDiscount
