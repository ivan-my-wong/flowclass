import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import OptionsCard from './OptionsCard'

const groupList: NotificationPropertyT[] = [
  {
    name: 'WA',
    question: 'subscription:client.section.notification.steps.wa.question',
    options: [
      {
        planId: 0,
        key: '',
        optionLabels:
          'subscription:client.section.notification.steps.wa.yesLabel',
        optionDesc: null,
        price: 0,
        currency: '',
      },
      {
        planId: 0,
        key: 'NOTIFICATION_CHANNEL_EMAIL_ONLY',
        optionLabels:
          'subscription:client.section.notification.steps.wa.noLabel',
        optionDesc: null,
        price: 0,
        currency: '',
      },
    ],
  },
  {
    name: 'OFFICIAL_WA',
    question:
      'subscription:client.section.notification.steps.official.question',
    options: [
      {
        planId: 0,
        key: 'NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_OFFICIAL',
        optionLabels:
          'subscription:client.section.notification.steps.official.yesLabel',
        optionDesc:
          'subscription:client.section.notification.steps.official.yesDesc',
        price: 0,
        currency: '',
      },
      {
        planId: 0,
        key: 'NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_UNOFFICIAL',
        optionLabels:
          'subscription:client.section.notification.steps.official.noLabel',
        optionDesc:
          'subscription:client.section.notification.steps.official.noDesc',
        price: 0,
        currency: '',
      },
    ],
  },
]

type NotificationPropertyT = {
  name: string
  question: string
  options: NotificationOptionsT[]
}
type NotificationOptionsT = {
  planId: number
  key: string
  optionLabels: string
  optionDesc: string | null
  price: number
  currency: string
}

const defaultOverview: SubscriptionOverviewT = {
  planId: 0,
  stepIndex: 7,
  stepValid: false,
  category: 'Notification',
  label: '',
  calculation: null,
  currency: '',
  count: null,
  annual: 0,
}

const selectedResultLabel = {
  NOTIFICATION_CHANNEL_EMAIL_ONLY:
    'subscription:client.section.notification.resultLabel.email',
  NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_OFFICIAL:
    'subscription:client.section.notification.resultLabel.waOfficial',
  NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_UNOFFICIAL:
    'subscription:client.section.notification.resultLabel.waUnofficial',
}
interface Props {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const NotificationStep: React.FC<Props> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState({ WA: null, OFFICIAL_WA: null })

  const usedQuestions = useMemo(() => {
    const newList = groupList.map(list => {
      const { options } = list
      const newOpt = options.map(opt => {
        const { key } = opt
        const data = stepOptions?.find(available => available.name === key)
        if (data) {
          const { stripeProduct } = data
          return {
            ...opt,
            currency: stripeProduct?.currency,
            planId: data?.id || 0,
            price: Number(stripeProduct?.unitAmount || 0),
            priceLabel: '',
          }
        }
        return opt
      })
      return { ...list, currency: '', options: newOpt }
    })
    return newList
  }, [stepOptions])

  const defaultProduct = useMemo(() => {
    let defaultPlanId = 0
    let defaultPlanKey = ''
    usedQuestions.forEach(item => {
      item.options.forEach(opt => {
        if (opt.price === 0) {
          defaultPlanId = opt.planId
          defaultPlanKey = opt.key
        }
      })
    })
    return { defaultPlanId, defaultPlanKey }
  }, [usedQuestions])

  const updateSelected = (
    name: string,
    key: string,
    price: number,
    planId: number,
    currency: string
  ) => {
    const newSelected = { ...selected, [name]: key }
    let defaultOverviewTemp = { ...defaultOverview }
    const { WA, OFFICIAL_WA } = newSelected

    if (WA === '') {
      defaultOverviewTemp.label = '-'
      if (OFFICIAL_WA !== null) {
        const { defaultPlanId, defaultPlanKey } = defaultProduct

        const tempLabel: string[] = [t(selectedResultLabel[key]) as string]
        const planIds: number[] = [planId]

        if (defaultPlanId !== 0) {
          tempLabel.unshift(t(selectedResultLabel[defaultPlanKey]) as string)
          planIds.unshift(defaultPlanId)
        }

        defaultOverviewTemp = {
          ...defaultOverviewTemp,
          currency,
          planId: planIds,
          stepValid: true,
          label: tempLabel.toString().replaceAll(',', ', '),
          annual: price,
        }
      }
    } else {
      defaultOverviewTemp = {
        ...defaultOverviewTemp,
        currency,
        planId,
        stepValid: true,
        label: (t(selectedResultLabel[key]) as string) || '',
        annual: price,
      }
    }

    if (name === 'WA') {
      newSelected.OFFICIAL_WA = null
    }
    setSelected(newSelected)
    onEmitResult(defaultOverviewTemp)
  }

  const allowClick = (groupName: string, key: string): boolean => {
    const isGroupSelected = Object.keys(selected).includes(groupName)
    if (isGroupSelected) {
      return !(selected[groupName] === key)
    }

    return true
  }

  const formatOptionPrice = (price: number, currency: string) => {
    return price
      ? `${getCurrencyPrefix(currency || 'usd')}${formatCurrency(
          price,
          currency || 'usd'
        )}`
      : ''
  }

  const showQuestion = (groupName: string): boolean => {
    const isWAGroup = groupName === 'WA'
    const isWASelected = Object.keys(selected).includes('WA')
    const shouldShowOfficialWA =
      isWAGroup || (isWASelected && selected.WA === '')
    return isWAGroup || shouldShowOfficialWA
  }

  return (
    <div className={currentStep === 7 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.notification.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.section.notification.description`)}
      </div>
      {usedQuestions.map((group, index) => {
        return (
          <div key={group.question} className="mb-8">
            {showQuestion(group.name) && (
              <>
                <div className="font-medium">
                  {index + 1}. {t(group.question)}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {group.options?.map(item => (
                    <OptionsCard
                      key={item.key}
                      isSelected={selected && selected[group.name] === item.key}
                      label={t(item.optionLabels) as string}
                      price={formatOptionPrice(
                        item.price,
                        item.currency || 'usd'
                      )}
                      onSelect={() => {
                        if (allowClick(group.name, item.key)) {
                          updateSelected(
                            group.name,
                            item.key,
                            item.price,
                            item.planId,
                            item.currency || 'usd'
                          )
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default NotificationStep
