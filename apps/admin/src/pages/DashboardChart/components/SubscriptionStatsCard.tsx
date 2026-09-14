import { useTranslation } from 'react-i18next'
import { BsCircleFill } from 'react-icons/bs'

import Box from '@/components/ui/Box'
import Text from '@/components/ui/Text'
import { SchoolSubscriptionPlans } from '@/types/schoolSubscriptionPlan'
import { cn } from '@/utils/cn'

type CircleProgressChartProps = {
  percentage: number
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
}

const CircleProgressChart = ({
  percentage,
  className,
  size = 'md',
}: CircleProgressChartProps) => {
  const circumference = 2 * Math.PI * 40 // 2πr where r=40
  return (
    <div className={cn(sizeClasses[size], className)}>
      <div
        id="student-quota-chart"
        className="w-full h-full"
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          role="img"
          aria-label="Progress chart showing percentage completion"
        >
          {/* Background circle (remaining) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb" // light gray
            strokeWidth="15"
          />

          {/* Foreground circle (active) - 10% of the circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#3b82f6" // blue
            strokeWidth="15"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${
              circumference - (circumference * percentage) / 100
            }`}
            transform="rotate(-90 50 50)"
          />

          {/* Center text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#3b82f6"
          >
            {percentage.toFixed(1)}%
          </text>
        </svg>
      </div>
    </div>
  )
}

const QuotaCard = ({
  title,
  value,
  percentage,
}: {
  title: string
  value: string
  percentage: number
}) => {
  return (
    <div className="flex flex-row items-center w-full">
      <div className="flex flex-col w-full">
        <Text variant="plain" className="!text-base">
          {title}
        </Text>
        <Text variant="plain" className="!text-2xl font-semibold">
          {value}
        </Text>
      </div>
      <CircleProgressChart percentage={percentage} />
    </div>
  )
}

const CurrentActiveStudents = ({
  current,
  quota,
}: {
  current: number
  quota: number
}) => {
  const { t } = useTranslation()
  return (
    <QuotaCard
      title={t('onboarding:dashboard.currentActiveStudents')}
      value={`${current} / ${quota}`}
      percentage={quota > 0 ? (current / quota) * 100 : 0}
    />
  )
}

const NotificationSent = ({
  current,
  quota,
}: {
  current: number
  quota: number
}) => {
  const { t } = useTranslation()
  return (
    <QuotaCard
      title={t('onboarding:dashboard.notificationSent')}
      value={`${current} / ${quota}`}
      percentage={quota > 0 ? (current / quota) * 100 : 0}
    />
  )
}

type SubscriptionStatsCardProps = {
  currentPlan: string
  currentStudents: number
  studentQuota: number
  notificationSent: number
  notificationQuota: number
}

export const planColorMap: Record<string, string> = {
  FREE: 'bg-blue-100 text-blue-500',
  STARTER: 'bg-blue-100 text-blue-500',
  GROWTH: 'bg-blue-100 text-blue-500',
  TRIAL: 'bg-blue-100 text-blue-500',
  PRO: 'bg-purple-100 text-purple-500',
}

export const planTitleMap: Record<string, string> = {
  FREE: 'freeTier',
  STARTER: 'starterTier',
  GROWTH: 'growthTier',
  TRIAL: 'trialTier',
  PRO: 'proTier',
}

export const stripeSubscriptionPlanMap: Record<string, string> = {
  [SchoolSubscriptionPlans.Starter]: 'Starter (Monthly)',
  [SchoolSubscriptionPlans.Growth]: 'Growth (Monthly)',
  [SchoolSubscriptionPlans.Pro]: 'Pro (Monthly)',
  [SchoolSubscriptionPlans.Enterprise]: 'Enterprise (Monthly)',
}

export const SubscriptionStatsCard = ({
  currentPlan,
  currentStudents,
  studentQuota,
  notificationSent,
  notificationQuota,
}: SubscriptionStatsCardProps): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box className="flex flex-col bg-background-layer-2 rounded-md p-6">
      <div
        className={cn(
          'flex flex-row items-center px-4 py-2 rounded-md self-start mb-2',
          planColorMap[currentPlan]
        )}
      >
        <BsCircleFill className="w-3 h-3 mr-2" />
        <Text
          variant="primary"
          className="text-base flex flex-row items-center"
        >
          {t(`pricingPlan:tiers.${planTitleMap[currentPlan]}`)}
        </Text>
      </div>
      <CurrentActiveStudents current={currentStudents} quota={studentQuota} />
      <NotificationSent current={notificationSent} quota={notificationQuota} />
    </Box>
  )
}
