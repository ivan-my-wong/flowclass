import { useTranslation } from 'react-i18next'
import {
  LuArrowRight,
  LuCalendar,
  LuCheck,
  LuMapPin,
  LuTarget,
  LuUsers,
} from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface QuizData {
  studentCount: string
  schoolCount: string
  painPoints: string[]
  currentTools: string[]
  budget: string
  timeline: string
  features: string[]
}

interface QuizResultsProps {
  quizData: QuizData
  recommendedPlan: string
  onProceedToCheckout: () => void
  onBackToQuiz: () => void
}

const QuizResults = ({
  quizData,
  recommendedPlan,
  onProceedToCheckout,
  onBackToQuiz,
}: QuizResultsProps): JSX.Element => {
  const { t } = useTranslation('onboarding')

  const getPlanDetails = (planId: string) => {
    const plans = {
      individual: {
        name: 'Individual Trainers & Tutors',
        price: 800,
        description:
          'Perfect for individual trainers and small tutoring businesses',
        features: [
          'Up to 100 students',
          '1 school location',
          '3 managers',
          '2 tutors',
          'Student portal',
          'Basic notifications',
        ],
      },
      startup: {
        name: 'Startup Education Centres',
        price: 3800,
        description: 'Ideal for growing education centers with multiple staff',
        features: [
          'Up to 500 students',
          '1 school location',
          '3 managers',
          '5 tutors',
          'Student portal',
          'Reschedule requests',
          'Tutor central',
          'Advanced notifications',
        ],
      },
      small: {
        name: 'Small-scale Education Centres',
        price: 6800,
        description: 'Great for established centers with multiple locations',
        features: [
          'Up to 1,500 students',
          '4 school locations',
          '3 managers',
          '10 tutors',
          'Student portal',
          'Reschedule requests',
          'Tutor central',
          'QR code attendance',
          'Credit system',
          'Advanced notifications',
        ],
      },
      medium: {
        name: 'Medium-size Education Centres',
        price: 12800,
        description: 'Perfect for larger institutions with complex needs',
        features: [
          'Up to 5,000 students',
          '10 school locations',
          '10 managers',
          '20 tutors',
          '2 class types',
          'All features included',
          'Advanced analytics',
          'Multi-location support',
        ],
      },
    }
    return plans[planId as keyof typeof plans] || plans.individual
  }

  const planDetails = getPlanDetails(recommendedPlan)

  const formatStudentCount = (count: string) => {
    if (count === '1501+') return '1,501+'
    return count
  }

  const formatSchoolCount = (count: string) => {
    if (count === '1') return '1 location'
    if (count === '10+') return '10+ locations'
    return `${count} locations`
  }

  const formatBudget = (budget: string) => {
    switch (budget) {
      case 'under-1000':
        return 'Under $1,000/year'
      case '1000-5000':
        return '$1,000 - $5,000/year'
      case '5000-10000':
        return '$5,000 - $10,000/year'
      case '10000+':
        return '$10,000+/year'
      default:
        return 'Not specified'
    }
  }

  const formatTimeline = (timeline: string) => {
    switch (timeline) {
      case 'immediately':
        return 'Immediately'
      case '1-month':
        return 'Within 1 month'
      case '3-months':
        return 'Within 3 months'
      case '6-months':
        return 'Within 6 months'
      default:
        return 'Not specified'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Recommendation
          </h1>
          <p className="text-xl text-gray-600">
            Based on your answers, Here is the plan that best fits your needs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quiz Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LuTarget className="w-5 h-5 text-purple-600" />
                  <span>Your Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <LuUsers className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">
                    {formatStudentCount(quizData.studentCount)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <LuMapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Locations:</span>
                  <span className="font-medium">
                    {formatSchoolCount(quizData.schoolCount)}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Key Challenges:</span>
                  <div className="space-y-1">
                    {quizData.painPoints.slice(0, 3).map((painPoint, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span className="text-sm text-gray-700">
                          {painPoint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Budget:</span>
                  <div className="text-sm font-medium text-gray-700">
                    {formatBudget(quizData.budget)}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Timeline:</span>
                  <div className="text-sm font-medium text-gray-700">
                    {formatTimeline(quizData.timeline)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Plan */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="text-center">
                <Badge className="bg-purple-600 text-white mb-2">
                  Recommended for You
                </Badge>
                <CardTitle className="text-2xl text-gray-900">
                  {planDetails.name}
                </CardTitle>
                <p className="text-gray-600">{planDetails.description}</p>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${planDetails.price.toLocaleString()}
                  </div>
                  <div className="text-gray-600">per year</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ${Math.round(planDetails.price / 12).toLocaleString()}/month
                    equivalent
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900">
                    What&apos;s included:
                  </h4>
                  {planDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <LuCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    onClick={onProceedToCheckout}
                    size="lg"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                  >
                    Get Started with This Plan
                    <LuArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Not the right fit?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Need a Custom Solution?
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Contact our sales team for personalized pricing and features
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Sales
                  </Button>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Want to Try Again?
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Retake the quiz with different answers
                  </p>
                  <Button variant="outline" size="sm" onClick={onBackToQuiz}>
                    Retake Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default QuizResults
