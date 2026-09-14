/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'

import { submitQuote } from '@/api/pricingPage'
import { Button } from '@/components/ui/Button'
import { REGISTRATION_URL } from '@/constants/common'
import { formatCurrencyWithName } from '@/utils/currency'

import ContactSalesForm from './ContactForms/ContactSalesForm'

interface QuizData {
  studentCount: string
  schoolCount: string
  setupAssistance: boolean
  adminStaff: string
  tutorCount: string
  classTypes: string[]
  premiumFeatures: string[]
  notificationChannels: string[]
  promotionFeatures: string[]
  contactInfo: {
    name: string
    email: string
    phone: string
    company?: string
    website?: string
  }
  submitStatus?: {
    success: boolean
    message: string
  }
}

interface PainPointQuizProps {
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
}

const PricingCalculator = ({
  selectedCurrency,
  selectedDuration,
}: PainPointQuizProps): JSX.Element => {
  const { t } = useTranslation('subscription')
  const { t: tOnboarding } = useTranslation('onboarding')
  const [currentStep, setCurrentStep] = useState(1)
  const [quizData, setQuizData] = useState<QuizData>({
    studentCount: '',
    schoolCount: '',
    setupAssistance: false,
    adminStaff: '',
    tutorCount: '',
    classTypes: [],
    premiumFeatures: [],
    notificationChannels: [],
    promotionFeatures: [],
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      company: '',
    },
  })

  const totalSteps = 16

  // Updated pricing calculations based on actual subscription plan prices
  const calculateTotalAnnual = (): number => {
    let total = 0

    // Student count pricing (Base User Tiers)
    switch (quizData.studentCount) {
      case '0-100':
        total += 0
        break
      case '101-500':
        total += 800 // HKD 800/year
        break
      case '501-1500':
        total += 2800 // HKD 2800/year
        break
      case '1501-3000':
        total += 4800 // HKD 4800/year
        break
      case '3001-5000':
        total += 6800 // HKD 6800/year
        break
      case '5001-10000':
        total += 9800 // HKD 9800/year
        break
      case '10000+':
        total += 19800 // HKD 19800/year
        break
      default:
        total += 0
        break
    }

    // School count pricing (Multiple Institution) - Per year per additional school
    switch (quizData.schoolCount) {
      case '1':
        // First school is free
        total += 0
        break
      case '2-4':
        // HKD 500/year per additional school for 2-4 schools
        total += 3 * 500 // 3 additional schools
        break
      case '5-10':
        // HKD 500 for first 3 additional + HKD 480/year for schools 5-10
        total += 3 * 500 + 5 * 480 // 3 at 500 + 5 at 480
        break
      case '10+':
        // For 10+ schools, use the unlimited pricing
        total += 30000
        break
      default:
        total += 0
        break
    }

    // Setup assistance (Setup Fee) - One-time fee
    if (quizData.setupAssistance) {
      switch (quizData.schoolCount) {
        case '1':
          total += 2800 // HKD 2800 for first school
          break
        case '2-4':
          total += 2800 + 2 * 1400 // HKD 1400 per additional school (assuming 3 schools)
          break
        case '5-10':
          total += 2800 + 2 * 1400 + 5 * 1000 // HKD 1000 per school after 3 (assuming 8 schools)
          break
        case '10+':
          total += 2800 + 2 * 1400 + 7 * 1000 // HKD 1000 per school after 3 (assuming 10 schools)
          break
        default:
          total += 0
          break
      }
    }

    // Admin staff (Multiple Admin) - Per year per additional admin
    switch (quizData.adminStaff) {
      case '1-3':
        // First admin is free, charge for additional admins (assuming 3 admins)
        total += 2 * 300 // 2 additional admins
        break
      case '4-10':
        // HKD 300 for first 3 additional + HKD 280/year for admins 5-10 (assuming 7 admins)
        total += 3 * 300 + 4 * 280 // 3 at 300 + 4 at 280
        break
      case '10+':
        // For 10+ admins, use the unlimited pricing
        total += 25000
        break
      default:
        total += 0
        break
    }

    // Tutor count (Multiple Tutor) - Per year per additional tutor
    switch (quizData.tutorCount) {
      case '0-2':
        // First 2 tutors are free
        total += 0
        break
      case '3-10':
        // HKD 200/year per additional tutor for 3-10 tutors (assuming 6 tutors)
        total += 4 * 200 // 4 additional tutors
        break
      case '11-20':
        // HKD 200 for first 3 additional + HKD 190 for next 5 + HKD 180/year for tutors 11-20 (assuming 15 tutors)
        total += 3 * 200 + 5 * 190 + 5 * 180 // 3 at 200 + 5 at 190 + 5 at 180
        break
      case '21-50':
        // HKD 200 for first 3 + HKD 190 for next 5 + HKD 180 for next 10 + HKD 180/year for tutors 21-50 (assuming 35 tutors)
        total += 3 * 200 + 5 * 190 + 10 * 180 + 15 * 180 // 3 at 200 + 5 at 190 + 10 at 180 + 15 at 180
        break
      case '50+':
        // For 50+ tutors, use the unlimited pricing
        total += 25000
        break
      default:
        total += 0
        break
    }

    // Class types (Class Type features)
    // Each class type costs HKD 800/year
    total += quizData.classTypes.length * 800

    // Premium features (Feature Enable)
    // Most features cost HKD 800/year, except Credit System which is HKD 1800/year
    quizData.premiumFeatures.forEach(feature => {
      if (feature === 'Credit System') {
        total += 1800
      } else {
        total += 800
      }
    })

    // Notification channels
    // Email is free, WhatsApp costs HKD 800/year
    if (quizData.notificationChannels.includes('WhatsApp')) {
      total += 800
    }

    // Promotion features
    // Basic promotion is free, advanced promotion costs HKD 1800/year
    if (quizData.promotionFeatures.includes('Trial Lesson')) {
      total += 1800
    }

    return total
  }

  // Get display price based on currency and duration
  const getDisplayPrice = (basePrice: number): string => {
    let price = basePrice

    // Convert to USD if needed (approximate conversion rate)
    if (selectedCurrency === 'USD') {
      price = Math.round(price * 0.128) // Approximate HKD to USD conversion
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      price = Math.round(price / 12)
    }

    const durationText = selectedDuration === 'month' ? 'month' : 'year'

    return `${formatCurrencyWithName(price, selectedCurrency)}/${durationText}`
  }

  const updateQuizData = (field: keyof QuizData, value: unknown) => {
    setQuizData(prev => ({ ...prev, [field]: value }))

    // Auto-advance to next step after a short delay
    setTimeout(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }, 500)
  }

  const analyzeQuizData = (_data: QuizData): string => {
    const totalAnnual = calculateTotalAnnual()
    if (totalAnnual <= 5000) return 'Starter'
    if (totalAnnual <= 15000) return 'Growth'
    if (totalAnnual <= 30000) return 'Professional'
    return 'Enterprise'
  }

  const calculateTotalPrice = () => {
    let total = calculateTotalAnnual()

    // Convert to USD if needed (approximate conversion rate)
    if (selectedCurrency === 'USD') {
      total = Math.round(total * 0.128) // Approximate HKD to USD conversion
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      total = Math.round(total / 12)
    }

    return total
  }

  // const isFormValid = () => {
  //   return (
  //     !!quizData.contactInfo.name &&
  //     !!quizData.contactInfo.email &&
  //     !!quizData.contactInfo.phone
  //   )
  // }

  const handleSubmitQuote = async () => {
    const totalPrice = calculateTotalPrice()
    const recommendedPlan = analyzeQuizData(quizData)

    const formData = {
      name: quizData.contactInfo.name,
      email: quizData.contactInfo.email,
      phone: quizData.contactInfo.phone,
      company: quizData.contactInfo.company,
      website: quizData.contactInfo.website,
      totalPrice: getDisplayPrice(totalPrice),
      recommendedPlan,
      currency: selectedCurrency,
      duration: selectedDuration,
      // Include all quiz data fields
      studentCount: quizData.studentCount,
      schoolCount: quizData.schoolCount,
      setupAssistance: quizData.setupAssistance,
      adminStaff: quizData.adminStaff,
      tutorCount: quizData.tutorCount,
      classTypes: quizData.classTypes,
      premiumFeatures: quizData.premiumFeatures,
      notificationChannels: quizData.notificationChannels,
      promotionFeatures: quizData.promotionFeatures,
    }

    try {
      // Try to send via API first
      const response = await submitQuote(formData)

      if (response.success) {
        setQuizData(prev => ({
          ...prev,
          submitStatus: {
            success: true,
            message: 'Quote request sent successfully!',
          },
        }))
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting quote:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.student.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.student.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: '0-100',
                  emoji: '👥',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.0-100'
                  ),
                },
                {
                  value: '101-500',
                  emoji: '🏫',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.101-500'
                  ),
                },
                {
                  value: '501-1500',
                  emoji: '🎓',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.501-1500'
                  ),
                },
                {
                  value: '1501-3000',
                  emoji: '🌟',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.1501-3000'
                  ),
                },
                {
                  value: '3001-5000',
                  emoji: '♾️',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.3001-5000'
                  ),
                },
                {
                  value: '5001-10000',
                  emoji: '🚀',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.5001-10000'
                  ),
                },
                {
                  value: '10000+',
                  emoji: '🌍',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.students.10000+'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => updateQuizData('studentCount', option.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.studentCount === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-lg text-gray-900">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.school.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.school.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: '1',
                  emoji: '🏫',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.schools.1'
                  ),
                },
                {
                  value: '2-4',
                  emoji: '🏢',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.schools.2-4'
                  ),
                },
                {
                  value: '5-10',
                  emoji: '🏛️',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.schools.5-10'
                  ),
                },
                {
                  value: '10+',
                  emoji: '🌍',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.schools.10+'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => updateQuizData('schoolCount', option.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.schoolCount === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-lg text-gray-900">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.setup.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.setup.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: true,
                  emoji: '✅',
                  label: t('client.section.setup.yesLabel'),
                },
                {
                  value: false,
                  emoji: '❌',
                  label: t('client.section.setup.noLabel'),
                },
              ].map(option => (
                <div
                  key={option.value.toString()}
                  onClick={() =>
                    updateQuizData('setupAssistance', option.value)
                  }
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.setupAssistance === option.value &&
                    !!quizData.setupAssistance
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-lg text-gray-900">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.adminStaff.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.adminStaff.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: '1-3',
                  emoji: '👥',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.admins.1-3'
                  ),
                },
                {
                  value: '4-10',
                  emoji: '👨‍💼',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.admins.4-10'
                  ),
                },
                {
                  value: '10+',
                  emoji: '🏢',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.admins.10+'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value.toString()}
                  onClick={() => updateQuizData('adminStaff', option.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.adminStaff === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-lg text-gray-900">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.tutor.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.tutor.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: '0-2',
                  emoji: '👨‍🏫',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.tutors.0-2'
                  ),
                },
                {
                  value: '3-10',
                  emoji: '👩‍🏫',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.tutors.3-10'
                  ),
                },
                {
                  value: '11-20',
                  emoji: '🎓',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.tutors.11-20'
                  ),
                },
                {
                  value: '21-50',
                  emoji: '🌟',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.tutors.21-50'
                  ),
                },
                {
                  value: '50+',
                  emoji: '♾️',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.tutors.50+'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value.toString()}
                  onClick={() => updateQuizData('tutorCount', option.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.tutorCount === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-lg text-gray-900">
                        {option.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {tOnboarding(
                'pricingPublic.pricingCalculator.classTypes.regular.title'
              )}
            </h3>
            <p className="text-gray-600 mb-6">
              {tOnboarding(
                'pricingPublic.pricingCalculator.classTypes.regular.description'
              )}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Regular',
                  emoji: '📚',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.regular.yesLabel'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.regular.yesDescription'
                  ),
                },
                {
                  value: 'No Regular',
                  emoji: '✋',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.regular.noLabel'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.regular.noDescription'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value.toString()}
                  onClick={() => {
                    if (option.value === 'Regular') {
                      updateQuizData('classTypes', [
                        ...quizData.classTypes,
                        'Regular',
                      ])
                    } else {
                      updateQuizData(
                        'classTypes',
                        quizData.classTypes.filter(t => t !== 'Regular')
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Regular' &&
                    quizData.classTypes.includes('Regular')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {tOnboarding(
                'pricingPublic.pricingCalculator.classTypes.recurring.title'
              )}
            </h3>
            <p className="text-gray-600 mb-6">
              {tOnboarding(
                'pricingPublic.pricingCalculator.classTypes.recurring.description'
              )}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Recurring',
                  emoji: '🔄',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.recurring.yesLabel'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.recurring.yesDescription'
                  ),
                },
                {
                  value: 'No Recurring',
                  emoji: '✋',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.recurring.noLabel'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.recurring.noDescription'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'Recurring') {
                      updateQuizData('classTypes', [
                        ...quizData.classTypes,
                        'Recurring',
                      ])
                    } else {
                      updateQuizData(
                        'classTypes',
                        quizData.classTypes.filter(t => t !== 'Recurring')
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Recurring' &&
                    quizData.classTypes.includes('Recurring')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {tOnboarding(
                'pricingPublic.pricingCalculator.classTypes.appointment.title'
              )}
            </h3>
            <p className="text-gray-600 mb-6">
              {tOnboarding(
                'pricingPublic.pricingCalculator.classTypes.appointment.description'
              )}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Appointment',
                  emoji: '📱',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.appointment.yesLabel'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.appointment.yesDescription'
                  ),
                },
                {
                  value: 'No Appointment',
                  emoji: '✋',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.appointment.noLabel'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.classTypes.appointment.noDescription'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'Appointment') {
                      updateQuizData('classTypes', [
                        ...quizData.classTypes,
                        'Appointment',
                      ])
                    } else {
                      updateQuizData(
                        'classTypes',
                        quizData.classTypes.filter(t => t !== 'Appointment')
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Appointment' &&
                    quizData.classTypes.includes('Appointment')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.addons.steps.featureBranding.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.addons.steps.featureBranding.desc')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Branding',
                  emoji: '🎨',
                  label: t(
                    'client.section.addons.steps.featureBranding.yesLabel'
                  ),
                  description: 'Custom email sender and branding removal',
                },
                {
                  value: 'No Branding',
                  emoji: '✋',
                  label: t(
                    'client.section.addons.steps.featureBranding.noLabel'
                  ),
                  description: 'Keep Flowclass branding',
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'Branding') {
                      updateQuizData('premiumFeatures', [
                        ...quizData.premiumFeatures,
                        'Branding',
                      ])
                    } else {
                      updateQuizData(
                        'premiumFeatures',
                        quizData.premiumFeatures.filter(f => f !== 'Branding')
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Branding' &&
                    quizData.premiumFeatures.includes('Branding')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.addons.steps.featurePortal.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.addons.steps.featurePortal.desc')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Student Portal',
                  emoji: '🌐',
                  label: t(
                    'client.section.addons.steps.featurePortal.yesLabel'
                  ),
                  description: 'Self-service student portal',
                },
                {
                  value: 'No Portal',
                  emoji: '✋',
                  label: t('client.section.addons.steps.featurePortal.noLabel'),
                  description: 'Admin-managed only',
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'Student Portal') {
                      updateQuizData('premiumFeatures', [
                        ...quizData.premiumFeatures,
                        'Student Portal',
                      ])
                    } else {
                      updateQuizData(
                        'premiumFeatures',
                        quizData.premiumFeatures.filter(
                          f => f !== 'Student Portal'
                        )
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Student Portal' &&
                    quizData.premiumFeatures.includes('Student Portal')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 11:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.addons.steps.featureTutorCentral.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.addons.steps.featureTutorCentral.desc')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Tutor Central',
                  emoji: '👨‍💼',
                  label: t(
                    'client.section.addons.steps.featureTutorCentral.yesLabel'
                  ),
                  description: 'Tutor database and management',
                },
                {
                  value: 'No Tutor Central',
                  emoji: '✋',
                  label: t(
                    'client.section.addons.steps.featureTutorCentral.noLabel'
                  ),
                  description: 'Admin-managed only',
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'Tutor Central') {
                      updateQuizData('premiumFeatures', [
                        ...quizData.premiumFeatures,
                        'Tutor Central',
                      ])
                    } else {
                      updateQuizData(
                        'premiumFeatures',
                        quizData.premiumFeatures.filter(
                          f => f !== 'Tutor Central'
                        )
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Tutor Central' &&
                    quizData.premiumFeatures.includes('Tutor Central')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 12:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.addons.steps.featureQrCode.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.addons.steps.featureQrCode.desc')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'QR Code Attendance',
                  emoji: '📱',
                  label: t(
                    'client.section.addons.steps.featureQrCode.yesLabel'
                  ),
                  description: 'QR code check-in system',
                },
                {
                  value: 'No QR Code',
                  emoji: '✋',
                  label: t('client.section.addons.steps.featureQrCode.noLabel'),
                  description: 'Manual attendance only',
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'QR Code Attendance') {
                      updateQuizData('premiumFeatures', [
                        ...quizData.premiumFeatures,
                        'QR Code Attendance',
                      ])
                    } else {
                      updateQuizData(
                        'premiumFeatures',
                        quizData.premiumFeatures.filter(
                          f => f !== 'QR Code Attendance'
                        )
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'QR Code Attendance' &&
                    quizData.premiumFeatures.includes('QR Code Attendance')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 13:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.addons.steps.creditSystem.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.addons.steps.creditSystem.desc')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Credit System',
                  emoji: '💳',
                  label: t('client.section.addons.steps.creditSystem.yesLabel'),
                  description: 'Credit wallet and flexible payments',
                },
                {
                  value: 'No Credit System',
                  emoji: '✋',
                  label: t('client.section.addons.steps.creditSystem.noLabel'),
                  description: 'Standard payment only',
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'Credit System') {
                      updateQuizData('premiumFeatures', [
                        ...quizData.premiumFeatures,
                        'Credit System',
                      ])
                    } else {
                      updateQuizData(
                        'premiumFeatures',
                        quizData.premiumFeatures.filter(
                          f => f !== 'Credit System'
                        )
                      )
                    }
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    option.value === 'Credit System' &&
                    quizData.premiumFeatures.includes('Credit System')
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 14:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.notification.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.notification.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Email',
                  emoji: '📧',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.notifications.emailOnly'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.options.notifications.emailDescription'
                  ),
                },
                {
                  value: 'WhatsApp',
                  emoji: '💬',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.notifications.emailWhatsApp'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.options.notifications.whatsappDescription'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value.toString()}
                  onClick={() => {
                    const newChannels =
                      option.value === 'Email'
                        ? ['Email']
                        : ['Email', 'WhatsApp']
                    updateQuizData('notificationChannels', newChannels)
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.notificationChannels.includes(option.value)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 15:
        return (
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-600 mb-2">
              {t('client.section.promotion.question')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('client.section.promotion.description')}
            </p>
            <div className="space-y-3">
              {[
                {
                  value: 'Basic',
                  emoji: '🎫',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.promotions.basic'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.options.promotions.basicDescription'
                  ),
                },
                {
                  value: 'Advanced',
                  emoji: '🚀',
                  label: tOnboarding(
                    'pricingPublic.pricingCalculator.options.promotions.advanced'
                  ),
                  description: tOnboarding(
                    'pricingPublic.pricingCalculator.options.promotions.advancedDescription'
                  ),
                },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    const newFeatures =
                      option.value === 'Basic'
                        ? ['Coupon']
                        : ['Coupon', 'Trial Lesson']
                    updateQuizData('promotionFeatures', newFeatures)
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    quizData.promotionFeatures.includes(
                      option.value === 'Basic' ? 'Coupon' : 'Trial Lesson'
                    )
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-left">
                        <span className="text-lg text-gray-900 font-medium">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 16:
        return (
          <div className="text-center">
            {/* Contact Information Form */}
            <div className="box-col-full w-full">
              <h4 className="text-lg font-bold text-primary">
                {tOnboarding(
                  'pricingPublic.pricingCalculator.getDetailedQuote'
                )}
              </h4>
              <p className="text-gray-600 mb-6">
                {tOnboarding(
                  'pricingPublic.pricingCalculator.quoteDescription'
                )}
              </p>

              {/* Plan Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border p-6 mb-6 border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {tOnboarding('pricingPublic.pricingCalculator.customPlan')}
                  </div>
                  <div className="text-lg text-blue-700 mb-2">
                    {(() => {
                      let price = calculateTotalPrice()
                      if (selectedCurrency === 'USD') {
                        price = Math.round(price * 0.128)
                      }
                      // Always show monthly rate
                      const monthlyPrice = Math.round(price / 12)
                      const currencySymbol =
                        selectedCurrency === 'HKD' ? 'HK$' : '$'
                      return `${currencySymbol}${monthlyPrice.toLocaleString()}`
                    })()}
                  </div>
                  <div className="text-sm text-blue-600">
                    {tOnboarding('pricingPublic.pricingCalculator.perMonth')}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {tOnboarding(
                      'pricingPublic.pricingCalculator.billedYearlyAt'
                    )}{' '}
                    {(() => {
                      let price = calculateTotalPrice()
                      if (selectedCurrency === 'USD') {
                        price = Math.round(price * 0.128)
                      }
                      const currencySymbol =
                        selectedCurrency === 'HKD' ? 'HK$' : '$'
                      return `${currencySymbol}${price.toLocaleString()}`
                    })()}
                  </div>
                </div>
              </div>

              <ContactSalesForm
                onSubmit={async formData => {
                  // Update quizData with form data
                  setQuizData(prev => ({
                    ...prev,
                    contactInfo: {
                      ...prev.contactInfo,
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      company: formData.company,
                      website: formData.website,
                    },
                  }))

                  // Submit the quote
                  await handleSubmitQuote()
                }}
                quizData={quizData}
                selectedPlan={
                  tOnboarding(
                    'pricingPublic.pricingCalculator.customPlan'
                  ) as string
                }
                calculatedPrice={calculateTotalPrice()}
                selectedCurrency={selectedCurrency}
                selectedDuration={selectedDuration}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show results after step 10
  if (currentStep > totalSteps) {
    const totalAnnual = calculateTotalAnnual()
    const recommendedPlan = analyzeQuizData(quizData)

    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {tOnboarding('pricingPublic.pricingCalculator.personalizedPlan')}
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {getDisplayPrice(totalAnnual)}
          </div>
          <div className="text-lg text-blue-700 mb-2">
            {tOnboarding('pricingPublic.pricingCalculator.recommendedPlan')}{' '}
            {recommendedPlan}
          </div>
          <div className="text-sm text-blue-600">
            {selectedDuration === 'month'
              ? `${tOnboarding(
                  'pricingPublic.pricingCalculator.monthlyEquivalent'
                )}: ${getDisplayPrice(totalAnnual)}`
              : `${tOnboarding(
                  'pricingPublic.pricingCalculator.monthlyEquivalent'
                )}: ${getDisplayPrice(Math.round(totalAnnual / 12))}`}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            onClick={() => {
              // Redirect to checkout page
              window.location.href = `${REGISTRATION_URL}?tier=${recommendedPlan}&currency=${selectedCurrency}&duration=${selectedDuration}`
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {tOnboarding('pricingPublic.pricingCalculator.startUsing')}
          </Button>

          {totalAnnual > 6000 && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                // Redirect to contact page
                window.open('https://flowclass.io/contact', '_blank')
              }}
              className="w-full"
            >
              {tOnboarding('pricingPublic.pricingCalculator.bookDemo')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100"
      id="pricing-calculator"
    >
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {tOnboarding('pricingPublic.pricingCalculator.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {tOnboarding('pricingPublic.pricingCalculator.subtitle')}
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {tOnboarding('pricingPublic.pricingCalculator.step')}{' '}
                {currentStep}{' '}
                {tOnboarding('pricingPublic.pricingCalculator.of')} {totalSteps}
              </span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>
              {tOnboarding('pricingPublic.pricingCalculator.previous')}
            </span>
          </Button>

          <div className="text-sm text-gray-600">
            {tOnboarding('pricingPublic.pricingCalculator.step')} {currentStep}{' '}
            {tOnboarding('pricingPublic.pricingCalculator.of')} {totalSteps}
          </div>

          <Button
            onClick={() =>
              setCurrentStep(Math.min(totalSteps, currentStep + 1))
            }
            disabled={currentStep === totalSteps}
            className="flex items-center space-x-2"
          >
            <span>{tOnboarding('pricingPublic.pricingCalculator.next')}</span>
            <LuArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PricingCalculator
