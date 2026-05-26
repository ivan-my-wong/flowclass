import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Button } from '@/components/ui/Button'
import useCourseData from '@/hooks/useCourseData'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'

import PackageDiscountForm, {
  PackageDiscountFormData,
} from './PackageDiscountForm'

const EditPackageDiscount = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { packageDiscountId } = useParams<{ packageDiscountId: string }>()
  const parsedId = parseInt(packageDiscountId ?? '0', 10)

  const {
    useFetchPackageDiscountById,
    useUpdatePackageDiscount,
    useTogglePackageDiscountStatus,
  } = usePromotionData()
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const { courseData } = useCourseData()

  const currentInstitutionId = schoolData.currentSchool?.id ?? 0
  const currentSiteId = schoolData.currentSchool?.siteId ?? 0

  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [formData, setFormData] = useState<PackageDiscountFormData>({
    name: '',
    amountPerLesson: 0,
    isAllClasses: true,
    applicableClassIds: [],
  })

  const {
    isLoading,
    isError,
    data: currentData,
  } = useFetchPackageDiscountById(parsedId, data => {
    setFormData({
      name: data.name,
      amountPerLesson: data.amountPerLesson,
      isAllClasses: data.isAllClasses,
      applicableClassIds: data.applicableClassIds ?? [],
    })
  })

  const updateMutation = useUpdatePackageDiscount()
  const toggleMutation = useTogglePackageDiscountStatus()

  const classOptions = courseData.courses.flatMap(course =>
    (course.classes ?? [])
      .filter(
        cls =>
          cls.siteId === currentSiteId &&
          cls.institutionId === currentInstitutionId
      )
      .map(cls => ({
        id: cls.id,
        label: `${cls.name} — ${course.name}`,
      }))
  )

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error(t('promotion:errors.nameRequired'))
      return
    }
    if (formData.amountPerLesson <= 0) {
      toast.error(t('promotion:packageDiscount.errors.amountRequired'))
      return
    }
    if (!formData.isAllClasses && formData.applicableClassIds.length === 0) {
      toast.error(t('promotion:errors.classRequired'))
      return
    }
    setConfirmUpdate(true)
  }

  const handleConfirm = async () => {
    try {
      await updateMutation.mutateAsync({
        packageDiscountId: parsedId,
        patch: {
          name: formData.name,
          amountPerLesson: formData.amountPerLesson,
          isAllClasses: formData.isAllClasses,
          applicableClassIds: formData.isAllClasses
            ? null
            : formData.applicableClassIds,
        },
      })
      navigate('/promotion/package-discounts')
    } catch {
      // error handled in hook
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:packageDiscount.editTitle'),
    mode: 'back',
  }

  if (isLoading) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
          {t('common:loading')}
        </div>
      </ContentLayout>
    )
  }

  if (isError) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <div className="p-6 text-center space-y-3">
          <p className="text-sm text-gray-500">
            {t('promotion:packageDiscount.notFound')}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/promotion/package-discounts')}
          >
            {t('common:action.back')}
          </Button>
        </div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout headerBackButton={headerBackButton}>
      <div className="p-6 space-y-6">
        <PackageDiscountForm
          formData={formData}
          setFormData={setFormData}
          classOptions={classOptions}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isLoading}
          submitLabel={t('common:action.update') as string}
        />

        <div className="border-t pt-4">
          <Button
            variant="outline"
            loading={toggleMutation.isLoading}
            onClick={() => toggleMutation.mutate(parsedId)}
          >
            {currentData?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      <CustomedAlertDialog
        open={confirmUpdate}
        setOpen={setConfirmUpdate}
        title={t('promotion:packageDiscount.confirmUpdateTitle')}
        description={t('promotion:packageDiscount.confirmUpdate')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.update')}
        onActionClick={() => {
          handleConfirm()
          setConfirmUpdate(false)
        }}
      />
    </ContentLayout>
  )
}

export default EditPackageDiscount
