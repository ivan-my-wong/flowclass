import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ChevronRightIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import { TRIAL_DAYS_CONSTANT } from '@/constants/featureFlags'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import dayjs from '@/utils/dayjs'

import AlertBox from '../Boxes/AlertBox'
import ProgressBar from '../ProgressIndicator/ProgressBar'
import Heading from '../Texts/Heading'
import Text from '../Texts/Text'
import Box from '../ui/Box'
import { Button } from '../ui/Button'

const FreeTrialCounter = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showTrialCounter, setShowTrialCounter] = useState(false)

  const { schoolSubscription } = usePlanData()
  const { activePlan } = schoolSubscription

  useEffect(() => {
    if (activePlan.isTrial) {
      setShowTrialCounter(true)
    }
  }, [activePlan])

  const dayUntilExpiry = Math.max(
    0,
    Math.ceil(dayjs(activePlan.expiryDate).diff(dayjs(), 'day', true))
  )

  if (!activePlan.isTrial) {
    return (
      <AlertBox
        content={`${t('subscription:alertBox.currently')} ${t(
          `subscription:title.${activePlan?.customerSupportTier}`
        )}`}
        actionText={t('subscription:alertBox.button') as string}
        actionLink="/subscription"
      />
    )
  }

  if (!showTrialCounter) {
    return <></>
  }

  return (
    <Box border className="!border-primary" padding="lg" gap="lg">
      <Box direction="col" align="start">
        <Heading size="smallMedium" css={{ marginTop: 0 }}>
          {t('subscription:alertBox.currentPlan')}
        </Heading>
        <ProgressBar
          percentage={(dayUntilExpiry / TRIAL_DAYS_CONSTANT) * 100}
        />
        <Text>
          {`${dayUntilExpiry} ${t('subscription:alertBox.daysLeft')}`}
        </Text>
      </Box>
      {!window.location.href.includes('subscription') && (
        <Button
          iconAfter={<ChevronRightIcon />}
          onClick={() => {
            navigate('/subscription')
          }}
        >
          {t('subscription:alertBox.upgrade')}
        </Button>
      )}
    </Box>
  )
}

export default FreeTrialCounter
