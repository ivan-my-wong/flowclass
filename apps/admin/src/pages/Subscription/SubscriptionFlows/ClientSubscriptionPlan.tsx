import { lazy, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'

import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import StepIndicator from '@/components/ProgressIndicator/StepIndicator'
import { Button } from '@/components/ui/Button'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import {
  ClientSubscriptionPlanT,
  PlanType,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import AdminStaffStepComp from '../components/ClientSubscription/AdminStaffStep'
import ClassTypeStepComp from '../components/ClientSubscription/ClassTypeStep'
import NotificationStepComp from '../components/ClientSubscription/NotificationStep'
import PremiumFeatureStepComp from '../components/ClientSubscription/PremiumFeatureStep'
import PromotionStepComp from '../components/ClientSubscription/PromotionStep'
import SchoolStepComp from '../components/ClientSubscription/SchoolStep'
import SetupStepComp from '../components/ClientSubscription/SetupStep'
import StepSummary from '../components/ClientSubscription/StepSummary'
import StudentStepComp from '../components/ClientSubscription/StudentStep'
import TutorStepComp from '../components/ClientSubscription/TutorStep'

const OverviewStep = lazy(
  () => import('../components/ClientSubscription/OverviewStep')
)

enum StepName {
  BASE_USER = 'Students',
  MULTIPLE_SCHOOL = 'Schools',
  MULTIPLE_ADMIN = 'Admin Staff',
  MULTIPLE_TUTOR = 'Tutors',
  CLASS_TYPE = 'Class Type',
  NOTIFICATION_CHANNEL = 'Notification',
  PROMOTION_FEES = 'Promotions',
  SETUP_FEE = 'Setup',
  FEATURE_ENABLE = 'Add-ons',
}

export type PlanOverviewRecord = Record<string, SubscriptionOverviewT>

const ClientSubscriptionPlan = (): JSX.Element => {
  const { t } = useTranslation()
  const [steps, setSteps] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState<number>(0)
  const [planOverview, setPlanOverview] = useState<PlanOverviewRecord>({})
  const [overviewSetup, setOverviewSetup] = useState<SubscriptionOverviewT>()
  const [schoolCount, setSchoolCount] = useState<number>(0)
  const { useFetchAllClientSubscriptionPlans } = usePlanData()
  const { data: availablePlans, isLoading } =
    useFetchAllClientSubscriptionPlans()

  const allPlans = useMemo(() => {
    return availablePlans?.reduce((acc, plan) => {
      if (!acc[plan.type]) {
        acc[plan.type] = []
      }
      const { stripeProductPrices, ...rest } = plan
      const filteredStripeProduct = stripeProductPrices?.find(
        product =>
          product.currency?.toUpperCase() === 'HKD' &&
          product.interval === 'year'
      )

      const filteredPlan: ClientSubscriptionPlanT = {
        ...rest,
        stripeProduct: filteredStripeProduct || null,
      }
      acc[plan.type].push(filteredPlan)
      return acc
    }, {} as Record<PlanType, ClientSubscriptionPlanT[]>)
  }, [availablePlans])

  const composedOverview = useMemo((): PlanOverviewRecord => {
    const { Setup, ...rest } = planOverview
    setOverviewSetup(Setup)
    const sortedEntriesByValue = Object.entries(rest).sort(
      ([, valA], [, valB]) => {
        return valA.annual - valB.annual
      }
    )
    return Object.fromEntries(sortedEntriesByValue)
  }, [planOverview])

  const totalAnnualEachStep = useMemo((): {
    total: number
    currency: string
  } => {
    let total = 0
    let currencyTemp = ''
    Object.keys(composedOverview).forEach(key => {
      const item = composedOverview[key]
      const { stepValid: isStepValid, annual, currency } = item
      if (isStepValid) {
        total += annual
      }
      if (currency && currency !== '') {
        currencyTemp = currency
      }
    })

    return { total, currency: currencyTemp }
  }, [composedOverview])

  const moveStep = (movement: number): void => {
    const newStep = activeStep + movement
    if (newStep >= 0 && newStep < steps.length) {
      setActiveStep(newStep)
    }
  }

  const updateOverview = (result: SubscriptionOverviewT) => {
    const { category, count } = result
    if (category === 'Schools') {
      setSchoolCount(count || 0)
    }
    const newPlanOverview = { ...planOverview, [category]: result }
    setPlanOverview(newPlanOverview)
  }

  const currentStepValid = (): boolean => {
    const currentStepPlanOverview = planOverview[steps[activeStep]]
    if (currentStepPlanOverview) {
      return currentStepPlanOverview.stepValid
    }
    return false
  }

  const renderActiveStepConten = () => {
    return (
      <>
        <StudentStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.BASE_USER}
          onEmitResult={updateOverview}
        />
        <SchoolStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.MULTIPLE_SCHOOL}
          onEmitResult={updateOverview}
        />
        <SetupStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.SETUP_FEE}
          schoolCount={schoolCount}
          onEmitResult={updateOverview}
        />
        <AdminStaffStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.MULTIPLE_ADMIN}
          onEmitResult={updateOverview}
        />
        <TutorStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.MULTIPLE_TUTOR}
          onEmitResult={updateOverview}
        />
        <ClassTypeStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.CLASS_TYPE}
          onEmitResult={updateOverview}
        />
        <PremiumFeatureStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.FEATURE_ENABLE}
          onEmitResult={updateOverview}
        />
        <NotificationStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.NOTIFICATION_CHANNEL}
          onEmitResult={updateOverview}
        />
        <PromotionStepComp
          currentStep={activeStep}
          stepOptions={allPlans?.PROMOTION_FEES}
          onEmitResult={updateOverview}
        />
        {activeStep === steps.length - 1 && (
          <OverviewStep
            allSteps={steps}
            overviewSetup={overviewSetup}
            overview={planOverview}
            onEmitEditStep={idx => setActiveStep(idx)}
            overviewList={composedOverview}
            allStepAnnual={totalAnnualEachStep}
          />
        )}
      </>
    )
  }

  useEffect(() => {
    const newSteps = Object.keys(allPlans || {})
      .filter(key => {
        return StepName[key]
      })
      .map(key => {
        return StepName[key]
      })
    if (newSteps.length > 0) {
      setSteps([...newSteps, 'Overview'])
    }
  }, [allPlans])

  return (
    <>
      {isLoading ? (
        <FullScreenLoading />
      ) : (
        <>
          <div className="w-full flex justify-between items-center">
            <div>
              <div className="text-xl font-semibold">
                {t(`subscription:client.buildYourPackage`)}
              </div>
              <div className="text-sm text-gray-500">
                {t(`subscription:client.customizeSolution`)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-blue-500">
                {getCurrencyPrefix(totalAnnualEachStep.currency)}
                {formatCurrency(
                  (overviewSetup?.annual || 0) + totalAnnualEachStep.total,
                  totalAnnualEachStep.currency
                )}
              </div>
              <div className="text-sm text-gray-500">
                {t(`subscription:client.totalAnnual`)}
              </div>
            </div>
          </div>
          {steps.length > 0 ? (
            <>
              <div className="w-full pb-3">
                <StepIndicator
                  steps={steps.map(step => t(`subscription:stepNames.${step}`))}
                  currentStep={activeStep}
                  className="bg-white top-2 shadow-sm rounded-lg"
                />
                <div className="w-full lg:w-[900px] mx-auto overflow-auto mt-4 my-3 min-h-[200px]">
                  {renderActiveStepConten()}
                </div>
                <div className="px-3">
                  <StepSummary
                    overviewList={composedOverview}
                    allStepAnnual={totalAnnualEachStep}
                    overviewSetup={overviewSetup}
                  />
                </div>
              </div>
              <div className="w-full border-t border-gray-300 sticky py-2 bg-white bottom-0 mb-[-16px] z-10">
                <div className="flex items-center justify-between w-full lg:w-[900px] mx-auto px-3">
                  <Button
                    variant="outline"
                    className="w-[120px]"
                    iconBefore={<FaAngleDoubleLeft />}
                    size="sm"
                    disabled={activeStep === 0}
                    onClick={() => moveStep(-1)}
                  >
                    {t(`common:action.previous`)}
                  </Button>
                  <div className="text-sm font-medium text-gray-600">
                    Step {activeStep + 1} of {steps.length}
                  </div>
                  <Button
                    size="sm"
                    variant={currentStepValid() ? 'default' : 'outline'}
                    className="w-[120px]"
                    onClick={() => moveStep(1)}
                    iconAfter={<FaAngleDoubleRight />}
                    disabled={!currentStepValid()}
                  >
                    {t(`common:action.next`)}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full lg:w-[900px] mx-auto pt-3 pb-2 px-6">
              {t(`subscription:client.noDataAvailable`)}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ClientSubscriptionPlan
