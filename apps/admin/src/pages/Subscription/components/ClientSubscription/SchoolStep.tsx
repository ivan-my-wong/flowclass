import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { useSubscriptionStepPrice } from '@/hooks/useSubscriptionStepPrice'
import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'
import { getSchoolPlanKey } from '@/utils/subscriptionPlanKey.utils'

import InputCounter from './InputCounter'

interface SchoolStepProps {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}
const SchoolStep: React.FC<SchoolStepProps> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [schoolCount, setSchoolCount] = useState<number>(0)

  const deductionAmount = useMemo(() => {
    const a = stepOptions?.find(item => item.stripeProduct === null)
    if (a) {
      return a.typeQuota || 0
    }
    return 0
  }, [stepOptions])

  const selectedKey = useMemo(() => {
    return getSchoolPlanKey(schoolCount)
  }, [schoolCount])

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

  const schoolPrice = useSubscriptionStepPrice(
    stepOptions,
    schoolCount,
    selectedKey,
    deductionAmount
  )

  useEffect(() => {
    if (schoolCount > 0) {
      const { planId, price, currency } = schoolPrice
      const data: SubscriptionOverviewT = {
        planId,
        stepIndex: 1,
        stepValid: schoolCount > 0,
        category: 'Schools',
        count: schoolCount,
        label: `${schoolCount} ${t(
          `subscription:client.section.school.schoolLabel`
        )}`,
        calculation: null,
        annual: price,
        currency,
      }
      onEmitResult(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onEmitResult excluded to prevent circular re-renders
  }, [schoolCount, schoolPrice, t])

  return (
    <div className={currentStep === 1 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.school.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.section.school.description`)}
      </div>
      <div className="mb-2 text-gray-700 text-sm font-medium">
        {t(`subscription:client.section.school.inputLabel`)}
      </div>

      <Card className="p-5 shadow-none border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-col gap-3 md:flex-row">
          <InputCounter
            count={schoolCount}
            setCount={setSchoolCount}
            priceLabel={pricePerUnit.label}
          />
          <div className="md:text-right text-center">
            <div className="text-sm text-gray-500">Total price</div>
            <div className="text-3xl font-semibold text-gray-800">
              {schoolPrice.priceLabel}
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

export default SchoolStep
