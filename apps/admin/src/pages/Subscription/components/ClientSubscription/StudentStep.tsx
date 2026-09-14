import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import OptionsCard from './OptionsCard'

enum RangeLabel {
  BASE_USER_100 = '0 - 100',
  BASE_USER_500 = '101 - 500',
  BASE_USER_1500 = '501 - 1,500',
  BASE_USER_3000 = '1,501 - 3,000',
  BASE_USER_5000 = '3,001 - 5,000',
  BASE_USER_UNLIMITED = 'Unlimited',
}

type UsedOptionsT = {
  parentName: string
  planId: number
  currency: string
  label: string
  price: number
}

interface StudentStepProps {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const StudentStep: React.FC<StudentStepProps> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)

  const usedOptions = useMemo(() => {
    const data: UsedOptionsT[] = []
    stepOptions?.forEach(option => {
      const { name, stripeProduct } = option
      if (stripeProduct) {
        const { currency, unitAmount } = stripeProduct
        data.push({
          parentName: name,
          planId: option.id,
          label: RangeLabel[name] || name,
          currency,
          price: Number(unitAmount),
        })
      }
    })

    return data
  }, [stepOptions])

  const updateSelection = (value: number): void => {
    setSelected(value)
    const selectedValue = usedOptions?.find(opt => opt.planId === value)
    if (selectedValue) {
      const data: SubscriptionOverviewT = {
        planId: selectedValue.planId,
        stepIndex: 0,
        stepValid: true,
        category: 'Students',
        count: null,
        label: `${RangeLabel[selectedValue.parentName]} users`,
        calculation: null,
        annual: selectedValue.price,
        currency: selectedValue.currency,
      }
      onEmitResult(data)
    }
  }

  return (
    <div className={currentStep === 0 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.student.question`)}
      </div>
      <div className="text-sm mb-3 text-gray-700">
        {t(`subscription:client.section.student.description`)}
      </div>
      <div className="flex flex-col text-center gap-2">
        {usedOptions?.map(opt => (
          <OptionsCard
            key={opt.planId}
            label={opt.label}
            isSelected={selected === opt.planId}
            price={`${getCurrencyPrefix(opt.currency)}${formatCurrency(
              opt.price,
              opt.currency
            )}`}
            onSelect={() => updateSelection(opt.planId)}
          />
        ))}
      </div>
    </div>
  )
}

export default StudentStep
