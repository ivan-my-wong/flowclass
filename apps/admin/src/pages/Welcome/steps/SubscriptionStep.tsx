import React from 'react'

import Testimonials from '@/pages-public/PricingPublic/components/Testimonials'

import SubscribePresetPlan from '../../Subscription/SubscribePresetPlan'

type SubscriptionStepProps = {
  showTestimonials?: boolean
  activePresetPlanName?: string | null
}

const SubscriptionStep: React.FC<SubscriptionStepProps> = ({
  showTestimonials = true,
  activePresetPlanName,
}) => {
  return (
    <div className="box-col-full overflow-hidden">
      {showTestimonials && (
        <>
          {/* Testimonials Section */}
          <Testimonials onBookDemo={() => {}} hasActionButton={false} />
        </>
      )}

      {/* Pricing Plans */}
      <div className="rounded-lg pb-4">
        <SubscribePresetPlan activePresetPlanName={activePresetPlanName} />
      </div>
    </div>
  )
}

export default SubscriptionStep
