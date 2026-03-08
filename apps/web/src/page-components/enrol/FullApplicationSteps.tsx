import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ComponentType, useMemo } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import { clsx } from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { FaChevronLeft } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import StepIndicator from '@/components/Form/StepIndicator'
import { courseApplicationSteps } from '@/constants/course'
import { GlobalErrorContextProvider } from '@/contexts/ErrorContext'
import { Mobile, NotMobile } from '@/hooks/useResponsive'
import { defaultEnrolState, enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { ClassType, Course, School, TuitionMode } from '@/types'
import { cn } from '@/utils/cn'

const ConfirmDetailStep = dynamic(() => import('./ConfirmDetailStep'), { ssr: false })
const CustomFieldStep = dynamic(() => import('./ApplicationFormSteps'), {
  ssr: false,
})
const PickClassStep = dynamic(() => import('./PickTimeSteps/PickClassStep'), { ssr: false })
const PickPeriodStep = dynamic(() => import('./PickTimeSteps/Regular/PickPeriodStep'), {
  ssr: false,
})
const PickRecurPeriodStep = dynamic(() => import('./PickTimeSteps/Recurring/PickRecurPeriodStep'), {
  ssr: false,
})
const PickRecurStartLessonStep = dynamic(
  () => import('./PickTimeSteps/Recurring/PickRecurStartLessonStep'),
  {
    ssr: false,
  }
)
const PickTuitionStep = dynamic(() => import('./PickTimeSteps/PickTuitionStep'), { ssr: false })
const PickPriceOptionStep = dynamic(() => import('./PickTimeSteps/PickPriceOptionStep'), {
  ssr: false,
})

const PickPeriodV2Step = dynamic(() => import('./PickTimeSteps/Regular/PickPeriodV2Step'), {
  ssr: false,
})

const simpleRegularCourseEnrolSteps = [PickPeriodStep, CustomFieldStep, ConfirmDetailStep]
const regularCourseEnrolSteps = [
  PickPeriodStep,
  PickTuitionStep,
  CustomFieldStep,
  ConfirmDetailStep,
]

const eventEnrolSteps = [PickPeriodStep, PickTuitionStep, CustomFieldStep, ConfirmDetailStep]

const recurringCourseEnrolStep = [
  PickRecurPeriodStep,
  PickTuitionStep,
  CustomFieldStep,
  ConfirmDetailStep,
]

const recurringCourseEnrolStepWithPriceOption = [
  PickPriceOptionStep,
  PickRecurPeriodStep,
  CustomFieldStep,
  ConfirmDetailStep,
]

const subscriptionEnrolSteps = [CustomFieldStep, ConfirmDetailStep]

const appointmentCourseEnrolStep = [PickRecurPeriodStep, CustomFieldStep, ConfirmDetailStep]

const appointmentCourseEnrolStepWithPriceOption = [
  PickPriceOptionStep,
  PickRecurPeriodStep,
  CustomFieldStep,
  ConfirmDetailStep,
]

const regularV2EnrolStepsWithPriceOption = [
  PickPriceOptionStep,
  PickPeriodV2Step,
  CustomFieldStep,
  ConfirmDetailStep,
]
const regularV2EnrolSteps = [PickPeriodV2Step, PickTuitionStep, CustomFieldStep, ConfirmDetailStep]

export const getCourseEnrolSteps = (
  selectedClassType: ClassType | undefined,
  hasMultipleApplicants: boolean,
  hasMultiplePriceOptions: boolean
): ComponentType<{}>[] => {
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
    return hasMultiplePriceOptions
      ? recurringCourseEnrolStepWithPriceOption
      : recurringCourseEnrolStep
  }
  if (selectedClassType === ClassType.subscription) {
    return subscriptionEnrolSteps
  }
  if (selectedClassType === ClassType.appointment) {
    return hasMultiplePriceOptions
      ? appointmentCourseEnrolStepWithPriceOption
      : appointmentCourseEnrolStep
  }
  if (selectedClassType === ClassType.regularV2) {
    return hasMultiplePriceOptions ? regularV2EnrolStepsWithPriceOption : regularV2EnrolSteps
  }
  return regularCourseEnrolSteps
}

interface EnrollementStepsProps {
  school: School
  course: Course
  sidebar?: JSX.Element
}

const EnrollementSteps = ({ school, course, sidebar }: EnrollementStepsProps): JSX.Element => {
  const { t } = useTranslation()
  const router = useRouter()

  const isElement = (router.query.isElement as string) === 'true'

  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const prevSelectedOption = useRecoilValue(prevSelectedOptionState)
  const { classId } = router.query

  const step = enrolForm.currentStep
  const currentSelectedClassData = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]

  const courseEnrolSteps = useMemo(
    () =>
      getCourseEnrolSteps(
        currentSelectedClassData?.selectedClass?.type,
        currentSelectedClassData?.selectedClass?.setMultipleApplicant ?? false,
        currentSelectedClassData?.selectedClass?.priceType === TuitionMode.MULTIPLE_OPTIONS
      ),
    [currentSelectedClassData]
  )

  const stepTitles = useMemo(() => {
    const classType = currentSelectedClassData?.selectedClass?.type || ClassType.regular
    const hasMultiplePriceOptions =
      currentSelectedClassData?.selectedClass?.priceType === TuitionMode.MULTIPLE_OPTIONS

    if (hasMultiplePriceOptions) {
      if (classType === ClassType.recurring) {
        return [
          'enrol:stepTitles.stepIndicator.selectPriceOption',
          'enrol:stepTitles.stepIndicator.selectRecurPeriod',
          'enrol:stepTitles.stepIndicator.customField',
          'enrol:stepTitles.stepIndicator.confirmDetail',
        ]
      } else if (classType === ClassType.appointment) {
        return [
          'enrol:stepTitles.stepIndicator.selectPriceOption',
          'enrol:stepTitles.stepIndicator.selectRecurPeriod',
          'enrol:stepTitles.stepIndicator.customField',
          'enrol:stepTitles.stepIndicator.confirmDetail',
        ]
      } else if (classType === ClassType.regularV2) {
        return [
          'enrol:stepTitles.stepIndicator.selectPriceOption',
          'enrol:stepTitles.stepIndicator.selectPeriod',
          'enrol:stepTitles.stepIndicator.customField',
          'enrol:stepTitles.stepIndicator.confirmDetail',
        ]
      }
    }

    return courseApplicationSteps[classType]
  }, [currentSelectedClassData])

  const renderStepContent = useMemo(() => {
    if (step === 0 || !currentSelectedClassData) return <PickClassStep />
    const Component = courseEnrolSteps[step - 1] || PickClassStep
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
            iconBefore={<FaChevronLeft />}
            onClick={back}
            // Disable the back button if the user is on the first step or has already selected a class using params
            variant={step === 0 ? 'disabledText' : 'text'}
          >
            {t('common:action.back')}
          </Button>
          <NotMobile className="box-row-full w-[80%] items-center ">
            {/* <ProgressBar
              percentage={((step + 1) / (courseEnrolSteps.length + 1)) * 100}
              className="h-3"
            /> */}
            <StepIndicator
              steps={[
                t('enrol:stepTitles.stepIndicator.selectOption'),
                ...stepTitles.map(step => t(step)),
              ]}
              currentStep={step}
            />
          </NotMobile>
          <Button
            variant="text"
            iconAfter={<MdClose />}
            disabled={isElement}
            onClick={() => {
              router.push(`/@${school.url ?? ''}/${course.path}`)
              setEnrolForm(defaultEnrolState)
            }}
          >
            {t('common:action.cancel')}
          </Button>
        </div>

        <Mobile
          className={cn('box-col ml-[-1rem] mt-[-1rem] p-0', sidebar ? 'w-full' : 'md:w-[80%]')}
        >
          <StepIndicator
            steps={[
              t('enrol:stepTitles.stepIndicator.selectOption'),
              ...courseApplicationSteps[
                currentSelectedClassData?.selectedClass?.type || ClassType.regular
              ].map(step => t(step)),
            ]}
            currentStep={step}
          />
        </Mobile>
        <div className="box-col lg:box-row flex-col-reverse pb-4 lg:items-start">
          {sidebar}
          <div className="box-col-full lg:box-col mb-4 justify-start pb-4 lg:mb-0 lg:w-[67%] lg:border-b-0 lg:pt-0">
            {renderStepContent}
          </div>
        </div>
      </>
    </GlobalErrorContextProvider>
  )
}

export default EnrollementSteps
