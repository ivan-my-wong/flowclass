import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { useRecoilState, useSetRecoilState } from 'recoil'

import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import {
  fetchSchoolAndCourse,
  getRecurringCourseStartLesson,
  previewRecurringCourseLessons,
} from '@/api/courseApi'
import { QUERY_KEY } from '@/constants/queryKey'
import { useCurrentStep } from '@/hooks/useCurrentTab'
import BareboneTemplateLayout from '@/layouts/BareboneTemplateLayout'
import DefaultLayout from '@/layouts/DefaultLayout'
import HeroTemplateLayout from '@/layouts/HeroTemplateLayout'
import TemplateLayout from '@/layouts/VerticalTemplateLayout'
import ApplicationFormCourseCard from '@/page-components/enrol/CourseInformationComponents/ApplicationFormCourseCard'
import { enrolState, SelectedClassDataState } from '@/stores/enrol'
import { EnrolStateProvider } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { SettingsState } from '@/stores/settingsData'
import {
  ClassType,
  CourseWithQuotaValueClasses,
  EnrollmentFieldFlag,
  School,
  SiteSettings,
  TuitionMode,
} from '@/types'
import { Tuition } from '@/types/enrol'
import { heroTemplateTabs, templateTabs, WebsiteTemplate } from '@/types/websiteTemplate'
import { calculateClassPrice } from '@/utils/calculateCourse'
import { exportDomain } from '@/utils/domain'
import { formatUnixTime } from '@/utils/format'

import NotFoundPage from '../404'

const ConfirmDetailStep = dynamic(() => import('@/page-components/enrol/ConfirmDetailStep'), {
  ssr: false,
})
const CustomFieldStep = dynamic(() => import('@/page-components/enrol/ApplicationFormSteps'), {
  ssr: false,
})
const EnrollmentSteps = dynamic(() => import('@/page-components/enrol/FullApplicationSteps'), {
  ssr: false,
})
const PickClassStep = dynamic(() => import('@/page-components/enrol/PickTimeSteps/PickClassStep'), {
  ssr: false,
})
const PickPeriodStep = dynamic(
  () => import('@/page-components/enrol/PickTimeSteps/Regular/PickPeriodStep'),
  {
    ssr: false,
  }
)
const PickTuitionStep = dynamic(
  () => import('@/page-components/enrol/PickTimeSteps/PickTuitionStep'),
  {
    ssr: false,
  }
)
const PickPeriodV2Step = dynamic(
  () => import('@/page-components/enrol/PickTimeSteps/Regular/PickPeriodV2Step'),
  {
    ssr: false,
  }
)

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const { school, course, token, errorMessage } = await fetchSchoolAndCourse(
    req,
    query as Record<string, string>
  )

  return {
    props: {
      school,
      course,
      siteSetting: school?.siteSetting,
      errorMessage,
    },
  }
}

interface PaymentPageProps {
  school: School
  course: CourseWithQuotaValueClasses
  siteSetting: SiteSettings
  errorMessage?: string
}

//change component EnrolText below if enrol steps has any change
const regularCourseEnrolSteps = [
  PickClassStep,
  PickPeriodStep,
  PickTuitionStep,
  CustomFieldStep,
  ConfirmDetailStep,
  // EnterPaymentStep,
]

const EnrollPage = ({
  school,
  course,
  siteSetting,
  errorMessage,
}: PaymentPageProps): JSX.Element => {
  const [, setSettings] = useRecoilState(SettingsState)
  const [isLessonDatesAvailable, setIsLessonDatesAvailable] = useState(false)
  const router = useRouter()

  const domain = exportDomain(course.site.customDomain, course.site?.url)
  const originalUrl = `https://${domain}/@${school.url ?? ''}/${course.path}`
  const { t } = useTranslation()
  const setEnrolForm = useSetRecoilState(enrolState)
  const setCurrentTheme = useSetRecoilState(currentWebsiteTheme)

  const currentStep = useCurrentStep(regularCourseEnrolSteps)

  // This part to process skiping steps

  const classes = course?.classes
  const {
    classId,
    firstLessonDateUnix,
    recurLessonTimeId,
    numOfApplicants: numApplicants,
    priceOptionId,
  } = router.query

  const numOfApplicants = useMemo(
    () => (numApplicants ? Number(numApplicants) : 1),
    [numApplicants]
  )
  const selectedClass = classes?.filter(item => item.id === Number(classId))[0]

  const selectedPeriod = selectedClass?.regularPeriods.filter(
    item => item.id === Number(recurLessonTimeId)
  )[0]
  const selectedRecurSchedule = selectedClass?.recurringSchedules.filter(
    item => item.id === Number(recurLessonTimeId)
  )[0]

  const lessonDateId = selectedRecurSchedule?.id ?? 0

  const { data: availableLessonDates } = useQuery(
    [QUERY_KEY.getRecurringClassStartDate, lessonDateId],
    () =>
      getRecurringCourseStartLesson(
        lessonDateId,
        course?.site?.id ?? 0,
        course?.institutionId ?? 0,
        3
      ),
    {
      enabled: !!course?.id && lessonDateId !== 0,
      onSuccess: () => {
        setIsLessonDatesAvailable(true)
      },
    }
  )

  const { mutateAsync: previewLessons } = useMutation({
    mutationFn: (lesson: string) => {
      return previewRecurringCourseLessons(
        lesson,
        lessonDateId,
        selectedClass.id ?? 0,
        course?.institutionId ?? 0
      )
    },
    onSuccess: (data: any) => {
      return data
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const skipEnrolRecurrenceStep = async () => {
    const handleURLNotFound = () => {
      toast.warning(t('errors:ENROL.URL_NOT_FOUND') as string)
      setEnrolForm(prev => ({ ...prev, currentStep: 0 }))
    }

    const newClassData: SelectedClassDataState = {
      selectedClass,
    }

    const customForm = {
      [EnrollmentFieldFlag.applicant]: [],
      [EnrollmentFieldFlag.common]: [],
    }

    sessionStorage.setItem('custom-form', JSON.stringify(customForm))

    let newCurrentStep = 0
    let tuitionObj: Tuition

    if (selectedClass?.priceOptions) {
      if (priceOptionId) {
        const selectedPriceOption = selectedClass.priceOptions.find(
          option => option.id === Number(priceOptionId)
        )
        if (selectedPriceOption) {
          newClassData.selectedPriceOption = selectedPriceOption

          if (selectedClass.priceType === TuitionMode.MULTIPLE_OPTIONS) {
            newCurrentStep += 1
          }
        }
      } else {
        newClassData.selectedPriceOption = selectedClass.priceOptions[0]
      }
    }

    // This is when the time has already been selected for recurring course
    // Therefore, we handle both recurring and class at the same time
    if (recurLessonTimeId && firstLessonDateUnix) {
      const selectedLesson = formatUnixTime(firstLessonDateUnix as string)

      let tuition = -1

      if (availableLessonDates) {
        const previewedLessons = await previewLessons(selectedLesson)

        const listLessons = selectedLesson ? previewedLessons : null

        if (!listLessons) {
          handleURLNotFound()
          return
        }

        newClassData.selectedRecurLessons = listLessons as string[]

        tuition = calculateClassPrice(
          selectedClass,
          newClassData.selectedRecurLessons.length,
          newClassData.selectedRecurLessons.length
        )

        if (selectedRecurSchedule) {
          newClassData.selectedRecurSchedule = selectedRecurSchedule
        }

        newCurrentStep = 2

        // This is when the time has already been selected for regular course
      } else if (selectedPeriod) {
        const findPeriodLessons = selectedPeriod.lessons.filter(lesson => {
          const { startTime } = lesson
          const [start] = selectedLesson.split(' ')

          const startSame = dayjs(startTime).isSame(dayjs(start), 'seconds')
          const startAfter = dayjs(startTime).isAfter(dayjs(start), 'seconds')

          return startSame || startAfter
        })

        tuition = calculateClassPrice(
          selectedClass,
          findPeriodLessons.length,
          selectedPeriod.lessons.length
        )

        if (numOfApplicants && Number(numOfApplicants) > 1) {
          tuition = tuition * Number(numOfApplicants)
        }

        newClassData.selectedLessons = findPeriodLessons
        newClassData.selectedRegularPeriod = selectedPeriod

        if (selectedClass.type === ClassType.regular) {
          newCurrentStep = 2
        } else {
          newCurrentStep = 1
        }
      }

      if (tuition >= 0) {
        if (numOfApplicants && Number(numOfApplicants) > 1) {
          tuition = tuition * Number(numOfApplicants)
          newCurrentStep += 1
        }

        tuitionObj = {
          originalFee: tuition ?? 0,
          couponDiscount: 0,
          directDiscount: 0,
          bundleDiscount: 0,
          recurringDiscount: 0,
          totalDiscount: 0,
          feePerLesson: tuition,
          paymentAmount: tuition,
          currency: siteSetting?.currency ?? 'USD',
        }
        newCurrentStep += 1
      }
    } else if (recurLessonTimeId) {
      if (!selectedRecurSchedule) {
        handleURLNotFound()
        return
      }
      newClassData.selectedRecurSchedule = selectedRecurSchedule
      newCurrentStep = 2
    } else {
      // This is the case which there is only the selectedClass
      if (!selectedClass) {
        handleURLNotFound()
        return
      }

      if (
        selectedClass.type === ClassType.subscription ||
        selectedClass.type === ClassType.workshop
      ) {
        tuitionObj = {
          originalFee: selectedClass.tuition ?? 0,
          couponDiscount: 0,
          directDiscount: 0,
          bundleDiscount: 0,
          recurringDiscount: 0,
          totalDiscount: 0,
          feePerLesson: selectedClass.tuition ?? 0,
          paymentAmount: selectedClass.tuition ?? 0,
          currency: siteSetting?.currency ?? 'USD',
        }
      }

      newCurrentStep = 1
    }

    setEnrolForm(prev => ({
      ...prev,
      currentStep: newCurrentStep,
      selectedClassData: [newClassData],
      tuition: tuitionObj ? [tuitionObj] : [],
      setMultipleApplicant: !!numOfApplicants && Number(numOfApplicants) > 1,
      numberOfApplicant: Number(numOfApplicants) ?? undefined,
    }))
  }

  useEffect(() => {
    setEnrolForm(prev => ({
      ...prev,
      currentStep,
      studentData: {},
      selectedClassData: [],
    }))

    setSettings({
      schoolSettings: school.institutionSetting ?? {},
      siteSettings: siteSetting ?? {},
    })

    setCurrentTheme(school?.institutionSetting?.templates ?? WebsiteTemplate.Hero)

    //check first required URL params is available or not,
    //firstLessonDateUnix:firstLesson DateTime UNIX timestamp range
  }, [])

  useEffect(() => {
    if (classId) {
      skipEnrolRecurrenceStep()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLessonDatesAvailable, selectedPeriod, classId])

  const store = {
    school,
    course,
    siteSetting,
    originalUrl,
  }

  const siteTitle = `${course?.name ?? ''} / ${school.name}`.replace(/\s+-\s+/g, '')
  const seoTitle = `${siteTitle}: ${t('enrol:siteTitle')}`

  const Layouts = {
    [WebsiteTemplate.Minimal]: DefaultLayout,
    [WebsiteTemplate.Hero]: HeroTemplateLayout,
    [WebsiteTemplate.Vertical]: TemplateLayout,
    [WebsiteTemplate.Barebone]: BareboneTemplateLayout,
  }

  const renderLayout = (Layout: any, additionalProps = {}) => (
    <Layout school={school} site={course.site} course={course} {...additionalProps}>
      <Head>
        <title>{seoTitle}</title> {/* Set page title */}
      </Head>
      <div
        className={`box-col ${
          Layout === DefaultLayout
            ? 'mt-[-1rem] w-full justify-start p-0 md:mt-0'
            : 'bg-background w-full justify-start md:p-4 lg:p-6'
        }`}
      >
        <EnrolStateProvider value={store}>
          <EnrollmentSteps
            school={school}
            course={course}
            sidebar={<ApplicationFormCourseCard />}
          />
        </EnrolStateProvider>
      </div>
    </Layout>
  )

  if (school.institutionSetting?.templates) {
    if (school.institutionSetting?.templates == WebsiteTemplate.Minimal) {
      return renderLayout(Layouts[WebsiteTemplate.Minimal])
    } else if (school.institutionSetting?.templates == WebsiteTemplate.Hero) {
      return renderLayout(Layouts[WebsiteTemplate.Hero], {
        courses: [course],
        tabs: heroTemplateTabs,
      })
    } else if (school.institutionSetting?.templates == WebsiteTemplate.Vertical) {
      return renderLayout(Layouts[WebsiteTemplate.Vertical], {
        tabs: templateTabs,
      })
    } else if (school.institutionSetting?.templates == WebsiteTemplate.Barebone) {
      return (
        <BareboneTemplateLayout school={school} site={course.site}>
          <Head>
            <title>{seoTitle}</title> {/* Set page title */}
          </Head>

          <EnrolStateProvider value={store}>
            <div className="box-col">
              <EnrollmentSteps school={school} course={course} />
            </div>
          </EnrolStateProvider>
        </BareboneTemplateLayout>
      )
    }
  }

  if (errorMessage) {
    return <NotFoundPage errorMessage={errorMessage} />
  }
  return renderLayout(Layouts[WebsiteTemplate.Hero], {
    courses: [course],
    tabs: heroTemplateTabs,
  })
}

export default EnrollPage
