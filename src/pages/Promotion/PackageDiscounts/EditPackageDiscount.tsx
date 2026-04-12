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
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Course } from '@/types/course'

import { PackageFormData } from './CreatePackageDiscount'
import CreatePackageDiscountForm from './CreatePackageDiscountForm'

const classesToSelectorItems = (
  courses: Course[],
  currentSiteId: number,
  currentInstitutionId: number
): CourseSelectorItem[] => {
  const classes: CourseSelectorItem[] = []
  courses.forEach(course => {
    if (
      course.siteId === currentSiteId &&
      course.institutionId === currentInstitutionId &&
      course.classes?.length
    ) {
      course.classes.forEach(classItem => {
        if (
          classItem.siteId === currentSiteId &&
          classItem.institutionId === currentInstitutionId
        ) {
          classes.push({
            value: classItem.id.toString(),
            label: `${classItem.name} - ${course.name}`,
          })
        }
      })
    }
  })
  return classes
}

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
  const { courseData } = useCourseData()

  const currentInstitutionId = schoolData.currentSchool?.id ?? 0
  const currentSiteId = schoolData.currentSchool?.siteId ?? 0

  const [confirmUpdate, setConfirmUpdate] = useState(false)
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    amountPerLesson: 0,
    selectedClassIds: [],
  })

  const {
    data: packageData,
    isLoading,
    isError,
  } = useFetchPackageDiscountById(parsedId, data => {
    setFormData({
      name: data.name,
      amountPerLesson: data.amountPerLesson,
      selectedClassIds: data.applicableClassIds?.map(id => id.toString()) ?? [],
    })
  })

  const updateMutation = useUpdatePackageDiscount()
  const toggleStatusMutation = useTogglePackageDiscountStatus()

  const classSelectorOptions = classesToSelectorItems(
    courseData.courses,
    currentSiteId,
    currentInstitutionId
  )

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error(t('promotion:errors.nameRequired'))
      return
    }
    if (formData.amountPerLesson <= 0) {
      toast.error(t('promotion:packageDiscount.errors.amountRequired'))
      return
    }
    try {
      await updateMutation.mutateAsync({
        packageDiscountId: parsedId,
        patch: {
          name: formData.name,
          amountPerLesson: formData.amountPerLesson,
          isAllClasses: false,
          applicableClassIds: formData.selectedClassIds.map(id =>
            parseInt(id, 10)
          ),
        },
      })

      navigate('/promotion/package-discounts')
    } catch (error) {
      console.error('Error updating package discount:', error)
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:packageDiscount.editTitle'),
    mode: 'back',
  }

  if (isLoading) return <FullScreenLoading />

  if (isError || !packageData) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <Box css={{ padding: '$8', textAlign: 'center' }}>
          <p>{t('promotion:errors.notFoundOrLoadError')}</p>
          <Button onClick={() => navigate('/promotion/package-discounts')}>
            {t('common:action.back')}
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
        css={{ padding: '$8', '@md': { padding: '$4' } }}
      >
        <CreatePackageDiscountForm
          formData={formData}
          setFormData={setFormData}
          classes={classSelectorOptions}
          onSubmit={() => setConfirmUpdate(true)}
          isEditing
          submitButtonText={t('common:action.update') as string}
        />
      </Box>

      <CustomedAlertDialog
        open={confirmUpdate}
        setOpen={setConfirmUpdate}
        description={t('promotion:packageDiscount.confirmUpdate')}
        title={t('promotion:packageDiscount.confirmUpdateTitle')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.update')}
        onActionClick={() => {
          handleUpdate()
          setConfirmUpdate(false)
        }}
      />
    </ContentLayout>
  )
}

export default EditPackageDiscount
