import { useTranslation } from 'react-i18next'

import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { SubscriptionPlanRecord } from '@/types/schoolSubscriptionPlan'

// Only keep the props you need
interface SubscriptionCardProps {
  icon: JSX.Element
  title: string
  currentPlan: SubscriptionPlanRecord
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  icon,
  title,
  currentPlan,
}) => {
  const { t } = useTranslation()

  return (
    <div className="box-col p-4">
      <div className="flex items-center gap-2">
        {icon}
        <Heading size="medium" className="planTitle">
          {title}
        </Heading>
      </div>
      <div className="box-col gap-2" style={{ width: '100%' }}>
        <h3 className="font-bold mb-2">
          {t('subscription:subscriptionDetail.planRecord')}
        </h3>
        <ul className="space-y-2">
          {Object.entries(currentPlan).map(([key, value]) => (
            <li key={key} className="flex gap-2">
              <span className="font-semibold">{key}:</span>
              <span>
                {typeof value === 'object' && value !== null
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SubscriptionCard
