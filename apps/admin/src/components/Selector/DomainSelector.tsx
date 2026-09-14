import React from 'react'

import { useTranslation } from 'react-i18next'

import usePlanData from '@/hooks/useSubscriptionPlanData'

import { getFreeDomainList, getTierDomainList } from '../../constants/domain'

import Select from './Select'

export type CourseSelectorItem = {
  value: string
  label: string
  image: string
  icon: JSX.Element
}

export type DomainSelectorProps = {
  selectedDomain: string
  onValueChange: (e: any) => void
}

const DomainSelector: React.FC<DomainSelectorProps> = ({
  selectedDomain,
  onValueChange,
}) => {
  const { t } = useTranslation()
  const { schoolSubscription } = usePlanData()
  const { activePlan } = schoolSubscription

  const DomainSelectorItems = [
    {
      group: t('pricingPlan:freeTier') as string,
      itemValues: getFreeDomainList.map(domain => ({
        value: domain,
        label: domain,
      })),
    },
    {
      group: t('pricingPlan:starterTier') as string,
      itemValues: getTierDomainList.map(domain => ({
        value: domain,
        label:
          domain +
          (activePlan && activePlan.planIds && activePlan.planIds.length === 0
            ? ` ${t('setting:customizeSite.availableInStarter')}`
            : ''),
        disabled:
          activePlan && activePlan.planIds && activePlan.planIds.length === 0,
      })),
    },
  ]
  return (
    <Select
      placeholder="Domain"
      fullWidth
      selectItems={DomainSelectorItems}
      currentSelect={selectedDomain}
      onValueChange={onValueChange}
    />
  )
}

export default DomainSelector
