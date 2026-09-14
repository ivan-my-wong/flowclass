import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuBookOpen, LuShield } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import { getPresetPlanByName } from '@/constants/presetSubscriptionPlans'
import useSubscriptionPlanData from '@/hooks/useSubscriptionPlanData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { ClientSubscriptionPlanRecord } from '@/types/schoolSubscriptionPlan'

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
}

interface CheckoutPageProps {
  quizData?: any
  selectedPlan?: string
  calculatedPrice?: number
  onBack?: () => void
}

const CheckoutPage = (): JSX.Element => {
  const { t } = useTranslation('onboarding')
  const [searchParams] = useSearchParams()
  const siteData = useRecoilValue(siteState)
  const schoolData = useRecoilValue(schoolState)

  // Get params from URL
  const planFromParams =
    searchParams.get('plan') || 'Small-scale Education Centres'
  const priceFromParams = parseInt(searchParams.get('price') || '6800', 10)
  const quizDataFromParams = searchParams.get('quizData')
    ? JSON.parse(decodeURIComponent(searchParams.get('quizData') || '{}'))
    : {}

  // New params for preset plans
  const tierFromParams = searchParams.get('tier')
  const currencyFromParams =
    (searchParams.get('currency') as 'HKD' | 'USD') || 'HKD'
  const durationFromParams =
    (searchParams.get('duration') as 'month' | 'year') || 'year'

  const [isProcessing, setIsProcessing] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'yearly'
  )
  const [countdown, setCountdown] = useState(900) // 15 minutes in seconds

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  })

  // Subscription plan creation hook
  const { useCreateClientSubscriptionRecord } = useSubscriptionPlanData()
  const { mutate: submitSubscriptionPlan, isLoading: isCreatingPlan } =
    useCreateClientSubscriptionRecord(async data => {
      if (data.checkoutUrl) {
        window.location.replace(data.checkoutUrl)
      }
    })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-generate discount code based on user name and date
  const generateDiscountCode = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const nameInitials = (formData.firstName + formData.lastName)
      .slice(0, 2)
      .toUpperCase()
    return `${nameInitials}${dateStr}`
  }

  // Calculate prices based on billing cycle
  const getDisplayPrice = () => {
    if (billingCycle === 'monthly') {
      return Math.round(priceFromParams / 12)
    }
    return priceFromParams
  }

  const getBillingPeriod = () => {
    return billingCycle === 'monthly' ? 'month' : 'year'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStripeCheckout = async () => {
    setIsProcessing(true)

    try {
      // If this is a preset plan from PricingTiers, create subscription plan first
      if (tierFromParams) {
        await handlePresetPlanCheckout()
        return
      }

      // Original logic for quiz-based plans
      const checkoutData = {
        planName: planFromParams,
        price: priceFromParams,
        billingCycle,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          position: formData.position,
        },
        quizData: quizDataFromParams,
        discountCode: generateDiscountCode(),
      }

      console.log('Creating Stripe checkout session for:', checkoutData)

      // Simulate API call - replace with actual implementation
      const response = { checkoutUrl: 'https://stripe.com/checkout' }

      // Redirect to Stripe checkout
      if (response.checkoutUrl) {
        window.open(response.checkoutUrl, '_blank')
        console.log('Redirecting to Stripe checkout:', response.checkoutUrl)
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to create checkout session. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePresetPlanCheckout = async () => {
    try {
      // Map tier ID to preset plan name
      const tierToPlanMap: Record<string, string> = {
        individual: 'INDIVIDUAL_TRAINERS_TUTORS',
        startup: 'STARTUP_EDUCATION_CENTRES',
        small: 'SMALL_SCALE_EDUCATION_CENTRES',
        medium: 'MEDIUM_SIZE_EDUCATION_CENTRES',
        large: 'LARGE_SIZE_EDUCATION_CENTRES',
      }

      const planName = tierToPlanMap[tierFromParams!]
      if (!planName) {
        console.error('Unknown tier ID:', tierFromParams)
        return
      }

      const presetPlan = getPresetPlanByName(planName)
      if (!presetPlan) {
        console.error('Preset plan not found:', planName)
        return
      }

      // Create subscription plan records based on the preset plan
      const plans: ClientSubscriptionPlanRecord[] = []

      // Base users plan
      if (presetPlan.baseUserQuantity > 0) {
        plans.push({
          category: 'BASE_USER',
          planId: 1, // You'll need to map this to actual plan IDs
          planQuantity: presetPlan.baseUserQuantity,
          interval: durationFromParams,
        })
      }

      // Schools plan
      if (presetPlan.schoolQuantity > 1) {
        plans.push({
          category: 'MULTIPLE_SCHOOL',
          planId: 2, // You'll need to map this to actual plan IDs
          planQuantity: presetPlan.schoolQuantity - 1, // Subtract 1 as first school is included
          interval: durationFromParams,
        })
      }

      // Admins plan
      if (presetPlan.adminQuantity > 3) {
        plans.push({
          category: 'MULTIPLE_ADMIN',
          planId: 3, // You'll need to map this to actual plan IDs
          planQuantity: presetPlan.adminQuantity - 3, // Subtract 3 as first 3 are included
          interval: durationFromParams,
        })
      }

      // Tutors plan
      if (presetPlan.tutorQuantity > 2) {
        plans.push({
          category: 'MULTIPLE_TUTOR',
          planId: 4, // You'll need to map this to actual plan IDs
          planQuantity: presetPlan.tutorQuantity - 2, // Subtract 2 as first 2 are included
          interval: durationFromParams,
        })
      }

      // Class types plan
      const enabledClassTypes = Object.values(
        presetPlan.classTypeEnable
      ).filter(Boolean).length
      if (enabledClassTypes > 1) {
        plans.push({
          category: 'CLASS_TYPE',
          planId: 5, // You'll need to map this to actual plan IDs
          planQuantity: enabledClassTypes - 1, // Subtract 1 as first class type is included
          interval: durationFromParams,
        })
      }

      // Features plan
      const enabledFeatures = Object.values(presetPlan.featureEnable).filter(
        Boolean
      ).length
      if (enabledFeatures > 0) {
        plans.push({
          category: 'FEATURE_ENABLE',
          planId: 6, // You'll need to map this to actual plan IDs
          planQuantity: enabledFeatures,
          interval: durationFromParams,
        })
      }

      // Notification channels plan
      const enabledNotifications = Object.values(
        presetPlan.notificationChannels
      ).filter(Boolean).length
      if (enabledNotifications > 1) {
        plans.push({
          category: 'NOTIFICATION_CHANNEL',
          planId: 7, // You'll need to map this to actual plan IDs
          planQuantity: enabledNotifications - 1, // Subtract 1 as first notification channel is included
          interval: durationFromParams,
        })
      }

      // Promotions plan
      const enabledPromotions = Object.values(presetPlan.promotionTier).filter(
        Boolean
      ).length
      if (enabledPromotions > 1) {
        plans.push({
          category: 'PROMOTION_FEES',
          planId: 8, // You'll need to map this to actual plan IDs
          planQuantity: enabledPromotions - 1, // Subtract 1 as first promotion tier is included
          interval: durationFromParams,
        })
      }

      // Submit the subscription plan
      const payload = {
        institutionId: schoolData.currentSchool?.id || 0,
        siteId: siteData.currentSite?.id || 0,
        plans,
      }

      submitSubscriptionPlan(payload)
    } catch (error) {
      console.error('Error creating subscription plan:', error)
      toast.error('Failed to create subscription plan. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Countdown Timer */}
      <div className="bg-red-600 text-white text-center py-2 font-semibold">
        ⏰ Complete your plan confirmation in {formatTime(countdown)} to secure
        your pricing
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="absolute left-4 top-20 text-primary hover:bg-blue-50"
          >
            <LuArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Confirm Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Review your plan details and provide contact information to proceed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Payment Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Plan Confirmation
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Review your selected plan details below. Click &quot;Confirm
                  Plan&quot; to proceed to secure payment.
                </p>

                {/* Plan Details */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {planFromParams}
                    </h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        HK${getDisplayPrice().toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        per {getBillingPeriod()}
                      </div>
                    </div>
                  </div>

                  {/* Plan Features Summary */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Education Management Platform
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Secure cloud-based solution
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      24/7 customer support
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Free setup and onboarding
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <LuShield className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium text-sm">
                      Secure Payment Processing
                    </span>
                  </div>
                  <p className="text-blue-600 text-xs mt-1">
                    Your payment will be processed securely through Stripe. No
                    payment information is stored on our servers.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={e =>
                        handleInputChange('firstName', e.target.value)
                      }
                      required
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={e =>
                        handleInputChange('lastName', e.target.value)
                      }
                      required
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="email" className="text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    required
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="company" className="text-gray-700">
                    Company/Institution Name
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={e => handleInputChange('company', e.target.value)}
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="position" className="text-gray-700">
                    Position/Role
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={e =>
                      handleInputChange('position', e.target.value)
                    }
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              {/* Billing Cycle */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Billing Cycle
                </h2>
                <div className="flex bg-gray-200 rounded-lg p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      billingCycle === 'monthly'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      billingCycle === 'yearly'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                    <span className="ml-1 text-xs text-green-600">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Pay Now Button */}
              <Button
                onClick={handleStripeCheckout}
                className="w-full bg-primary hover:bg-blue-700 text-white py-4 text-xl font-bold rounded-lg"
                disabled={
                  isProcessing ||
                  isCreatingPlan ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email
                }
                loading={isProcessing || isCreatingPlan}
              >
                {(() => {
                  if (isProcessing || isCreatingPlan) {
                    return tierFromParams ? 'Creating Plan...' : 'Processing...'
                  }
                  return tierFromParams ? 'Confirm Plan' : 'Confirm Plan'
                })()}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Plan Summary
              </h2>

              {/* Product Details */}
              <div className="flex items-start space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <LuBookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium">
                    {planFromParams}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Education Management Platform
                  </p>
                  <p className="text-gray-600 text-sm">
                    Estimated Start: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-primary font-bold text-lg">
                    HK${getDisplayPrice().toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <Label className="text-gray-700 text-sm">Discount code</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    value={generateDiscountCode()}
                    readOnly
                    className="flex-1 bg-white border-gray-300 text-green-600"
                  />
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white px-4">
                    Applied
                  </Button>
                </div>
                <p className="text-green-600 text-xs mt-1">
                  Auto-applied based on your name and today&apos;s date
                </p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    HK${getDisplayPrice().toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-bold text-lg">
                      Total
                    </span>
                    <span className="text-gray-900 font-bold text-lg">
                      HK${getDisplayPrice().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    USD equivalent: $
                    {Math.round(getDisplayPrice() * 0.128).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <LuShield className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Secure Checkout
                  </span>
                </div>
                <p className="text-green-600 text-sm">
                  Your payment is protected with bank-level security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-600">
              <button type="button" className="hover:text-primary">
                Refund policy
              </button>
              <button type="button" className="hover:text-primary">
                Privacy policy
              </button>
              <button type="button" className="hover:text-primary">
                Terms of service
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-primary font-bold text-lg">Flowclass</div>
              <span className="text-gray-600 text-sm">Powered by Stripe</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CheckoutPage
