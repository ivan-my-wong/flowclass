import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import {
  PricingTierId,
  pricingTiers,
} from '@/constants/presetSubscriptionPlans'
import { useUserCountry } from '@/hooks/useLocalization'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { PlanType } from '@/types/schoolSubscriptionPlan'

import AddOnsSection from './components/AddOnsSection'
import CompleteSubscriptionPlans from './components/CompleteSubscriptionPlans'
import ExampleClientPricing from './components/ExampleClientPricing'
import FeatureBreakdown from './components/FeatureBreakdown'
import HeroSection from './components/HeroSection'
import MoneyBackGuarantee from './components/MoneyBackGuarantee'
import PricingCalculator from './components/PricingCalculator'
import PricingTiers from './components/PricingTiers'
import Testimonials from './components/Testimonials'
import TrustedBy from './components/TrustedBy'

const PricingPublic = (): JSX.Element => {
  const { i18n } = useTranslation()
  const location = useLocation()
  const [selectedTier, setSelectedTier] = useState<PricingTierId>(
    PricingTierId.Startup
  )
  const [selectedCurrency, setSelectedCurrency] = useState<'HKD' | 'USD'>('HKD')
  const [selectedDuration, setSelectedDuration] = useState<'month' | 'year'>(
    'year'
  )

  // Localization logic
  const [country, isLoading] = useUserCountry()

  // Set language and currency based on URL path (/zh route)
  useEffect(() => {
    if (location.pathname.includes('/zh')) {
      i18n.changeLanguage('zh')
      setSelectedCurrency('HKD')
    }
  }, [location.pathname, i18n])

  // Set default currency and language based on location and iframe host
  useEffect(() => {
    // Don't override if already set by /zh route
    if (location.pathname.includes('/zh')) return

    if (!isLoading && country.toString().length === 2) {
      if (country.toString().toUpperCase() === 'HK') {
        i18n.changeLanguage('zh')
        setSelectedCurrency('HKD')
      } else {
        setSelectedCurrency('USD')
      }
    }
  }, [country, isLoading, location.pathname, i18n])

  // Detect and set language from iframe host
  useEffect(() => {
    // Don't override if already set by /zh route
    if (location.pathname.includes('/zh')) return

    const isInIframe = window !== window.top
    let hasChineseHost = false

    if (isInIframe && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer)
        const hostname = referrerUrl.hostname.toLowerCase()
        const pathname = referrerUrl.pathname.toLowerCase()

        // Chinese language indicators
        const chineseIndicators = ['zh']

        hasChineseHost = chineseIndicators.some(
          indicator =>
            hostname.includes(indicator) || pathname.includes(indicator)
        )
      } catch (error) {
        // Could not parse referrer
      }
    }

    if (hasChineseHost && i18n.language !== 'zh') {
      i18n.changeLanguage('zh')
    }
  }, [i18n, location.pathname])

  // Fetch subscription plans data using the same method as ClientList.tsx
  const { useFetchAllPlanPrices } = usePlanData()
  const { data: availablePlans, refetch: refetchPlans } =
    useFetchAllPlanPrices()

  useEffect(() => {
    refetchPlans()
  }, [refetchPlans])

  // Group plans by type for organized display
  const groupedPlans = useMemo(() => {
    if (!availablePlans || availablePlans.length === 0) return {}

    const availablePlansWithoutActivePlan = availablePlans.filter(
      plan =>
        !plan.name.includes('ACTIVE_PAID') &&
        !plan.name.includes('DEFAULT_SUBSCRIPTION') &&
        !plan.name.includes('CUSTOMER_SUPPORT') &&
        !plan.name.includes('INTEGRATION')
    )

    return availablePlansWithoutActivePlan.reduce((acc, plan) => {
      if (!acc[plan.type]) {
        acc[plan.type] = []
      }
      acc[plan.type].push(plan)
      return acc
    }, {} as Record<PlanType, typeof availablePlans>)
  }, [availablePlans])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      {/* Hero Section */}
      <HeroSection />

      {/* Choose Your Perfect Plan */}
      <PricingTiers
        pricingTiers={pricingTiers}
        selectedTier={selectedTier}
        setSelectedTier={tierId => setSelectedTier(tierId as PricingTierId)}
        selectedCurrency={selectedCurrency}
        selectedDuration={selectedDuration}
        onCurrencyChange={setSelectedCurrency}
        onDurationChange={setSelectedDuration}
      />

      {/* Trusted By Section */}
      <TrustedBy
        onBookDemo={() => window.open('https://flowclass.io/contact', '_blank')}
      />

      {/* Feature Breakdown */}
      <FeatureBreakdown
        selectedCurrency={selectedCurrency}
        selectedDuration={selectedDuration}
      />

      {/* Pain Point Quiz Section */}
      <PricingCalculator
        selectedCurrency={selectedCurrency}
        selectedDuration={selectedDuration}
      />

      {/* Example Client Pricing Section */}
      <ExampleClientPricing
        selectedCurrency={selectedCurrency}
        selectedDuration={selectedDuration}
      />

      {/* Money Back Guarantee */}
      <MoneyBackGuarantee />

      {/* Testimonials */}
      <Testimonials
        onBookDemo={() => window.open('https://flowclass.io/contact', '_blank')}
      />

      {/* Add-ons Section */}
      <AddOnsSection
        onBookDemo={() => window.open('https://flowclass.io/contact', '_blank')}
      />

      {/* Complete Subscription Plans Showcase */}
      <CompleteSubscriptionPlans
        groupedPlans={groupedPlans}
        availablePlans={availablePlans}
        selectedCurrency={selectedCurrency}
        selectedDuration={selectedDuration}
        onCurrencyChange={setSelectedCurrency}
        onDurationChange={setSelectedDuration}
      />
    </div>
  )
}

export default PricingPublic
