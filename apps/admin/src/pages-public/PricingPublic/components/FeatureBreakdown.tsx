import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { REGISTRATION_URL } from '@/constants/common'
import { pricingTiers } from '@/constants/presetSubscriptionPlans'

import ContactSalesModal from './ContactForms/ContactSalesModal'

interface FeatureBreakdownProps {
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
}

// Get pricing data from the pricingTiers
const getPricingData = () => {
  const tierData = pricingTiers.map(tier => ({
    id: tier.id,
    nameKey: tier.nameKey,
    base:
      tier.prices.find(p => p.currency === 'HKD' && p.interval === 'year')
        ?.price || 0,
    originalPrice:
      tier.originalPrices?.find(p => p.currency === 'HKD')?.price || 0,
    savings: tier.originalPrices?.find(p => p.currency === 'HKD')?.savings || 0,
    percentage:
      tier.originalPrices?.find(p => p.currency === 'HKD')?.percentage || 0,
    features: tier.features,
    isPopular: tier.isPopular || false,
  }))

  // Add large scale tier for "Contact for details"
  tierData.push({
    id: 'large-scale',
    nameKey: 'pricingTiers.largeScale',
    base: 0,
    originalPrice: 0,
    savings: 0,
    percentage: 0,
    features: {
      students: 'Unlimited',
      schools: 'Unlimited',
      managers: 'Unlimited',
      tutors: 'Unlimited',
      classTypes: 'All',
      studentPortal: true,
      rescheduleRequest: true,
      tutorCentral: true,
      qrCodeAttendance: true,
      creditSystem: true,
      notifications: 'Email + WhatsApp',
      promotions: 'Advanced',
    },
    isPopular: false,
  })

  return tierData
}

const FeatureBreakdown = ({
  selectedCurrency,
  selectedDuration,
}: FeatureBreakdownProps): JSX.Element => {
  const { t } = useTranslation('subscription')
  const { t: tOnboarding } = useTranslation('onboarding')
  const [isContactSalesFormOpen, setIsContactSalesFormOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  const tierData = getPricingData()

  // Helper function to get tier by id
  const getTierById = (id: string) => tierData.find(tier => tier.id === id)

  // Calculate display price based on currency and duration
  const getDisplayPrice = (basePrice: number): string => {
    if (basePrice === 0) {
      return tOnboarding(
        'pricingPublic.exampleClientPricing.contactForDetails',
        'Contact for details'
      )
    }

    let price = basePrice

    // Convert to USD if needed (approximate conversion rate)
    if (selectedCurrency === 'USD') {
      price = Math.round(price * 0.128) // Approximate HKD to USD conversion
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      price = Math.round(price / 12)
    }

    const currencySymbol = selectedCurrency === 'HKD' ? 'HK$' : '$'
    const durationText = selectedDuration === 'month' ? 'month' : 'year'

    return `${currencySymbol}${price.toLocaleString()} / ${durationText}`
  }

  // Calculate total plan values based on currency and duration
  const getTotalPlanValue = (baseValue: number): string => {
    if (baseValue === 0) {
      return tOnboarding(
        'pricingPublic.exampleClientPricing.contactForDetails',
        'Contact for details'
      )
    }

    let value = baseValue

    // Convert to USD if needed
    if (selectedCurrency === 'USD') {
      value = Math.round(value * 0.128)
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      value = Math.round(value / 12)
    }

    const currencySymbol = selectedCurrency === 'HKD' ? 'HK$' : '$'
    return `${currencySymbol}${value.toLocaleString()}`
  }

  // Calculate savings based on currency and duration
  const getSavings = (baseSavings: number): string => {
    if (baseSavings === 0) {
      return tOnboarding(
        'pricingPublic.exampleClientPricing.contactForDetails',
        'Contact for details'
      )
    }

    let savings = baseSavings

    // Convert to USD if needed
    if (selectedCurrency === 'USD') {
      savings = Math.round(savings * 0.128)
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      savings = Math.round(savings / 12)
    }

    const currencySymbol = selectedCurrency === 'HKD' ? 'HK$' : '$'
    return `${currencySymbol}${savings.toLocaleString()}`
  }

  const handleContactSales = (planName: string) => {
    setSelectedPlan(planName)
    setIsContactSalesFormOpen(true)
  }

  const handleStartUsing = (planName: string) => {
    window.location.href = `${REGISTRATION_URL}?tier=${planName}&currency=${selectedCurrency}&duration=${selectedDuration}`
  }

  const getPlanPrice = (planId: string): number => {
    const tier = getTierById(planId)
    return tier?.base || 0
  }

  // Helper function to render feature value
  const renderFeatureValue = (
    tier: any,
    featureKey: keyof typeof tier.features
  ) => {
    const value = tier.features[featureKey]
    if (typeof value === 'boolean') {
      return value ? (
        <LuCheck className="w-4 h-4 text-green-500 mx-auto" />
      ) : (
        <span className="text-gray-300">-</span>
      )
    }
    return <span className="text-sm">{value}</span>
  }

  // Helper function to render notification channel
  const renderNotificationChannel = (tier: any) => {
    const { notifications } = tier.features
    if (notifications === 'Email Only') {
      return t('stripeProduct.NOTIFICATION_CHANNEL_EMAIL_ONLY', 'Email Only')
    }
    if (notifications === 'Email + WhatsApp') {
      return t(
        'stripeProduct.NOTIFICATION_CHANNEL_EMAIL_WHATSAPP_UNOFFICIAL',
        'WhatsApp (Unofficial)'
      )
    }
    return notifications
  }

  // Helper function to render promotion level
  const renderPromotionLevel = (tier: any) => {
    const { promotions } = tier.features
    if (promotions === 'Basic') {
      return t('stripeProduct.PROMOTION_FEES_BASIC', 'Basic')
    }
    if (promotions === 'Advanced') {
      return t('stripeProduct.PROMOTION_FEES_ADVANCED', 'Advanced')
    }
    return promotions
  }

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {tOnboarding(
              'pricingPublic.featureBreakdown.title',
              'Complete Feature & Pricing Breakdown'
            )}
          </h2>
          <p className="text-lg text-gray-600">
            {tOnboarding(
              'pricingPublic.featureBreakdown.subtitle',
              'Transparent pricing for every feature and capability'
            )}
          </p>
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t('planType.BASE_USER.title', 'Feature')}
                  </th>
                  {tierData.map((tier, index) => (
                    <th
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm font-semibold text-gray-900 ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {tOnboarding(
                        tier.nameKey,
                        tier.id.charAt(0).toUpperCase() + tier.id.slice(1)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Pricing Row */}
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {tOnboarding(
                      'pricingPublic.featureBreakdown.baseSubscription',
                      'Base Subscription'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm font-semibold text-blue-600 ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {getDisplayPrice(tier.base)}
                    </td>
                  ))}
                </tr>

                {/* Max Students */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t('planType.BASE_USER.title', 'Max Students')}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {tier.features.students === 'Unlimited'
                        ? t('planType.BASE_USER_UNLIMITED.title', 'Unlimited')
                        : tier.features.students.toLocaleString()}
                    </td>
                  ))}
                </tr>

                {/* Schools Included */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t('planType.MULTIPLE_SCHOOL.title', 'Schools Included')}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {tier.features.schools}
                    </td>
                  ))}
                </tr>

                {/* Admins Included */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t('planType.MULTIPLE_ADMIN.title', 'Admins Included')}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {tier.features.managers}
                    </td>
                  ))}
                </tr>

                {/* Tutors Included */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t('planType.MULTIPLE_TUTOR.title', 'Tutors Included')}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {tier.features.tutors}
                    </td>
                  ))}
                </tr>

                {/* Class Types */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t('planType.CLASS_TYPE.title', 'Class Types')}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {tier.features.classTypes}
                    </td>
                  ))}
                </tr>

                {/* Promotions */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t('planType.PROMOTION_FEES.title', 'Promotions')}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderPromotionLevel(tier)}
                    </td>
                  ))}
                </tr>

                {/* Tutor Central */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t(
                      'stripeProduct.FEATURE_ENABLE_TUTOR_CENTRAL',
                      'Tutor Central'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderFeatureValue(tier, 'tutorCentral')}
                    </td>
                  ))}
                </tr>

                {/* Student Portal */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t(
                      'stripeProduct.FEATURE_ENABLE_STUDENT_PORTAL',
                      'Student Portal'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderFeatureValue(tier, 'studentPortal')}
                    </td>
                  ))}
                </tr>

                {/* Reschedule Request */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t(
                      'stripeProduct.FEATURE_ENABLE_RESCHEDULE_REQUEST',
                      'Reschedule Request'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderFeatureValue(tier, 'rescheduleRequest')}
                    </td>
                  ))}
                </tr>

                {/* QR Code Attendance */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t(
                      'stripeProduct.FEATURE_ENABLE_QRCODE_ATTENDANCE',
                      'QR Code Attendance'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderFeatureValue(tier, 'qrCodeAttendance')}
                    </td>
                  ))}
                </tr>

                {/* Credit System */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t(
                      'stripeProduct.FEATURE_ENABLE_CREDIT_SYSTEM',
                      'Credit System'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderFeatureValue(tier, 'creditSystem')}
                    </td>
                  ))}
                </tr>

                {/* Notification Channel */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t(
                      'planType.NOTIFICATION_CHANNEL.title',
                      'Notification Channel'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {renderNotificationChannel(tier)}
                    </td>
                  ))}
                </tr>

                {/* Total Plan Value */}
                <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {tOnboarding(
                      'pricingPublic.featureBreakdown.totalPlanValue',
                      'Total Plan Value'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm font-bold text-yellow-700 ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      {getTotalPlanValue(tier.originalPrice)}
                    </td>
                  ))}
                </tr>

                {/* Money Saved Row in Table */}
                <tr className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mt-6">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {tOnboarding(
                      'pricingPublic.featureBreakdown.totalSavings',
                      'Total Savings with Preset Plans'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center text-sm font-bold text-green-600 ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div>{getSavings(tier.savings)}</div>
                      <div className="text-xs text-green-500 mt-1">
                        {tier.percentage}%{' '}
                        {tOnboarding(
                          'pricingPublic.featureBreakdown.saved',
                          'saved'
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action Buttons Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {tOnboarding(
                      'pricingPublic.featureBreakdown.getStarted',
                      'Get Started'
                    )}
                  </td>
                  {tierData.map(tier => (
                    <td
                      key={tier.id}
                      className={`px-4 py-4 text-center ${
                        tier.isPopular ? 'bg-purple-50' : ''
                      }`}
                    >
                      <Button
                        onClick={() =>
                          tier.id === 'large-scale'
                            ? handleContactSales(tier.id)
                            : handleStartUsing(tier.id)
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                      >
                        {tier.id === 'large-scale'
                          ? tOnboarding(
                              'pricingPublic.featureBreakdown.contactSales',
                              'Contact Sales'
                            )
                          : tOnboarding(
                              'pricingPublic.presetPlans.start_using',
                              'Start Using'
                            )}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={isContactSalesFormOpen}
        onClose={() => setIsContactSalesFormOpen(false)}
        quizData={null}
        selectedPlan={selectedPlan}
        calculatedPrice={selectedPlan ? getPlanPrice(selectedPlan) : 0}
        selectedCurrency={selectedCurrency}
        selectedDuration={selectedDuration}
      />
    </div>
  )
}

export default FeatureBreakdown
