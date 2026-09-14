import { useTranslation } from 'react-i18next'

import { PlanWithQuotasResponse } from '@/types/schoolSubscriptionPlan'

import Box from '../ui/Box'

import QuotaProgressBar from './QuotaProgressBar'

type PropsType = {
  quotas: PlanWithQuotasResponse
}
const QuotaShowcase = ({ quotas }: PropsType): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box className="rounded-md" padding="lg" direction="col" border>
      <QuotaProgressBar
        data={quotas.activeStudents}
        title={t('pricingPlan:quotas.currentActiveStudents')}
      />
      <QuotaProgressBar
        data={quotas.reminder}
        title={t('pricingPlan:quotas.currentSentReminder')}
      />
    </Box>
  )
}

export default QuotaShowcase
