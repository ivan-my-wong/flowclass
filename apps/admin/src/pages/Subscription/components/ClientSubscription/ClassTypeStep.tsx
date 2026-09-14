import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import OptionsCard from './OptionsCard'

type QuestionListT = {
  name: string
  question: string
  availableOptions: AvailableOptionsT[]
}

type AvailableOptionsT = {
  planId: number
  key: string
  title: string
  desc: string | null
  value: string
}

const questionList: QuestionListT[] = [
  {
    name: 'SCHEDULE',
    question: 'subscription:client.section.classType.schedule.question',
    availableOptions: [
      {
        planId: 0,
        key: 'A',
        title:
          'subscription:client.section.classType.schedule.optionFixedSchedule',
        desc: null,
        value: 'A',
      },
      {
        planId: 0,
        key: 'B',
        title:
          'subscription:client.section.classType.schedule.optionFlexibleSchedule',
        desc: null,
        value: 'CLASS_TYPE_APPOINTMENT',
      },
      {
        planId: 0,
        key: 'C',
        title: 'subscription:client.section.classType.optionOther',
        desc: null,
        value: '',
      },
    ],
  },
  {
    name: 'ENTERING',
    question: 'subscription:client.section.classType.entering.question',
    availableOptions: [
      {
        planId: 0,
        key: 'A',
        title:
          'subscription:client.section.classType.entering.optionRegularLabel',
        desc: null,
        value: 'CLASS_TYPE_REGULAR',
      },
      {
        planId: 0,
        key: 'B',
        title:
          'subscription:client.section.classType.entering.optionRecurringLabel',
        desc: null,
        value: 'CLASS_TYPE_RECURRING',
      },
      {
        planId: 0,
        key: 'C',
        title: 'subscription:client.section.classType.optionOther',
        desc: null,
        value: '',
      },
    ],
  },
]

const optionProperties = {
  CLASS_TYPE_REGULAR: {
    title: 'subscription:client.section.classType.suggestion.regular',
    desc: 'subscription:client.section.classType.suggestion.regularDescription',
  },
  CLASS_TYPE_RECURRING: {
    title: 'subscription:client.section.classType.suggestion.recurring',
    desc: 'subscription:client.section.classType.suggestion.recurringDescription',
  },
  CLASS_TYPE_APPOINTMENT: {
    title: 'subscription:client.section.classType.suggestion.appointment',
    desc: 'subscription:client.section.classType.suggestion.appointmentDescription',
  },
}

const defaultOverview: SubscriptionOverviewT = {
  planId: 0,
  stepIndex: 5,
  stepValid: true,
  category: 'Class Type',
  count: null,
  label: '',
  calculation: null,
  currency: '',
  annual: 0,
}

interface Props {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const ClassTypeStep: React.FC<Props> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState({
    SCHEDULE: [] as string[],
    ENTERING: [] as string[],
  })
  const [suggestedProducts, setSuggestedProducts] = useState<
    ClientSubscriptionPlanT[]
  >([])
  const [selectedProducts, setSelectedProducts] = useState<
    ClientSubscriptionPlanT[]
  >([])

  const updateSelected = (name: string, value: string): void => {
    let newValue = selected[name]

    if (!newValue.includes(value)) {
      newValue.push(value)
    } else {
      newValue = newValue.filter(item => item !== value)
    }
    const newSelected = { ...selected, [name]: newValue }
    if (name === 'SCHEDULE' && value === 'A') {
      newSelected.ENTERING = []
    }
    formatSuggestion(newSelected)
    setSelected(newSelected)

    let currentProduct = [...selectedProducts]
    if (name === 'SCHEDULE') {
      if (value === 'A') {
        currentProduct = currentProduct.filter(item => {
          return (
            item.name !== 'CLASS_TYPE_REGULAR' &&
            item.name !== 'CLASS_TYPE_RECURRING'
          )
        })
      }
      if (value === 'CLASS_TYPE_APPOINTMENT') {
        currentProduct = currentProduct.filter(
          item => item.name !== 'CLASS_TYPE_APPOINTMENT'
        )
      }
    }

    if (name === 'ENTERING' && value !== '') {
      currentProduct = currentProduct.filter(item => item.name !== value)
    }

    setSelectedProducts(currentProduct)
  }

  const formatSuggestion = (newSelected: {
    SCHEDULE: string[]
    ENTERING: string[]
  }) => {
    const { SCHEDULE, ENTERING } = newSelected
    const filterSchedule = SCHEDULE.filter(item => item !== '')
    const filterEntering = ENTERING.filter(item => item !== '')

    const keys: string[] = [...filterSchedule, ...filterEntering]

    const products: ClientSubscriptionPlanT[] = []

    keys.forEach(item => {
      const plan = stepOptions?.find(p => p.name === item)
      if (plan) {
        const { stripeProduct } = plan
        if (stripeProduct) {
          products.push(plan)
        }
      }
    })

    setSuggestedProducts(products)
  }

  const updateSelectedProducts = (product: ClientSubscriptionPlanT) => {
    let currentProducts = [...selectedProducts]
    if (currentProducts.includes(product)) {
      currentProducts = currentProducts.filter(
        item => item.name !== product.name
      )
    } else {
      currentProducts.push(product)
    }

    setSelectedProducts(currentProducts)
  }

  const showQuestion = (name: string): boolean => {
    if (name === 'SCHEDULE') {
      return true
    }
    return selected.SCHEDULE.includes('A')
  }

  useEffect(() => {
    let annual = 0
    const ids: number[] = []
    let currencyTemp = 'hkd'
    const labels: string[] = []
    selectedProducts.forEach(item => {
      const { stripeProduct } = item
      if (stripeProduct) {
        const { unitAmount, currency } = stripeProduct
        ids.push(item.id)
        annual += Number(unitAmount)
        currencyTemp = currency
        labels.push(t(optionProperties[item.name].title))
      }
    })

    const defaultOverviewTemp: SubscriptionOverviewT = {
      ...defaultOverview,
      planId: ids,
      // stepValid: ids.length > 0,
      stepValid: true,
      annual,
      currency: currencyTemp,
      label: labels.length > 0 ? labels.join(', ') : '-',
    }
    onEmitResult(defaultOverviewTemp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducts, t])

  return (
    <div className={currentStep === 5 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.classType.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.section.classType.description`)}
      </div>
      {questionList.map((list, index) => {
        if (showQuestion(list.name)) {
          return (
            <div key={list.name} className="mb-8">
              <div className="font-medium">
                {index + 1}. {t(list.question)}
              </div>
              <div className="flex flex-col text-center gap-2 mt-4">
                {list.availableOptions.map(opt => (
                  <OptionsCard
                    key={`${list.name}#${opt.value}`}
                    label={t(opt.title) as string}
                    isSelected={selected[list.name].includes(opt.value)}
                    onSelect={() => updateSelected(list.name, opt.value)}
                  />
                ))}
              </div>
            </div>
          )
        }
        return null
      })}
      <div className="mt-8 font-medium">
        {t(`subscription:client.section.classType.finalStep`)}
      </div>
      <Separator className="bg-gray-300 my-4" />
      <div>
        <div className="text-sm bg-yellow-50 border border-yellow-300 shadow-none p-4 py-2 rounded-sm mb-4 text-gray-800">
          {t(`subscription:client.section.classType.includedByDefault`)}
        </div>
        <div className="flex items-start gap-2 mb-3">
          <div className="text-left font-medium text-sm">
            {t(`subscription:client.section.classType.event`)}:
          </div>
          <div className="text-left text-sm">
            {t(`subscription:client.section.classType.eventDescription`)}
          </div>
        </div>
        <div className="flex items-start gap-1 mb-3">
          <div className="text-left font-medium text-sm">
            {t(`subscription:client.section.classType.membership`)}:
          </div>
          <div className="text-left text-sm">
            {t(`subscription:client.section.classType.membershipDescription`)}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="font-medium">
          {t(`subscription:client.section.classType.suggestion.label`)}
        </div>
        <Separator className="bg-gray-300 my-3" />
      </div>
      <div>
        {suggestedProducts.length > 0 ? (
          suggestedProducts.map(product => (
            <OptionsCard
              className="mb-2"
              key={product.id}
              title={t(optionProperties[product.name]?.title) as string}
              label={t(optionProperties[product.name]?.desc) as string}
              price={`${getCurrencyPrefix(
                product.stripeProduct?.currency || 'hkd'
              )}${formatCurrency(
                product.stripeProduct?.unitAmount || 0,
                product.stripeProduct?.currency || 'hkd'
              )}`}
              isSelected={selectedProducts.includes(product)}
              onSelect={() => updateSelectedProducts(product)}
            />
          ))
        ) : (
          <Card className="text-sm text-gray-500 p-4">
            {t(`subscription:client.section.classType.suggestion.noSuggestion`)}
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClassTypeStep
