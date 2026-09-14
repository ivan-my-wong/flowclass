import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import Select from '@/components/Selector/Select'
import Box from '@/components/ui/Box'

const UpgradeCard: React.FC = () => {
  // const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedPlan, setSelectedPlan] = useState<number>(0)
  // const plan = subscriptionPlans[selectedPlan]
  const changePricingHandler = (event: number): void => {
    setSelectedPlan(event)
  }

  // useEffect(() => {
  //   persistLocaleCookie(lang)
  // }, [lang])
  return (
    <Box
      direction="col"
      className="bg-background-layer-2 rounded-sm"
      padding="sm"
    >
      <Box direction="row">
        <Select
          placeholder="plans"
          fullWidth
          selectItems={[
            {
              group: 'plans',
              itemValues: [
                {
                  value: 0,
                  label: t('pricingPlan:freeTier') as string,
                },
                { value: 1, label: t('pricingPlan:starterTier') as string },
                { value: 2, label: t('pricingPlan:growthTier') as string },
                { value: 3, label: t('pricingPlan:proTier') as string },
                { value: 4, label: t('pricingPlan:enterpriseTier') as string },
              ],
            },
          ]}
          currentSelect={selectedPlan}
          onValueChange={changePricingHandler}
        />
      </Box>
      {/* seems the whole component is not used */}
    </Box>
  )
}

export default UpgradeCard
