import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import {
  LuBuilding2,
  LuCalendar,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuCreditCard,
  LuGlobe,
  LuHeadphones,
  LuMessageSquare,
  LuSettings,
  LuStar,
  LuUsers,
} from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { TextInput } from '@/components/ui/Inputs/TextInput'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import ContactSalesForm from '@/pages-public/PricingPublic/components/ContactForms/ContactSalesForm'

interface SalesQuizProps {
  onCalculate?: (total: number) => void
  onContactSales?: (quizData: any, planName: string, price: number) => void
  activeStep: number
  totalSteps: number
  onStepChange: (step: number) => void
}

interface CalculatorState {
  studentCount: number
  workload: number
  communication: number
  parentUpdates: number
  paymentReminders: number
  tuitionCollection: number
  attendanceTracking: number
  makeupLessons: number
  bookingProcess: number
  multipleLocations: number
  staffManagement: number
  website: number
  support: number
  userEmail: string
  userName: string
  userPhone: string
  contactInfo: number
}

const initialState: CalculatorState = {
  studentCount: 0,
  workload: 0,
  communication: 0,
  parentUpdates: 0,
  paymentReminders: 0,
  tuitionCollection: 0,
  attendanceTracking: 0,
  makeupLessons: 0,
  bookingProcess: 0,
  multipleLocations: 0,
  staffManagement: 0,
  website: 0,
  support: 0,
  userEmail: '',
  userName: '',
  userPhone: '',
  contactInfo: 0,
}

const SalesQuiz = ({
  onCalculate,
  onContactSales,
  activeStep,
  totalSteps,
  onStepChange,
}: SalesQuizProps): JSX.Element => {
  const { t } = useTranslation('onboarding')
  const [state, setState] = useState<CalculatorState>(initialState)
  const [showResults, setShowResults] = useState(false)
  const [animateResults, setAnimateResults] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>(
    'forward'
  )
  const [isTransitioning, setIsTransitioning] = useState(false)

  const questions = [
    { key: 'studentCount', icon: LuUsers, category: 'Basic Info' },
    { key: 'workload', icon: LuSettings, category: 'Operations' },
    { key: 'communication', icon: LuMessageSquare, category: 'Communication' },
    { key: 'parentUpdates', icon: LuMessageSquare, category: 'Communication' },
    { key: 'paymentReminders', icon: LuCreditCard, category: 'Payments' },
    { key: 'tuitionCollection', icon: LuCreditCard, category: 'Payments' },
    { key: 'attendanceTracking', icon: LuCalendar, category: 'Operations' },
    { key: 'makeupLessons', icon: LuCalendar, category: 'Operations' },
    { key: 'bookingProcess', icon: LuCalendar, category: 'Operations' },
    { key: 'multipleLocations', icon: LuBuilding2, category: 'Growth' },
    { key: 'staffManagement', icon: LuUsers, category: 'Management' },
    { key: 'website', icon: LuGlobe, category: 'Digital' },
    { key: 'support', icon: LuHeadphones, category: 'Support' },
    { key: 'contactInfo', icon: LuUsers, category: 'Contact Information' },
  ]

  const calculateTotal = useMemo(() => {
    let total = 0
    let complexity = 0

    // Calculate complexity score (0-3 for each question)
    Object.values(state).forEach(value => {
      complexity += value
    })

    // Base pricing based on complexity
    if (complexity <= 15) {
      total = 800 // Basic plan
    } else if (complexity <= 25) {
      total = 2800 // Starter plan
    } else if (complexity <= 35) {
      total = 6800 // Professional plan
    } else {
      total = 12800 // Enterprise plan
    }

    // Adjust based on student count
    if (state.studentCount === 3) total += 1000 // 501-1500 students
    if (state.studentCount === 4) total += 2000 // 1501+ students

    // Adjust based on multiple locations
    if (state.multipleLocations >= 2) total += 1350

    onCalculate?.(total)
    return total
  }, [state, onCalculate])

  const getPlanName = (total: number) => {
    if (total <= 1000) return 'Basic'
    if (total <= 3000) return 'Starter'
    if (total <= 7000) return 'Professional'
    return 'Enterprise'
  }

  const getPlanFeatures = (total: number) => {
    const baseFeatures = [
      'Student Management',
      'Basic Reporting',
      'Email Support',
    ]

    if (total > 1000) baseFeatures.push('Parent Portal', 'Payment Reminders')
    if (total > 3000)
      baseFeatures.push('QR Code Attendance', 'Advanced Analytics')
    if (total > 7000)
      baseFeatures.push('Multi-location Support', 'Priority Support')

    return baseFeatures
  }

  const updateState = (key: keyof CalculatorState, value: number | string) => {
    setState(prev => ({ ...prev, [key]: value }))

    // For contact info step, don't auto-advance
    if (key === 'contactInfo') {
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 800)
      return
    }

    // Trigger flashing animation
    setIsFlashing(true)

    // Auto-advance to next step after flashing animation
    setTimeout(() => {
      if (activeStep < questions.length - 1) {
        setStepDirection('forward')
        setIsTransitioning(true)
        setTimeout(() => {
          onStepChange(activeStep + 1)
          setIsTransitioning(false)
          setIsFlashing(false)
        }, 300)
      } else {
        setShowResults(true)
        setIsFlashing(false)
        setTimeout(() => setAnimateResults(true), 100)
      }
    }, 800) // 800ms delay to allow flashing animation to complete
  }

  const handleContactInfoSubmit = () => {
    if (state.userName && state.userEmail && state.userPhone) {
      setIsFlashing(true)
      setTimeout(() => {
        setShowResults(true)
        setIsFlashing(false)
        setTimeout(() => setAnimateResults(true), 100)
      }, 800)
    }
  }

  const nextStep = () => {
    if (activeStep < questions.length - 1) {
      setStepDirection('forward')
      setIsTransitioning(true)
      setTimeout(() => {
        onStepChange(activeStep + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      setShowResults(true)
      setTimeout(() => setAnimateResults(true), 100)
    }
  }

  const previousStep = () => {
    if (activeStep > 0) {
      setStepDirection('backward')
      setIsTransitioning(true)
      setTimeout(() => {
        onStepChange(Math.max(0, activeStep - 1))
        setIsTransitioning(false)
      }, 300)
    }
  }

  const QuestionCard = ({
    question,
    index,
  }: {
    question: (typeof questions)[0]
    index: number
  }) => {
    const Icon = question.icon
    const questionKey = question.key as keyof CalculatorState
    const currentValue = state[questionKey]

    return (
      <div
        className={`space-y-8 transition-all duration-500 ease-in-out transform ${
          isTransitioning
            ? 'translate-x-full opacity-0 scale-95'
            : 'translate-x-0 opacity-100 scale-100'
        } ${
          isFlashing ? 'animate-pulse scale-105 rounded-xl p-4 shadow-lg' : ''
        }`}
      >
        {/* Question Header */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
            {t(`pricingCalculator.questions.${questionKey}.title`)}
          </h3>
        </div>

        {/* Options */}
        {questionKey === 'contactInfo' ? (
          <ContactSalesForm
            selectedPlan="Custom Plan"
            calculatedPrice={calculateTotal}
            selectedCurrency="HKD"
            selectedDuration="year"
            onSubmit={formData => {
              // Update the state with form data
              setState(prev => ({
                ...prev,
                userName: formData.name,
                userEmail: formData.email,
                userPhone: formData.phone,
              }))

              // Trigger the contact info submission
              handleContactInfoSubmit()
            }}
          />
        ) : (
          <RadioGroup
            value={currentValue.toString()}
            onValueChange={value =>
              updateState(questionKey, parseInt(value, 10))
            }
            className="space-y-4"
          >
            {(
              t(`pricingCalculator.questions.${questionKey}.options`, {
                returnObjects: true,
              }) as string[]
            ).map((option, optionIndex) => (
              <div key={optionIndex} className="relative">
                <RadioGroupItem
                  value={(optionIndex + 1).toString()}
                  id={`${questionKey}-${optionIndex}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`${questionKey}-${optionIndex}`}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                    currentValue === optionIndex + 1
                      ? `border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md ${
                          isFlashing
                            ? 'animate-pulse scale-105 ring-4 ring-blue-300'
                            : ''
                        }`
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center h-5 mt-0.5">
                    <div
                      className={`w-4 h-4 border-2 rounded-full transition-all duration-300 ${
                        currentValue === optionIndex + 1
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {currentValue === optionIndex + 1 && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 leading-relaxed">
                    {option}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    )
  }

  const ResultsCard = () => {
    const planName = getPlanName(calculateTotal)
    const features = getPlanFeatures(calculateTotal)
    const monthlyPrice = Math.round(calculateTotal / 12)

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-1000 ${
              animateResults
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 scale-110'
                : 'bg-gradient-to-br from-blue-100 to-blue-200 scale-100'
            }`}
          >
            <LuStar
              className={`w-10 h-10 text-white transition-all duration-1000 ${
                animateResults ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
              }`}
            />
          </div>
          <div className="space-y-2">
            <h2
              className={`text-3xl font-bold text-gray-900 transition-all duration-1000 ${
                animateResults
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              }`}
            >
              {t('pricingCalculator.results.title')}
            </h2>
            <p
              className={`text-gray-600 transition-all duration-1000 delay-200 ${
                animateResults
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              }`}
            >
              {t('pricingCalculator.results.subtitle')}
            </p>
          </div>
        </div>

        {/* Plan Card */}
        <Card
          className={`overflow-hidden border-0 shadow-2xl transition-all duration-1000 delay-300 ${
            animateResults ? 'scale-105 shadow-blue-200' : 'scale-100'
          }`}
        >
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white text-center">
              <div className="space-y-4">
                <h3
                  className={`text-2xl font-bold transition-all duration-1000 delay-400 ${
                    animateResults
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  {planName} Plan
                </h3>
                <div
                  className={`space-y-2 transition-all duration-1000 delay-500 ${
                    animateResults
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  <div className="text-5xl font-bold">
                    HK${monthlyPrice.toLocaleString()}
                  </div>
                  <div className="text-purple-100">
                    {t('pricingCalculator.results.monthlyPrice')}
                  </div>
                  <div className="text-sm text-blue-200">
                    {t('pricingCalculator.results.saveWithYearly')} (HK$
                    {calculateTotal.toLocaleString()})
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <h4
                  className={`text-lg font-semibold text-gray-900 transition-all duration-1000 delay-600 ${
                    animateResults
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  {t('pricingCalculator.results.features')}
                </h4>
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={feature}
                      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-1000 ${
                        animateResults
                          ? 'translate-x-0 opacity-100'
                          : 'translate-x-4 opacity-0'
                      }`}
                      style={{ transitionDelay: `${700 + index * 100}ms` }}
                    >
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <LuCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 pt-6 transition-all duration-1000 delay-1000 ${
                  animateResults
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                }`}
              >
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  onClick={() =>
                    onContactSales?.(state, planName, calculateTotal)
                  }
                >
                  Start Using
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-lg font-semibold"
                  onClick={() => {
                    const message = `Hi! I'm interested in the ${planName} Plan for HK$${calculateTotal.toLocaleString()}/year. Here are my details:\n\nName: ${
                      state.userName
                    }\nEmail: ${state.userEmail}\nPhone: ${
                      state.userPhone
                    }\n\nCan you help me get started?`
                    const whatsappUrl = `https://wa.me/85257225763?text=${encodeURIComponent(
                      message
                    )}`
                    window.open(whatsappUrl, '_blank')
                  }}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <ResultsCard />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Content - No Card */}
      <div className="min-h-[400px] overflow-hidden relative">
        <div
          className={`transition-all duration-500 ease-in-out transform ${
            isTransitioning
              ? 'translate-x-full opacity-0 scale-95'
              : 'translate-x-0 opacity-100 scale-100'
          }`}
        >
          <QuestionCard question={questions[activeStep]} index={activeStep} />
        </div>
      </div>
    </div>
  )
}

export default SalesQuiz
