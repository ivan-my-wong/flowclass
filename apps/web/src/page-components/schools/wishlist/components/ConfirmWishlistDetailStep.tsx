import { useCallback, useEffect, useMemo } from 'react'

import { useRecoilState, useSetRecoilState } from 'recoil'

import { LucideShoppingCart } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'
import { toast } from 'sonner'

import { getApplicableAdditionalFee } from '@/api/promotionApi'
import Button from '@/components/Buttons/Button'
import ErrorModal from '@/components/Popups/ErrorModal'
import Text from '@/components/Texts/Text'
import { QUERY_KEY } from '@/constants/queryKey'
import { GlobalErrorContextProvider } from '@/contexts/ErrorContext'
import CourseDetail from '@/entities/CourseDetail'
import useFormFieldsData from '@/hooks/useFormFieldsData'
import ConfirmCourseDetail from '@/page-components/enrol/PaymentSteps/ConfirmCourseDetail'
import RenderPaymentAmount from '@/page-components/enrol/PaymentSteps/PaymentAmount'
import PaymentAmountAdditionalFee from '@/page-components/enrol/PaymentSteps/PaymentAmountAdditionalFee'
import { defaultEnrolState, enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { WishlistItem, wishlistState } from '@/stores/wishlist'
import { CourseWithQuotaValueClasses, School } from '@/types'
import { AdditionalFeeApplicants } from '@/types/additionalFee'
import { Tuition } from '@/types/enrol'
import { exportDomain } from '@/utils/domain'
import { extractStudentDataFromApplicantForm } from '@/utils/enroll-course.utils'

export enum EnrolDataType {
  class = 'class',
  session = 'session',
}

interface ConfirmWishlistDetailStepProps {
  onAddSuccess?: (item: WishlistItem) => void
}

const ConfirmWishlistDetailStep: React.FC<ConfirmWishlistDetailStepProps> = ({ onAddSuccess }) => {
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const { school, course, siteSetting } = useEnrolState()
  const { useFetchFormFields } = useFormFieldsData()
  const { data: formFields } = useFetchFormFields(course?.formId || '')
  const setPrevSelectedOption = useSetRecoilState(prevSelectedOptionState)
  const { t } = useTranslation()
  const [wishlist, setWishlist] = useRecoilState(wishlistState)

  const fields = useMemo(() => {
    return Object.keys(enrolForm.studentData)
      .filter(key => typeof enrolForm.studentData[key] === 'object')
      .map(key => enrolForm.studentData[key])
  }, [enrolForm.studentData])

  const domain = useMemo(
    () => exportDomain(course?.site.customDomain ?? '', course?.site.url ?? ''),
    [course?.site]
  )

  const studentData = useMemo(() => {
    return extractStudentDataFromApplicantForm(
      enrolForm.numberOfApplicant,
      fields,
      formFields?.fields
    )
  }, [enrolForm.numberOfApplicant, fields, formFields?.fields])

  const { data: applicationFeeData } = useQuery(
    [QUERY_KEY.getAllApplicableAdditionalFee],
    () =>
      getApplicableAdditionalFee({
        applicants: studentData.map(d => ({
          phone: d.phoneNumber,
          email: d.email,
        })) as AdditionalFeeApplicants[],
        courseId: course?.id ?? 0,
        institutionId: school?.id ?? 0,
        siteId: school?.siteId ?? 0,
      }),
    {
      enabled: studentData.length > 0 && !!course?.id && !!school?.id && !!school?.siteId,
    }
  )

  const courseDetail = useMemo(() => {
    return new CourseDetail(enrolForm, siteSetting!, applicationFeeData)
  }, [enrolForm, siteSetting, applicationFeeData])

  const handleAddToWishlist = useCallback(() => {
    // Check if course already exists in wishlist
    const existingItem = wishlist.wishlistItems?.find(item => item.courseId === course?.id)

    if (existingItem) {
      // Check for duplicate classes and lesson times
      const duplicateClass = enrolForm.selectedClassData.find(newClassData => {
        return existingItem.enrollForm.selectedClassData.some(existingClassData => {
          // Check if it's the same class
          if (existingClassData.selectedClass?.id !== newClassData.selectedClass?.id) {
            return false
          }

          // For recurring classes, check recurring schedule
          if (newClassData.selectedClass?.type === 'recurring') {
            return (
              existingClassData.selectedRecurSchedule?.id === newClassData.selectedRecurSchedule?.id
            )
          }

          // For regular classes, check if any lesson times overlap
          if (newClassData.selectedClass?.type === 'regular') {
            const newLessons = newClassData.selectedRegularPeriod?.lessons || []
            const existingLessons = existingClassData.selectedRegularPeriod?.lessons || []

            return newLessons.some(newLesson =>
              existingLessons.some(
                existingLesson =>
                  // Check if lesson times overlap
                  new Date(newLesson.startTime) <= new Date(existingLesson.endTime) &&
                  new Date(newLesson.endTime) >= new Date(existingLesson.startTime)
              )
            )
          }

          return false
        })
      })

      if (duplicateClass) {
        toast.error(
          `Class "${duplicateClass.selectedClass?.name}" with selected schedule is already in your wishlist`
        )
        return
      }

      // Merge selected classes with existing ones
      const updatedEnrolForm = {
        ...existingItem.enrollForm,
        selectedClassData: [
          ...existingItem.enrollForm.selectedClassData,
          ...enrolForm.selectedClassData,
        ],
        tuition: mergeTuition(existingItem.enrollForm.tuition, enrolForm.tuition),
      }

      // Update existing item
      setWishlist(prev => ({
        ...prev,
        wishlistItems: prev.wishlistItems?.map(item =>
          item.id === existingItem.id
            ? {
                ...item,
                enrollForm: updatedEnrolForm,
                courseDetail: new CourseDetail(updatedEnrolForm, siteSetting!, applicationFeeData),
              }
            : item
        ),
      }))
      onAddSuccess?.(existingItem)
    } else {
      // Add new wishlist item
      const wishlistData: WishlistItem = {
        id: Date.now().toString(),
        courseId: course?.id ?? 0,
        course: course as CourseWithQuotaValueClasses,
        school: school as School,
        enrollForm: enrolForm,
        courseDetail,
        registrationForm: fields,
      }

      setWishlist(prev => ({
        ...prev,
        wishlistItems: [
          ...(prev.wishlistItems || []).filter(item => Boolean(item.id)),
          wishlistData,
        ],
      }))
      onAddSuccess?.(wishlistData)
    }

    toast.success('Added to wishlist')
    setEnrolForm(defaultEnrolState)
  }, [
    course,
    school,
    enrolForm,
    courseDetail,
    fields,
    setWishlist,
    setEnrolForm,
    onAddSuccess,
    wishlist.wishlistItems,
    siteSetting,
    applicationFeeData,
  ])

  // Helper function to merge tuition arrays

  const mergeTuition = (existingTuition: Tuition[], newTuition: Tuition[]): Tuition[] => {
    return [...existingTuition, ...newTuition].map(tuition => {
      const originalFee = Number(tuition.originalFee) || 0
      const couponDiscount = tuition.couponDiscount || 0
      const directDiscount = tuition.directDiscount || 0
      const bundleDiscount = tuition.bundleDiscount || 0
      const recurringDiscount = tuition.recurringDiscount || 0
      const totalDiscount = couponDiscount + directDiscount + bundleDiscount + recurringDiscount
      const paymentAmount = Math.max(0, originalFee - totalDiscount)

      return {
        ...tuition,
        originalFee,
        paymentAmount,
        couponDiscount,
        directDiscount,
        bundleDiscount,
        recurringDiscount,
        totalDiscount,
        currency: tuition.currency,
        feePerLesson: tuition.feePerLesson || 0,
      }
    })
  }

  useEffect(() => {
    setPrevSelectedOption({
      ...enrolForm,
      currentStep: enrolForm.currentStep - 1,
    })
  }, [])

  return (
    <GlobalErrorContextProvider>
      <div className="box-col items-start p-0">
        <div className="box-col bg-backgroundLayer2 rounded">
          <ConfirmCourseDetail enrolForm={enrolForm} courseDetail={courseDetail} />

          {courseDetail.totalAdditionalFee > 0 ? (
            <PaymentAmountAdditionalFee
              courseDetail={courseDetail}
              course={course}
              paymentAmount={courseDetail.totalPayAmount}
            />
          ) : (
            <RenderPaymentAmount courseDetail={courseDetail} />
          )}

          {/* Rest of the JSX remains the same */}

          <Button
            className="w-full py-4"
            iconAfter={<LucideShoppingCart />}
            onClick={handleAddToWishlist}
          >
            Add to My Wishlist
          </Button>

          <Text align="center" fontSize="small" className="w-full">
            {t('enrol:coupon.canUse')}
          </Text>
          <ErrorModal domain={domain} school={school} course={course} />
        </div>
      </div>
    </GlobalErrorContextProvider>
  )
}

export default ConfirmWishlistDetailStep
