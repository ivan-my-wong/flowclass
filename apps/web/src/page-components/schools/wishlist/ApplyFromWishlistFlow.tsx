import dynamic from 'next/dynamic'
import { ComponentType, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import { clsx } from 'clsx'
import { LucideArrowLeft } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import StepIndicator from '@/components/Form/StepIndicator'
import { courseApplicationStepsApplyFromWishlist } from '@/constants/course'
import { GlobalErrorContextProvider } from '@/contexts/ErrorContext'
import { Mobile, NotMobile } from '@/hooks/useResponsive'
import { defaultWishlistState, wishlistState } from '@/stores/wishlist'
import { ClassType } from '@/types'
import { EnrolCourseResponse, EnrollCourseStreamWithIdType } from '@/types/enrol'

const ConfirmApplyWishlistDetailStep = dynamic(
  () => import('./components/ConfirmApplyWishlistDetailStep'),
  { ssr: false }
)
const CustomFieldStep = dynamic(() => import('../../enrol/ApplicationFormSteps'), {
  ssr: false,
})

const simpleRegularCourseEnrolSteps = [CustomFieldStep, ConfirmApplyWishlistDetailStep]
const regularCourseEnrolSteps = [CustomFieldStep, ConfirmApplyWishlistDetailStep]

const eventEnrolSteps = [CustomFieldStep, ConfirmApplyWishlistDetailStep]

const recurringCourseEnrolStep = [CustomFieldStep, ConfirmApplyWishlistDetailStep]

const subscriptionEnrolSteps = [CustomFieldStep, ConfirmApplyWishlistDetailStep]

const regularV2CourseEnrolSteps = [CustomFieldStep, ConfirmApplyWishlistDetailStep]

export const getCourseEnrolSteps = (
  selectedClassType: ClassType | undefined,
  hasMultipleApplicants: boolean
): ComponentType<{
  onDone?: (
    successStreams: EnrollCourseStreamWithIdType[],
    failedStreams: EnrollCourseStreamWithIdType[]
  ) => void
}>[] => {
  if (selectedClassType === ClassType.workshop) {
    if (hasMultipleApplicants) {
      return eventEnrolSteps
    }
    return eventEnrolSteps
  }
  if (selectedClassType === ClassType.regular) {
    return regularCourseEnrolSteps
  }
  if (selectedClassType === ClassType.recurring) {
    return recurringCourseEnrolStep
  }
  if (selectedClassType === ClassType.subscription) {
    return subscriptionEnrolSteps
  }
  if (selectedClassType === ClassType.regularV2) {
    return regularV2CourseEnrolSteps
  }
  return simpleRegularCourseEnrolSteps
}

const ApplyFromWishlistFlow = ({
  onApplySuccess,
  sidebar,
}: {
  onApplySuccess?: (
    successStreams: EnrollCourseStreamWithIdType[],
    failedStreams: EnrollCourseStreamWithIdType[]
  ) => void
  sidebar?: React.ReactNode
}): JSX.Element => {
  const { t } = useTranslation()

  const [wishlist, setWishlist] = useRecoilState(wishlistState)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3)

  const step = wishlist.currentStep
  const currentSelectedClassData = wishlist.wishlistItems?.[0]?.enrollForm?.selectedClassData[step]

  const courseEnrolSteps = useMemo(() => {
    const steps = getCourseEnrolSteps(
      currentSelectedClassData?.selectedClass?.type,
      currentSelectedClassData?.selectedClass?.setMultipleApplicant ?? false
    )
    return steps
  }, [currentSelectedClassData])

  const handleOnDone = (
    successStreams: EnrollCourseStreamWithIdType[],
    failedStreams: EnrollCourseStreamWithIdType[]
  ) => {
    const isAllSuccess = failedStreams.length == 0
    setIsSuccess(isAllSuccess)
    if (isAllSuccess) {
      setWishlist(defaultWishlistState)
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)

            const enrollCourse = successStreams[0].data
              ? ((Array.isArray(successStreams[0].data)
                  ? successStreams[0].data[0]
                  : successStreams[0].data) as EnrolCourseResponse)
              : undefined

            if (!enrollCourse?.invoice.proofToken) {
              console.error('Missing proof token for receipt upload')
              return prev
            }
            const uploadReceiptUrl = new URLSearchParams({
              token: enrollCourse.invoice.proofToken,
              school: enrollCourse.schoolName ?? '',
              schoolId: enrollCourse.course.id?.toString() ?? '',
              course: enrollCourse.course.path ?? '',
            })
            window.location.href = '/enrol/upload-receipt?' + uploadReceiptUrl.toString()
            return prev
          }
          return prev - 1
        })
      }, 1000)
    } else {
      const failedWishlistItems = failedStreams.map(stream => {
        if (Array.isArray(stream.data)) {
          return stream.data.map(data => data.courseId)
        }
        return stream.data?.courseId
      })
      setWishlist(prev => ({
        ...prev,
        wishlistItems: prev.wishlistItems.filter(item =>
          failedWishlistItems.includes(item.courseId)
        ),
      }))
    }
  }

  const renderStepContent = useMemo(() => {
    const Component = courseEnrolSteps[step] || CustomFieldStep
    if (Component === ConfirmApplyWishlistDetailStep) {
      return <Component onDone={handleOnDone} />
    }
    return <Component />
  }, [step, courseEnrolSteps, currentSelectedClassData])

  const back = () => {
    if (step > 0) {
      setWishlist(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }))
    }
  }

  const SuccessSection = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="animate-bounce rounded-full bg-green-100 p-4">
          <svg
            className="h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-600">{t('enrol:wishlist.success')}</h2>
        <div className="space-y-2 text-gray-600">
          <p>{t('enrol:wishlist.applicationSuccessful')}</p>
          <p>{t('enrol:wishlist.confirmationEmail')}</p>
          <p className="mt-4 text-sm text-gray-500">
            {t('enrol:wishlist.redirectingToCourses')}{' '}
            <span className="font-medium text-green-500">{redirectCountdown}</span>{' '}
            {t('enrol:wishlist.seconds')}
          </p>
        </div>
        <div className="mt-4 h-1 w-48 overflow-hidden rounded bg-gray-200">
          <div
            className="h-full animate-[progress_3s_linear] bg-green-500"
            style={{
              width: `${((3 - redirectCountdown) / 3) * 100}%`,
            }}
          />
        </div>
      </div>
    )
  }

  const StepIndicatorSection = () => {
    return (
      <StepIndicator
        steps={[
          ...courseApplicationStepsApplyFromWishlist[
            currentSelectedClassData?.selectedClass?.type || ClassType.regular
          ].map(step => t(step)),
        ]}
        currentStep={step}
      />
    )
  }

  return (
    <GlobalErrorContextProvider>
      {isSuccess ? (
        <SuccessSection />
      ) : (
        <>
          <div className={clsx('box-row-full mb-4 w-full justify-between')} id="step-indicator">
            <Button
              className="-mt-2"
              iconBefore={<LucideArrowLeft />}
              onClick={back}
              // Disable the back button if the user is on the first step or has already selected a class using params
              variant={step === 0 ? 'disabledText' : 'text'}
            >
              {t('common:action.back')}
            </Button>
            <NotMobile className="box-row w-full">
              <StepIndicatorSection />
            </NotMobile>
          </div>

          <Mobile className={'box-col mt-[-1rem] w-full p-0'}>
            <StepIndicatorSection />
          </Mobile>
          <div className="box-col lg:box-row flex-col-reverse pb-4 lg:items-start">
            {sidebar}
            <div className="box-col-full lg:box-col mb-4 justify-start pb-4 lg:mb-0 lg:w-[67%] lg:border-b-0 lg:pt-0">
              {renderStepContent}
            </div>
          </div>
        </>
      )}
    </GlobalErrorContextProvider>
  )
}

export default ApplyFromWishlistFlow
