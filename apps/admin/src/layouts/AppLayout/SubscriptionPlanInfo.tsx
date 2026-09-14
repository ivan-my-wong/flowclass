import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuCreditCard } from 'react-icons/lu'

import ProgressBar from '@/components/ProgressIndicator/ProgressBar'
import { TRIAL_DAYS_CONSTANT } from '@/constants/featureFlags'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { PlanTier } from '@/types/schoolSubscriptionPlan'
import dayjs from '@/utils/dayjs'

const SubscriptionPlanInfo = () => {
  const { t } = useTranslation()
  const { schoolSubscription } = usePlanData()
  const navigate = useNavigate()

  const { activePlan } = schoolSubscription

  if (!activePlan)
    return (
      <div
        className="box-col-full gap-1 items-start w-fit cursor-pointer mr-2"
        role="button"
        tabIndex={0}
        onClick={() => navigate('/subscription')}
      >
        <div className="box-row-full w-fit hover:border-b hover:border-primary">
          <LuCreditCard className="text-primary" />
          <p className="text-sm text-primary font-bold">
            {`${t('subscription:currentPlan')}: ${t(
              `subscription:title.${PlanTier.FREE}`
            )}`}
          </p>
        </div>
      </div>
    )

  const dayUntilExpiry = Math.max(
    0,
    Math.ceil(dayjs(activePlan.expiryDate).diff(dayjs(), 'day', true))
  )

  return (
    <div
      className="box-col-full gap-1 items-start w-fit cursor-pointer mr-2"
      role="button"
      tabIndex={0}
      onClick={() => navigate('/subscription')}
    >
      <div className="box-row-full w-fit hover:border-b hover:border-primary">
        <LuCreditCard className="text-primary" />
        <p className="text-sm text-primary font-bold">
          {`${t('subscription:currentPlan')}: ${t(
            `subscription:title.${
              activePlan?.customerSupportTier ?? PlanTier.FREE
            }`
          )}`}
        </p>
        {activePlan.isTrial && (
          <p className="text-sm">
            {`(${dayUntilExpiry} ${t('subscription:alertBox.daysLeft')})`}
          </p>
        )}
      </div>
      {activePlan.isTrial && (
        <ProgressBar
          percentage={(dayUntilExpiry / TRIAL_DAYS_CONSTANT) * 100}
          css={{
            height: '8px',
          }}
        />
      )}
    </div>
  )
}

export default SubscriptionPlanInfo
