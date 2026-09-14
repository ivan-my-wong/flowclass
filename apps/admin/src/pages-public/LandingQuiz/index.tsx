import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import SalesQuiz from './components/SalesQuiz'

interface CalculatorData {
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
}

const QuizPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation('onboarding')
  const [activeStep, setActiveStep] = useState(0)
  const totalSteps = 14 // Total number of quiz questions

  const handleCalculate = (total: number) => {
    // Handle calculation if needed
    console.log('Calculated total:', total)
  }

  const handleContactSales = (
    calculatorData: CalculatorData,
    planName: string,
    price: number
  ) => {
    // Navigate to pricing page with calculator data
    const pricingUrl = `/pricing?calculator=true&plan=${planName}&price=${price}`
    window.location.href = pricingUrl
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step)
  }

  const getProgressPercentage = () => {
    return ((activeStep + 1) / totalSteps) * 100
  }

  return (
    <div className="bg-white overflow-hidden min-h-screen">
      {/* Light alternating gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" />

      {/* Header with logo and back button */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        {activeStep > 0 ? (
          <button
            type="button"
            onClick={() => setActiveStep(activeStep - 1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}

        <img
          src="/src/assets/logos/flowclass.png"
          alt="Flowclass"
          className="h-8 w-auto"
        />

        {/* Step counter in upper right */}
        <div className="text-sm font-medium text-gray-600">
          {activeStep + 1} / {totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white border-b border-gray-100">
        <div className="w-full bg-gray-200 h-2">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col">
        {/* Quiz container with proper spacing */}
        <div className="flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-3xl">
            <SalesQuiz
              onCalculate={handleCalculate}
              onContactSales={handleContactSales}
              activeStep={activeStep}
              totalSteps={totalSteps}
              onStepChange={handleStepChange}
            />
          </div>
        </div>
      </div>

      {/* Teacher image positioned optimally on the right side */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -z-10 pointer-events-none">
        <img
          src="/src/assets/pricing/teacher_talking_to_students_2.png"
          alt="Teacher with students"
          className="h-96 w-auto opacity-90"
        />
      </div>
    </div>
  )
}

export default QuizPage
