import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import OptionsCard from './OptionsCard'

const stepProperties = {
  yes: 'subscription:client.section.setup.yesLabel',
  no: 'subscription:client.section.setup.noLabel',
}

type UsedOptionT = {
  category: string
  title: string
  planId: number
  price: number
  currency: string
}

interface SetupStepProps {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  schoolCount: number
  onEmitResult: (result: SubscriptionOverviewT) => void
}
const SetupStep: React.FC<SetupStepProps> = ({
  currentStep,
  stepOptions,
  schoolCount,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [selectedSetup, setselectedSetup] = useState<string>()
  const [result, setResult] = useState<SubscriptionOverviewT>()

  const usedOptions = useMemo((): UsedOptionT[] => {
    const option = stepOptions?.find(item => item.name === 'SETUP_FEE_SCHOOL_1')
    if (option) {
      const { stripeProduct } = option
      if (stripeProduct) {
        return [
          {
            category: 'yes',
            title: stepProperties.yes,
            planId: option.id,
            price: stripeProduct?.unitAmount,
            currency: stripeProduct?.currency,
          },
          {
            category: 'no',
            title: stepProperties.no,
            planId: 0,
            price: 0,
            currency: stripeProduct?.currency,
          },
        ]
      }
    }
    return []
  }, [stepOptions])

  useEffect(() => {
    if (schoolCount && selectedSetup && usedOptions.length > 0) {
      const plan = usedOptions.find(opt => opt.category === selectedSetup)
      if (plan) {
        const data: SubscriptionOverviewT = {
          planId: plan.planId,
          stepIndex: 2,
          stepValid: true,
          category: 'Setup',
          label: `${schoolCount} ${t('school:title')} x ${getCurrencyPrefix(
            plan.currency
          )}${formatCurrency(plan.price, plan.currency)}`,
          count: schoolCount,
          calculation: null,
          currency: plan.currency,
          annual: schoolCount * plan.price,
        }

        setResult(data)
        onEmitResult(data)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolCount, selectedSetup, t, usedOptions])

  return (
    <div className={currentStep === 2 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.setup.question`)}
      </div>
      <div className="text-sm text-gray-700">
        {t(`subscription:client.section.setup.description`)}
      </div>
      <div className="flex flex-col text-center gap-2 mt-4">
        {usedOptions.map(opt => (
          <OptionsCard
            isSelected={selectedSetup === opt.category}
            key={opt.planId}
            label={t(opt.title) as string}
            price={`${getCurrencyPrefix(opt.currency)}${formatCurrency(
              opt.price,
              opt.currency
            )} / ${t(`subscription:schoolLowerCase`)}`}
            onSelect={() => setselectedSetup(opt.category)}
          />
        ))}
      </div>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-5">
        <div className="text-sm font-medium mb-1">
          {t(`subscription:client.setupFeeOneTime`)}
        </div>
        <div className="font-semibold text-gray-900 text-3xl">
          {getCurrencyPrefix(result?.currency || '')}
          {formatCurrency(result?.annual || 0, result?.currency || '')}
        </div>
      </div>
    </div>
  )
}

export default SetupStep
