import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AlertTypes } from '@/reducers/confirm.reducers'

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

const defaultBundleTable = [{ amount: 1, discount: 0 }]

const CreateBundleDiscount = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { useCreateBundleDiscount } = usePromotionData()
  const createBundleDiscount = useCreateBundleDiscount()
  const { schoolData } = useSchoolData()
  const { courseData } = useCourseData()
  const { siteData } = useSiteData()

  const [confirmCreate, setConfirmCreate] = useState(false)

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

  const [selectedCourse, setSelectedCourse] = useState<CourseSelectorItem>(
    courseSelectorOptions[0]
  )

  const createBundleDiscountFunc = async () => {
    if (selectedCourse?.value && selectedCourse?.value !== '0') {
      // createBundleDiscount
      //   .mutateAsync({
      //     siteId: currentSiteId,
      //     institutionId: currentInstitutionId,
      //     courseId: parseInt(selectedCourse?.value ?? '0', 10),
      //     discountType: currentDiscountType,
      //     bundleTable: currentBundleTable,
      //   })
      //   .then(() => {
      //     setTimeout(() => {
      //       navigate('/promotion/bundle-discounts')
      //     }, 1000)
      //   })
    } else {
      toast.error(t('promotion:errors.courseRequired'))
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:titles.bundleDiscount'),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Box>
      <Button
        onClick={() => {
          setConfirmCreate(true)
        }}
      >
        {t('promotion:save')}
      </Button>
    </Box>
  )

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
        <Heading>{t('promotion:bundles.selectDiscountType')}</Heading>
        <Text css={{ marginBottom: '$4' }}>
          {t('promotion:bundles.typeExplanation')}
        </Text>

        <RadioCardGroup
          items={[
            {
              value: DiscountType.FIXED_AMOUNT,
              id: DiscountType.FIXED_AMOUNT,
              label: t('promotion:types.fixedAmount'),
            },
            {
              value: DiscountType.PERCENTAGE,
              id: DiscountType.PERCENTAGE,
              label: t('promotion:types.percentage'),
            },
          ]}
          selectedValue={currentDiscountType}
          handleValueChange={type => {
            setCurrentDiscountType(type as DiscountType)
          }}
        />

        <Heading css={{ marginTop: '$8' }}>
          {t('promotion:bundles.table')}
        </Heading>
        <Text>{t('promotion:bundles.numOfLessonExplanation')}</Text>
        <Text css={{ marginBottom: '$4' }}>
          {t('promotion:bundles.discountExplanation')}
        </Text>
        <Box
          css={{
            borderRadius: '$2',
            border: '1px solid $colors$textDisabled',
            padding: '$2',
          }}
        >
          <BundleTableComponent
            table={currentBundleTable}
            isEditable
            handleChange={setCurrentBundleTable}
            currency={currency}
          />
        </Box>

        <Heading>{t('promotion:bundles.applicableCourse')}</Heading>
        <CourseSelector
          selectOption={selectedCourse}
          options={courseSelectorOptions}
          onChange={setSelectedCourse}
          width="100%"
        />
      </Box>
      <CustomedAlertDialog
        open={confirmCreate}
        setOpen={setConfirmCreate}
        description={t('promotion:bundles.cannotChange')}
        title={t('promotion:bundles.confirmCreateBundle')}
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
