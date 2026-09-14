import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { RxDotFilled } from 'react-icons/rx'

import { Card } from '@/components/ui/Card'
import { useSubscriptionStepPrice } from '@/hooks/useSubscriptionStepPrice'
import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'
import { getTutorPlanKey } from '@/utils/subscriptionPlanKey.utils'

import InputCounter from './InputCounter'

interface Props {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const TutorStep: React.FC<Props> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [tutorCount, setTutorCount] = useState<number>(0)

  const deductionAmount = useMemo(() => {
    const a = stepOptions?.find(item => item.stripeProduct === null)
    if (a) {
      return a.typeQuota || 0
    }
    return 0
  }, [stepOptions])

  const selectedKey = useMemo(() => {
    return getTutorPlanKey(tutorCount)
  }, [tutorCount])

  const pricePerUnit = useMemo(() => {
    const plan = stepOptions?.find(item => item.name === selectedKey)
    if (plan) {
      const { stripeProduct } = plan
      if (stripeProduct) {
        const { currency, unitAmount } = stripeProduct
        return {
          label: `${getCurrencyPrefix(currency)}${formatCurrency(
            unitAmount,
            currency
          )}`,
          price: stripeProduct.unitAmount,
        }
      }
    }
    return { label: 'FREE', price: 0 }
  }, [stepOptions, selectedKey])

  const tutorPrice = useSubscriptionStepPrice(
    stepOptions,
    tutorCount,
    selectedKey,
    deductionAmount
  )

  useEffect(() => {
    if (tutorCount > 0) {
      const { planId, price, currency } = tutorPrice
      const data: SubscriptionOverviewT = {
        planId,
        stepIndex: 4,
        stepValid: tutorCount > 0,
        category: 'Tutors',
        label: `${tutorCount} tutors`,
        calculation: null,
        count: tutorCount,
        annual: price,
        currency,
      }

      onEmitResult(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onEmitResult excluded to prevent circular re-renders
  }, [tutorPrice, tutorCount])

  return (
    <div className={currentStep === 4 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.tutor.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.section.tutor.description`)}
        <ol className="mt-2">
          <li className="flex items-center gap-1">
            <RxDotFilled />{' '}
            {t(`subscription:client.section.tutor.viewScheduleLabel`)}
          </li>
          <li className="flex items-center gap-1">
            <RxDotFilled />{' '}
            {t(`subscription:client.section.tutor.attendanceLabel`)}
          </li>
          <li className="flex items-center gap-1">
            <RxDotFilled />{' '}
            {t(`subscription:client.section.tutor.manageClassLabel`)}
          </li>
          <li className="flex items-center gap-1">
            <RxDotFilled />{' '}
            {t(`subscription:client.section.tutor.viewRateLabel`)}
          </li>
        </ol>
      </div>
      <div className="mb-2 text-gray-700 text-sm font-medium">
        {t(`subscription:client.section.tutor.inputLabel`)}
      </div>
      <Card className="p-5 shadow-none border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-col gap-3 md:flex-row">
          <InputCounter
            count={tutorCount}
            setCount={setTutorCount}
            priceLabel={pricePerUnit.label}
          />
          <div className="md:text-right text-center">
            <div className="text-sm text-gray-500">Total price</div>
            <div className="text-3xl font-semibold text-gray-800">
              {tutorPrice.priceLabel}
            </div>
            <div className="text-sm text-gray-500">
              {t(`subscription:perYear`)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default TutorStep
