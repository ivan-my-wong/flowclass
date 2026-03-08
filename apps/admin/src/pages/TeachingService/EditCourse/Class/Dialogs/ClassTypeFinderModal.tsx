import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCalendar, LuHelpCircle, LuX } from 'react-icons/lu'
import { RiRefreshFill } from 'react-icons/ri'

import AppointmentIcon from '@/assets/svgs/courses/AppointmentIcon'
import RegularCourseIcon from '@/assets/svgs/courses/RegularCourseIcon'
import WorkshopIcon from '@/assets/svgs/courses/WorkshopIcon'
import SubscriptionIcon from '@/assets/svgs/SubscriptionIcon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Text from '@/components/ui/Text'
import { ClassTypeEnum } from '@/types/course'
import { cn } from '@/utils/cn'

interface ClassTypeFinderModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectClassType: (classType: ClassTypeEnum) => void
}

interface Question {
  id: string
  question: string
  options: {
    id: string
    label: string
    value: string
  }[]
}

interface Recommendation {
  classType: ClassTypeEnum
  title: string
  description: string
  icon: React.ReactNode
}

const ClassTypeFinderModal = ({
  isOpen,
  onClose,
  onSelectClassType,
}: ClassTypeFinderModalProps): JSX.Element | null => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showRecommendation, setShowRecommendation] = useState(false)

  const questions: Question[] = [
    {
      id: 'timeSlots',
      question: t(
        'teachingService:classTypeFinder.questions.timeSlots.question'
      ),
      options: [
        {
          id: 'yes',
          label: t(
            'teachingService:classTypeFinder.questions.timeSlots.options.yes'
          ),
          value: 'yes',
        },
        {
          id: 'no',
          label: t(
            'teachingService:classTypeFinder.questions.timeSlots.options.no'
          ),
          value: 'no',
        },
      ],
    },
    {
      id: 'recurring',
      question: t(
        'teachingService:classTypeFinder.questions.recurring.question'
      ),
      options: [
        {
          id: 'yes',
          label: t(
            'teachingService:classTypeFinder.questions.recurring.options.yes'
          ),
          value: 'yes',
        },
        {
          id: 'no',
          label: t(
            'teachingService:classTypeFinder.questions.recurring.options.no'
          ),
          value: 'no',
        },
      ],
    },
    {
      id: 'availability',
      question: t(
        'teachingService:classTypeFinder.questions.availability.question'
      ),
      options: [
        {
          id: 'flexible',
          label: t(
            'teachingService:classTypeFinder.questions.availability.options.flexible'
          ),
          value: 'flexible',
        },
        {
          id: 'fixed',
          label: t(
            'teachingService:classTypeFinder.questions.availability.options.fixed'
          ),
          value: 'fixed',
        },
      ],
    },
    {
      id: 'monthlyStart',
      question: t(
        'teachingService:classTypeFinder.questions.monthlyStart.question'
      ),
      options: [
        {
          id: 'yes',
          label: t(
            'teachingService:classTypeFinder.questions.monthlyStart.options.yes'
          ),
          value: 'yes',
        },
        {
          id: 'no',
          label: t(
            'teachingService:classTypeFinder.questions.monthlyStart.options.no'
          ),
          value: 'no',
        },
      ],
    },
  ]

  const recommendations: Record<string, Recommendation> = {
    subscription: {
      classType: ClassTypeEnum.subscription,
      title: t(
        'teachingService:classTypeFinder.recommendations.subscription.title'
      ),
      description: t(
        'teachingService:classTypeFinder.recommendations.subscription.description'
      ),
      icon: <SubscriptionIcon />,
    },
    event: {
      classType: ClassTypeEnum.workshop,
      title: t('teachingService:classTypeFinder.recommendations.event.title'),
      description: t(
        'teachingService:classTypeFinder.recommendations.event.description'
      ),
      icon: <WorkshopIcon />,
    },
    appointment: {
      classType: ClassTypeEnum.appointment,
      title: t(
        'teachingService:classTypeFinder.recommendations.appointment.title'
      ),
      description: t(
        'teachingService:classTypeFinder.recommendations.appointment.description'
      ),
      icon: <AppointmentIcon />,
    },
    regularV2: {
      classType: ClassTypeEnum.regularV2,
      title: t(
        'teachingService:classTypeFinder.recommendations.regularV2.title'
      ),
      description: t(
        'teachingService:classTypeFinder.recommendations.regularV2.description'
      ),
      icon: <RegularCourseIcon />,
    },
    recurring: {
      classType: ClassTypeEnum.recurring,
      title: t(
        'teachingService:classTypeFinder.recommendations.recurring.title'
      ),
      description: t(
        'teachingService:classTypeFinder.recommendations.recurring.description'
      ),
      icon: <RiRefreshFill fill="#13c931" />,
    },
  }

  const getRecommendation = (): Recommendation => {
    const { timeSlots, recurring, availability, monthlyStart } = answers

    // Step 1: Check if students need to select time slots
    if (timeSlots === 'no') {
      return recommendations.subscription
    }

    // Step 2: Check if it's a one-time event
    if (recurring === 'no') {
      return recommendations.event
    }

    // Step 3: Check availability type
    if (availability === 'flexible') {
      return recommendations.appointment
    }

    // Step 4: Check if class begins at start of month
    if (monthlyStart === 'yes') {
      return recommendations.regularV2
    }

    // Default to recurring if no specific match
    return recommendations.recurring
  }

  const handleAnswerSelect = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Check if we can make a recommendation at this step
    if (questionId === 'timeSlots' && value === 'no') {
      setShowRecommendation(true)
      return
    }

    if (questionId === 'recurring' && value === 'no') {
      setShowRecommendation(true)
      return
    }

    if (questionId === 'availability' && value === 'flexible') {
      setShowRecommendation(true)
      return
    }

    // Move to next step
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowRecommendation(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowRecommendation(true)
    }
  }

  const handleCreateClass = () => {
    const recommendation = getRecommendation()
    onSelectClassType(recommendation.classType)
    onClose()
  }

  const handleTakeQuizAgain = () => {
    setCurrentStep(1)
    setAnswers({})
    setShowRecommendation(false)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setAnswers({})
    setShowRecommendation(false)
    onClose()
  }

  if (!isOpen) return null

  const currentQuestion = questions[currentStep - 1]
  const isLastStep = currentStep === questions.length
  const hasAnswer = answers[currentQuestion.id]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <LuHelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('teachingService:classTypeFinder.title')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('teachingService:classTypeFinder.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              {t('teachingService:classTypeFinder.step', {
                current: currentStep,
                total: questions.length,
              })}
            </span>
            <span>{Math.round((currentStep / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showRecommendation ? (
            <>
              {/* Question */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        handleAnswerSelect(currentQuestion.id, option.value)
                      }
                      className={cn(
                        'w-full p-4 text-left border rounded-lg transition-all duration-200',
                        answers[currentQuestion.id] === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                            answers[currentQuestion.id] === option.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          )}
                        >
                          {answers[currentQuestion.id] === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <LuCalendar className="w-4 h-4" />
                  {t('teachingService:classTypeFinder.previous')}
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  className="flex items-center gap-2"
                >
                  {t('teachingService:classTypeFinder.next')}
                  <LuCalendar className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            /* Recommendation */
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuHelpCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('teachingService:classTypeFinder.recommendation.title')}
                </h3>
              </div>

              {/* Recommended Class Type */}
              <Card className="p-6 mb-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    {getRecommendation().icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-600 font-semibold">
                        {t(
                          'teachingService:classTypeFinder.recommendation.recommended'
                        )}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {getRecommendation().title}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {getRecommendation().description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleTakeQuizAgain}
                  className="flex items-center gap-2"
                >
                  {t('teachingService:classTypeFinder.takeQuizAgain')}
                </Button>
                <Button
                  onClick={handleCreateClass}
                  className="flex items-center gap-2"
                >
                  {t('teachingService:classTypeFinder.createClass', {
                    classType: getRecommendation().title,
                  })}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClassTypeFinderModal
