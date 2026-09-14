import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  ClientSubscriptionPlanT,
  StripeProductPrice,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import OptionsCard from './OptionsCard'

const stepProperties = {
  FEATURE_ENABLE_OWN_BRANDING: {
    question:
      'subscription:client.section.addons.steps.featureBranding.question',
    desc: 'subscription:client.section.addons.steps.featureBranding.desc',
  },
  FEATURE_ENABLE_STUDENT_PORTAL: {
    question: 'subscription:client.section.addons.steps.featurePortal.question',
    desc: 'subscription:client.section.addons.steps.featurePortal.desc',
  },
  FEATURE_ENABLE_TUTOR_CENTRAL: {
    question:
      'subscription:client.section.addons.steps.featureTutorCentral.question',
    desc: 'subscription:client.section.addons.steps.featureTutorCentral.desc',
  },
  FEATURE_ENABLE_QRCODE_ATTENDANCE: {
    question: 'subscription:client.section.addons.steps.featureQrCode.question',
    desc: 'subscription:client.section.addons.steps.featureQrCode.desc',
  },
  FEATURE_ENABLE_CREDIT_SYSTEM: {
    question: 'subscription:client.section.addons.steps.creditSystem.question',
    desc: 'subscription:client.section.addons.steps.creditSystem.desc',
  },
}

const optionLabels = {
  FEATURE_ENABLE_OWN_BRANDING: {
    yes: 'subscription:client.section.addons.steps.featureBranding.yesLabel',
    no: 'subscription:client.section.addons.steps.optionNoLabel',
  },
  FEATURE_ENABLE_STUDENT_PORTAL: {
    yes: 'subscription:client.section.addons.steps.featurePortal.yesLabel',
    no: 'subscription:client.section.addons.steps.optionNoLabel',
  },
  FEATURE_ENABLE_TUTOR_CENTRAL: {
    yes: 'subscription:client.section.addons.steps.featureTutorCentral.yesLabel',
    no: 'subscription:client.section.addons.steps.optionNoLabel',
  },
  FEATURE_ENABLE_QRCODE_ATTENDANCE: {
    yes: 'subscription:client.section.addons.steps.featureQrCode.yesLabel',
    no: 'subscription:client.section.addons.steps.optionNoLabel',
  },
  FEATURE_ENABLE_CREDIT_SYSTEM: {
    yes: 'subscription:client.section.addons.steps.creditSystem.yesLabel',
    no: 'subscription:client.section.addons.steps.optionNoLabel',
  },
}

const selectedResultLabel = {
  FEATURE_ENABLE_OWN_BRANDING:
    'subscription:client.section.addons.steps.featureBranding.resultLabel',
  FEATURE_ENABLE_STUDENT_PORTAL:
    'subscription:client.section.addons.steps.featurePortal.resultLabel',
  FEATURE_ENABLE_TUTOR_CENTRAL:
    'subscription:client.section.addons.steps.featureTutorCentral.resultLabel',
  FEATURE_ENABLE_QRCODE_ATTENDANCE:
    'subscription:client.section.addons.steps.featureQrCode.resultLabel',
  FEATURE_ENABLE_CREDIT_SYSTEM:
    'subscription:client.section.addons.steps.creditSystem.resultLabel',
}

type PremiumFeaturePropertyT = {
  productId: number
  name: string
  question: string
  desc: string
  availableOptions: PremiumFeatureOptionsT[]
}
type PremiumFeatureOptionsT = {
  id: number
  type: string
  product: StripeProductPrice | null
  key: number | string
  optionLabel: string
  currency: string
  price: number
}
interface Props {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const PremiumFeatureStep: React.FC<Props> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [options, setOptions] = useState<PremiumFeaturePropertyT[]>([])
  const [selected, setSelected] = useState({})

  const updateSelected = (
    key: string,
    product: StripeProductPrice | null,
    type: string,
    currency: string
  ) => {
    const newSelected = { ...selected, [key]: { product, type } }
    setSelected(newSelected)

    let price: number = 0
    const tempLabel: string[] = []
    const planIds: number[] = []
    Object.keys(newSelected).forEach(item => {
      const element = newSelected[item]
      const { product } = element
      if (product) {
        price += Number(product.unitAmount)
        tempLabel.push(t(selectedResultLabel[item]))
        planIds.push(product.planId)
      }
    })

    const data: SubscriptionOverviewT = {
      planId: planIds,
      stepIndex: 6,
      stepValid: true,
      category: 'Add-ons',
      label: tempLabel.toString().replaceAll(',', ', '),
      calculation: null,
      count: null,
      annual: price,
      currency,
    }
    onEmitResult(data)
  }

  useEffect(() => {
    const items: PremiumFeaturePropertyT[] = []
    stepOptions?.forEach(plan => {
      const { name, stripeProduct } = plan
      if (stripeProduct) {
        const properties = stepProperties[name]
        if (properties) {
          const item: PremiumFeaturePropertyT = {
            productId: plan.id,
            name,
            question: t(stepProperties[name].question),
            desc: t(stepProperties[name].desc),
            availableOptions: [],
          }

          if (optionLabels[name]) {
            const { yes, no } = optionLabels[name]
            item.availableOptions = [
              {
                id: plan.id,
                type: 'yes',
                product: stripeProduct,
                key: `YES#${name}`,
                optionLabel: t(yes),
                price: Number(stripeProduct.unitAmount),
                currency: stripeProduct.currency,
              },
              {
                id: plan.id,
                type: 'no',
                product: null,
                key: `NO#${name}`,
                optionLabel: t(no),
                price: 0,
                currency: stripeProduct.currency,
              },
            ]
          }

          items.push(item)
        }
      }
    })
    setOptions(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepOptions])

  const isSelected = (name: string, type: string): boolean => {
    const keys = Object.keys(selected)
    if (keys.includes(name)) {
      return selected[name].type === type
    }
    return false
  }

  return (
    <div className={currentStep === 6 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.addons.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.section.addons.description`)}
      </div>
      {options.map((option, index) => {
        return (
          <div key={option.question} className="mb-8">
            <div className="font-medium mb-1">
              {index + 1}. {option.question}
            </div>
            <div className="text-sm text-gray-700">{option.desc}</div>
            <div className="flex flex-col text-center gap-2 mt-4">
              {option.availableOptions?.map(item => (
                <OptionsCard
                  key={item.key}
                  isSelected={isSelected(option.name, item.type)}
                  label={item.optionLabel}
                  price={`${getCurrencyPrefix(item.currency)}${formatCurrency(
                    item.price,
                    item.currency
                  )}`}
                  onSelect={() =>
                    updateSelected(
                      option.name,
                      item.product,
                      item.type,
                      item.currency
                    )
                  }
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PremiumFeatureStep
