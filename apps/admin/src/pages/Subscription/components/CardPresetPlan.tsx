'use client'

import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCheck, LuStar } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  PricingTier,
  PricingTierId,
  pricingTiers,
} from '@/constants/presetSubscriptionPlans'
import {
  PresetPlanTier,
  StripePriceInterval,
} from '@/types/schoolSubscriptionPlan'
import {
  CurrencyEnum,
  type SubscriptionPresetPlan,
} from '@/types/subscription-preset-plan'
import { cn } from '@/utils/cn'

interface PricingCardProps {
  plan: SubscriptionPresetPlan
  currency: CurrencyEnum
  interval: StripePriceInterval
  onStartUsing?: () => void
  isLoading?: boolean
  isCurrentPlan?: boolean
}

// Map subscription plan names to pricing tier IDs
const planNameToTierId: Record<string, PricingTierId> = {
  INDIVIDUAL_TRAINERS_TUTORS: PricingTierId.Individual,
  STARTUP_EDUCATION_CENTRES: PricingTierId.Startup,
  GROWING_EDUCATION_CENTRES: PricingTierId.Growing,
  MULTI_BRANCH_EDUCATION_CENTRES: PricingTierId.MultiBranch,
}

export function CardPresetPlan({
  plan,
  currency,
  interval,
  onStartUsing,
  isLoading,
  isCurrentPlan,
}: PricingCardProps): JSX.Element {
  const { t } = useTranslation(['onboarding', 'subscription'])

  // Get the corresponding pricing tier data
  const tierId = planNameToTierId[plan.name]
  const pricingTier = useMemo(() => {
    if (!tierId) return null
    return pricingTiers.find((tier: PricingTier) => tier.id === tierId)
  }, [tierId])

  const selectedPrice = useMemo(() => {
    return plan.prices.find(
      price => price.currency === currency && price.interval === interval
    )
  }, [plan.prices, currency, interval])

  const isPopular = plan.customerSupportTier === PresetPlanTier.GROWTH

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 hover:shadow-xl cursor-pointer',
        isPopular
          ? 'border-blue-500 shadow-lg scale-105'
          : 'border-gray-200 hover:border-blue-300'
      )}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 right-0 transform -translate-x-3/4 z-10">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {t('subscription:yourCurrentPlan')}
          </div>
        </div>
      )}
      {!isCurrentPlan && isPopular && (
        <div className="absolute -top-3 right-0 transform -translate-x-3/4 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <LuStar className="w-3 h-3" />
            {t('onboarding:pricingPublic.presetPlans.most_popular')}
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4 pt-6">
        <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
          {pricingTier
            ? t(pricingTier.nameKey)
            : t(`subscription:presetPlanNames.${plan.name}`)}
        </CardTitle>
        <div className="mt-4">
          <div className="text-4xl font-bold text-gray-900">
            {(() => {
              if (!selectedPrice) return '—'
              const basePrice = selectedPrice?.price ?? 0
              const currencySymbol = currency === 'HKD' ? 'HK$' : '$'

              if (interval === 'year') {
                // For yearly plans, show monthly equivalent price
                const monthlyPrice = basePrice / 12
                return `${currencySymbol}${Math.round(
                  monthlyPrice
                ).toLocaleString()}`
              }

              return `${currencySymbol}${basePrice?.toLocaleString()}`
            })()}
          </div>
          <div className="text-sm text-gray-500">
            {t('onboarding:pricingPublic.presetPlans.per_month')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {interval === 'year'
              ? `${t(
                  'onboarding:pricingPublic.presetPlans.billed_yearly_at'
                )} ${(() => {
                  if (!selectedPrice) return '—'
                  const basePrice = selectedPrice?.price ?? 0
                  const currencySymbol = currency === 'HKD' ? 'HK$' : '$'
                  return `${currencySymbol}${basePrice?.toLocaleString()}`
                })()}`
              : t('onboarding:pricingPublic.presetPlans.billed_monthly')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3 text-sm">
          {pricingTier && (
            <>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>
                  {typeof pricingTier.features.students === 'number'
                    ? `${pricingTier.features.students.toLocaleString()} ${t(
                        'onboarding:pricingPublic.presetPlans.students'
                      )}`
                    : t(
                        'onboarding:pricingPublic.presetPlans.unlimited_students'
                      )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>
                  {pricingTier.features.schools}{' '}
                  {typeof pricingTier.features.schools === 'number' &&
                  pricingTier.features.schools > 1
                    ? t('onboarding:pricingPublic.presetPlans.schools')
                    : t('onboarding:pricingPublic.presetPlans.school')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>
                  {pricingTier.features.managers}{' '}
                  {t('onboarding:pricingPublic.presetPlans.managers')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>
                  {pricingTier.features.tutors}{' '}
                  {t('onboarding:pricingPublic.presetPlans.tutors')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>
                  {pricingTier.features.classTypes}{' '}
                  {typeof pricingTier.features.classTypes === 'number' &&
                  pricingTier.features.classTypes > 1
                    ? t('onboarding:pricingPublic.presetPlans.class_types')
                    : t('onboarding:pricingPublic.presetPlans.class_type')}
                </span>
              </div>
              {pricingTier.features.rescheduleRequest && (
                <div className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>
                    {t(
                      'onboarding:pricingPublic.presetPlans.reschedule_requests'
                    )}
                  </span>
                </div>
              )}
              {pricingTier.features.qrCodeAttendance && (
                <div className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>
                    {t(
                      'onboarding:pricingPublic.presetPlans.qr_code_attendance'
                    )}
                  </span>
                </div>
              )}
              {pricingTier.features.creditSystem && (
                <div className="flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>
                    {t('onboarding:pricingPublic.presetPlans.credit_system')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {!isCurrentPlan && (
          <div className="mt-6 space-y-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onStartUsing}
              loading={isLoading}
            >
              {t('onboarding:pricingPublic.presetPlans.start_using')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
