import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AlertTypes } from '@/reducers/confirm.reducers'
import { Course } from '@/types/course'

import Button from '../../../components/Buttons/Button'
import Box from '../../../components/Containers/Box'
import CustomedAlertDialog from '../../../components/Popups/AlertDialog'
import RadioCardGroup from '../../../components/RadioGroup/RadioCardGroup'
import CourseSelector, {
  CourseSelectorItem,
} from '../../../components/Selector/CourseSelector'
import { HeaderBackButtonStatus } from '../../../components/TabWithListAndButton/HeaderBackButton'
import Heading from '../../../components/Texts/Heading'
import Text from '../../../components/Texts/Text'
import useCourseData from '../../../hooks/useCourseData'
import usePromotionData from '../../../hooks/usePromotionData'
import useSchoolData from '../../../hooks/useSchoolData'
import useSiteData from '../../../hooks/useSiteData'
import ContentLayout from '../../../layouts/ContentLayout'
import { BundleTable } from '../../../types/bundleDiscounts'
import { DiscountType } from '../../../types/coupon'
import { courseListToCourseOptions } from '../../../utils/options'
import BundleTableComponent from '../components/BundleTable'

import CreateBundleForm from './CreateBundleForm'

const defaultBundleTable = [{ amount: 1, discount: 0 }]

const classesToSelectorItems = (
  courses: Course[],
  currentSiteId: number,
  currentInstitutionId: number
): CourseSelectorItem[] => {
  const classes: CourseSelectorItem[] = []

  courses.forEach(course => {
    // Filter courses by current site and institution
    if (
      course.siteId === currentSiteId &&
      course.institutionId === currentInstitutionId
    ) {
      if (course.classes && course.classes.length > 0) {
        course.classes.forEach(classItem => {
          // Double check that class also belongs to current site and institution
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

export interface BundleFormData {
  name: string
  minQty: number
  discountType: DiscountType
  discountValue: number
  applyToAll: boolean
  selectedItems: string[]
  startDate: Date | null
  endDate: Date | null
  autoApply: boolean
  retroactive: boolean
}

const CreateBundleDiscount = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useCreateBundleDiscount } = usePromotionData()
  const createBundleDiscount = useCreateBundleDiscount()
  const { schoolData } = useSchoolData()
  const { courseData } = useCourseData()
  const { siteData } = useSiteData()

  const [confirmCreate, setConfirmCreate] = useState(false)

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

  const currency = siteData.currentSite?.currency

  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const currentSiteId = schoolData.currentSchool?.siteId || 0

  const [currentDiscountType, setCurrentDiscountType] = useState(
    DiscountType.FIXED_AMOUNT
  )

  const [currentBundleTable, setCurrentBundleTable] =
    useState<BundleTable>(defaultBundleTable)

  const courseSelectorOptions: CourseSelectorItem[] = courseListToCourseOptions(
    courseData.courses,
    true
  )

  const classSelectorOptions: CourseSelectorItem[] = classesToSelectorItems(
    courseData.courses,
    currentSiteId,
    currentInstitutionId
  )

  const [selectedCourse, setSelectedCourse] = useState<CourseSelectorItem>(
    courseSelectorOptions[0]
  )

  const [selectedClass, setSelectedClass] = useState<CourseSelectorItem>(
    classSelectorOptions[0]
  )

  const generateBundleTable = (): BundleTable => {
    return [{ amount: formData.minQty, discount: formData.discountValue }]
  }

  const getApplicableItemIds = (): number[] => {
    if (formData.applyToAll) {
      return []
    }
    return formData.selectedItems.map(id => parseInt(id, 10))
  }

  const createBundleDiscountFunc = async () => {
    // Validation
    if (!formData.applyToAll && formData.selectedItems.length === 0) {
      toast.error(t('promotion:errors.classRequired'))
      return
    }

    if (!formData.name.trim()) {
      toast.error(t('promotion:errors.nameRequired'))
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error(t('promotion:errors.datesRequired'))
      return
    }

    try {
      await createBundleDiscount.mutateAsync({
        siteId: currentSiteId,
        institutionId: currentInstitutionId,
        name: formData.name,
        discountType: formData.discountType,
        amount: formData.discountValue,
        minQty: formData.minQty,
        applicableItemIds: getApplicableItemIds(),
        bundleTable: generateBundleTable(),
        isAllItems: formData.applyToAll,
        isAutoApply: formData.autoApply,
        isRetroactive: formData.retroactive,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })

      toast.success(t('promotion:bundles.createSuccess'))
      navigate('/promotion/bundle-discounts')
    } catch (error) {
      console.error('Error creating bundle discount:', error)
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.bundleDiscount'),
    mode: 'add',
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
          setConfirmCreate={setConfirmCreate}
          classes={classSelectorOptions}
          formData={formData}
          setFormData={setFormData}
        />
      </Box>
      <CustomedAlertDialog
        open={confirmCreate}
        setOpen={setConfirmCreate}
        description={t('promotion:bundleDiscount.cannotChange')}
        title={t('promotion:bundleDiscount.confirmCreateBundle')}
        alertType={AlertTypes.CONFIRM}
        cancelText={t('common:action.cancel')}
        actionText={t('common:action.confirm')}
        onActionClick={() => {
          createBundleDiscountFunc()
          setConfirmCreate(false)
        }}
      />
    </ContentLayout>
  )
}

export default CreateBundleDiscount
