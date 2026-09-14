import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IoMdArrowForward } from 'react-icons/io'
import { LuArrowLeft, LuExternalLink, LuGlobe, LuRocket } from 'react-icons/lu'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import { createDefaultApplicationForm } from '@/api/applicationForm'
import { createAvailability } from '@/api/availability'
import { createClass, CreateClassDto } from '@/api/class'
import { getCourses, updateCourseBasic } from '@/api/courses'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import { createWebpageStyle } from '@/api/settingSite'
import {
  checkDomainAvailability,
  createSite,
  setSiteIntlSettings,
} from '@/api/siteManagement'
import { getS3PrivateFileUrl } from '@/api/uploadFile'
import { getUserProfile } from '@/api/userProfile'
import csvTemplate from '@/assets/docs/student_data_template.csv?url'
import flowclassLogo from '@/assets/logos/flowclass.png'
import doneAnimation from '@/assets/onboarding/done_animation.gif'
import page2Demo from '@/assets/onboarding/page_2_demo.png'
import page3Demo from '@/assets/onboarding/page_3_demo.png'
import page4Demo from '@/assets/onboarding/page_4_demo.png'
import page5Demo from '@/assets/onboarding/page_5_demo.png'
import page6Demo from '@/assets/onboarding/page_6_demo.png'
import page7Demo from '@/assets/onboarding/page_7_demo.png'
import page8Demo from '@/assets/onboarding/page_8_demo.png'
import { FadeInAndLeftAnimation } from '@/components/Animations/FadeInAnimations'
import Logout from '@/components/Buttons/Logout'
import DraggableMultiGroup from '@/components/Containers/DraggableMultiGroup'
import ImageAspect from '@/components/Images/ImageAspect'
import TextEditor from '@/components/Inputs/TextEditor'
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
import { DownloadLink } from '@/components/ui/DownloadLink'
import FileInput from '@/components/ui/FileInput'
import Form from '@/components/ui/Form'
import { FormStepItem } from '@/components/ui/FormStepItem'
import { ColorPicker } from '@/components/ui/Inputs/ColorPicker'
import { Input } from '@/components/ui/Inputs/Input'
import { ProgressIndicator } from '@/components/ui/ProgressIndicator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import TextArea from '@/components/ui/TextArea'
import { TIMEOUT_TIME } from '@/constants/common'
import { countryConfig } from '@/constants/countryConfig'
import { defaultRepeatFormat } from '@/constants/course'
import { extractSubdomain, getFreeDomainList } from '@/constants/domain'
import {
  isS3PrivateBucket,
  MediaFileDirectory,
} from '@/constants/MediaFileDirectory'
import { QUERY_KEY } from '@/constants/queryKey'
import { defaultThemeColor, WebsiteTemplate } from '@/constants/websiteTemplate'
import useApplicationFormData from '@/hooks/useApplicationFormData'
import { useUserCountry } from '@/hooks/useLocalization'
import usePayoutData from '@/hooks/usePayoutData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import FieldCard from '@/pages/Setting/ApplicationForm/EditCustomFieldItem'
import ImportCSVModal, {
  ImportCSVModalHandle,
} from '@/pages/StudentCRM/CSV/ImportCSVModal'
import { informationFieldState } from '@/stores/informationFieldData'
import { RegisterSiteResponse } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import { userPermissionState } from '@/stores/userPermissionData'
import { InformationFieldTypes } from '@/types/applicationForm'
import {
  RecurringSchedules,
  RegularPeriods,
  RepeatFormats,
} from '@/types/classes'
import { ClassTypeEnum, PriceType, SectionDescription } from '@/types/course'
import { CourseSectionTagEnum, SectionTagEnum } from '@/types/school'
import { StripeConnectStatus } from '@/types/schoolSubscriptionPlan'
import { WebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'
import { cn } from '@/utils/cn'
import { getUserRoleFromArray } from '@/utils/convert'
import { defaultRegularPeriod } from '@/utils/convert-class.utils'
import { getCurrencySymbol } from '@/utils/currency'
import { getS3FileUrl } from '@/utils/generate-link.utils'
import {
  validateCourseLowestPrice,
  validateCustomDomain,
} from '@/utils/validate'

import StripePaymentSection from '../../PaymentMethods/StripePaymentSection'
import { initializeSchoolSectionValues } from '../../School/Description'
import SelectField from '../../Setting/ApplicationForm/SelectField'
import CreateNewField from '../../Setting/CustomDataField/CreateNewCustomDataFieldDrawer'
import { CountryOption } from '../../Setting/Site/RegionLanguageSetting'
import RegularPeriodsSection from '../../TeachingService/EditCourse/Class/RegularPeriodsSection'
import SelectClassType from '../../TeachingService/EditCourse/Class/SelectClassType'
import Session from '../../TeachingService/EditCourse/Events/Session'
import { initializeCourseSectionValues } from '../../TeachingService/EditCourse/PageContent'
import RecurringScheduleTable from '../../TeachingService/EditCourse/Recurring/RecurringScheduleTable'
import OnboardingPreview from '../components/OnboardingPreview'
import SetCountryStep from '../steps/SetCountryStep'
import SetDomainStep from '../steps/SetDomainStep'
import StartSetUpStep from '../steps/StartSetUpStep'
import SubscriptionStep from '../steps/SubscriptionStep'

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

  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0)
  const { updateCurrentSchool, useUpdateSchool, schoolData } = useSchoolData()
  const { mutateAsync: updateSchool } = useUpdateSchool(
    schoolData?.currentSchool?.id ?? 0,
    false
  )
  const { useCreateApplicationForm } = useApplicationFormData()
  const createForm = useCreateApplicationForm()

  const [user, setUser] = useRecoilState(userState)
  const [, setUserPermission] = useRecoilState(userPermissionState)
  const [informationFieldData] = useRecoilState(informationFieldState)
  const [courseId, setCourseId] = useState<number>(0)
  const [payoutPreview, setPayoutPreview] = useState<string | undefined>(
    undefined
  )
  const [isPayoutUploading, setIsPayoutUploading] = useState<boolean>(false)
  const [isOpenCreateFields, setIsOpenCreateFields] = useState(false)
  const [isOpenSelectField, setIsOpenSelectField] = useState(false)
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
    useState<string>('schedule')

  const selectedDomain = getFreeDomainList[0]

  const [selectedWebsiteTemplate] = useState<WebsiteTemplate>(
    WebsiteTemplate.Hero
  )

  // const [createNewSiteRes, setCreateNewSiteRes] =
  //   useState<RegisterSiteResponse>()

  // const { mutate: createPayout } = useCreatePayoutMethod()
  const importCSVModalHandle = useRef<ImportCSVModalHandle>(null)
  const handlePrev = () => {
    importCSVModalHandle.current?.handleOpenChange?.()
  }
  const calendarRef = useRef(null)
  const { useFetchStripeConnectDetail } = usePayoutData()
  const stripeDetailResult = useFetchStripeConnectDetail()
  const isStripeComplete =
    stripeDetailResult?.data?.status === StripeConnectStatus.COMPLETE
  const { useCreatePayoutMethod } = usePayoutData()
  const { mutate: createPayoutMethod } = useCreatePayoutMethod()
  const handleDeleteField = (id: number) => {
    setApplicationFormFields(prev =>
      prev ? prev.filter(field => field.id !== id) : []
    )
  }
  const renderTimeSlotComponent = (classType: string) => {
    switch (classType) {
      case ClassTypeEnum.regular:
        return (
          <FormStepItem
            name="regularPeriods"
            label={t('onboarding:welcome.classTimeSlots')}
            required
          >
            <RegularPeriodsSection calendarRef={calendarRef} />
          </FormStepItem>
        )
      case ClassTypeEnum.workshop:
        return (
          <FormStepItem
            name="regularPeriods"
            label={t('onboarding:welcome.classTimeSlots')}
            required
          >
            <Session />
          </FormStepItem>
        )
      case ClassTypeEnum.recurring:
        return (
          <FormStepItem
            name="recurringSchedules"
            label={t('onboarding:welcome.classTimeSlots')}
            required
            customValueCheck={value =>
              value && Array.isArray(value) && value.some(item => !item.deleted)
            }
            rules={{
              validate: (value: RecurringSchedules[]) => {
                return value &&
                  Array.isArray(value) &&
                  value.some(item => !item.deleted)
                  ? undefined
                  : (t('common:errors.required') as string)
              },
            }}
          >
            <RecurringScheduleTable />
          </FormStepItem>
        )
      default:
        return null
    }
  }

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
      recurringSchedules: [],
      recurringFormat: defaultRepeatFormat,
    },
  })

  const formPaymentMethod = useForm<{
    stripeConnect: boolean
    methodName: string
    paymentInstructions: string
    qrCodePic: string
  }>({
    mode: 'onBlur',
    defaultValues: {
      stripeConnect: false,
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

  const formWhatsApp = useForm<{
    whatsappNumber: string
    whatsappEnabled: boolean
  }>({
    mode: 'onBlur',
    defaultValues: {
      whatsappNumber: '',
      whatsappEnabled: false,
    },
  })

  const siteDomain = formSchool.watch('siteDomain')
  const schoolName = formSchool.watch('schoolName')
  const selectedCountry = formSchool.watch('country')

  const url = useMemo(() => {
    return `${siteDomain.toLowerCase()}.${selectedDomain}`
  }, [siteDomain, selectedDomain])

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

  const isDisabledNextButton = useMemo(() => {
    // console.log('Form is valid:', formSchoolDetails.formState.isValid)
    // console.log('Form errors:', formSchoolDetails.formState.errors)
    // console.log('Form values:', formSchoolDetails.getValues())

    switch (currentSectionIndex) {
      case 0:
        return false
      case 1:
        // return !formSchool.formState.isValid
        return (
          !formSchool.formState.isValid ||
          !validateCustomDomain(url) ||
          !schoolName ||
          isValidatingDomain
        )
      case 2: {
        return !selectedCountry
      }
      case 3: {
        // Class setup - only allow next if user is at the last step (preview) and not creating class
        return createClassCurrentStep !== 'preview' || isCreatingClass
      }
      case 4: {
        // Payment method validation
        return !formPaymentMethod.formState.isValid
      }
      case 5: {
        // WhatsApp step - always allow next (optional step)
        return false
      }
      case 6: {
        // Student enrollment step - always allow next (testing step)
        return false
      }
      case 7: {
        // Subscription step - always allow next (optional step)
        return false
      }
      case 8: {
        const hasCourseName = !!courseName
        const hasCourseLink = !!courseLink
        // const hasCourseBanner = !!courseBanner
        const hasCourseDesc = validateDescriptionSection(courseDesc)

        return !(
          hasCourseName &&
          hasCourseLink &&
          // hasCourseBanner &&
          hasCourseDesc
        )
      }
      case 9:
        return !formClass.formState.isValid
      case 10:
        return !formApplicationForm.formState.isValid
      case 11:
        return !formImportCSV.formState.isValid
      default:
        return false
    }
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
    schoolLogo,
    themeColor,
    schoolDescValues,
    courseName,
    courseLink,
    courseBanner,
    courseDesc,
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
        siteDomain: extractSubdomain(siteData.currentSite?.url) || '',
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
    if (isStripeComplete) {
      formPaymentMethod.reset({
        stripeConnect: true,
      })
    }
  }, [schoolData?.currentSchool, siteData?.currentSite, isStripeComplete])

  // useEffect(() => {
  //   if (currentSectionIndex === 4 && !courseId) {
  //     setCurrentSectionIndex(3)
  //   }
  // }, [courseId, currentSectionIndex])

  useEffect(() => {
    if (
      informationFieldData.informationFields &&
      (!applicationFormFields || applicationFormFields.length === 0)
    ) {
      const defaultFields = informationFieldData.informationFields
        .filter(field => typeof field.order === 'number' && field.isDefault)
        .sort((a, b) => a.order - b.order)
      setApplicationFormFields(defaultFields)
      formApplicationForm.setValue('applicationFormFields', defaultFields)
    }
  }, [
    applicationFormFields,
    formApplicationForm,
    informationFieldData.informationFields,
  ])

  const onSubmitSchoolDetails = async (data: any) => {
    if (schoolData?.currentSchool?.id) {
      try {
        const updatedSchool = await updateSchool({
          logo: data.schoolLogo,
          description: data.schoolDesc,
          themeColor: data.themeColor,
        })

        if (updatedSchool) {
          updateCurrentSchool(updatedSchool)
        }
      } catch (error) {
        console.error('Error updating school details:', error)
      }
    }
  }

  const onSubmitCourse = async (data: any) => {
    try {
      if (schoolData?.currentSchool?.id) {
        const updatedCourse = await updateCourseBasic({
          name: data.courseName,
          path: data.courseLink,
          institutionId: schoolData.currentSchool.id,
          previewImageUrl: data.courseBanner,
          longDescriptions: data.courseDescription,
          useQrAttendance: data.attendanceQrCode,
        })
        setCourseId(updatedCourse.id)
        formClass.setValue('classToBeEdited', {
          courseId: updatedCourse.id,
          lessons: [],
          duration: 60,
          repeatFormat: defaultRepeatFormat,
        })
        toast.success(t('onboarding:welcome.courseCreated'))
      }
      return true
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error(t('common:errors.network'))
      return false
    }
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
          courseLink: data.coursePath || '/my-course',
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
      }

      if (
        data.classType === ClassTypeEnum.regular &&
        data.regularPeriods?.length > 0
      ) {
        classRequestData.regularPeriods = data.regularPeriods
      } else if (
        data.classType === ClassTypeEnum.workshop &&
        data.regularPeriods?.length > 0
      ) {
        classRequestData.regularPeriods = data.regularPeriods
      } else if (
        data.classType === ClassTypeEnum.recurring &&
        data.recurringSchedules?.length > 0
      ) {
        classRequestData.recurringSchedules = data.recurringSchedules
        classRequestData.recurringFormat = data.recurringFormat || {
          repeat: true,
          times: 8,
          every: 1,
          unit: 'weeks',
        }
      } else if (data.classType === ClassTypeEnum.subscription) {
        classRequestData.recurringFormat = data.recurringFormat || {
          repeat: true,
          times: 8,
          every: 1,
          unit: 'weeks',
        }
      }

      const createdClass = await createClass(classRequestData)

      if (createdClass) {
        // For appointment classes, create availability with test time slots
        if (
          data.isAppointment &&
          schoolData?.currentSchool?.id &&
          siteData?.currentSite?.id
        ) {
          try {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(14, 0, 0, 0) // 2:00 PM

            const availabilityData = {
              siteId: siteData.currentSite.id,
              institutionId: schoolData.currentSchool.id,
              name: `${data.className} Availability`,
              availableSchedules: [
                {
                  dayOfWeek: tomorrow.getDay(),
                  startTime: tomorrow.toTimeString().slice(0, 5),
                  endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)
                    .toTimeString()
                    .slice(0, 5),
                  isEnabled: true,
                },
              ],
            }

            const createdAvailability = await createAvailability(
              availabilityData
            )

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

        // Refresh iframe to show the latest class after successful creation
        setTimeout(() => {
          const iframe = document.querySelector('iframe')
          if (iframe && createdClass.id && data.coursePath) {
            // Navigate to the specific class page using the correct URL format
            const classUrl = `https://${url}/@/${data.coursePath}`
            iframe.src = classUrl
          }
        }, 1000)
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
  const onSubmitNewEnrollmentForm = async (data: any) => {
    try {
      const institutionId = schoolData.currentSchool?.id || 0

      const fieldsList =
        applicationFormFields?.map(field => {
          if (field.id) return `${field.flag || 'applicant'}.${field.id}`
          return `${field.flag}.0`
        }) || []

      const response = await createForm.mutateAsync({
        institutionId,
        fields: fieldsList,
        name: data.applicationFormName,
        description: data.applicationFormDescription,
      })
      return response
    } catch (error) {
      console.error('create application form failed:', error)
      throw error
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
    5: formWhatsApp,
    6: formSchool, // Student enrollment uses school form for simplicity
    7: formSchool, // Subscription step uses school form for simplicity
    8: formSchoolDetails,
    9: formCourse,
    10: formClass,
    11: formApplicationForm,
    12: formImportCSV,
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
        return {
          fields: ['whatsappEnabled', 'whatsappNumber'],
          total: 2,
        }
      case 6:
        return {
          fields: ['studentName', 'studentEmail', 'studentPhone'],
          total: 3,
        }
      case 7:
        return {
          fields: ['subscriptionPlan'],
          total: 1,
        }
      case 8:
        return {
          fields: sectionFormFields.schoolDetails,
          total: sectionFormFields.schoolDetails.length,
        }
      case 9:
        return {
          fields: sectionFormFields.createCourse,
          total: sectionFormFields.createCourse.length,
        }
      case 10: {
        const baseFields = [...sectionFormFields.createClass]

        const classType = formClass.watch('classType')
        let timeSlotField = ''

        if (classType === ClassTypeEnum.recurring) {
          timeSlotField = 'recurringSchedules'
        } else if (
          classType === ClassTypeEnum.regular ||
          classType === ClassTypeEnum.workshop
        ) {
          timeSlotField = 'regularPeriods'
        }

        if (timeSlotField) {
          baseFields.push(timeSlotField)
        }

        return {
          fields: baseFields,
          total: baseFields.length,
        }
      }
      case 11:
        return {
          fields: sectionFormFields.applicationForm,
          total: sectionFormFields.applicationForm.length,
        }
      case 12:
        return {
          fields: sectionFormFields.importCSV,
          total: sectionFormFields.importCSV.length,
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
    if (currentSectionIndex < setUpSectionList.length - 1) {
      if (currentSectionIndex === 0) {
        // Check if user already has a site
        if (siteData?.currentSite) {
          // User already has a site, skip to step 3 (school details)
          setCurrentSectionIndex(3)
          return
        }

        setCurrentSectionIndex(currentSectionIndex + 1)
      } else if (currentSectionIndex === 1) {
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
            if (
              error instanceof ApiError &&
              error.message === 'SITE_NOT_FOUND'
            ) {
              setCurrentSectionIndex(currentSectionIndex + 1)
              return
            }
            toast.error(t('onboarding:errors.domainCheckFailed'))
          } finally {
            setIsValidatingDomain(false)
          }
        }
      } else if (currentSectionIndex === 2) {
        // Show confirmation modal for country selection
        setShowCountryConfirmDialog(true)
      } else if (currentSectionIndex === 3) {
        // Class setup - create course and class when Next is clicked
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
      } else if (currentSectionIndex === 4) {
        const isValid = await formPaymentMethod.trigger()
        if (isValid) {
          await formPaymentMethod.handleSubmit(onSubmitPaymentMethod)()
          setCurrentSectionIndex(currentSectionIndex + 1)
        }
      } else if (currentSectionIndex === 5) {
        // WhatsApp step - always allow next (optional step)
        setCurrentSectionIndex(currentSectionIndex + 1)
      } else if (currentSectionIndex === 6) {
        // Student enrollment step - always allow next (testing step)
        setCurrentSectionIndex(currentSectionIndex + 1)
      } else if (currentSectionIndex === 7) {
        // Subscription step - always allow next (optional step)
        setCurrentSectionIndex(currentSectionIndex + 1)
      } else if (currentSectionIndex === 8) {
        const isValid = await formSchoolDetails.trigger()
        if (isValid) {
          await formSchoolDetails.handleSubmit(onSubmitSchoolDetails)()
          setCurrentSectionIndex(currentSectionIndex + 1)
        }
      } else if (currentSectionIndex === 9) {
        const isValid = await formCourse.trigger()
        if (isValid) {
          await formCourse.handleSubmit(onSubmitCourse)()
          setCurrentSectionIndex(currentSectionIndex + 1)
        }
      } else if (currentSectionIndex === 10) {
        const isValid = await formClass.trigger()
        if (isValid) {
          await formClass.handleSubmit(onSubmitClass)()
          setCurrentSectionIndex(currentSectionIndex + 1)
        }
      } else if (currentSectionIndex === 11) {
        const isValid = await formApplicationForm.trigger()
        if (isValid) {
          await formApplicationForm.handleSubmit(onSubmitNewEnrollmentForm)()
          setCurrentSectionIndex(currentSectionIndex + 1)
        }
      } else {
        setCurrentSectionIndex(currentSectionIndex + 1)
      }
    } else {
      await submitCreateSite()
    }
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

  const getStyleClassName = (hasValue: boolean, isError: boolean) => {
    if (hasValue && !isError) {
      return 'border-blue-100 bg-blue-50'
    }
    if (isError) {
      return 'border-red-100 bg-red-50'
    }
    return 'border-gray-200'
  }

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
    title: 'What class types do you need?',
    subtitle:
      'Enabling the right class types ensures your scheduling, enrollment, and payment workflows match how your organization actually runs its classes.',
    // content: (
    //   <CreateClassStep
    //     formClass={formClass}
    //     onSubmitClass={onSubmitClass}
    //     onNext={() => setCurrentSectionIndex(currentSectionIndex + 1)}
    //     onStepChange={setCreateClassCurrentStep}
    //     onBack={() => setCurrentSectionIndex(currentSectionIndex - 1)}
    //   />
    // ),
  }

  const connectWhatsAppSection = {
    title: 'Connect WhatsApp',
    subtitle:
      'Link your WhatsApp to send automated messages to students and parents.',
    // content: <ConnectWhatsAppStep formWhatsApp={formWhatsApp} />,
  }

  const studentEnrollmentSection = {
    title: 'Test Student Enrollment',
    subtitle: 'Experience how your students will enroll in your courses.',
    // content: (
    //   <StudentEnrollmentStep
    //     coursePath={formCourse.watch('courseLink') || '/my-course'}
    //     className={formClass.watch('className') || 'My Class'}
    //   />
    // ),
  }

  const subscriptionSection = {
    title: 'Choose Your Plan',
    subtitle:
      'Select a subscription plan to unlock all features and start building your educational platform.',
    content: <SubscriptionStep />,
  }

  const schoolDetailsSection = {
    title: t('onboarding:newUserSetup.schoolDetails'),
    subtitle: t('onboarding:newUserSetup.schoolDetailsDesc'),
    content: (
      <Form {...formSchoolDetails}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <FormStepItem
            name="schoolLogo"
            label={t('onboarding:welcome.schoolLogo')}
            // required
            // rules={{
            //   required: t('common:errors.required') as string,
            // }}
          >
            <FileInput
              imageUrl={formSchoolDetails.watch('schoolLogo')}
              croppable
              directory={MediaFileDirectory.INSTITUTION}
              form={formSchoolDetails}
              onFileUpload={url => {
                formSchoolDetails.setValue('schoolLogo', url)
              }}
            />
          </FormStepItem>
          <FormStepItem
            name="themeColor"
            label={t('onboarding:welcome.themeColor')}
            required
            rules={{
              required: t('common:errors.required') as string,
            }}
          >
            <ColorPicker
              popoverTitle={t('onboarding:welcome.custom')}
              value={formSchoolDetails.watch('themeColor')}
              onChange={url => {
                formSchoolDetails.setValue('themeColor', url)
              }}
            />
          </FormStepItem>
          <FormStepItem
            name="schoolDesc"
            label={t('onboarding:welcome.schoolDesc')}
            required
            rules={{
              required: t('common:errors.required') as string,
              validate: (value: SectionDescription[]) => {
                if (!Array.isArray(value) || value.length === 0) {
                  return t('common:errors.required') as string
                }
                const hasContent = validateDescriptionSection(value)
                return hasContent || (t('common:errors.required') as string)
              },
            }}
            isCompleted={validateDescriptionSection(
              formSchoolDetails.watch('schoolDesc')
            )}
          >
            <TextEditor
              className="mt-0 gap-0 justify-start p-0 h-60"
              theme="snow"
              content={formSchoolDetails.watch('schoolDesc')}
              currentSection={
                schoolData &&
                schoolData.currentSchool &&
                Array.isArray(schoolData.currentSchool.description) &&
                schoolData.currentSchool.description.length > 0
                  ? schoolData.currentSchool.description[0].sectionTitle
                  : SectionTagEnum.SCHOOL_ABOUT_US
              }
              imageDirectory={MediaFileDirectory.INSTITUTION}
              onValueChange={value => {
                if (Array.isArray(value)) {
                  formSchoolDetails.setValue('schoolDesc', value)
                }
              }}
            />
          </FormStepItem>
        </div>
      </Form>
    ),
  }
  const createCourseSection = {
    title: t('onboarding:newUserSetup.createCourse'),
    subtitle: t('onboarding:newUserSetup.createCourseDesc'),
    content: (
      <Form {...formCourse}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <FormStepItem
            name="courseName"
            label={t('onboarding:welcome.courseName')}
            required
            rules={{
              required: t('common:errors.required') as string,
            }}
          >
            <Input className="h-6" />
          </FormStepItem>
          <FormStepItem
            name="courseLink"
            label={t('onboarding:welcome.courseLink')}
            required
            rules={{
              required: t('common:errors.required') as string,
            }}
          >
            <Input className="h-6" />
          </FormStepItem>
          <FormStepItem
            name="courseBanner"
            label={t('onboarding:welcome.courseBanner')}
          >
            <FileInput
              label={t('teachingService:basic.previewImageTips') as string}
              croppable
              directory={MediaFileDirectory.COURSE}
              aspectRatio={16 / 9}
              onFileUpload={url => {
                formCourse.setValue('courseBanner', url)
                formCourse.trigger('courseBanner')
              }}
            />
          </FormStepItem>
          <FormStepItem
            name="courseDescription"
            label={t('onboarding:welcome.courseDescription')}
            required
            isCompleted={isCourseDescriptionCompleted}
            rules={{
              required: t('common:errors.required') as string,
              validate: (value: SectionDescription[]) => {
                const content = value[0]?.content || ''
                const textContent = content.replace(/<[^>]*>/g, '').trim()
                return (
                  textContent.length > 0 ||
                  (t('common:errors.required') as string)
                )
              },
            }}
          >
            <TextEditor
              placeholder={
                t('onboarding:welcome.courseDescriptionPlaceholder') as string
              }
              className="mt-0 gap-0 justify-start p-0 h-60"
              theme="snow"
              content={formCourse.watch('courseDescription')}
              currentSection={CourseSectionTagEnum.COURSE_FEATURES}
              imageDirectory={MediaFileDirectory.COURSE}
              onValueChange={value => {
                formCourse.setValue(
                  'courseDescription',
                  value as SectionDescription[]
                )
              }}
            />
          </FormStepItem>
          <FormStepItem
            name="attendanceQrCode"
            label={t('onboarding:welcome.attendanceQrCode')}
          >
            <Switch
              className="rounded-xl border-0"
              checked={formCourse.watch('attendanceQrCode')}
              onCheckedChange={checked => {
                formCourse.setValue('attendanceQrCode', checked)
              }}
            />
          </FormStepItem>
        </div>
      </Form>
    ),
  }
  const createClassSection = {
    title: t('onboarding:newUserSetup.createClass'),
    subtitle: t('onboarding:newUserSetup.createClassDesc'),
    content: (
      <Form {...formClass}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <FormStepItem
            name="classType"
            label={t('onboarding:welcome.classType')}
            preserveChildStyle
            required
          >
            <SelectClassType
              label={t('onboarding:welcome.classTypeDesc') as string}
              optionMode
              selectedValue={formClass.watch('classType')}
              handleValueChange={(value: string) => {
                formClass.setValue('classType', value)
              }}
              cardClassName="w-[100%] md:w-[47%] lg:w-[100%] xl:w-[45%]"
            />
          </FormStepItem>
          <FormStepItem
            name="className"
            label={t('onboarding:welcome.className')}
            required
          >
            <Input />
          </FormStepItem>
          <FormStepItem
            name="classTuition"
            label={t('onboarding:welcome.classTuition')}
            rules={{
              required: t('common:errors.required') as string,
              validate: async (val: number) => {
                if (val < 0) {
                  return t('embed:configuration.negative') as string
                }
                if (Number(val) === 0) {
                  return true
                }
                const priceValidation = await validateCourseLowestPrice(
                  val,
                  schoolData?.currentSchool?.siteSetting?.currency || 'HKD'
                )
                if (!priceValidation) {
                  return t('teachingService:feeNTime.tooLow') as string
                }
                return true
              },
            }}
            required
          >
            <div className="flex flex-row gap-2 h-auto w-[40%]">
              <Input
                {...formClass.register('classTuition')}
                prefixText={getCurrencySymbol(
                  schoolData?.currentSchool?.siteSetting?.currency || 'HKD'
                )}
                className="h-8"
              />
              {schoolData?.currentSchool && (
                <span className="flex items-center">
                  {schoolData.currentSchool.siteSetting?.currency}
                </span>
              )}
              <Select
                onValueChange={value => {
                  formClass.setValue('classPriceType', value as PriceType)
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue
                    placeholder={
                      t('onboarding:welcome.tuitionPerClass') as string
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PriceType.PER_CLASS}>
                    {t('onboarding:welcome.tuitionPerClass')}
                  </SelectItem>
                  <SelectItem value={PriceType.PER_LESSON}>
                    {t('onboarding:welcome.tuitionPerLesson')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FormStepItem>
          <FormStepItem
            name="classQuota"
            label={t('onboarding:welcome.classQuota')}
            rules={{
              required: t('common:errors.required') as string,
            }}
            required
          >
            <div className="flex flex-row gap-2 h-auto w-fit">
              <Input
                type="number"
                className="h-8 w-24"
                {...formClass.register('classQuota')}
              />
              <span className="flex items-center">Students</span>
            </div>
          </FormStepItem>
          {formClass.watch('classType') && (
            <>{renderTimeSlotComponent(formClass.watch('classType'))}</>
          )}
        </div>
      </Form>
    ),
  }
  const paymentMethodSection = {
    title: t('onboarding:newUserSetup.registerPaymentMethod'),
    subtitle: `${t('onboarding:newUserSetup.fillInPaymentInfo')}. ${t(
      'onboarding:newUserSetup.addPaymentMethod'
    )}.`,
    content: (
      <Form {...formPaymentMethod}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <FormStepItem
            name="stripeConnect"
            label={t('payout:stripe.onlinePayment')}
            isCompleted={isStripeComplete}
          >
            <Text className="text-gray-500">
              {t('payout:stripe.description')}
            </Text>
            <StripePaymentSection onboardingMode />
          </FormStepItem>
          <FormStepItem
            name="offlinePayment"
            label={t('payout:paymentMethod.offlinePayment')}
            required
            isCompleted={
              !!formPaymentMethod.watch('methodName') &&
              !!formPaymentMethod.watch('paymentInstructions')
            }
            validateFields={['methodName', 'paymentInstructions']}
          >
            <div className="space-y-4 mt-2 h-auto">
              <div
                className={cn(
                  getStyleClassName(
                    !!formPaymentMethod.watch('methodName'),
                    !!formPaymentMethod.formState.errors.methodName
                  )
                )}
              >
                <label
                  htmlFor="methodName"
                  className="text-sm font-medium block mb-1"
                >
                  {t('payout:paymentMethodName')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  data-testid="payment-method-name-input"
                  required
                  id="methodName"
                  className={cn(
                    getStyleClassName(
                      !!formPaymentMethod.watch('methodName'),
                      !!formPaymentMethod.formState.errors.methodName
                    ),
                    'px-0 py-1 h-6 border-t-0 border-x-0 rounded-none focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0'
                  )}
                  {...formPaymentMethod.register('methodName', {
                    required: true,
                  })}
                />
                {formPaymentMethod.formState.errors.methodName && (
                  <p className="text-sm font-medium text-destructive">
                    {formPaymentMethod.formState.errors.methodName?.message ||
                      t('common:errors.required')}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="paymentInstructions"
                  className="text-sm font-medium block mb-1"
                >
                  {t('payout:instruction')}{' '}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <TextArea
                  data-testid="payment-instructions-input"
                  required
                  id="paymentInstructions"
                  placeholder={t('payout:instructionPlaceholder').toString()}
                  className={cn(
                    'px-0 py-1 min-h-[80px] border-t-0 border-x-0 rounded-none focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0',
                    getStyleClassName(
                      !!formPaymentMethod.watch('paymentInstructions'),
                      !!formPaymentMethod.formState.errors.paymentInstructions
                    )
                  )}
                  {...formPaymentMethod.register('paymentInstructions', {
                    required: true,
                  })}
                />
                {formPaymentMethod.formState.errors.paymentInstructions && (
                  <p className="text-sm font-medium text-destructive">
                    {formPaymentMethod.formState.errors.paymentInstructions
                      ?.message || t('common:errors.required')}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="qrCodePic"
                  className="text-sm font-medium block mb-1"
                >
                  {t('payout:paymentCode')}
                </label>
                <FileInput
                  croppable
                  directory={MediaFileDirectory.PAYMENT_METHOD}
                  {...formPaymentMethod.register('qrCodePic')}
                  onFileUpload={async url => {
                    formPaymentMethod.setValue('qrCodePic', url)

                    try {
                      if (
                        isS3PrivateBucket[MediaFileDirectory.PAYMENT_METHOD]
                      ) {
                        const result = await getS3PrivateFileUrl(url)
                        setPayoutPreview(result)
                      } else {
                        setPayoutPreview(getS3FileUrl(url))
                      }
                    } finally {
                      setIsPayoutUploading(false)
                    }
                  }}
                  onUploadStart={() => {
                    setIsPayoutUploading(true)
                  }}
                />
              </div>
            </div>
          </FormStepItem>
        </div>
      </Form>
    ),
  }
  const applicationFormSection = {
    title: t('onboarding:newUserSetup.applicationForm.title'),
    subtitle: t('onboarding:newUserSetup.applicationForm.subtitle'),
    content: (
      <Form {...formApplicationForm}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <FormStepItem
            name="applicationFormName"
            label={t('onboarding:newUserSetup.applicationForm.name')}
            required
          >
            <Text className="text-gray-500">
              {t('onboarding:newUserSetup.applicationForm.nameDesc')}
            </Text>
            <Input
              {...formApplicationForm.register('applicationFormName')}
              placeholder={
                t(
                  'onboarding:newUserSetup.applicationForm.namePlaceholder'
                ) as string
              }
              className={cn(
                getStyleClassName(
                  !!formApplicationForm.watch('applicationFormName'),
                  !!formApplicationForm.formState.errors.applicationFormName
                ),
                'px-0 py-1 h-6 border-t-0 border-x-0 rounded-none focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
              data-testid="application-form-name-input"
            />
          </FormStepItem>
          <FormStepItem
            name="applicationFormDescription"
            label={t('onboarding:newUserSetup.applicationForm.description')}
            required
          >
            <Input
              placeholder={
                t(
                  'onboarding:newUserSetup.applicationForm.namePlaceholder'
                ) as string
              }
              data-testid="application-form-description-input"
            />
          </FormStepItem>
          <FormStepItem
            name="applicationFormFields"
            label={t('onboarding:newUserSetup.applicationForm.personalInfo')}
            required
            rules={{
              validate: (value: any) => {
                return (
                  (value && Array.isArray(value) && value.length > 0) ||
                  (t('common:errors.required') as string)
                )
              },
            }}
            isCompleted={
              applicationFormFields && applicationFormFields.length > 0
            }
          >
            <Text className="text-gray-500">
              {t('onboarding:newUserSetup.applicationForm.personalInfoDesc')}
            </Text>
            <div className="flex gap-2 mt-4">
              <Button
                data-testid="create-new-field-btn"
                className="w-fit"
                onClick={() => setIsOpenCreateFields(true)}
              >
                {t(`setting:studentInformation.createNewField`)}
              </Button>
              <Button
                data-testid="add-custom-data-field-btn"
                className="w-fit"
                onClick={() => setIsOpenSelectField(true)}
              >
                {t('setting:applicationForm.selectField')}
              </Button>
            </div>
            {applicationFormFields && applicationFormFields.length > 0 && (
              <div className="mt-4">
                <Heading size="smallMedium" className="mb-2">
                  {t('setting:applicationForm.applicantFields')}
                </Heading>
                <DraggableMultiGroup
                  items={{
                    applicant: applicationFormFields,
                  }}
                  handleDragEnd={(
                    value: Record<string, InformationFieldTypes[]>
                  ) => {
                    setApplicationFormFields(value.applicant)
                  }}
                  labelField={{}}
                  fieldCard={({ item }) => (
                    <FieldCard
                      data={item}
                      handleDeleteField={() => {
                        handleDeleteField(item.id ?? 0)
                      }}
                    />
                  )}
                />
              </div>
            )}
          </FormStepItem>
          <CreateNewField
            open={isOpenCreateFields}
            handleClose={() => {
              setIsOpenCreateFields(false)
            }}
            mode="dialog"
          />
          <SelectField
            open={isOpenSelectField}
            setFields={selectedFields => {
              if (typeof selectedFields === 'function') {
                const finalFields = selectedFields(applicationFormFields || [])
                setApplicationFormFields(finalFields)
                formApplicationForm.setValue(
                  'applicationFormFields',
                  finalFields
                )
              } else {
                setApplicationFormFields(selectedFields)
                formApplicationForm.setValue(
                  'applicationFormFields',
                  selectedFields
                )
              }
            }}
            fields={applicationFormFields}
            handleClose={() => setIsOpenSelectField(false)}
          />
        </div>
      </Form>
    ),
  }
  const registerWithImportData = {
    siteName: siteDomain,
    schoolName,
    url,
    // payoutMethodName: formPaymentMethod.getValues('methodName'),
    // payoutDescription: formPaymentMethod.getValues('paymentInstructions'),
    // payoutMethodDetails: {
    //   payoutImg: formPaymentMethod.getValues('qrCodePic'),
    //   receiptRequired: true,
    // },
    selectedWebsiteTemplate,
    selectedCountryOption,
  }

  const handleImportCSV = () => {
    importCSVModalHandle.current?.handleOpenChange?.()
  }

  /** COUNTRY SELECTION PAGE */

  // const handleCountryChange = (selectedOption: number) => {
  //   if (selectedOption !== null) {
  //     setSelectedCountryOption(countryOptions[selectedOption])
  //   }
  // }

  const uploadCSVSection = {
    title: t('onboarding:newUserSetup.uploadCsv.uploadStuInfo'),
    subtitle: t('onboarding:newUserSetup.uploadCsv.startAssign'),
    content: (
      <Form {...formImportCSV}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <FormStepItem
            name="importCSV"
            label={
              t('onboarding:newUserSetup.uploadCsv.prepareUpload') as string
            }
            required
          >
            <Box direction="col" align="center" className="h-auto">
              <DownloadLink
                href={csvTemplate}
                download="student_data_template.csv"
                className="p-0 h-auto self-start"
              >
                {t('onboarding:newUserSetup.uploadCsv.step1')}
              </DownloadLink>

              <Text align="left" width="100%">
                {t('onboarding:newUserSetup.uploadCsv.step2')}
              </Text>
              <Text align="left" width="100%">
                {t('onboarding:newUserSetup.uploadCsv.step3')}
              </Text>
              <Text align="left" width="100%">
                {t('onboarding:newUserSetup.uploadCsv.step4')}
              </Text>
              <Text align="left" width="100%">
                {t('onboarding:newUserSetup.uploadCsv.step5')}
              </Text>

              <div className="flex w-full pt-2 gap-2">
                <Button className="w-full" onClick={handleImportCSV}>
                  {t('onboarding:newUserSetup.uploadCsv.uploadCSVBtn')}
                </Button>
              </div>
            </Box>
          </FormStepItem>

          <ImportCSVModal
            institutionId={schoolData.currentSchool?.id}
            siteId={schoolData.currentSchool?.siteId}
            ref={importCSVModalHandle}
            hidden
            handlePrev={handlePrev}
            registerWithImportData={registerWithImportData}
            onImportSuccess={() => {
              formImportCSV.setValue('importCSV', 'completed')
              formImportCSV.trigger('importCSV')
              setTimeout(() => {
                setCurrentSectionIndex(currentSectionIndex + 1)
              }, 1000)
            }}
          />
        </div>
      </Form>
    ),
  }

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
    content: (
      <Box direction="col" className="h-[70vh]">
        <ImageAspect
          src={doneAnimation}
          ratio={1 / 1}
          width="15rem"
          alt="Done"
        />
        <Text bold className="mt-6 text-5xl text-primary">
          {t('onboarding:newUserSetup.finishSetup.success')}
        </Text>
        <Text
          bold
          className="mt-6 text-lg sm:text-2xl text-gray-700 text-wrap p-4 text-center"
        >
          {t('onboarding:newUserSetup.finishSetup.successDesc')}
        </Text>
      </Box>
    ),
  }

  /* 
       THIS IS WHERE THE USER CHOOSES HOW TO USE FLOWCLASS
  */

  const setUpSectionList: {
    title: string
    subtitle: string
    titleIcon?: JSX.Element
    content: JSX.Element
  }[] = [
    onboardingPreferenceSection,
    domainSection,
    countrySection,
    // classSetupSection,
    paymentMethodSection,
    // connectWhatsAppSection,
    // studentEnrollmentSection,
    subscriptionSection,
    // schoolDetailsSection,
    // createCourseSection,
    // createClassSection,
    // applicationFormSection,
    // paymentNotificationSection,
    // uploadCSVSection,
    // selectTemplateSection,
    finishSetupSection,
  ]

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

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

  const submitCreateSite = async (): Promise<void> => {
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
        phone: formSchool.getValues('phone'),
        description: formSchoolDetails.getValues('schoolDesc'),
        logo: formSchoolDetails.getValues('schoolLogo'),
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
            <div className="w-[180px] flex flex-row gap-4">
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
                'Connect WhatsApp',
                'Test Student Enrollment',
                'Choose Your Plan',
                // t('onboarding:newUserSetup.stepIndicators.schoolDetails'),
                // t('onboarding:newUserSetup.stepIndicators.createCourse'),
                // t('onboarding:newUserSetup.stepIndicators.createClass'),
                // t('onboarding:newUserSetup.stepIndicators.applicationForm'),
                // t('onboarding:newUserSetup.stepIndicators.importStudents'),
                // t('onboarding:newUserSetup.stepIndicators.subscription'),
                t('onboarding:newUserSetup.stepIndicators.success'),
              ]}
              currentStep={currentSectionIndex}
            />
          </div>

          <div className="box-responsive-full gap-8 justify-start items-start">
            <Box
              direction="col"
              className={`bg-gray-50 ${
                currentSectionIndex === 0 ||
                currentSectionIndex === setUpSectionList.length - 1
                  ? 'px-4 md:px-4'
                  : 'w-full lg:w-[70%] xl:w-[50%]'
              }`}
            >
              <Box
                direction="col"
                className={`bg-gray-50 gap-4 ${
                  currentSectionIndex !== 0 &&
                  currentSectionIndex !== setUpSectionList.length - 1
                    ? 'border border-gray-100 rounded-lg  shadow-sm bg-white'
                    : ''
                }`}
              >
                <div
                  className={`${
                    currentSectionIndex !== 0 &&
                    currentSectionIndex !== setUpSectionList.length - 1
                      ? 'w-full border-b px-5 pt-6 border-gray-200'
                      : ''
                  }`}
                >
                  {currentSectionIndex !== 0 &&
                    currentSectionIndex !== setUpSectionList.length - 1 && (
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

                  <div className="box-row-full md:gap-8 gap-4 px-4">
                    {setUpSectionList[currentSectionIndex].titleIcon && (
                      <div>
                        {setUpSectionList[currentSectionIndex].titleIcon}
                      </div>
                    )}
                    <div className="box-col-full items-start ml-4">
                      <Heading
                        align={currentSectionIndex === 0 ? 'center' : 'left'}
                        size="large"
                        id="setUpWebsiteHeading"
                        className="mt-4 text-left"
                      >
                        {setUpSectionList[currentSectionIndex].title}
                      </Heading>
                      <Text
                        align={currentSectionIndex === 0 ? 'center' : 'left'}
                        className="mb-4 text-left"
                        size="medium"
                      >
                        {setUpSectionList[currentSectionIndex].subtitle}
                      </Text>
                    </div>
                  </div>
                </div>
                <FadeInAndLeftAnimation
                  style={{ width: '100%' }}
                  key={currentSectionIndex}
                >
                  {setUpSectionList[currentSectionIndex].content}
                </FadeInAndLeftAnimation>
              </Box>
              {currentSectionIndex !== setUpSectionList.length - 1 &&
                currentSectionIndex !== 0 && (
                  <div className="sticky w-full bottom-2 mt-4 left-0 right-0 shadow-md rounded-lg bg-white border-gray-200 p-4 lg:relative lg:border-t-0">
                    <Box direction="row" className="my-2 h-[34px] gap-3">
                      {currentSectionIndex !== 0 &&
                        currentSectionIndex !== 3 && (
                          <Button
                            onClick={handlePrevSection}
                            variant="outline"
                            iconBefore={<LuArrowLeft />}
                            className="w-[99px] h-full"
                          >
                            {t(`common:action.back`)}
                          </Button>
                        )}
                      {currentSectionIndex !== 0 &&
                        currentSectionIndex === 13 && (
                          <Button
                            disabled={
                              isSubmitSiteSettingIsLoading ||
                              isCreateNewSiteLoading
                            }
                            type="submit"
                            iconAfter={<IoMdArrowForward />}
                            onClick={handleNextSection}
                            className="w-fit h-full"
                          >
                            {t(
                              'onboarding:newUserSetup.uploadCsv.manuallyUploadLater'
                            )}
                          </Button>
                        )}
                      {currentSectionIndex !== 0 &&
                        currentSectionIndex !== setUpSectionList.length - 2 && (
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
                            {t(`common:action.next`)}
                          </Button>
                        )}{' '}
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
            <OnboardingPreview
              currentSectionIndex={currentSectionIndex}
              siteDomain={siteDomain}
              demoImages={demoImages}
              page2Demo={page2Demo}
              isPayoutUploading={isPayoutUploading}
              payoutPreview={payoutPreview}
            />
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
                await submitCreateSite()
                navigate('/home')
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
