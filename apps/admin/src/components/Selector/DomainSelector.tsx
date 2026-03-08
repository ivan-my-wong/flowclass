import React from 'react'

import { useTranslation } from 'react-i18next'

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
        label: domain,
        disabled: false,
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
