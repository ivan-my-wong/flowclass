import { useTranslation } from 'react-i18next'
import { LuCalendar, LuDollarSign } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { PlanType } from '@/types/schoolSubscriptionPlan'
import { formatCurrency } from '@/utils/currency'
import { getPlanTypeDisplayName } from '@/utils/subscriptionPlanKey.utils'

interface CompleteSubscriptionPlansProps {
  groupedPlans: Record<PlanType, any[]> | {}
  availablePlans: any[] | undefined
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
  onCurrencyChange: (currency: 'HKD' | 'USD') => void
  onDurationChange: (duration: 'month' | 'year') => void
}

const CompleteSubscriptionPlans = ({
  groupedPlans,
  availablePlans,
  selectedCurrency,
  selectedDuration,
  onCurrencyChange,
  onDurationChange,
}: CompleteSubscriptionPlansProps): JSX.Element => {
  const { t } = useTranslation('subscription')
  const { t: tOnboarding } = useTranslation('onboarding')

  // Helper function to get detailed description for plan types
  const getPlanTypeDescription = (type: PlanType): string => {
    switch (type) {
      case PlanType.BASE_USER:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.BASE_USER'
        )
      case PlanType.MULTIPLE_SCHOOL:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.MULTIPLE_SCHOOL'
        )
      case PlanType.FEATURE_ENABLE:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.FEATURE_ENABLE'
        )
      case PlanType.NOTIFICATION_CHANNEL:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.NOTIFICATION_CHANNEL'
        )
      case PlanType.INTEGRATION:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.INTEGRATION'
        )
      case PlanType.CUSTOMER_SUPPORT:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.CUSTOMER_SUPPORT'
        )
      case PlanType.CLASS_TYPE:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.CLASS_TYPE'
        )
      case PlanType.SETUP_FEE:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.SETUP_FEE'
        )
      case PlanType.MULTIPLE_ADMIN:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.MULTIPLE_ADMIN'
        )
      case PlanType.MULTIPLE_TUTOR:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.MULTIPLE_TUTOR'
        )
      case PlanType.PROMOTION_FEES:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.PROMOTION_FEES'
        )
      default:
        return tOnboarding(
          'pricingPublic.completeSubscriptionPlans.planTypeDescriptions.default'
        )
    }
  }

  // Helper function to get icon for plan type
  const getPlanTypeIcon = (type: PlanType) => {
    switch (type) {
      case PlanType.BASE_USER:
        return '👥'
      case PlanType.MULTIPLE_SCHOOL:
        return '🏫'
      case PlanType.FEATURE_ENABLE:
        return '⚡'
      case PlanType.NOTIFICATION_CHANNEL:
        return '📢'
      case PlanType.INTEGRATION:
        return '🔗'
      case PlanType.CUSTOMER_SUPPORT:
        return '🎧'
      default:
        return '📋'
    }
  }

  return (
    <div className="bg-white py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {tOnboarding('pricingPublic.completeSubscriptionPlans.title')}
          </h2>
          <p className="text-lg text-gray-600">
            {tOnboarding('pricingPublic.completeSubscriptionPlans.subtitle')}
            <br />
            <span className="text-sm text-blue-600 font-medium">
              {tOnboarding(
                'pricingPublic.completeSubscriptionPlans.pricingNote'
              )}
            </span>
          </p>
        </div>

        {/* Pricing Structure Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {tOnboarding(
                'pricingPublic.completeSubscriptionPlans.pricingStructure.title'
              )}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium mb-1">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleSchools.title'
                  )}
                </div>
                <div>
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleSchools.description'
                  )}
                </div>
                <div className="text-xs text-blue-600">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleSchools.note'
                  )}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium mb-1">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleAdmins.title'
                  )}
                </div>
                <div>
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleAdmins.description'
                  )}
                </div>
                <div className="text-xs text-blue-600">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleAdmins.note'
                  )}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium mb-1">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleTutors.title'
                  )}
                </div>
                <div>
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleTutors.description'
                  )}
                </div>
                <div className="text-xs text-blue-600">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.pricingStructure.multipleTutors.note'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency and Duration Selectors */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
          {/* Currency Selector */}
          <div className="flex items-center gap-3">
            <LuDollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {tOnboarding(
                'pricingPublic.completeSubscriptionPlans.selectors.currency'
              )}
            </span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onCurrencyChange('HKD')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedCurrency === 'HKD'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                HKD
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange('USD')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedCurrency === 'USD'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                USD
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-3">
            <LuCalendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {tOnboarding(
                'pricingPublic.completeSubscriptionPlans.selectors.duration'
              )}
            </span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onDurationChange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedDuration === 'month'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('monthly')}
              </button>
              <button
                type="button"
                onClick={() => onDurationChange('year')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedDuration === 'year'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('yearly')}
              </button>
            </div>
          </div>
        </div>

        {/* Plans Display */}
        {groupedPlans &&
          Object.keys(groupedPlans).length > 0 &&
          Object.entries(groupedPlans).map(([planType, plans]) => (
            <Card key={planType} className="w-full mb-8 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getPlanTypeIcon(planType as PlanType)}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {getPlanTypeDisplayName(planType as PlanType, t)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getPlanTypeDescription(planType as PlanType)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.isArray(plans) &&
                    plans.map(plan => (
                      <div
                        key={plan.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300"
                      >
                        <div className="flex gap-4 items-center justify-between md:flex-row flex-col">
                          {/* Plan Name and Description */}
                          <div className="flex-1 items-center">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {t(`stripeProduct.${plan.name}`)}
                              </h3>
                            </div>
                            <p>{t(`stripeProductDescription.${plan.name}`)}</p>
                          </div>

                          {/* Pricing Display */}
                          {plan.stripeProductPrices &&
                          plan.stripeProductPrices.length > 0 ? (
                            <div className="text-right">
                              {plan.stripeProductPrices
                                .filter(
                                  price =>
                                    price.currency?.toUpperCase() ===
                                      selectedCurrency &&
                                    price.interval === selectedDuration
                                )
                                .map(price => (
                                  <div key={price.id} className="text-center">
                                    {price.interval === 'year' ? (
                                      <>
                                        <div className="text-3xl font-bold text-blue-600">
                                          {formatCurrency(
                                            price.unitAmount,
                                            price.currency
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {t('per')} {t('year')}
                                        </div>
                                        <div className="mt-2">
                                          <div className="text-lg font-semibold text-gray-700">
                                            {formatCurrency(
                                              Math.round(price.unitAmount / 12),
                                              price.currency
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {t('per')} {t('month')}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-3xl font-bold text-blue-600">
                                          {formatCurrency(
                                            price.unitAmount,
                                            price.currency
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {t('per')} {t('month')}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}

                              {/* Show message if no matching currency/duration */}
                              {!plan.stripeProductPrices.some(
                                price =>
                                  price.currency?.toUpperCase() ===
                                    selectedCurrency &&
                                  price.interval === selectedDuration
                              ) && (
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-500">
                                    {tOnboarding(
                                      'pricingPublic.completeSubscriptionPlans.noPricingAvailable',
                                      {
                                        duration: selectedDuration,
                                        currency: selectedCurrency,
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500">
                                {tOnboarding(
                                  'pricingPublic.completeSubscriptionPlans.noPricingConfigured'
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}

        {(!groupedPlans ||
          Object.keys(groupedPlans).length === 0 ||
          !availablePlans ||
          availablePlans.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-lg font-medium">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.noPlansAvailable.title'
                  )}
                </p>
                <p className="text-sm">
                  {tOnboarding(
                    'pricingPublic.completeSubscriptionPlans.noPlansAvailable.description'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CompleteSubscriptionPlans
