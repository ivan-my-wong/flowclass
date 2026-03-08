import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import {
  LuArrowRight,
  LuCheckCircle2,
  LuCircle,
  LuLock,
  LuPlay,
} from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import CheckProgress from '@/pages/DashboardChart/CheckProgress'
import { courseState } from '@/stores/courseData'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'

import { getFeatureData } from './components/featureData'
import FeatureModal from './components/FeatureModal'
import { Notifications } from './components/Notifications'

export enum LearningPathItemType {
  VIDEO = 'video',
  ACTION = 'action',
  MILESTONE = 'milestone',
}

export enum LearningPathItemStatus {
  COMPLETE = 'complete',
  NOT_STARTED = 'not-started',
  LOCKED = 'locked',
}

interface LearningPathItem {
  id: string
  title: string
  description: string
  type: LearningPathItemType
  status: LearningPathItemStatus
  action?: () => void
  url?: string
}

const Home = (): JSX.Element => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('starter')
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [userPermission] = useRecoilState(userPermissionState)

  // Get data for progress checking
  const checkProgress = CheckProgress()
  const { courses } = useRecoilValue(courseState)
  const currentUser = useRecoilValue(userState)

  const { t } = useTranslation()

  // Redirect to instructor profile page if user permission is instructor
  useEffect(() => {
    if (userPermission === UserRole.Instructor) {
      navigate(`/settings/users/profile?userId=${currentUser.id}&view=profile`)
    }
  }, [userPermission, currentUser])

  // Helper function to get task status
  const getTaskStatus = (
    checkFunction: () => number
  ): LearningPathItemStatus => {
    const result = checkFunction()
    if (result === -1) {
      return LearningPathItemStatus.LOCKED
    }
    return result
      ? LearningPathItemStatus.COMPLETE
      : LearningPathItemStatus.NOT_STARTED
  }

  // Starter tier learning path items
  const starterItems: LearningPathItem[] = [
    {
      id: 'home-description',
      title: t('onboarding:home.learningPath.starter.homeDescription.title'),
      description: t(
        'onboarding:home.learningPath.starter.homeDescription.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkSchoolDescription()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/school?tab=description'),
    },
    {
      id: 'more-classes',
      title: t('onboarding:home.learningPath.starter.moreClasses.title'),
      description: t(
        'onboarding:home.learningPath.starter.moreClasses.description'
      ),
      type: LearningPathItemType.ACTION,
      status:
        courses && courses.length > 1
          ? LearningPathItemStatus.COMPLETE
          : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/teaching-service/create-course'),
    },
    {
      id: 'course-settings',
      title: t('onboarding:home.learningPath.starter.courseSettings.title'),
      description: t(
        'onboarding:home.learningPath.starter.courseSettings.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkCourseDescription()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/teaching-service/edit-course?tab=description'),
    },
    {
      id: 'custom-fields',
      title: t('onboarding:home.learningPath.starter.customFields.title'),
      description: t(
        'onboarding:home.learningPath.starter.customFields.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkApplicationFormFields()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/settings/student-information-field'),
    },
    {
      id: 'custom-forms',
      title: t('onboarding:home.learningPath.starter.customForms.title'),
      description: t(
        'onboarding:home.learningPath.starter.customForms.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkApplicationForm()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/settings/application-form'),
    },
    {
      id: 'coupons',
      title: t('onboarding:home.learningPath.starter.coupons.title'),
      description: t(
        'onboarding:home.learningPath.starter.coupons.description'
      ),
      type: LearningPathItemType.ACTION,
      status:
        checkProgress.checkCouponFixedAmount() ||
        checkProgress.checkCouponPercentage()
          ? LearningPathItemStatus.COMPLETE
          : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/promotion/coupon-code'),
    },
    {
      id: 'online-payment',
      title: t('onboarding:home.learningPath.starter.onlinePayment.title'),
      description: t(
        'onboarding:home.learningPath.starter.onlinePayment.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkActivePaymentMethod()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/settings/payments'),
    },
  ]

  // Scaling tier learning path items
  const scalingItems: LearningPathItem[] = [
    {
      id: 'tracking-attendance',
      title: t('onboarding:home.learningPath.scaling.trackingAttendance.title'),
      description: t(
        'onboarding:home.learningPath.scaling.trackingAttendance.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkAttendanceModifications()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () =>
        navigate(
          '/full-calendar?student=&classes=&onlyWithApplications=false&location=&teachers='
        ),
    },
    {
      id: 'adding-class-to-students',
      title: t(
        'onboarding:home.learningPath.scaling.addingClassToStudents.title'
      ),
      description: t(
        'onboarding:home.learningPath.scaling.addingClassToStudents.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkHaveCourse()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/student-record'),
    },
    {
      id: 'import-students',
      title: t('onboarding:home.learningPath.scaling.importStudents.title'),
      description: t(
        'onboarding:home.learningPath.scaling.importStudents.description'
      ),
      type: LearningPathItemType.ACTION,
      status: getTaskStatus(() => checkProgress.checkStudentImported()),
      action: () => navigate('/student-record'),
    },
    {
      id: 'invoice-campaign',
      title: t('onboarding:home.learningPath.scaling.invoiceCampaign.title'),
      description: t(
        'onboarding:home.learningPath.scaling.invoiceCampaign.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkInvoiceCampaignCreated()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/invoice-templates'),
    },
    {
      id: 'enter-address',
      title: t('onboarding:home.learningPath.scaling.enterAddress.title'),
      description: t(
        'onboarding:home.learningPath.scaling.enterAddress.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkSchoolContact()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/contact'),
    },
  ]

  // Multi Branch tier learning path items
  const multiBranchItems: LearningPathItem[] = [
    {
      id: 'inviting-instructors',
      title: t(
        'onboarding:home.learningPath.multiBranch.invitingInstructors.title'
      ),
      description: t(
        'onboarding:home.learningPath.multiBranch.invitingInstructors.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkInstructorInvited()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/settings/users'),
    },
    {
      id: 'student-credits',
      title: t('onboarding:home.learningPath.multiBranch.studentCredits.title'),
      description: t(
        'onboarding:home.learningPath.multiBranch.studentCredits.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkStudentCreditSystem()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/feature-enable'),
    },
    {
      id: 'add-locations',
      title: t('onboarding:home.learningPath.multiBranch.addLocations.title'),
      description: t(
        'onboarding:home.learningPath.multiBranch.addLocations.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkLocationAdded()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/locations'),
    },
    {
      id: 'approval-requests',
      title: t(
        'onboarding:home.learningPath.multiBranch.approvalRequests.title'
      ),
      description: t(
        'onboarding:home.learningPath.multiBranch.approvalRequests.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkRescheduleApproval()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/reschedule-approval'),
    },
    {
      id: 'whatsapp-templates',
      title: t(
        'onboarding:home.learningPath.multiBranch.automationFlows.title'
      ),
      description: t(
        'onboarding:home.learningPath.multiBranch.automationFlows.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkWhatsappTemplate()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/custom-messages'),
    },
    {
      id: 'assign-hourly-rate',
      title: t(
        'onboarding:home.learningPath.multiBranch.assignHourlyRate.title'
      ),
      description: t(
        'onboarding:home.learningPath.multiBranch.assignHourlyRate.description'
      ),
      type: LearningPathItemType.ACTION,
      status: checkProgress.checkInstructorHourlyRates()
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/settings/users'),
    },
  ]

  // Milestone items for each tier
  const starterMilestones: LearningPathItem[] = [
    {
      id: 'reach-10-students',
      title: t('onboarding:home.learningPath.milestones.reach10Students.title'),
      description: t(
        'onboarding:home.learningPath.milestones.reach10Students.description'
      ),
      type: LearningPathItemType.MILESTONE,
      status: checkProgress.checkStudentCount(10)
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/student-record'),
    },
  ]

  const scalingMilestones: LearningPathItem[] = [
    {
      id: 'reach-50-students-scaling',
      title: t('onboarding:home.learningPath.milestones.reach50Students.title'),
      description: t(
        'onboarding:home.learningPath.milestones.reach50Students.description'
      ),
      type: LearningPathItemType.MILESTONE,
      status: checkProgress.checkStudentCount(50)
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/student-record'),
    },
  ]

  const multiBranchMilestones: LearningPathItem[] = [
    {
      id: 'reach-200-students',
      title: t(
        'onboarding:home.learningPath.milestones.reach200Students.title'
      ),
      description: t(
        'onboarding:home.learningPath.milestones.reach200Students.description'
      ),
      type: LearningPathItemType.MILESTONE,
      status: checkProgress.checkStudentCount(200)
        ? LearningPathItemStatus.COMPLETE
        : LearningPathItemStatus.NOT_STARTED,
      action: () => navigate('/student-record'),
    },
  ]

  // Calculate progress percentage (exclude unmeasurable/locked tasks)
  const calculateProgress = (items: LearningPathItem[]) => {
    const measurableItems = items.filter(
      item => item.status !== LearningPathItemStatus.LOCKED
    )
    if (measurableItems.length === 0) return 0

    const completed = measurableItems.filter(
      item => item.status === LearningPathItemStatus.COMPLETE
    ).length
    return Math.round((completed / measurableItems.length) * 100)
  }

  const getStatusIcon = (status: LearningPathItemStatus) => {
    switch (status) {
      case LearningPathItemStatus.COMPLETE:
        return <LuCheckCircle2 className="w-5 h-5 text-green-500" />
      case LearningPathItemStatus.LOCKED:
        return <LuLock className="w-5 h-5 text-gray-400" />
      default:
        return <LuCircle className="w-5 h-5 text-gray-300" />
    }
  }

  const getStatusText = (status: LearningPathItemStatus) => {
    switch (status) {
      case LearningPathItemStatus.COMPLETE:
        return t('onboarding:home.status.complete')
      case LearningPathItemStatus.LOCKED:
        return t('onboarding:home.status.locked')
      default:
        return t('onboarding:home.status.notStarted')
    }
  }

  const getStatusColor = (status: LearningPathItemStatus) => {
    switch (status) {
      case LearningPathItemStatus.COMPLETE:
        return 'text-green-600'
      case LearningPathItemStatus.LOCKED:
        return 'text-gray-400'
      default:
        return 'text-gray-500'
    }
  }

  // Reusable component for learning path items
  const LearningPathItem = ({ item }: { item: LearningPathItem }) => (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
          {item.type === LearningPathItemType.VIDEO && (
            <LuPlay className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
      </div>
      <div className="flex-shrink-0 flex items-center space-x-3">
        {/* Video play button - always visible and prominent */}
        <button
          type="button"
          onClick={() => handleOpenModal(item.id)}
          className="inline-flex items-center px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 text-xs font-medium rounded-md transition-colors"
          title={t('onboarding:home.actions.learnMore') as string}
        >
          <LuPlay className="w-3 h-3 mr-1" />
          {t('onboarding:home.actions.learnMore')}
        </button>

        {/* Status or Start button */}
        {item.status === LearningPathItemStatus.COMPLETE && (
          <span
            className={`text-sm font-medium ${getStatusColor(item.status)}`}
          >
            {getStatusText(item.status)}
          </span>
        )}
        {item.status === LearningPathItemStatus.LOCKED && (
          <span
            className={`text-sm font-medium ${getStatusColor(item.status)}`}
          >
            {t('onboarding:home.status.unmeasurable')}
          </span>
        )}
        {item.status === LearningPathItemStatus.NOT_STARTED && (
          <Button variant="primary-outline" onClick={item.action}>
            {t('onboarding:home.actions.start')}
            <LuArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )

  // Reusable component for tier content
  const TierContent = ({
    title: _title,
    description,
    items,
    milestones,
  }: {
    title: string
    description: string
    items: LearningPathItem[]
    milestones: LearningPathItem[]
  }) => (
    <div className="pt-4">
      <div className="mb-4">
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-800 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${calculateProgress(items)}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {calculateProgress(items)}% {t('onboarding:home.progress.complete')}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <LearningPathItem key={item.id} item={item} />
        ))}
      </div>

      {/* Milestones */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          {t('onboarding:home.milestones')}
        </h4>
        <div className="space-y-3">
          {milestones.map(item => (
            <div
              key={item.id}
              className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-blue-900">
                  {item.title}
                </h5>
                <p className="text-xs text-blue-700 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const handleOpenModal = (featureId: string) => {
    setSelectedFeature(featureId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFeature(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="box-responsive-full justify-between">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('onboarding:home.welcome', {
                    name:
                      currentUser.fullName || currentUser.firstName || 'User',
                  })}
                </h1>
                {/* Onboarding Button */}
                <Button
                  variant="primary-outline"
                  iconAfter={<LuArrowRight />}
                  onClick={() => navigate('/welcome/set-up')}
                >
                  {t('onboarding:skipDialog.resumeOnboarding')}
                </Button>
              </div>

              <p className="text-lg text-gray-600">
                {t('onboarding:home.subtitle')}
              </p>
            </div>

            {/* Learning Path */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
              {/* Tab Navigation */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="starter">
                    {t('onboarding:home.tabs.starter')}
                  </TabsTrigger>
                  <TabsTrigger value="scaling">
                    {t('onboarding:home.tabs.scaling')}
                  </TabsTrigger>
                  <TabsTrigger value="multi-branch">
                    {t('onboarding:home.tabs.multiBranch')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="starter">
                  <TierContent
                    title={t('onboarding:home.tabs.starter')}
                    description={t('onboarding:home.tierDescriptions.starter')}
                    items={starterItems}
                    milestones={starterMilestones}
                  />
                </TabsContent>

                <TabsContent value="scaling">
                  <TierContent
                    title={t('onboarding:home.tabs.scaling')}
                    description={t('onboarding:home.tierDescriptions.scaling')}
                    items={scalingItems}
                    milestones={scalingMilestones}
                  />
                </TabsContent>

                <TabsContent value="multi-branch">
                  <TierContent
                    title={t('onboarding:home.tabs.multiBranch')}
                    description={t(
                      'onboarding:home.tierDescriptions.multiBranch'
                    )}
                    items={multiBranchItems}
                    milestones={multiBranchMilestones}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Notifications Sidebar */}
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
            <Notifications />
          </Card>
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeature && (
        <FeatureModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          {...getFeatureData(t)[selectedFeature]}
        />
      )}
    </div>
  )
}

export default Home
