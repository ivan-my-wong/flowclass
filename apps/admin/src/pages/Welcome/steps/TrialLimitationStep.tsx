import React from 'react'

import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuClock, LuUsers, LuX, LuZap } from 'react-icons/lu'

import CountdownTimer from '@/components/Timer/CountdownTimer'
import { Button } from '@/components/ui/Button'
import TrustedBy from '@/pages-public/PricingPublic/components/TrustedBy'

interface TrialLimitationStepProps {
  onBack?: () => void
}

const TrialLimitationStep: React.FC<TrialLimitationStepProps> = ({
  onBack,
}) => {
  const { t } = useTranslation('onboarding')

  // Set timer to expire in 24 hours from now
  const endTime = new Date()
  endTime.setHours(endTime.getHours() + 24)

  const handleBookDemo = () => {
    // This could open a demo booking modal or navigate to a contact page
    // eslint-disable-next-line no-console
    console.log('Book demo clicked')
  }

  const freePlanFeatures = [
    {
      icon: <LuUsers className="w-5 h-5 text-blue-600" />,
      title: t('trialLimitation.freePlan.students'),
      description: t('trialLimitation.freePlan.studentsDesc'),
    },
    {
      icon: <LuZap className="w-5 h-5 text-blue-600" />,
      title: t('trialLimitation.freePlan.features'),
      description: t('trialLimitation.freePlan.featuresDesc'),
    },
    {
      icon: <LuClock className="w-5 h-5 text-blue-600" />,
      title: t('trialLimitation.freePlan.support'),
      description: t('trialLimitation.freePlan.supportDesc'),
    },
  ]

  return (
    <div className="bg-white pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Countdown Timer */}
        <div className="text-center mb-8">
          <CountdownTimer endTime={endTime} className="mb-4" />
        </div>

        {/* TrustedBy Section */}
        <div className="mt-12">
          <TrustedBy onBookDemo={handleBookDemo} hasActionButton={false} />
        </div>
        {/* Trial Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <LuClock className="w-8 h-8 text-blue-600 mt-1" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                {t('trialLimitation.trialInfo.title')}
              </h3>
              <p className="text-blue-800 text-base leading-relaxed">
                {t('trialLimitation.trialInfo.description')}
              </p>
            </div>
          </div>
        </div>

        {/* What Happens Without Subscription */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-red-900 mb-6 text-center">
            {t('trialLimitation.freePlanDetails.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.students')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.schools')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.managers')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.tutors')}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.classTypes')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.studentPortal')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.emailNotifications')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LuX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">
                  {t('trialLimitation.freePlanDetails.communitySupport')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">{t('trialLimitation.note')}</p>
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="flex justify-center w-full mt-8">
            <Button
              onClick={onBack}
              variant="default"
              iconBefore={<LuArrowLeft />}
              className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('common:action.back')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrialLimitationStep
