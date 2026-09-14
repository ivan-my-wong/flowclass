import { useTranslation } from 'react-i18next'
import { LuCalendar, LuCheck, LuDollarSign, LuStar } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { REGISTRATION_URL } from '@/constants/common'
import { PricingTier, PricingTierId } from '@/constants/presetSubscriptionPlans'

const CAN_SWITCH_CURRENCY = false
interface PricingTiersProps {
  pricingTiers: PricingTier[]
  selectedTier: string
  setSelectedTier: (tierId: string) => void
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
  onCurrencyChange: (currency: 'HKD' | 'USD') => void
  onDurationChange: (duration: 'month' | 'year') => void
}

const PricingTiers = ({
  pricingTiers,
  selectedTier,
  setSelectedTier,
  selectedCurrency,
  selectedDuration,
  onCurrencyChange,
  onDurationChange,
}: PricingTiersProps): JSX.Element => {
  const { t } = useTranslation('onboarding')

  const isLargeTier = (tier: PricingTier): boolean => {
    return (
      tier.id === PricingTierId.MultiBranch || tier.id === PricingTierId.Growing
    )
  }

  const handleStartUsing = (tierId: string) => {
    // Redirect to registration page with tier information
    const url = new URL(REGISTRATION_URL)
    url.search = new URLSearchParams({
      tier: tierId,
      currency: selectedCurrency,
      duration: selectedDuration,
    }).toString()
    window.location.assign(url.toString())
  }

  return (
    <div id="preset-plans" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pricingPublic.presetPlans.not_sure_where_to_start')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('pricingPublic.presetPlans.choose_from_popular_packages')}
          </p>
        </div>

        {/* Currency and Duration Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
            {/* Currency Selector */}
            {CAN_SWITCH_CURRENCY && (
              <div className="flex items-center space-x-3">
                <LuDollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('pricingPublic.presetPlans.currency')}
                </span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => onCurrencyChange('HKD')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedCurrency === 'HKD'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    HKD
                  </button>
                  <button
                    type="button"
                    onClick={() => onCurrencyChange('USD')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedCurrency === 'USD'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
            )}

            {/* Duration Selector */}
            <div className="flex items-center space-x-3">
              <LuCalendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('pricingPublic.presetPlans.duration')}
              </span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => onDurationChange('month')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedDuration === 'month'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('pricingPublic.presetPlans.monthly')}
                </button>
                <button
                  type="button"
                  onClick={() => onDurationChange('year')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedDuration === 'year'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('pricingPublic.presetPlans.yearly')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map(tier => (
            <Card
              key={tier.id}
              className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
                tier.isPopular
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              } ${selectedTier === tier.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 right-0 transform -translate-x-3/4 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <LuStar className="w-3 h-3" />
                    {t('pricingPublic.presetPlans.most_popular')}
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                  {t(tier.nameKey)}
                </CardTitle>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {(() => {
                      const basePrice =
                        selectedDuration === 'year'
                          ? tier.prices.find(
                              p =>
                                p.currency === selectedCurrency &&
                                p.interval === 'billedYearly'
                            )?.price ?? 0
                          : tier.prices.find(
                              p =>
                                p.currency === selectedCurrency &&
                                p.interval === selectedDuration
                            )?.price ?? 0
                      const currencySymbol =
                        selectedCurrency === 'HKD' ? 'HK$' : '$'
                      return `${currencySymbol}${basePrice?.toLocaleString()}`
                    })()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('pricingPublic.presetPlans.per_month')}
                  </div>
                  {selectedDuration === 'year' && (
                    <div className="text-xs text-gray-400 mt-1">
                      {t('pricingPublic.presetPlans.billed_yearly_at')}{' '}
                      {(() => {
                        const basePrice =
                          tier.prices.find(
                            p =>
                              p.currency === selectedCurrency &&
                              p.interval === 'year'
                          )?.price ?? 0

                        const currencySymbol =
                          selectedCurrency === 'HKD' ? 'HK$' : '$'
                        return `${currencySymbol}${basePrice?.toLocaleString()}`
                      })()}
                    </div>
                  )}
                  {selectedDuration === 'month' && (
                    <div className="text-xs text-gray-400 mt-1">
                      {t('pricingPublic.presetPlans.billed_monthly')}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {typeof tier.features.students === 'number'
                        ? `${tier.features.students.toLocaleString()} ${t(
                            'pricingPublic.presetPlans.students'
                          )}`
                        : t('pricingPublic.presetPlans.unlimited_students')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {tier.features.schools}{' '}
                      {tier.features.schools > 1
                        ? t('pricingPublic.presetPlans.schools')
                        : t('pricingPublic.presetPlans.school')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {tier.features.managers}{' '}
                      {t('pricingPublic.presetPlans.managers')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {tier.features.tutors}{' '}
                      {t('pricingPublic.presetPlans.tutors')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {tier.features.classTypes}{' '}
                      {typeof tier.features.classTypes === 'number' &&
                      tier.features.classTypes > 1
                        ? t('pricingPublic.presetPlans.class_types')
                        : t('pricingPublic.presetPlans.class_type')}
                    </span>
                  </div>
                  {tier.features.rescheduleRequest && (
                    <div className="flex items-center gap-2">
                      <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>
                        {t('pricingPublic.presetPlans.reschedule_requests')}
                      </span>
                    </div>
                  )}
                  {tier.features.qrCodeAttendance && (
                    <div className="flex items-center gap-2">
                      <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>
                        {t('pricingPublic.presetPlans.qr_code_attendance')}
                      </span>
                    </div>
                  )}
                  {tier.features.creditSystem && (
                    <div className="flex items-center gap-2">
                      <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>
                        {t('pricingPublic.presetPlans.credit_system')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={e => {
                      e.stopPropagation()
                      handleStartUsing(tier.id)
                    }}
                  >
                    {t('pricingPublic.presetPlans.start_using')}
                  </Button>

                  {isLargeTier(tier) && (
                    <Button
                      variant="ghost"
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={e => {
                        e.stopPropagation()
                        window.open('https://flowclass.io/contact', '_blank')
                      }}
                    >
                      {t('pricingPublic.presetPlans.book_demo_with_team')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="box-col-full gap-4 p-4 mt-12 bg-gray-100 rounded-lg py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('pricingPublic.presetPlans.still_choosing')}
          </h2>
          <p className="text-gray-600 text-center">
            {t('pricingPublic.presetPlans.build_your_own_plans')}
          </p>
          <Button
            onClick={() => {
              // Scroll to the preset plans section
              const presetPlansSection =
                document.getElementById('pricing-calculator')
              if (presetPlansSection) {
                presetPlansSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            }}
          >
            {t('pricingPublic.presetPlans.try_pricing_calculator')}
          </Button>
        </div>
      </div>

      {/* Remove ContactSalesModal component */}
    </div>
  )
}

export default PricingTiers
