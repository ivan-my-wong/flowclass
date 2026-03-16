import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IoMdArrowForward } from 'react-icons/io'
import {
  LuArrowLeft,
  LuClock,
  LuExternalLink,
  LuGlobe,
  LuRocket,
} from 'react-icons/lu'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import { createDefaultApplicationForm } from '@/api/applicationForm'
import { createAvailability } from '@/api/availability'
import {
  createClass,
  CreateClassDto,
  getAllClasses,
  updateClass,
} from '@/api/class'
import { getCourses, updateCourseBasic } from '@/api/courses'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import { createWebpageStyle } from '@/api/settingSite'
import {
  checkDomainAvailability,
  createSite,
  setSiteIntlSettings,
} from '@/api/siteManagement'
import { getUserProfile } from '@/api/userProfile'
import flowclassLogo from '@/assets/logos/flowclass.png'
import page2Demo from '@/assets/onboarding/page_2_demo.png'
import page3Demo from '@/assets/onboarding/page_3_demo.png'
import page4Demo from '@/assets/onboarding/page_4_demo.png'
import page5Demo from '@/assets/onboarding/page_5_demo.png'
import page6Demo from '@/assets/onboarding/page_6_demo.png'
import page7Demo from '@/assets/onboarding/page_7_demo.png'
import page8Demo from '@/assets/onboarding/page_8_demo.png'
import { FadeInAndLeftAnimation } from '@/components/Animations/FadeInAnimations'
import Logout from '@/components/Buttons/Logout'
import ImageAspect from '@/components/Images/ImageAspect'
import StepIndicator from '@/components/ProgressIndicator/StepIndicator'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { ProgressIndicator } from '@/components/ui/ProgressIndicator'
import { TIMEOUT_TIME } from '@/constants/common'
import { countryConfig } from '@/constants/countryConfig'
import { defaultRepeatFormat, RepeatUnit } from '@/constants/course'
import { QUERY_KEY } from '@/constants/queryKey'
import { defaultThemeColor, WebsiteTemplate } from '@/constants/websiteTemplate'
import { useUserCountry } from '@/hooks/useLocalization'
import usePayoutData from '@/hooks/usePayoutData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { informationFieldState } from '@/stores/informationFieldData'
import { RegisterSiteResponse } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import { userPermissionState } from '@/stores/userPermissionData'
import { InformationFieldTypes } from '@/types/applicationForm'
import {
  ClassRegularPeriodsSelectionMode,
  RecurringSchedules,
  RegularPeriods,
  RepeatFormats,
} from '@/types/classes'
import { ClassTypeEnum, PriceType, SectionDescription } from '@/types/course'
import { QuizStep } from '@/types/onboarding'
import { WebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'
import { getUserRoleFromArray } from '@/utils/convert'
import { defaultRegularPeriod } from '@/utils/convert-class.utils'
import { validateFreeFormDomain } from '@/utils/validate'

import { initializeSchoolSectionValues } from '../School/Description'
import { CountryOption } from '../Setting/Site/RegionLanguageSetting'
import { initializeCourseSectionValues } from '../TeachingService/EditCourse/PageContent'

import OnboardingPreview from './components/OnboardingPreview'
import CreateClassStep from './steps/CreateClassStep'
import FinishSetupStep from './steps/FinishSetupStep'
import MobilePreviewStep from './steps/MobilePreviewStep'
import PaymentMethodStep from './steps/PaymentMethodStep'
import SetCountryStep from './steps/SetCountryStep'
import SetDomainStep from './steps/SetDomainStep'
import StartSetUpStep from './steps/StartSetUpStep'

const countries = countryConfig.map(obj => ({
  name: obj.name,
  code: obj.code,
  nativeName: obj.nativeName,
}))

const countryOptions = countries.map((option, index) => ({
  index,
  name: option.name,
  code: option.code,
  label: `${option.nativeName} [${option.name}]`,
}))

const TESTING_CURRENT_STEP = null

// Step constants for better maintainability
const ONBOARDING_STEPS = {
  WELCOME: 0,
  DOMAIN_SETTINGS: 1,
  COUNTRY_SETTINGS: 2,
  CLASS_SETUP: 3,
  PAYMENT_METHOD: 4,
  STUDENT_ENROLLMENT: 5,
  SUCCESS: 6, // This is the last step (finishSetupSection)
} as const

type OnboardingStep = (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS]

// Helper functions for step logic
const isFirstStep = (step: number) => step === ONBOARDING_STEPS.WELCOME
const isLastStep = (step: number) => step === ONBOARDING_STEPS.SUCCESS
const isMobilePreviewStep = (step: number) =>
  step === ONBOARDING_STEPS.STUDENT_ENROLLMENT

const isClassSetupStep = (step: number) => step === ONBOARDING_STEPS.CLASS_SETUP
const isPaymentMethodStep = (step: number) =>
  step === ONBOARDING_STEPS.PAYMENT_METHOD
const isStudentEnrollmentStep = (step: number) =>
  step === ONBOARDING_STEPS.STUDENT_ENROLLMENT

const shouldShowExitButton = (step: number) =>
  step >= ONBOARDING_STEPS.CLASS_SETUP

const getWrapperClassName = (step: number) => {
  if (isFirstStep(step) || isLastStep(step) || isMobilePreviewStep(step)) {
    return 'w-full max-w-2xl'
  }
  return 'w-full lg:w-[70%] xl:w-[50%]'
}

const GradientIcon = ({ icon }: { icon: React.ReactNode }) => {
  return (
    <div className="relative group flex items-center justify-center">
      {/* Main icon - stays stationary */}
      <div className="relative text-blue-500 z-10">{icon}</div>

      {/* Rotating gradient ring - positioned outside the icon */}
      <div
        className="absolute rounded-full"
        style={{
          width: '80px',
          height: '80px',
          background:
            'conic-gradient(from 0deg, #3b82f6, #1d4ed8, #1e40af, #3b82f6, #60a5fa, #3b82f6)',
          animation: 'rotateRing 4s linear infinite',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      >
        <div
          className="w-full h-full bg-white rounded-full"
          style={{
            margin: '3px',
          }}
        />
      </div>

      {/* CSS Animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
      @keyframes rotateRing {
        0% {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    `,
        }}
      />
    </div>
  )
}

const SetUpPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { siteData, updateCurrentSite } = useSiteData()
  const [country] = useUserCountry()

  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(
    TESTING_CURRENT_STEP || 0
  )
  const { updateCurrentSchool, schoolData } = useSchoolData()

  const [user, setUser] = useRecoilState(userState)
  const [, setUserPermission] = useRecoilState(userPermissionState)
  const [informationFieldData] = useRecoilState(informationFieldState)
  const [courseId, setCourseId] = useState<number>(0)
  const [payoutPreview, setPayoutPreview] = useState<string | undefined>(
    undefined
  )
  const [isPayoutUploading, setIsPayoutUploading] = useState<boolean>(false)
  const [applicationFormFields, setApplicationFormFields] = useState<
    InformationFieldTypes[] | undefined
  >([])

  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [showCountryConfirmDialog, setShowCountryConfirmDialog] =
    useState(false)
  const [isCreatingSite, setIsCreatingSite] = useState(false)
  const [isValidatingDomain, setIsValidatingDomain] = useState(false)
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [createClassCurrentStep, setCreateClassCurrentStep] =
    useState<QuizStep>(QuizStep.SCHEDULE)
  const [classUrl, setClassUrl] = useState<string>('')
  const [classDataFromStep, setClassDataFromStep] = useState<{
    classType: ClassTypeEnum
    courseName: string
    coursePath: string
    generatedTimeSlots: any[]
  } | null>(null)
  const [hasReachedUploadReceipt, setHasReachedUploadReceipt] = useState(false)

  const [selectedWebsiteTemplate] = useState<WebsiteTemplate>(
    WebsiteTemplate.Hero
  )

  // const [createNewSiteRes, setCreateNewSiteRes] =
  //   useState<RegisterSiteResponse>()

  // const { mutate: createPayout } = useCreatePayoutMethod()
  const { useCreatePayoutMethod, useFetchPayoutMethodsNew } = usePayoutData()
  const { mutate: createPayoutMethod } = useCreatePayoutMethod()

  // Get payment methods for the current school
  const { data: existingPaymentMethods } = useFetchPayoutMethodsNew()

  const queryClient = useQueryClient()

  const formSchool = useForm({
    mode: 'onBlur',
    defaultValues: {
      schoolName: '',
      siteDomain: '',
      email: '',
      phone: '',
      country,
    },
  })

  const formSchoolDetails = useForm<{
    schoolLogo: string
    themeColor: string
    schoolDesc: SectionDescription[]
  }>({
    mode: 'onBlur',
    defaultValues: {
      schoolLogo: '',
      themeColor: defaultThemeColor,
      schoolDesc: initializeSchoolSectionValues(),
    },
  })

  const formCourse = useForm<{
    courseName: string
    courseLink: string
    courseBanner: string
    courseDescription: SectionDescription[]
    attendanceQrCode: boolean
  }>({
    mode: 'onBlur',
    defaultValues: {
      courseName: '',
      courseLink: '',
      courseBanner: '',
      courseDescription: initializeCourseSectionValues(),
      attendanceQrCode: false,
    },
  })

  const formClass = useForm<{
    classType: string
    className: string
    classTuition: string
    classPriceType: PriceType
    classQuota: string
    classToBeEdited: RegularPeriods
    regularPeriods: RegularPeriods[]
    regularScheduleV2?: any // V2 structure for regularV2 classes
    recurringSchedules: RecurringSchedules[]
    recurringFormat: RepeatFormats
  }>({
    mode: 'onBlur',
    defaultValues: {
      classType: '',
      className: '',
      classTuition: '',
      classPriceType: PriceType.PER_CLASS,
      classQuota: '',
      classToBeEdited: {
        courseId,
        lessons: [],
        duration: 60,
        repeatFormat: defaultRepeatFormat,
      },
      regularPeriods: [defaultRegularPeriod(courseId, 60 * 24 * 7)],
      regularScheduleV2: undefined,
      recurringSchedules: [],
      recurringFormat: defaultRepeatFormat,
    },
  })

  const formPaymentMethod = useForm<{
    methodName: string
    paymentInstructions: string
    qrCodePic: string
  }>({
    mode: 'onBlur',
    defaultValues: {
      methodName: '',
      paymentInstructions: '',
      qrCodePic: '',
    },
  })

  const formApplicationForm = useForm<{
    applicationFormName: string
    applicationFormDescription: string
    applicationFormFields: InformationFieldTypes[] | undefined
  }>({
    mode: 'onBlur',
    defaultValues: {
      applicationFormName: '',
      applicationFormDescription: '',
      applicationFormFields: undefined,
    },
  })

  const formImportCSV = useForm<{
    importCSV: string
  }>({
    mode: 'onChange',
    defaultValues: {
      importCSV: '',
    },
  })

  const siteDomain = formSchool.watch('siteDomain')
  const schoolName = formSchool.watch('schoolName')
  const selectedCountry = formSchool.watch('country')

  const url = useMemo(() => {
    const domain = siteDomain?.trim().toLowerCase()
    return domain || 'localhost'
  }, [siteDomain])

  const schoolDescValues = formSchoolDetails.watch('schoolDesc')
  const schoolLogo = formSchoolDetails.watch('schoolLogo')
  const themeColor = formSchoolDetails.watch('themeColor')
  const courseName = formCourse.watch('courseName')
  const courseLink = formCourse.watch('courseLink')
  const courseBanner = formCourse.watch('courseBanner')
  const courseDesc = formCourse.watch('courseDescription')

  const validateDescriptionSection = (value: SectionDescription[]) => {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.some(
        desc =>
          desc.content && desc.content.replace(/<[^>]*>/g, '').trim().length > 0
      )
    )
  }

  console.log(selectedCountry)

  const isDisabledNextButton = useMemo(() => {
    // Welcome step - always allow next
    if (isFirstStep(currentSectionIndex)) {
      return false
    }

    // Domain settings step
    if (currentSectionIndex === ONBOARDING_STEPS.DOMAIN_SETTINGS) {
      return (
        !formSchool.formState.isValid ||
        !validateFreeFormDomain(url) ||
        !schoolName ||
        isValidatingDomain
      )
    }

    // Country settings step
    if (currentSectionIndex === ONBOARDING_STEPS.COUNTRY_SETTINGS) {
      return !selectedCountry || selectedCountry === 'Unknown'
    }

    // Class setup step - only allow next if user is at the last step (preview) and not creating class
    if (isClassSetupStep(currentSectionIndex)) {
      return createClassCurrentStep !== QuizStep.PREVIEW || isCreatingClass
    }

    // Payment method step
    if (isPaymentMethodStep(currentSectionIndex)) {
      return !formPaymentMethod.formState.isValid
    }

    // Student enrollment step - only allow next when upload receipt is reached
    if (isStudentEnrollmentStep(currentSectionIndex)) {
      return !hasReachedUploadReceipt
    }

    // Legacy steps (8-11) - keeping for backward compatibility
    if (currentSectionIndex === 8) {
      const hasCourseName = !!courseName
      const hasCourseLink = !!courseLink
      const hasCourseDesc = validateDescriptionSection(courseDesc)

      return !(hasCourseName && hasCourseLink && hasCourseDesc)
    }

    if (currentSectionIndex === 9) {
      return !formClass.formState.isValid
    }

    if (currentSectionIndex === 10) {
      return !formApplicationForm.formState.isValid
    }

    if (currentSectionIndex === 11) {
      return !formImportCSV.formState.isValid
    }

    // Default case
    return false
  }, [
    currentSectionIndex,
    formSchool.formState.isValid,
    url,
    schoolName,
    selectedCountry,
    isValidatingDomain,
    createClassCurrentStep,
    isCreatingClass,
    formClass.formState.isValid,
    formPaymentMethod.formState.isValid,
    formApplicationForm.formState.isValid,
    formImportCSV.formState.isValid,
    courseName,
    courseLink,
    courseDesc,
    hasReachedUploadReceipt,
  ])

  const isCourseDescriptionCompleted = useMemo(() => {
    const courseDesc = formCourse.watch('courseDescription')
    return (
      courseDesc?.length > 0 &&
      Boolean(courseDesc[0]?.content?.replace(/<[^>]*>/g, '').trim().length > 0)
    )
  }, [formCourse.watch('courseDescription')])

  useEffect(() => {
    getUserProfile()
      .then(resUser => {
        setUser({ ...resUser, isLogin: true })
      })
      .catch(err => {
        navigate('/login')
      })
  }, [])

  useEffect(() => {
    const matchingOption = countryOptions.find(
      option => option.code === country
    )

    if (matchingOption) {
      setSelectedCountryOption(matchingOption)
    }
  }, [country])

  useEffect(() => {
    if (schoolData?.currentSchool) {
      let country = ''
      if (siteData) {
        const { currentSite } = siteData
        country =
          countryOptions.find(option => option.name === currentSite?.country)
            ?.code || ''
      }

      formSchool.reset({
        schoolName: schoolData.currentSchool.name || '',
        siteDomain: siteData.currentSite?.url || '',
        email: schoolData.currentSchool.email || user.email || '',
        phone: schoolData.currentSchool.phone || user.phone || '',
        country: country || schoolData.currentSchool.siteSetting?.countryCode,
      })

      formSchoolDetails.reset({
        schoolLogo: schoolData.currentSchool.logo || '',
        themeColor:
          (schoolData.currentSchool.themeColor as string) || defaultThemeColor,
        schoolDesc:
          schoolData.currentSchool.description &&
          schoolData.currentSchool.description.length > 0
            ? schoolData.currentSchool.description
            : initializeSchoolSectionValues(),
      })
    }
  }, [schoolData?.currentSchool, siteData?.currentSite])

  // useEffect(() => {
  //   if (
  //     informationFieldData.informationFields &&
  //     (!applicationFormFields || applicationFormFields.length === 0)
  //   ) {
  //     const defaultFields = informationFieldData.informationFields
  //       .filter(field => typeof field.order === 'number' && field.isDefault)
  //       .sort((a, b) => a.order - b.order)
  //     setApplicationFormFields(defaultFields)
  //     formApplicationForm.setValue('applicationFormFields', defaultFields)
  //   }
  // }, [informationFieldData.informationFields])

  const onSubmitCreateSite = async (): Promise<void> => {
    if (siteData && siteData.sites && siteData.sites.length === 0) {
      const newSiteWithSchool = await createNewSite({
        url,
        name: schoolName,
      })
      const { institution: school, ...newSite } = newSiteWithSchool

      // if (
      //   formPaymentMethod.getValues('methodName') &&
      //   formPaymentMethod.getValues('methodName') !== ''
      // ) {
      //   const newPayout = {
      //     siteId: newSite?.id ?? 0,
      //     methodType: PayoutMethodType.others,
      //     methodName: formPaymentMethod.getValues('methodName'),
      //     institutionId: school?.id ?? 0,
      //     description: formPaymentMethod.getValues('paymentInstructions'),
      //     enable: true,
      //     payoutMethodDetails: {
      //       payoutImg: formPaymentMethod.getValues('qrCodePic'),
      //       receiptRequired: true,
      //     },
      //   } as unknown as Payout
      //   //
      //   createPayout(newPayout)
      // }

      await createInstituionSetting({
        institutionId: school.id,
        templates: selectedWebsiteTemplate,
        themeColor: defaultThemeColor,
      }).then(() => {
        setCurrentSectionIndex(currentSectionIndex + 1)
      })

      const selectedIndex = selectedCountryOption.index

      await submitSiteSettings({
        language: countryConfig[selectedIndex].locale.default.code,
        timeZone: countryConfig[selectedIndex].timezone.default.name,
        currency: countryConfig[selectedIndex].currency,
        country: selectedCountryOption.name,
        siteId: newSite?.id,
        countryCode: selectedCountryOption.code,
      })

      await updateCurrentSite(newSite)
      await updateCurrentSchool({
        ...school,
        phone: user.phone ?? null,
        email: user.email ?? null,
        description: [
          {
            sectionTitle: 'School Description',
            content: '<p>This school was created during onboarding.</p>',
          },
        ],
      })

      const resUser = await getUserProfile()

      if (resUser) {
        setUser({ ...resUser, isLogin: true })

        await setUserPermission(
          getUserRoleFromArray(user.permissions, newSite.id, school.id)
        )
      }

      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.site.siteDataKey] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.getCurrentSchoolKey],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.getCurrentSchoolsSiteKey],
      })

      setGtmEvent({
        siteId: newSite.id,
        siteDomain: url,
        firstName: resUser.firstName ?? '',
        lastName: resUser.lastName ?? '',
        email: resUser.email,
        countryCode: selectedCountryOption.code,
        event: GtmEvent.createSite,
      })

      await setTimeout(() => {
        navigate('/home')
      }, TIMEOUT_TIME)

      toast.success(t('onboarding:welcome.setupComplete'))
    } else {
      setTimeout(() => {
        navigate('/home')
      }, TIMEOUT_TIME)

      toast.success(t('onboarding:welcome.setupComplete'))
    }
  }

  // Prepare form data based on class type and generated time slots
  const prepareClassFormData = (classData: {
    classType: ClassTypeEnum
    courseName: string
    coursePath: string
    courseId: number
    generatedTimeSlots: any[]
  }) => {
    const { classType, generatedTimeSlots, courseId } = classData

    const extraFields: Record<string, any> = {}

    if (classType === ClassTypeEnum.workshop) {
      extraFields.regularPeriods = generatedTimeSlots.map(slot => ({
        courseId,
        lessons: slot.lessons || [],
        duration: slot.duration,
        repeatFormat: slot.lessonRepeatFormat || {
          repeat: false, // Workshop is one-time event
          every: 1,
          unit: RepeatUnit.weeks,
          times: 1,
        },
      }))
    } else if (classType === ClassTypeEnum.regularV2) {
      // For regularV2, prepare the schedule data to be included in class creation
      const tomorrow = dayjs()
        .add(1, 'day')
        .hour(14)
        .minute(0)
        .second(0)
        .millisecond(0)

      const regularScheduleV2 = {
        weekDay: tomorrow.day(),
        startTime: tomorrow.toISOString(),
        endTime: tomorrow.add(2, 'hours').toISOString(),
        periodRepeatFormat: {
          every: 1,
          unit: RepeatUnit.months,
          startTime: tomorrow.toISOString(),
        },
        gapBetweenPeriods: {
          every: 0,
          unit: RepeatUnit.weeks,
        },
        periodRepeatCount: 8,
        selectionMode: ClassRegularPeriodsSelectionMode.ALLOW_CUSTOM_SELECTION,
        periodsV2: generatedTimeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          lessonRepeatFormat: {
            repeat: true,
            every: 1,
            unit: RepeatUnit.weeks,
            times: 8,
            weekDay: tomorrow.day(),
          },
        })),
      }

      extraFields.regularScheduleV2 = regularScheduleV2
    } else if (classType === ClassTypeEnum.recurring) {
      extraFields.recurringSchedules = generatedTimeSlots
      extraFields.recurringFormat = {
        repeat: true,
        times: 8,
        every: 1,
        unit: RepeatUnit.weeks,
      }
    } else if (classType === ClassTypeEnum.appointment) {
      extraFields.recurringFormat = {
        repeat: true,
        times: 1,
        every: 1,
        unit: RepeatUnit.days,
      }
    }

    return extraFields
  }

  const onSubmitClass = async (data: any) => {
    setIsCreatingClass(true)

    try {
      let currentCourseId = courseId

      // Check if course already exists by path
      if (schoolData?.currentSchool?.id && data.coursePath) {
        try {
          const existingCourses = await getCourses(schoolData.currentSchool.id)
          const existingCourse = existingCourses.find(
            course => course.path === data.coursePath
          )

          if (existingCourse) {
            currentCourseId = existingCourse.id
            setCourseId(existingCourse.id)
            toast.success(t('onboarding:welcome.courseFound'))
          }
        } catch (error) {
          console.log('Error checking existing courses:', error)
          // Continue with course creation if check fails
        }
      }

      // Create course if not exists
      if (!currentCourseId && schoolData?.currentSchool?.id) {
        const courseData = {
          courseName: data.courseName || 'My Course',
          courseLink: data.coursePath || 'my-course',
          courseBanner: '',
          courseDescription: [
            {
              sectionTitle: 'Course Features',
              content: '<p>This course was created during onboarding.</p>',
            },
          ],
          attendanceQrCode: false,
        }

        const updatedCourse = await updateCourseBasic({
          name: courseData.courseName,
          path: courseData.courseLink,
          institutionId: schoolData.currentSchool.id,
          previewImageUrl: courseData.courseBanner,
          longDescriptions: courseData.courseDescription,
          useQrAttendance: courseData.attendanceQrCode,
        })

        currentCourseId = updatedCourse.id
        setCourseId(updatedCourse.id)
        toast.success(t('onboarding:welcome.courseCreated'))
      }

      if (!currentCourseId) {
        toast.error(t('common:errors.courseRequired'))
        return false
      }

      // Prepare form data with actual courseId and classId
      if (classDataFromStep) {
        const extraFields = prepareClassFormData({
          ...classDataFromStep,
          courseId: currentCourseId,
        })
        // Always create the class, regardless of whether course existed or not
        const classRequestData: CreateClassDto = {
          courseId: currentCourseId,
          name: data.className,
          quota: data.classQuota,
          tuition: parseFloat(data.classTuition),
          type: data.classType,
          dropIn: false,
          teachingLanguage: data.teachingLanguage || 'en',
          priceType: data.classPriceType,
          priceOptions: [
            {
              name: data.className,
              priceType: data.classPriceType,
              amount: parseFloat(data.classTuition).toString(),
              numberOfLessons: data.recurringFormat?.times ?? 1,
              classId: data.classId,
            },
          ],
          ...extraFields,
        }

        const createdClass = await createClass(classRequestData)

        if (createdClass) {
          // For appointment classes, create availability with test time slots
          if (data.classType === ClassTypeEnum.appointment) {
            try {
              const tomorrow = dayjs()
                .add(1, 'day')
                .hour(14)
                .minute(0)
                .second(0)
                .millisecond(0)

              const availabilityData = {
                siteId: siteData?.currentSite?.id || 0,
                institutionId: schoolData?.currentSchool?.id || 0,
                name: `${data.className} Availability`,
                availableSchedules: [
                  {
                    dayOfWeek: tomorrow.day(),
                    startTime: tomorrow.format('HH:mm'),
                    endTime: tomorrow.add(2, 'hours').format('HH:mm'),
                    isEnabled: true,
                  },
                ],
              }

              const createdAvailability = await createAvailability(
                availabilityData
              )

              if (createdAvailability && createdClass.appointment) {
                await updateClass({
                  ...createdClass,
                  appointment: {
                    ...createdClass.appointment,
                    availabilityId: createdAvailability.id ?? 0,
                  },
                })
              }

              // Update the class with the availability
              // Note: This would require an API call to update the class with availability ID
              // For now, we'll just show a success message
              toast.success(t('onboarding:welcome.availabilityCreated'))
            } catch (error) {
              console.error('Error creating availability:', error)
              // Don't fail the entire process if availability creation fails
              toast.warning(t('onboarding:welcome.availabilityCreationFailed'))
            }
          }

          toast.success(t('onboarding:welcome.classCreated'))
        }

        // Set class URL for iframe preview
        if (createdClass.id && data.coursePath) {
          const newClassUrl = `https://${url}/enrol?school=${
            schoolData?.currentSchool?.url ?? ''
          }&course=${encodeURI(data.coursePath)}`
          setClassUrl(newClassUrl)
        }
      }

      return true
    } catch (error) {
      console.error('Error creating class:', error)
      handleApiError({ error, t })

      return false
    } finally {
      setIsCreatingClass(false)
    }
  }

  const onSubmitPaymentMethod = async (data: any) => {
    try {
      const { methodName, paymentInstructions, qrCodePic } = data

      if (
        !schoolData?.currentSchool?.id ||
        !schoolData?.currentSchool?.siteSetting?.id
      ) {
        toast.error(t('common:errors.unexpected'))
        return false
      }
      const payload = {
        siteId: schoolData.currentSchool.siteSetting.id,
        institutionId: schoolData.currentSchool.id,
        description: paymentInstructions,
        methodType: 'Others',
        methodName,
        payoutImg: '',
        payoutUrl: '',
        payoutMethodDetails: {
          payoutImg: qrCodePic || '',
          receiptRequired: true,
        },
        enabled: true,
        enable: true,
      }

      await createPayoutMethod(payload)
      toast.success(t('payout:createSuccess'))
      return true
    } catch (error: any) {
      if (error.statusCode === 400) {
        toast.error(
          t('payout:errors.createMethodError') || t('common:errors.badRequest')
        )
      } else if (error.statusCode === 403) {
        toast.error(t('common:errors.NOT_AUTHENTICATE'))
      } else if (error.statusCode === 422 || error.statusCode === 500) {
        toast.error(error.message)
      } else {
        toast.error(t('common:errors.network'))
      }
      return false
    }
  }
  /**
   * THIS PART IS FOR MAPPING THE SECTIONS TO THE DEMOS
   */

  const demoImages = {
    1: page2Demo,
    2: page3Demo,
    3: page4Demo,
    4: page5Demo,
    5: page6Demo,
    6: page7Demo,
    7: page8Demo,
    8: page8Demo, // Use the same image for import CSV step
  }

  const sectionFormMapping = {
    1: formSchool,
    2: formSchool,
    3: formClass,
    4: formPaymentMethod,
    5: formPaymentMethod,
    6: formPaymentMethod,
    7: formSchool,
    8: formSchool,
    9: formSchool,
    10: formSchool,
    11: formSchool,
    12: formSchool,
  } as const

  const sectionFormFields = {
    domainSettings: ['schoolName', 'siteDomain'],
    countrySettings: ['country'],
    schoolDetails: ['schoolLogo', 'themeColor', 'schoolDesc'],
    createCourse: [
      'courseName',
      'courseLink',
      'courseBanner',
      'courseDescription',
      'attendanceQrCode',
    ],
    createClass: ['classType', 'className', 'classTuition', 'classQuota'],
    paymentMethod: ['stripeConnect', 'methodName', 'paymentInstructions'],
    applicationForm: [
      'applicationFormName',
      'applicationFormDescription',
      'applicationFormFields',
    ],
    importCSV: ['importCSV'],
  }

  const getCurrentSectionFields = () => {
    switch (currentSectionIndex) {
      case 1:
        return {
          fields: sectionFormFields.domainSettings,
          total: sectionFormFields.domainSettings.length,
        }
      case 2:
        return {
          fields: sectionFormFields.countrySettings,
          total: sectionFormFields.countrySettings.length,
        }
      case 3:
        return {
          fields: ['classType'],
          total: 1,
        }
      case 4:
        return {
          fields: sectionFormFields.paymentMethod,
          total: sectionFormFields.paymentMethod.length,
        }
      case 5:
      case 6:
        return {
          fields: [],
          total: 0,
        }

      default:
        return {
          fields: [],
          total: 0,
        }
    }
  }
  const { fields, total } = getCurrentSectionFields()

  const handleNextSection = async () => {
    // If we're at the last step, complete the setup
    if (currentSectionIndex >= setUpSectionList.length - 1) {
      await onSubmitCreateSite()
      return
    }

    // Reset upload receipt state when leaving student enrollment step
    if (isStudentEnrollmentStep(currentSectionIndex)) {
      setHasReachedUploadReceipt(false)
    }

    // Welcome step - check for existing data and skip accordingly
    if (isFirstStep(currentSectionIndex)) {
      if (siteData?.currentSite && schoolData?.currentSchool?.id) {
        try {
          const [existingCourses, existingClasses] = await Promise.all([
            getCourses(schoolData.currentSchool.id),
            getAllClasses(schoolData.currentSchool.id),
          ])

          // Determine which step to skip to based on what exists
          if (
            existingPaymentMethods?.content &&
            existingPaymentMethods.content.length > 0
          ) {
            // User has payment methods, skip to student enrollment step
            setCurrentSectionIndex(ONBOARDING_STEPS.STUDENT_ENROLLMENT)
            return
          }
          if (existingCourses.length > 0 || existingClasses.length > 0) {
            // User has courses/classes but no payment methods, skip to payment method step
            setCurrentSectionIndex(ONBOARDING_STEPS.PAYMENT_METHOD)
            return
          }
          // User has a site but no courses/classes/payment methods, skip to class setup step
          setCurrentSectionIndex(ONBOARDING_STEPS.CLASS_SETUP)
          return
        } catch (error) {
          console.error('Error checking existing data:', error)
          // If there's an error, continue with normal flow
        }
      }
      setCurrentSectionIndex(currentSectionIndex + 1)
      return
    }

    // Domain settings step
    if (currentSectionIndex === ONBOARDING_STEPS.DOMAIN_SETTINGS) {
      const isValid = await formSchool.trigger()
      if (isValid) {
        // Validate domain availability before proceeding
        setIsValidatingDomain(true)
        try {
          const existingSite = await checkDomainAvailability(url)
          if (existingSite) {
            formSchool.setError('siteDomain', {
              type: 'manual',
              message: t('onboarding:errors.domainAlreadyTaken') as string,
            })
            toast.error(t('onboarding:errors.domainAlreadyTaken'))
            setIsValidatingDomain(false)
            return
          }

          // Domain is available, proceed with form submission
          setCurrentSectionIndex(currentSectionIndex + 1)
        } catch (error) {
          if (error instanceof ApiError && error.message === 'SITE_NOT_FOUND') {
            setCurrentSectionIndex(currentSectionIndex + 1)
            return
          }
          toast.error(t('onboarding:errors.domainCheckFailed'))
        } finally {
          setIsValidatingDomain(false)
        }
      }
      return
    }

    // Country settings step - show confirmation modal
    if (currentSectionIndex === ONBOARDING_STEPS.COUNTRY_SETTINGS) {
      setShowCountryConfirmDialog(true)
      return
    }

    // Class setup step - create course and class when Next is clicked
    if (isClassSetupStep(currentSectionIndex)) {
      const classData = formClass.getValues()
      if (
        classData.classType &&
        formCourse.watch('courseName') &&
        formCourse.watch('courseLink')
      ) {
        const isSuccess = await onSubmitClass(classData)
        if (isSuccess) {
          setCurrentSectionIndex(currentSectionIndex + 1)
        }
        // If creation fails, stay on current step (loading will be handled by isCreatingClass state)
      } else {
        // If no class data is ready, just proceed to next step
        setCurrentSectionIndex(currentSectionIndex + 1)
      }
      return
    }

    // Payment method step
    if (isPaymentMethodStep(currentSectionIndex)) {
      const isValid = await formPaymentMethod.trigger()
      if (isValid) {
        await formPaymentMethod.handleSubmit(onSubmitPaymentMethod)()
        setCurrentSectionIndex(currentSectionIndex + 1)
      }
      return
    }

    // Student enrollment step - always allow next (testing step)
    if (isStudentEnrollmentStep(currentSectionIndex)) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      return
    }

    // Default case - just move to next step
    setCurrentSectionIndex(currentSectionIndex + 1)
  }

  /**
   *
   * THE FOLLOWING SECTIONS ARE FOR THE USER TO CHOOSE HOW TO USE FLOWCLASS
   */

  /** SELECT ONBOARDING PREFERENCE */
  const onboardingPreferenceSection = {
    title: t('onboarding:newUserSetup.welcome'),
    subtitle: t('onboarding:newUserSetup.welcomeDesc'),
    titleIcon: <GradientIcon icon={<LuRocket size={40} />} />,
    content: <StartSetUpStep handleNextSection={handleNextSection} />,
  }

  const [selectedCountryOption, setSelectedCountryOption] =
    useState<CountryOption>(
      countryOptions.find(option => option.code === country) ||
        countryOptions[0]
    )

  const domainSection = {
    title: t('onboarding:newUserSetup.domainSettings.title'),
    subtitle: t('onboarding:newUserSetup.domainSettings.subtitle'),
    titleIcon: <GradientIcon icon={<LuExternalLink size={40} />} />,
    content: <SetDomainStep formSchool={formSchool} />,
  }

  const countrySection = {
    title: t('onboarding:newUserSetup.countrySettings'),
    subtitle: t('onboarding:newUserSetup.countrySettingsDesc'),
    titleIcon: <GradientIcon icon={<LuGlobe size={40} />} />,
    content: <SetCountryStep formSchool={formSchool} />,
  }

  const classSetupSection = {
    title: t('onboarding:newUserSetup.classSetup.title'),
    subtitle: t('onboarding:newUserSetup.classSetup.subtitle'),
    titleIcon: <GradientIcon icon={<LuClock size={40} />} />,
    content: (
      <CreateClassStep
        formClass={formClass as any}
        formCourse={formCourse as any}
        onSubmitClass={onSubmitClass}
        onNext={() => setCurrentSectionIndex(currentSectionIndex + 1)}
        onStepChange={setCreateClassCurrentStep}
        onBack={() => setCurrentSectionIndex(currentSectionIndex - 1)}
        courseId={courseId}
        onClassDataReady={setClassDataFromStep}
      />
    ),
  }

  const handleSkipMobilePreview = () => {
    setCurrentSectionIndex(currentSectionIndex + 1)
  }

  const studentEnrollmentSection = {
    title: t('onboarding:newUserSetup.studentEnrollment.title'),
    subtitle: t('onboarding:newUserSetup.studentEnrollment.subtitle'),
    content: (
      <MobilePreviewStep
        onUploadReceiptReached={setHasReachedUploadReceipt}
        onSkip={handleSkipMobilePreview}
      />
    ),
  }

  const paymentMethodSection = {
    title: t('onboarding:newUserSetup.registerPaymentMethod'),
    subtitle: `${t('onboarding:newUserSetup.fillInPaymentInfo')}. ${t(
      'onboarding:newUserSetup.addPaymentMethod'
    )}.`,
    content: (
      <PaymentMethodStep
        formPaymentMethod={formPaymentMethod}
        isPayoutUploading={isPayoutUploading}
        setIsPayoutUploading={setIsPayoutUploading}
        payoutPreview={payoutPreview ?? null}
        setPayoutPreview={setPayoutPreview}
      />
    ),
  }

  /** COUNTRY SELECTION PAGE */

  // const handleCountryChange = (selectedOption: number) => {
  //   if (selectedOption !== null) {
  //     setSelectedCountryOption(countryOptions[selectedOption])
  //   }
  // }

  // const selectTemplateSection = {
  //   title: t('onboarding:newUserSetup.selectTemplate.title'),
  //   subtitle: t('onboarding:newUserSetup.selectTemplate.subtitle'),
  //   content: (
  //     <Box direction="column">
  //       <Box
  //         css={{
  //           width: '100%',
  //         }}
  //       >
  //         <WebsiteTemplateSelector
  //           selectedWebsiteTemplate={selectedWebsiteTemplate}
  //           setSelectedWebsiteTemplate={setSelectedWebsiteTemplate}
  //         />
  //       </Box>
  //       <Box
  //         css={{
  //           minWidth: '40rem',
  //           '@sm': {
  //             minWidth: '90vw',
  //           },
  //         }}
  //       >
  //         <WebsiteTemplatePreviewContainer
  //           selectedWebsiteTemplate={selectedWebsiteTemplate}
  //         />
  //       </Box>
  //     </Box>
  //   ),
  // }

  /** FINISHED SELECTION */

  const finishSetupSection = {
    title: '',
    subtitle: '',
    content: <FinishSetupStep />,
  }

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      // Reset upload receipt state when entering student enrollment step
      if (isStudentEnrollmentStep(currentSectionIndex - 1)) {
        setHasReachedUploadReceipt(false)
      }
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const handleExitOnboarding = () => {
    navigate('/home')
  }

  const setUpSectionList: {
    title: string
    subtitle: string
    titleIcon?: JSX.Element
    content: JSX.Element
  }[] = [
    onboardingPreferenceSection,
    domainSection,
    countrySection,
    classSetupSection,
    paymentMethodSection,
    studentEnrollmentSection,
    // schoolDetailsSection,
    // createCourseSection,
    // createClassSection,
    // applicationFormSection,
    // paymentNotificationSection,
    // uploadCSVSection,
    // selectTemplateSection,
    finishSetupSection,
  ]

  const handleCountryConfirm = async () => {
    setIsCreatingSite(true)
    setShowCountryConfirmDialog(false)

    try {
      // Create the site with the current form data
      const siteData = {
        url,
        name: schoolName,
      }

      const newSiteWithSchool = await createNewSite(siteData)
      const { institution: school, ...newSite } = newSiteWithSchool

      // Create institution settings
      await createInstituionSetting({
        institutionId: school.id,
        templates: selectedWebsiteTemplate,
        themeColor: defaultThemeColor,
      })

      // Set site international settings
      const selectedIndex = selectedCountryOption.index
      await submitSiteSettings({
        language: countryConfig[selectedIndex].locale.default.code,
        timeZone: countryConfig[selectedIndex].timezone.default.name,
        currency: countryConfig[selectedIndex].currency,
        country: selectedCountryOption.name,
        siteId: newSite?.id,
        countryCode: selectedCountryOption.code,
      })

      // Update current site and school
      await updateCurrentSite(newSite)
      await updateCurrentSchool({
        ...school,
        email: formSchool.getValues('email'),
        phone: formSchool.getValues('phone'),
      })

      // Update user profile and permissions
      const resUser = await getUserProfile()
      if (resUser) {
        setUser({ ...resUser, isLogin: true })
        await setUserPermission(
          getUserRoleFromArray(user.permissions, newSite.id, school.id)
        )
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.site.siteDataKey] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.getCurrentSchoolKey],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.getCurrentSchoolsSiteKey],
      })

      // Set GTM event
      setGtmEvent({
        siteId: newSite.id,
        siteDomain: url,
        firstName: resUser.firstName ?? '',
        lastName: resUser.lastName ?? '',
        email: resUser.email,
        countryCode: selectedCountryOption.code,
        event: GtmEvent.createSite,
      })

      // Show success toast
      toast.success(t('onboarding:welcome.siteCreated'))

      // Proceed to next step
      setCurrentSectionIndex(currentSectionIndex + 1)
    } catch (error) {
      console.error('Error creating site:', error)
      toast.error(t('onboarding:errors.siteCreationFailed'))
      setShowCountryConfirmDialog(true) // Reopen dialog on error
    } finally {
      setIsCreatingSite(false)
    }
  }

  const handleCountryReject = () => {
    setShowCountryConfirmDialog(false)
  }

  const getNextButtonText = () => {
    if (isValidatingDomain) {
      return t('common:action.checking')
    }
    if (isCreatingClass) {
      return t('onboarding:newUserSetup.creating')
    }
    if (
      isStudentEnrollmentStep(currentSectionIndex) &&
      !hasReachedUploadReceipt
    ) {
      return t(
        'onboarding:newUserSetup.waitingForUploadReceipt',
        'Complete the enrollment process to continue'
      )
    }
    return t('common:action.next')
  }

  const { mutateAsync: createApplicationForm } = useMutation(
    (institutionId: number) => {
      return createDefaultApplicationForm(institutionId)
    }
  )

  const { mutateAsync: createNewSite, isLoading: isCreateNewSiteLoading } =
    useMutation<RegisterSiteResponse, ApiError, any>(
      (data: { url: string; name: string }) => {
        return createSite({ url: data.url, name: data.name })
      },
      {
        onSuccess: async (data: RegisterSiteResponse) => {
          if (data.institution?.id) {
            await createApplicationForm(data.institution.id)
          }
          toast.success(t('onboarding:welcome.siteCreated'))

          return data
        },
        onError: (error: ApiError) => {
          switch (error.statusCode) {
            case 400:
              toast.error(t('onboarding:errors.domainAlreadyExist'))
              break
            case 403:
              toast.error(t('common:errors.NOT_AUTHENTICATE'))
              break
            case 422:
            case 500:
              toast.error(t('onboarding:errors.invalidDomain'))
              break
            default:
              toast.error(t('common:errors.network'))
              break
          }
        },
      }
    )

  const { mutateAsync: createInstituionSetting } = useMutation<
    WebpageInstitutionSettingProps,
    ApiError,
    any
  >(
    (data: { institutionId: number; templates: string }) => {
      return createWebpageStyle(data.institutionId, {
        templates: data.templates,
        themeColor: defaultThemeColor,
      })
    },
    {
      onSuccess: async (data: WebpageInstitutionSettingProps) => {
        toast.success(t('onboarding:welcome.themeSettingComplete'))
        return data
      },

      onError: (_error: ApiError) => {
        toast.error(t('common:errors.network'))
      },
    }
  )
  const {
    mutateAsync: submitSiteSettings,
    isLoading: isSubmitSiteSettingIsLoading,
  } = useMutation(
    (data: {
      language: string
      timeZone: string
      currency: string
      country: string
      siteId: number
      countryCode: string
    }) => {
      return setSiteIntlSettings({
        language: data.language,
        timeZone: data.timeZone,
        currency: data.currency,
        country: data.country,
        siteId: data.siteId,
        countryCode: data.countryCode,
      })
    },
    {
      onError: (error: ApiError) => {
        if (error.statusCode === 400) {
          toast.error(t('onboarding:errors.setSiteError'))
        } else if (error.statusCode === 403) {
          toast.error(t('common:errors.NOT_AUTHENTICATE'))
        } else if (error.statusCode === 422 || error.statusCode === 500) {
          toast.error(error.message)
        } else {
          toast.error(t('common:errors.network'))
        }
      },
    }
  )

  return (
    <Box
      align="start"
      justify="start"
      responsive
      className="gap-0 absolute md:flex-col md:h-auto"
    >
      <Box
        justify="start"
        align="start"
        className="w-full overflow-y-auto h-dvh bg-gray-50"
      >
        <div className="box-col-full p-4">
          <Box className="bg-background justify-between p-4">
            <ImageAspect
              width="8rem"
              ratio={5.4 / 1}
              src={flowclassLogo}
              alt="Flowclass Logo"
            />
            <div className="flex flex-row gap-4">
              {/* Exit button - show after class setup step */}
              {shouldShowExitButton(currentSectionIndex) && (
                <Button
                  variant="outline"
                  onClick={handleExitOnboarding}
                  className="flex w-fit mt-3 lg:mt-0"
                >
                  {t('common:action.exitOnboarding')}
                </Button>
              )}
              <LanguageToggle variant="iconOnly" justify="end" />
              <Logout iconOnly />
            </div>
          </Box>

          <div className="w-full">
            <StepIndicator
              steps={[
                t('onboarding:newUserSetup.stepIndicators.welcome'),
                t('onboarding:newUserSetup.stepIndicators.domainSettings'),
                t('onboarding:newUserSetup.stepIndicators.countrySettings'),
                t('onboarding:newUserSetup.stepIndicators.classSetup'),
                t('onboarding:newUserSetup.stepIndicators.paymentSetup'),
                t(
                  'onboarding:newUserSetup.stepIndicators.tryStudentEnrollment'
                ),
                t('onboarding:newUserSetup.stepIndicators.success'),
              ]}
              currentStep={currentSectionIndex}
              className="py-4"
            />
          </div>

          <div className="box-responsive-full gap-8 justify-center items-start">
            <Box
              direction="col"
              className={`bg-gray-50 ${getWrapperClassName(
                currentSectionIndex
              )}`}
            >
              <Box
                direction="col"
                className={`bg-gray-50 gap-4 transition-all duration-1000 ${(() => {
                  if (
                    !isFirstStep(currentSectionIndex) &&
                    !isLastStep(currentSectionIndex)
                  ) {
                    return 'border border-gray-100 rounded-lg shadow-sm bg-white'
                  }
                  if (isLastStep(currentSectionIndex)) {
                    return 'bg-transparent'
                  }
                  return ''
                })()}`}
              >
                <div
                  className={`${
                    !isFirstStep(currentSectionIndex) &&
                    !isLastStep(currentSectionIndex)
                      ? 'w-full border-b px-5 pt-6 border-gray-200'
                      : ''
                  }`}
                >
                  {!isFirstStep(currentSectionIndex) &&
                    !isLastStep(currentSectionIndex) && (
                      <ProgressIndicator
                        Form={
                          sectionFormMapping[
                            currentSectionIndex as keyof typeof sectionFormMapping
                          ]
                        }
                        formFields={fields.filter(field => {
                          if (field === 'courseDescription') {
                            return isCourseDescriptionCompleted
                          }
                          if (field === 'recurringSchedules') {
                            const value = formClass.watch('recurringSchedules')
                            return (
                              value &&
                              Array.isArray(value) &&
                              value.some(item => !item.deleted)
                            )
                          }
                          return true
                        })}
                        total={total}
                        className="self-start"
                      />
                    )}

                  {!isLastStep(currentSectionIndex) && (
                    <div className="box-row-full md:gap-8 gap-4 px-4">
                      {setUpSectionList[currentSectionIndex].titleIcon && (
                        <div>
                          {setUpSectionList[currentSectionIndex].titleIcon}
                        </div>
                      )}
                      <div className="box-col-full items-start ml-4">
                        <Heading
                          align={
                            isFirstStep(currentSectionIndex) ? 'center' : 'left'
                          }
                          size="large"
                          id="setUpWebsiteHeading"
                          className="mt-4 text-left"
                        >
                          {setUpSectionList[currentSectionIndex].title}
                        </Heading>
                        <Text
                          align={
                            isFirstStep(currentSectionIndex) ? 'center' : 'left'
                          }
                          className="mb-4 text-left"
                          size="medium"
                        >
                          {setUpSectionList[currentSectionIndex].subtitle}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
                <FadeInAndLeftAnimation
                  style={{ width: '100%' }}
                  key={currentSectionIndex}
                >
                  {setUpSectionList[currentSectionIndex].content}
                </FadeInAndLeftAnimation>
              </Box>
              {!isLastStep(currentSectionIndex) &&
                !isFirstStep(currentSectionIndex) && (
                  <div className="sticky w-full bottom-2 mt-4 left-0 right-0 shadow-md rounded-lg bg-white border-gray-200 p-4 lg:relative lg:border-t-0">
                    <Box direction="row" className="my-2 h-[34px] gap-3">
                      {/* Back button - hide for class setup step */}
                      {!isClassSetupStep(currentSectionIndex) && (
                        <Button
                          onClick={handlePrevSection}
                          variant="outline"
                          iconBefore={<LuArrowLeft />}
                          className="w-[99px] h-full"
                        >
                          {t(`common:action.back`)}
                        </Button>
                      )}

                      {/* Next button - hide for last step */}
                      {!isLastStep(currentSectionIndex) && (
                        <Button
                          data-testid="next-button"
                          disabled={isDisabledNextButton}
                          type="submit"
                          iconAfter={
                            isValidatingDomain ||
                            isCreatingClass ? undefined : (
                              <IoMdArrowForward />
                            )
                          }
                          onClick={handleNextSection}
                          className={`h-full flex-1 ${
                            isDisabledNextButton ? 'bg-gray-500' : ''
                          }`}
                        >
                          {getNextButtonText()}
                        </Button>
                      )}

                      {/* Skip button - show for mobile preview step */}
                      {isStudentEnrollmentStep(currentSectionIndex) && (
                        <Button
                          variant="outline"
                          onClick={handleSkipMobilePreview}
                          className="flex ml-auto w-fit h-[34px] mt-3 lg:mt-0"
                        >
                          {t('common:action.skip')}
                        </Button>
                      )}

                      {/* Skip button - show for legacy steps (9+) */}
                      {currentSectionIndex >= 9 && (
                        <Button
                          variant="outline"
                          onClick={() => setShowSkipDialog(true)}
                          className="flex ml-auto w-fit h-[34px] mt-3 lg:mt-0"
                        >
                          {t('onboarding:skipDialog.skip')}
                        </Button>
                      )}
                    </Box>
                  </div>
                )}
            </Box>
            {/* Hide right side preview for mobile preview steps */}
            {!isMobilePreviewStep(currentSectionIndex) && (
              <OnboardingPreview
                currentSectionIndex={currentSectionIndex}
                siteDomain={siteDomain}
                demoImages={demoImages}
                page2Demo={page2Demo}
                isPayoutUploading={isPayoutUploading}
                payoutPreview={payoutPreview}
                classUrl={classUrl}
              />
            )}
          </div>
        </div>
      </Box>
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('onboarding:skipDialog.title')}</DialogTitle>
          </DialogHeader>

          <Text className="px-4 py-2 text-gray-500">
            {t('onboarding:skipDialog.description')}
          </Text>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={async () => {
                setShowSkipDialog(false)
                await onSubmitCreateSite()
              }}
            >
              {t('common:action.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Country Confirmation Modal */}
      <Dialog
        open={showCountryConfirmDialog || isCreatingSite}
        onOpenChange={isCreatingSite ? undefined : setShowCountryConfirmDialog}
      >
        <DialogContent className="w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isCreatingSite
                ? t('onboarding:countryConfirm.buildingTitle')
                : t('onboarding:countryConfirm.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 py-2">
            {isCreatingSite ? (
              <div className="flex flex-col items-center space-y-6">
                {/* Building Animation */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LuRocket className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    {t('onboarding:countryConfirm.buildingMessage')}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {t('onboarding:countryConfirm.buildingSubMessage')}
                  </Text>
                </div>

                {/* Progress Steps */}
                <div className="w-full space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <Text className="text-sm text-gray-600">
                      {t('onboarding:countryConfirm.step1')}
                    </Text>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <Text className="text-sm text-gray-600">
                      {t('onboarding:countryConfirm.step2')}
                    </Text>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <Text className="text-sm text-gray-600">
                      {t('onboarding:countryConfirm.step3')}
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Text className="text-gray-600 text-base leading-relaxed">
                  {t('onboarding:countryConfirm.description')}
                </Text>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Text className="text-yellow-800 text-sm font-medium">
                    {t('onboarding:countryConfirm.warning')}
                  </Text>
                </div>
              </>
            )}
          </div>

          {!isCreatingSite && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleCountryReject}
                data-testid="country-confirm-cancel"
              >
                {t('onboarding:countryConfirm.cancel')}
              </Button>
              <Button
                onClick={handleCountryConfirm}
                data-testid="country-confirm-continue"
              >
                {t('onboarding:countryConfirm.continue')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default SetUpPage
