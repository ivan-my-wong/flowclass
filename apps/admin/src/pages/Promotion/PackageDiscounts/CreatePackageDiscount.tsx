import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useCourseData from '@/hooks/useCourseData'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'

import PackageDiscountForm, {
  PackageDiscountFormData,
} from './PackageDiscountForm'

const CreatePackageDiscount = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useCreatePackageDiscount } = usePromotionData()
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const { courseData } = useCourseData()

  const currentInstitutionId = schoolData.currentSchool?.id ?? 0
  const currentSiteId = schoolData.currentSchool?.siteId ?? 0

  const [confirmCreate, setConfirmCreate] = useState(false)
  const [formData, setFormData] = useState<PackageDiscountFormData>({
    name: '',
    amountPerLesson: 0,
    isAllClasses: true,
    applicableClassIds: [],
  })

  const createMutation = useCreatePackageDiscount()

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
    setConfirmCreate(true)
  }

  const handleConfirm = async () => {
    try {
      await createMutation.mutateAsync({
        siteId: currentSiteId,
        institutionId: currentInstitutionId,
        name: formData.name,
        amountPerLesson: formData.amountPerLesson,
        isAllClasses: formData.isAllClasses,
        applicableClassIds: formData.isAllClasses
          ? null
          : formData.applicableClassIds,
      })
      navigate('/promotion/package-discounts')
    } catch {
      // error handled in hook
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.packageDiscount'),
    mode: 'add',
  }

  return (
    <ContentLayout headerBackButton={headerBackButton}>
      <div className="p-6">
        <PackageDiscountForm
          formData={formData}
          setFormData={setFormData}
          classOptions={classOptions}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isLoading}
          submitLabel={t('common:action.create') as string}
        />
      </div>

      <CustomedAlertDialog
        open={confirmCreate}
        setOpen={setConfirmCreate}
        title={t('promotion:packageDiscount.confirmCreateTitle')}
        description={t('promotion:packageDiscount.confirmCreate')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.confirm')}
        onActionClick={() => {
          handleConfirm()
          setConfirmCreate(false)
        }}
      />
    </ContentLayout>
  )
}

export default CreatePackageDiscount
