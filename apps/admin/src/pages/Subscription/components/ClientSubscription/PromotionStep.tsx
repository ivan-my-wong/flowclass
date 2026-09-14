import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import OptionsCard from './OptionsCard'

type QuestionPropertyT = {
  planId: number
  key: string
  label: string
  title: string
  price: number
  currency: string
}

const questionProperties: QuestionPropertyT[] = [
  {
    planId: 0,
    key: 'PROMOTION_FEES_ADVANCED',
    title: 'subscription:client.section.promotion.yes',
    label: 'subscription:client.section.promotion.couponTrialLabel',
    price: 0,
    currency: '',
  },
  {
    planId: 0,
    key: 'PROMOTION_FEES_BASIC',
    label: 'subscription:client.section.promotion.coupon',
    title: 'subscription:client.section.promotion.no',
    price: 0,
    currency: '',
  },
]

interface Props {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const PromotionStep: React.FC<Props> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string>()

  const usedOptions = useMemo(() => {
    if (!stepOptions?.length) {
      return questionProperties
    }

    const newQuestion = questionProperties.map(item => {
      const { key } = item
      const option = stepOptions?.find(opt => opt.name === key)
      if (option) {
        const { stripeProduct } = option
        return {
          ...item,
          planId: option.id,
          price: Number(stripeProduct?.unitAmount || 0),
          currency: stripeProduct?.currency || 'usd',
        }
      }

      return item
    })
    return newQuestion
  }, [stepOptions])

  const updateSelection = (key: string): void => {
    setSelected(key)
    const selectedValue = usedOptions?.find(opt => opt.key === key)
    if (selectedValue) {
      const planId = [selectedValue.planId || 0]
      if (key === 'PROMOTION_FEES_ADVANCED') {
        const freePlan = usedOptions.find(
          item => item.key === 'PROMOTION_FEES_BASIC'
        )
        if (freePlan) {
          planId.push(freePlan.planId)
        }
      }
      const data: SubscriptionOverviewT = {
        planId,
        stepIndex: 8,
        stepValid: true,
        category: 'Promotions',
        label: t(selectedValue.label),
        count: null,
        calculation: null,
        annual: selectedValue.price || 0,
        currency: selectedValue.currency,
      }
      onEmitResult(data)
    }
  }

  return (
    <div className={currentStep === 8 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.promotion.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        <p>{t(`subscription:client.section.promotion.description`)}</p>
        <ul className="list-disc list-inside mt-2">
          <li>
            {t(`subscription:client.section.promotion.descriptionList.trial`)}
          </li>
          <li>
            {t(`subscription:client.section.promotion.descriptionList.bundle`)}
          </li>
        </ul>
      </div>
      <div className="flex flex-col text-center gap-2 w-full">
        {usedOptions?.map(opt => (
          <OptionsCard
            key={opt.planId}
            isSelected={selected === opt.key}
            title={t(opt.title) as string}
            label={t(opt.label) as string}
            price={`${getCurrencyPrefix(opt.currency)}${formatCurrency(
              opt.price,
              opt.currency
            )}`}
            onSelect={() => updateSelection(opt.key)}
          />
        ))}
      </div>
    </div>
  )
}

export default PromotionStep
