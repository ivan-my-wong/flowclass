import { useState } from 'react'

import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import Heading from '@/components/Texts/Heading'
import { SubscriptionPlanRecord } from '@/types/schoolSubscriptionPlan'

interface PricingCardProps {
  title: string
  id: number
  isCurrentPlan: boolean
  subscriptionPlanRecord: SubscriptionPlanRecord
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  id,
  isCurrentPlan,
  subscriptionPlanRecord,
}) => {
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Get all key-value pairs from the record
  const entries = Object.entries(subscriptionPlanRecord)

  return (
    <div className={clsx('box-col p-4', { 'bg-gray-100': isCurrentPlan })}>
      <div className="flex items-center gap-2">
        <Heading size="medium" className="planTitle">
          {title}
        </Heading>
      </div>
      <div className="box-col gap-2" style={{ width: '100%' }}>
        <h3 className="font-bold mb-2">
          {t('subscription:subscriptionDetail.planRecord')}
        </h3>
        <ul className="space-y-2">
          {entries
            .slice(0, isCollapsed ? 8 : entries.length)
            .map(([key, value]) => (
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
        {entries.length > 8 && (
          <button
            type="button"
            className="text-blue-600 text-sm mt-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {t(`common:action.${isCollapsed ? 'seeAll' : 'seeLess'}`)}
          </button>
        )}
      </div>
    </div>
  )
}

export default PricingCard
