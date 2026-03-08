import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ComponentType, useMemo } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import { clsx } from 'clsx'
import { LucideArrowLeft } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import StepIndicator from '@/components/Form/StepIndicator'
import { courseApplicationStepsWishlist } from '@/constants/course'
import { GlobalErrorContextProvider } from '@/contexts/ErrorContext'
import { Mobile, NotMobile } from '@/hooks/useResponsive'
import { enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { WishlistItem } from '@/stores/wishlist'
import { ClassType, School } from '@/types'

const ConfirmWishlistDetailStep = dynamic(() => import('./components/ConfirmWishlistDetailStep'), {
  ssr: false,
})
const PickClassStep = dynamic(() => import('../../enrol/PickTimeSteps/PickClassStep'), {
  ssr: false,
})
const PickPeriodStep = dynamic(() => import('../../enrol/PickTimeSteps/Regular/PickPeriodStep'), {
  ssr: false,
})
const PickRecurPeriodStep = dynamic(
  () => import('../../enrol/PickTimeSteps/Recurring/PickRecurPeriodStep'),
  {
    ssr: false,
  }
)
const PickRecurStartLessonStep = dynamic(
  () => import('../../enrol/PickTimeSteps/Recurring/PickRecurStartLessonStep'),
  {
    ssr: false,
  }
)
const PickTuitionStep = dynamic(() => import('../../enrol/PickTimeSteps/PickTuitionStep'), {
  ssr: false,
})

const PickPeriodV2Step = dynamic(
  () => import('../../enrol/PickTimeSteps/Regular/PickPeriodV2Step'),
  {
    ssr: false,
  }
)

const simpleRegularCourseEnrolSteps = [PickPeriodStep, ConfirmWishlistDetailStep]
const regularCourseEnrolSteps = [PickPeriodStep, PickTuitionStep, ConfirmWishlistDetailStep]

const eventEnrolSteps = [PickPeriodStep, PickTuitionStep, ConfirmWishlistDetailStep]

const recurringCourseEnrolStep = [
  PickRecurPeriodStep,
  PickRecurStartLessonStep,
  PickTuitionStep,
  ConfirmWishlistDetailStep,
]

const regularV2EnrolSteps = [PickPeriodV2Step, PickTuitionStep, ConfirmWishlistDetailStep]

const subscriptionEnrolSteps = [ConfirmWishlistDetailStep]

export const getCourseEnrolSteps = (
  selectedClassType: ClassType | undefined,
  hasMultipleApplicants: boolean
): ComponentType<{ onAddSuccess?: (item: WishlistItem) => void }>[] => {
  if (selectedClassType === ClassType.workshop) {
    if (hasMultipleApplicants) {
      return eventEnrolSteps
    }
    return eventEnrolSteps.filter(s => s !== PickTuitionStep)
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
    return regularV2EnrolSteps
  }
  return simpleRegularCourseEnrolSteps
}

interface AddToWishlistFlowProps {
  school: School
  onAddSuccess?: (item: WishlistItem) => void
}

const AddToWishlistFlow = ({ school, onAddSuccess }: AddToWishlistFlowProps): JSX.Element => {
  const { t } = useTranslation()
  const router = useRouter()

  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const prevSelectedOption = useRecoilValue(prevSelectedOptionState)
  const { classId } = router.query

  const step = enrolForm.currentStep
  const currentSelectedClassData = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]

  const courseEnrolSteps = useMemo(() => {
    const steps = getCourseEnrolSteps(
      currentSelectedClassData?.selectedClass?.type,
      currentSelectedClassData?.selectedClass?.setMultipleApplicant ?? false
    )
    return steps
  }, [currentSelectedClassData])

  const renderStepContent = useMemo(() => {
    if (step === 0 || !currentSelectedClassData) return <PickClassStep />
    const Component = courseEnrolSteps[step - 1] || PickClassStep
    if (Component === ConfirmWishlistDetailStep) {
      return <Component onAddSuccess={onAddSuccess} />
    }
    return <Component />
  }, [step, courseEnrolSteps, currentSelectedClassData])

  const back = () => {
    // This classId is from the router.query
    if (step > 0 || classId) {
      setEnrolForm({
        ...prevSelectedOption,
        currentStep: enrolForm.currentStep - 1,
      })
    }
  }

  if (!school) return <></>

  return (
    <GlobalErrorContextProvider>
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
            <StepIndicator
              steps={[
                t('enrol:stepTitles.stepIndicator.selectOption'),
                ...courseApplicationStepsWishlist[
                  currentSelectedClassData?.selectedClass?.type || ClassType.regular
                ].map(step => t(step)),
              ]}
              currentStep={step}
            />
          </NotMobile>
        </div>

        <Mobile className={'box-col mt-[-1rem] w-full p-0'}>
          <StepIndicator
            steps={[
              t('enrol:stepTitles.stepIndicator.selectOption'),
              ...courseApplicationStepsWishlist[
                currentSelectedClassData?.selectedClass?.type || ClassType.regular
              ].map(step => t(step)),
            ]}
            currentStep={step}
          />
        </Mobile>
        <div className="box-col lg:box-row flex-col-reverse pb-4 lg:items-start">
          <div className="box-col-full lg:box-col mb-4 justify-start pb-4 lg:mb-0 lg:border-b-0 lg:pt-0">
            {renderStepContent}
          </div>
        </div>
      </>
    </GlobalErrorContextProvider>
  )
}

export default AddToWishlistFlow
