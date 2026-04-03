import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { CourseSelectorItem } from '@/components/Selector/CourseSelector'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useCourseData from '@/hooks/useCourseData'
import usePromotionData from '@/hooks/usePromotionData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Course } from '@/types/course'

import CreatePackageDiscountForm from './CreatePackageDiscountForm'

export interface PackageFormData {
  name: string
  amountPerLesson: number
  selectedClassIds: string[]
}

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

const CreatePackageDiscount = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useCreatePackageDiscount } = usePromotionData()
  const createMutation = useCreatePackageDiscount()
  const { schoolData } = useSchoolData()
  const { courseData } = useCourseData()

  const [confirmCreate, setConfirmCreate] = useState(false)

  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    amountPerLesson: 0,
    selectedClassIds: [],
  })

  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const currentSiteId = schoolData.currentSchool?.siteId || 0

  const classSelectorOptions = classesToSelectorItems(
    courseData.courses,
    currentSiteId,
    currentInstitutionId
  )

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error(t('promotion:errors.nameRequired'))
      return
    }
    if (formData.amountPerLesson <= 0) {
      toast.error(t('promotion:packageDiscount.errors.amountRequired'))
      return
    }
    if (formData.selectedClassIds.length === 0) {
      toast.error(t('promotion:errors.classRequired'))
      return
    }
    try {
      await createMutation.mutateAsync({
        siteId: currentSiteId,
        institutionId: currentInstitutionId,
        name: formData.name,
        amountPerLesson: formData.amountPerLesson,
        isAllClasses: false,
        applicableClassIds: formData.selectedClassIds.map(id =>
          parseInt(id, 10)
        ),
      })

      navigate('/promotion/package-discounts')
    } catch (error) {
      console.error('Error creating package discount:', error)
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.packageDiscount'),
    mode: 'add',
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
          onSubmit={() => setConfirmCreate(true)}
        />
      </Box>
      <CustomedAlertDialog
        open={confirmCreate}
        setOpen={setConfirmCreate}
        description={t('promotion:packageDiscount.confirmCreate')}
        title={t('promotion:packageDiscount.confirmCreateTitle')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.confirm')}
        onActionClick={() => {
          handleCreate()
          setConfirmCreate(false)
        }}
      />
    </ContentLayout>
  )
}

export default CreatePackageDiscount
