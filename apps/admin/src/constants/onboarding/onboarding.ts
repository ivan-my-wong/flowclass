import Highcharts from 'highcharts'

type TaskProps = {
  id: string
  url: string
}

export const Tasks: Record<string, TaskProps> = {
  CentreUploadLogo: {
    id: 'centre-upload-logo',
    url: '/tc/:tcId/?tab=1',
  },
  CentreUploadInfo: {
    id: 'centre-upload-info',
    url: '/tc/:tcId/?tab=1',
  },
  CentreWriteDescription: {
    id: 'centre-write-description',
    url: '/tc/:tcId/?tab=2',
  },
  CentreUploadGallery: {
    id: 'centre-upload-gallery',
    url: '/tc/:tcId/?tab=3',
  },
  CourseBasicInformation: {
    id: 'course-basic-information',
    url: '/tc/:tcId/courses/?tab=0',
  },
  CourseDescription: {
    id: 'course-description',
    url: '/tc/:tcId/courses/?tab=0',
  },
  CourseLessonTime: {
    id: 'course-lesson-time',
    url: '/tc/:tcId/courses/?tab=0',
  },
  CourseUploadBanner: {
    id: 'course-upload-banner',
    url: '/tc/:tcId/courses/?tab=0',
  },
  ClassDescription: {
    id: 'class-description',
    url: '/tc/:tcId/courses?tab=2',
  },
  ClassTimeslots: {
    id: 'class-timeslots',
    url: '/tc/:tcId/courses?tab=2',
  },
  PromotionDiscountCode: {
    id: 'class-timeslots',
    url: '/',
  },
  PaymentWithdrawalInfo: {
    id: 'payment-withdrawal-info',
    url: '/tc/:tcId/settings/account-info',
  },
  PaymentConnectStripe: {
    id: 'payment-connect-stripe',
    url: '/tc/:tcId/settings/payment-info',
  },
  CourseFillSections: {
    id: 'course-fill-sections',
    url: '/tc/:tcId/settings/payment-info',
  },
}

export const getTaskLink = (tcId: string, taskId: string): string => {
  const task = Object.values(Tasks).find(x => x.id === taskId)
  const url = task?.id || ''

  return url.replace(':tcId', tcId)
}

export const GoalCategory = {
  Course: 'Course',
  Promotion: 'Promotion',
  Centre: 'Centre',
  Payment: 'Payment',
}

export const GoalType = {
  FulfillQuota: 'FULFILL_QUOTA',
  FulfillChecked: 'FULFILL_CHECKED',
}

export const TaskIds = {
  centreUploadLogo: 'centre-upload-logo',
  centreUploadInfo: 'centre-upload-info',
  centreWriteDescription: 'centre-write-description',
  centreUploadGallery: 'centre-upload-gallery',
  courseBasicInformation: 'course-basic-information',
  courseDescription: 'course-description',
  courseLessonTime: 'course-lesson-time',
  courseUploadBanner: 'course-upload-banner',
  classDescription: 'class-description',
  classTimeslots: 'class-timeslots',
  promotionDiscountCode: 'promotion-discount-code',
  paymentWithdrawalInfo: 'payment-withdrawal-info',
  paymentConnectStripe: 'payment-connect-stripe',
  courseFillSections: 'course-fill-sections',
}

interface MetricDefaults {
  name: string
  current: number
  previous: number
  chart: Highcharts.Options
  growthRate: string
}

const createMetric = (name: string): MetricDefaults => ({
  name,
  current: 0,
  previous: 0,
  chart: {},
  growthRate: '',
})

export const defaultMetrics: Record<string, MetricDefaults> = {
  totalRevenue: createMetric('totalRevenue'),
  unpaidRevenue: createMetric('unpaidRevenue'),
  overdueRevenue: createMetric('overdueRevenue'),
  amountReceived: createMetric('amountReceived'),
  paymentsReceived: createMetric('paymentsReceived'),
  paymentToBeReviewed: createMetric('paymentToBeReviewed'),
}

export const defaultTaskState = {
  checkIntlSettings: 0,
  checkTimezoneSettings: 0,
  checkDomain: 0,
  checkSchoolInfo: 0,
  checkSchoolContact: 0,
  checkSchoolLogo: 0,
  checkSchoolBanner: 0,
  checkSchoolGallery: 0,
  checkEmailNotiSetting: 0,
  checkTermsConditions: 0,
  checkSeo: 0,
  checkSocialMedia: 0,
  checkHaveCourse: 0,
  checkHaveClass: 0,
  checkHaveTag: 0,
  checkRegistrationMessage: 0,
  checkSchoolDescription: 0,
  checkCoursePath: 0,
  checkCourseDescription: 0,
  checkCoursePrice: 0,
  checkSchedule: 0,
  checkPublished: 0,
  checkPlan: 0,
  checkAttendanceModifications: 0,
  checkBlockTime: 0,
  checkApplicationFormFields: 0,
  checkApplicationForm: 0,
  checkCurrentApplicationForm: 0,
  checkCouponFixedAmount: 0,
  checkCouponPercentage: 0,
  checkTimezone: 0,
  checkTemplateAndThemeColor: 0,
  checkCustomWebsite: 0,
  checkPayoutMethod: 0,
  checkAdditionalFee: 0,
  checkWhatsappSetting: 0,
  checkTestSendWhatsapp: 0,
  checkWhatsappTemplate: 0,
  checkWhatsappSendLessonReminder: 0,
}
