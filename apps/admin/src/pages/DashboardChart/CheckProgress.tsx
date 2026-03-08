import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'

import { getAllAdditionalFee } from '@/api/additionalFee'
import { hasCreditRecords } from '@/api/credit'
import ApiError from '@/api/errors/apiError'
import { getInstructors } from '@/api/instructors'
import { getAttendanceModifications } from '@/api/lessonDateTime'
import { getWebpageStyle } from '@/api/settingSite'
import { getAllStudentsOfInstitutionNew } from '@/api/student'
import { QUERY_KEY } from '@/constants/queryKey'
import { defaultThemeColor, WebsiteTemplate } from '@/constants/websiteTemplate'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import useCourseData from '@/hooks/useCourseData'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import usePayoutData from '@/hooks/usePayoutData'
import usePromotionData from '@/hooks/usePromotionData'
import { useGetRescheduleApproval } from '@/hooks/useRescheduleApproval'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import useSchoolData from '@/hooks/useSchoolData'
import useWhatsappTemplateData from '@/hooks/useWhatsappTemplateData'
import { courseState } from '@/stores/courseData'
import notificationSettingState from '@/stores/NotificationSettingData'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'
import { siteState } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
  UserRole,
} from '@/stores/userPermissionData'
import { Classes } from '@/types/classes'
import { DiscountType } from '@/types/coupon'
import { ClassTypeEnum, Course } from '@/types/course'
import { RequestTimeChangeStatus } from '@/types/rescheduleApproval'
import { School } from '@/types/school'
import { StripeConnectDetail } from '@/types/stripe-connect'

const defaultSectionValue = '<p><br></p>'

const CheckProgress = (): {
  checkIntlSettings: () => number
  checkTimezoneSettings: () => number
  checkDomain: () => number
  checkSchoolInfo: () => number
  checkSchoolContact: () => number
  checkHaveCourse: () => number
  checkHaveClass: () => number
  checkHaveTag: () => number
  checkRegistrationMessage: () => number
  checkSchoolDescription: () => number
  checkSchoolLogo: () => number
  checkSchoolBanner: () => number
  checkSchoolGallery: () => number
  checkEmailNotiSetting: () => number
  checkTermsConditions: () => number
  checkSeo: () => number
  checkSocialMedia: () => number
  checkCoursePath: () => number
  checkCourseDescription: () => number
  checkCoursePrice: () => number
  checkSchedule: () => number
  checkPublished: () => number
  checkPlan: () => number
  checkStripe: () => Promise<number>
  isCourseNotHaveSchedule: (currentCourse?: Course) => boolean
  isSchoolNotHaveDescription: (currentSchool?: School) => boolean
  isCourseNotHaveDescription: (currentCourse?: Course) => boolean
  isClassNotHaveLessons: (
    currentCourseType: string,
    currentClass?: Classes
  ) => boolean
  checkBlockTime: () => number
  checkPayoutMethod: () => number
  checkAdditionalFee: () => number
  checkApplicationFormFields: () => number
  checkApplicationForm: () => number
  checkCurrentApplicationForm: () => number
  checkCouponFixedAmount: () => number
  checkCouponPercentage: () => number
  checkTimezone: () => number
  checkTemplateAndThemeColor: () => number
  checkCustomWebsite: () => number
  checkAttendanceModifications: () => number
  checkWhatsappSetting: () => number
  checkTestSendWhatsapp: () => number
  checkWhatsappTemplate: () => number
  checkWhatsappSendLessonReminder: () => number
  checkStudentCount: (threshold: number) => number
  checkInvoiceCampaignCreated: () => number
  checkStudentImported: () => number
  checkInstructorInvited: () => number
  checkStudentCreditSystem: () => number
  checkLocationAdded: () => number
  checkRescheduleApproval: () => number
  checkAutomationFlowCreated: () => number
  checkInstructorHourlyRates: () => number
  additionalFeeData: unknown
  checkActivePaymentMethod: () => number
} => {
  const { useFetchExpressAccountDetail } = usePayoutData()
  const { useFetchStripeConnectDetail } = usePayoutData()
  const {
    useFetchCurrentSchool,
    useFetchCurrentSchoolSetting,
    useFetchCurrentSchoolNotificationsSetting,
  } = useSchoolData()
  const { useFetchInvoiceCampaigns } = useInvoiceCampaignData()
  const { useFetchListWhatsappTemplate } = useWhatsappTemplateData()
  const { useFetchLocationRooms } = useLocationRoom()
  const { data: whatsappTemplates } = useFetchListWhatsappTemplate({
    name: '',
    status: 'ALL',
    assignedTo: 'ALL',
    num: 10,
    page: 1,
    order: 'ASC',
    orderBy: 'id',
  })
  const { useFetchAllblockTimeData } = useBlockTimeData()
  const { useFetchAllApplicationFormData, useFetchCurrentApplicationForm } =
    useApplicationFormData()
  const { useFetchPayoutMethodsNew } = usePayoutData()
  const { useFetchAllCouponData } = usePromotionData()
  const { currentCourse } = useCourseData()

  const fetchCouponDataResult = useFetchAllCouponData()
  const stripeDetailResult = useFetchStripeConnectDetail()
  const accountDetailResult = useFetchExpressAccountDetail(
    Boolean(stripeDetailResult.data?.stripeAccountId)
  )

  const { data: blockTimeData } = useFetchAllblockTimeData()
  const { data: applicationFormData } = useFetchAllApplicationFormData()
  const { data: currentApplicationFormData } = useFetchCurrentApplicationForm()
  const { data: payoutMethods } = useFetchPayoutMethodsNew()
  const { data: couponData } = fetchCouponDataResult
  const { data: currentSchoolData } = useFetchCurrentSchool()
  const { data: currentSchoolSetting } = useFetchCurrentSchoolSetting()
  const { data: currentSchoolNotificationsSetting } =
    useFetchCurrentSchoolNotificationsSetting()

  const { currentSite } = useRecoilValue(siteState)
  const { courses } = useRecoilValue(courseState)
  const { currentSetting } = useRecoilValue(notificationSettingState)
  const { activePlan } = useRecoilValue(schoolSubscriptionState)
  const currentUser = useRecoilValue(userState)
  const userPermission = useRecoilValue(userPermissionState)

  const { data: hasAttendanceModifications } = useQuery(
    [QUERY_KEY.course.checkAttendanceModificationsKey, currentSchoolData?.id],
    () => getAttendanceModifications(currentSchoolData?.id ?? 0),
    {
      enabled: !!currentSchoolData?.id,
    }
  )

  const { data: socialMediaSettings } = useQuery(
    [QUERY_KEY.settings.getWebpageSettingSchoolKey, currentSchoolData?.id],
    () => getWebpageStyle(currentSchoolData?.id ?? 0),
    {
      enabled: !!currentSchoolData?.id,
    }
  )

  const { data: additionalFeeData } = useQuery(
    [QUERY_KEY.promotion.getAllAdditionalFeeKey],
    () => {
      return getAllAdditionalFee(
        currentSchoolData?.siteId ?? 0,
        currentSchoolData?.id ?? 0
      )
    },
    {
      enabled: !!currentSchoolData?.id && !!currentSchoolData?.siteId,
      onError: (error: ApiError) => {
        return error
      },
    }
  )

  const { data: studentList } = useQuery(
    [QUERY_KEY.student.studentListNewKey, currentSchoolData?.id],
    () =>
      getAllStudentsOfInstitutionNew({
        id: currentSchoolData?.id ?? 0,
        siteId: currentSite?.id ?? 0,
        userRoleId:
          currentUser.isLogin && AboveInstructorRoles.includes(userPermission)
            ? undefined
            : currentUser.id,
        type: 'ALL',
        payload: {},
      }),
    {
      enabled:
        currentUser.isLogin && !!currentSchoolData?.id && !!currentSite?.id,
    }
  )

  const { data: invoiceCampaigns } = useFetchInvoiceCampaigns({
    page: 1,
    limit: 1,
    search: '',
  })

  const { data: locationRooms } = useFetchLocationRooms()
  const { data: rescheduleApprovals } = useGetRescheduleApproval({
    institutionId: currentSchoolData?.id ?? 0,
  })

  const { data: instructors } = useQuery(
    [QUERY_KEY.user.getInstructorsKey, currentSite?.id, currentSchoolData?.id],
    () => getInstructors(currentSite?.id ?? 0, currentSchoolData?.id ?? 0),
    {
      enabled: !!currentSite?.id && !!currentSchoolData?.id,
    }
  )

  const { data: creditRecords } = useQuery(
    [QUERY_KEY.student.hasCreditRecordsKey, currentSchoolData?.id],
    () => hasCreditRecords(currentSchoolData?.id ?? 0),
    {
      enabled: !!currentSchoolData?.id,
    }
  )

  const checkDomain = (): number => {
    if (!currentSite?.url || currentSite.url === '') {
      return 0
    }

    return 1
  }

  const checkCustomWebsite = (): number => {
    if (!currentSite?.website || currentSite.website === '') {
      return 0
    }

    return 1
  }

  const checkIntlSettings = (): number => {
    if (!currentSite || !currentSite.country || !currentSite.currency) {
      return 0
    }

    return 1
  }
  const checkTimezoneSettings = (): number => {
    if (!currentSite || !currentSite.timeZone) {
      return 0
    }

    return 1
  }

  const checkSchoolInfo = (): number => {
    if (!currentSchoolData?.url || !currentSchoolData?.name) {
      return 0
    }

    return 1
  }

  const checkSchoolDescription = (): number => {
    if (!currentSchoolData?.description) {
      return 0
    }

    let noOfWords = 0
    currentSchoolData?.description?.forEach(section => {
      noOfWords += section.content?.length
    })

    if (noOfWords < 200) {
      return 0
    }

    return 1
  }

  const checkSchoolContact = (): number => {
    if (!currentSchoolData?.phone || !currentSchoolData?.email) {
      return 0
    }
    if (currentSchoolData?.phoneContactMethod === 'WhatsApp') {
      return 1
    }
    return currentSchoolData?.contactId ? 1 : 0
  }

  const checkSchoolLogo = (): number => {
    if (!currentSchoolData?.logo) {
      return 0
    }

    return 1
  }

  const checkSchoolBanner = (): number => {
    if (!currentSchoolData?.bannerImage) {
      return 0
    }

    return 1
  }

  const checkSchoolGallery = (): number => {
    if (!currentSchoolData?.galleries) {
      return 0
    }

    return 1
  }

  const checkEmailNotiSetting = (): number => {
    if (
      currentSetting?.customEmailSender ||
      currentSetting?.displayEmailLogo ||
      currentSetting?.sendLessonReminders ||
      currentSetting?.sendReminders
    ) {
      return 1
    }
    return 0
  }

  const checkTermsConditions = (): number => {
    if (!currentSchoolSetting?.termsCondition) {
      return 0
    }
    return 1
  }

  const checkSeo = (): number => {
    if (!currentCourse?.seoContent) {
      return 0
    }
    return 1
  }

  const checkSocialMedia = (): number => {
    if (socialMediaSettings?.socialMedia?.length === 0) {
      return 0
    }
    return 1
  }

  const checkHaveCourse = (): number => {
    if (!courses || courses.length === 0) {
      return 0
    }

    return 1
  }

  const checkHaveClass = (): number => {
    if (!currentCourse?.classes || currentCourse?.classes.length === 0) {
      return 0
    }
    return 1
  }

  const checkHaveTag = (): number => {
    if (!currentCourse?.tags || currentCourse?.tags.length === 0) {
      return 0
    }
    return 1
  }

  const checkRegistrationMessage = (): number => {
    if (!currentCourse?.registrationMes) {
      return 0
    }
    return 1
  }

  const checkCoursePath = (): number => {
    if (!courses || courses.length === 0) {
      return 0
    }
    const hasUrl = courses.filter(course => course.path !== '')
    if (hasUrl.length === 0) {
      return 0
    }

    return 1
  }

  const checkCourseDescription = (): number => {
    if (!courses || courses.length === 0) {
      return 0
    }

    const hasDescription = courses.some(course => {
      let noOfWords = 0

      if (Array.isArray(course?.longDescriptions)) {
        course?.longDescriptions?.forEach(section => {
          noOfWords += section.content?.length
        })
      }

      if (noOfWords > 200) {
        return true
      }
      return false
    })

    if (hasDescription) {
      return 1
    }

    return 0
  }

  const checkCoursePrice = (): number => {
    if (!courses || courses.length === 0) {
      return 0
    }

    const hasPrice = courses.some(course => {
      return course.classes?.some(singleClass => {
        if (singleClass.type === 'regular') {
          return +singleClass.tuition && +singleClass.tuition > 0
        }
        return false
      })
    })
    if (hasPrice) {
      return 1
    }

    return 0
  }

  const checkSchedule = (): number => {
    if (!courses || courses.length === 0) {
      return 0
    }

    const hasSchedule = courses.some(course => {
      return course.classes?.some(singleClass => {
        if (singleClass.type === 'regular') {
          return singleClass.regularPeriods
            ? singleClass.regularPeriods?.length > 0
            : false
        }
        return false
      })
    })
    if (hasSchedule) {
      return 1
    }

    return 0
  }

  const checkPublished = (): number => {
    if (!courses || courses.length === 0) {
      return 0
    }

    const hasPublished = courses.filter(course => course.published)
    if (hasPublished.length === 0) {
      return 0
    }

    return 1
  }

  const checkStripe = async (): Promise<number> => {
    if (!currentSchoolData || !currentSchoolData.id) {
      return 0
    }
    try {
      if (accountDetailResult.data?.charges_enabled) {
        return 1
      }
      return 0
    } catch (e) {
      return 0
    }
  }

  const checkPlan = (): number => {
    if (!activePlan || activePlan.planIds?.length === 0) {
      return 0
    }

    return 1
  }

  const isCourseNotHaveSchedule = (currentCourse?: Course): boolean => {
    if (!currentCourse) {
      return true
    }

    return currentCourse.classes.length === 0
  }

  const isSchoolNotHaveDescription = (currentSchool?: School): boolean => {
    if (!currentSchool || !currentSchool.description) {
      return true
    }

    return currentSchool.description.every(
      item => item.content === '' || item.content === defaultSectionValue
    )
  }

  const isCourseNotHaveDescription = (currentCourse?: Course): boolean => {
    if (!currentCourse || !currentCourse.longDescriptions) {
      return true
    }

    return currentCourse.longDescriptions.every(
      item => item.content === '' || item.content === defaultSectionValue
    )
  }

  const isClassNotHaveLessons = (
    currentCourseType: string,
    currentClass?: Classes
  ): boolean => {
    if (!currentClass) return true

    const hasPeriodsWithoutLessons = currentClass.regularPeriods?.some(
      scheduleItem => scheduleItem?.lessons?.length === 0
    )
    const isRegularOrWorkshopClass = [
      ClassTypeEnum.regular,
      ClassTypeEnum.workshop,
    ].includes(currentCourseType as ClassTypeEnum)

    if (
      (!currentClass?.regularPeriods?.length || hasPeriodsWithoutLessons) &&
      isRegularOrWorkshopClass
    ) {
      return true
    }

    if (
      !currentClass.recurringSchedules?.length &&
      currentCourseType === ClassTypeEnum.recurring
    ) {
      return true
    }

    return false
  }

  const checkAttendanceModifications = (): number => {
    if (!hasAttendanceModifications) {
      return 0
    }
    return 1
  }

  const checkBlockTime = (): number => {
    if (!blockTimeData || blockTimeData.length === 0) {
      return 0
    }
    return 1
  }

  const checkPayoutMethod = (): number => {
    if (!payoutMethods || payoutMethods.content.length <= 1) {
      return 0
    }
    return 1
  }

  const checkActivePaymentMethod = (): number => {
    if (stripeDetailResult.isLoading) {
      return 1
    }

    if (!stripeDetailResult?.data) {
      return 0
    }

    const stripeDetail = stripeDetailResult.data as StripeConnectDetail
    if (stripeDetail?.enabled && stripeDetail?.stripeAccountId) {
      return 1
    }

    const hasActivePaymentMethod = payoutMethods?.content.some(
      method => method.enabled
    )
    if (hasActivePaymentMethod) {
      return 1
    }

    return 0
  }

  const checkAdditionalFee = (): number => {
    if (!additionalFeeData || additionalFeeData.length === 0) {
      return 0
    }
    return 1
  }

  const checkApplicationFormFields = (): number => {
    if (!applicationFormData || applicationFormData.length === 0) {
      return 0
    }

    return applicationFormData.some(form => form.fields.length > 3) ? 1 : 0
  }

  const checkApplicationForm = (): number => {
    if (!applicationFormData) {
      return 0
    }
    return 1
  }

  const checkCurrentApplicationForm = (): number => {
    if (!currentApplicationFormData) {
      return 0
    }
    return 1
  }

  const checkCouponFixedAmount = (): number => {
    if (!couponData || couponData.length === 0) {
      return 0
    }

    return couponData.some(
      coupon => coupon.discountType === DiscountType.FIXED_AMOUNT
    )
      ? 1
      : 0
  }

  const checkCouponPercentage = (): number => {
    if (!couponData || couponData.length === 0) {
      return 0
    }

    return couponData.some(
      coupon => coupon.discountType === DiscountType.PERCENTAGE
    )
      ? 1
      : 0
  }

  const checkTimezone = (): number => {
    const siteSetting = currentSchoolData?.siteSetting

    if (!siteSetting || !siteSetting.language || !siteSetting.timeZone) {
      return 0
    }
    return 1
  }

  const checkTemplateAndThemeColor = (): number => {
    if (
      currentSchoolSetting?.templates === WebsiteTemplate.Hero &&
      currentSchoolSetting?.themeColor === defaultThemeColor
    ) {
      return 0
    }
    return 1
  }

  const checkWhatsappSetting = (): number => {
    if (
      !currentSchoolNotificationsSetting?.wtsApiToken ||
      !currentSchoolNotificationsSetting?.wtsApiSid ||
      !currentSchoolNotificationsSetting?.wtsApiPhoneNumber
    ) {
      return 0
    }
    return 1
  }

  const checkTestSendWhatsapp = (): number => {
    if (!currentSchoolNotificationsSetting?.sendReminders) {
      return 0
    }
    return 1
  }

  const checkWhatsappTemplate = (): number => {
    if (!whatsappTemplates?.content) {
      return 0
    }
    return 1
  }

  const checkWhatsappSendLessonReminder = (): number => {
    if (!currentSchoolNotificationsSetting?.sendLessonReminders) {
      return 0
    }
    return 1
  }

  const checkStudentCount = (threshold: number): number => {
    if (!studentList || studentList.length === 0) {
      return 0
    }

    return studentList.length >= threshold ? 1 : 0
  }

  const checkInvoiceCampaignCreated = (): number => {
    if (!invoiceCampaigns?.data || invoiceCampaigns.data.length === 0) {
      return 0
    }

    return 1
  }

  const checkStudentImported = (): number => {
    // Cannot reliably measure if students were imported vs manually added
    // Return -1 to indicate this task cannot be measured
    return -1
  }

  const checkInstructorInvited = (): number => {
    // Check if there are more than one instructor in the system
    if (!instructors || instructors.length <= 1) {
      return 0
    }

    return 1
  }

  const checkStudentCreditSystem = (): number => {
    // Check if institution has any credit management records
    if (!creditRecords?.hasRecords) {
      return 0
    }

    return 1
  }

  const checkLocationAdded = (): number => {
    if (!locationRooms || locationRooms.length === 0) {
      return 0
    }

    return 1
  }

  const checkRescheduleApproval = (): number => {
    if (!rescheduleApprovals || rescheduleApprovals.length === 0) {
      return 0
    }

    // Check if there are any approved or rejected requests
    const hasProcessedRequests = rescheduleApprovals.some(
      request =>
        request.status === RequestTimeChangeStatus.APPROVED ||
        request.status === RequestTimeChangeStatus.REJECTED
    )

    return hasProcessedRequests ? 1 : 0
  }

  const checkAutomationFlowCreated = (): number => 0

  const checkInstructorHourlyRates = (): number => {
    // Check if there are more than one instructor
    if (!instructors || instructors.length <= 1) {
      return 0
    }

    // Check if any instructor has rates enabled
    const hasInstructorWithRatesEnabled = instructors.some(
      instructor => instructor.instructorProfile?.isRatesEnabled === true
    )

    return hasInstructorWithRatesEnabled ? 1 : 0
  }

  return {
    checkIntlSettings,
    checkTimezoneSettings,
    checkDomain,
    checkSchoolInfo,
    checkSchoolContact,
    checkHaveCourse,
    checkHaveClass,
    checkHaveTag,
    checkRegistrationMessage,
    checkSchoolDescription,
    checkSchoolLogo,
    checkSchoolBanner,
    checkSchoolGallery,
    checkEmailNotiSetting,
    checkTermsConditions,
    checkSeo,
    checkSocialMedia,
    checkCoursePath,
    checkCourseDescription,
    checkCoursePrice,
    checkSchedule,
    checkPublished,
    checkPlan,
    checkStripe,

    isCourseNotHaveSchedule,
    isSchoolNotHaveDescription,
    isCourseNotHaveDescription,
    isClassNotHaveLessons,
    checkBlockTime,
    checkPayoutMethod,
    checkAdditionalFee,
    checkApplicationFormFields,
    checkApplicationForm,
    checkCurrentApplicationForm,
    checkCouponFixedAmount,
    checkCouponPercentage,
    checkTimezone,
    checkTemplateAndThemeColor,
    checkCustomWebsite,
    checkAttendanceModifications,
    checkWhatsappSetting,
    checkTestSendWhatsapp,
    checkWhatsappTemplate,
    checkWhatsappSendLessonReminder,
    checkStudentCount,
    checkInvoiceCampaignCreated,
    checkStudentImported,
    checkInstructorInvited,
    checkStudentCreditSystem,
    checkLocationAdded,
    checkRescheduleApproval,
    checkAutomationFlowCreated,
    checkInstructorHourlyRates,

    additionalFeeData,

    checkActivePaymentMethod,
  }
}

export default CheckProgress
