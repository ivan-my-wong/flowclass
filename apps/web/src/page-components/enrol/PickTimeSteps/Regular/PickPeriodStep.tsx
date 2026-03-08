import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useRecoilState } from 'recoil'

import { LucidePhone } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Pagination from '@/components/Containters/Pagination'
import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { applicationDescription } from '@/constants/course'
import { getCourseEnrolSteps } from '@/page-components/schools/wishlist/AddToWishlistFlow'
import {
  defaultTuition,
  enrolState,
  prevSelectedOptionState,
  SelectedClassDataState,
} from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { ClassType, PeriodLesson, PhoneContactMethod, RegularPeriod } from '@/types'
import { Tuition } from '@/types/enrol'
import { calculateClassPrice } from '@/utils/calculateCourse'
import {
  calculateLessonFormatAndDuration,
  getRegularScheduleAfterTodayOnly,
} from '@/utils/calculateTime'
import { getContactMethodLink } from '@/utils/contact'
import {
  enrolCourseScrollAction,
  updateCurrentSelectedClass,
  updateSelectedClassTuition,
} from '@/utils/courseDisplay'
import { getTimeZone } from '@/utils/format'

const PickPeriodStep = (): JSX.Element => {
  const { t } = useTranslation()
  const { course, originalUrl, school } = useEnrolState()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const today = new Date()
  const router = useRouter()

  const { siteSetting } = useEnrolState()

  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const [currentTheme] = useRecoilState(currentWebsiteTheme)

  const classes = course?.classes ?? []
  const schedule = classes.map((classItem: any) => classItem.regularPeriods).flat()

  const currentSelectedClassData = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]
  const currentSelectedClass = currentSelectedClassData?.selectedClass
  const selectedPriceOption = currentSelectedClassData?.selectedPriceOption
  // Filter the schedule to only include lessons after today
  const scheduleAllLessonAfterTodayOnly = currentSelectedClass
    ? getRegularScheduleAfterTodayOnly(currentSelectedClass)
    : []
  const dropInClass = currentSelectedClassData?.selectedClass?.dropIn

  const classType = currentSelectedClassData?.selectedClass?.type ?? ClassType.workshop

  useEffect(() => {
    if (!course) {
      toast.error(t('errors:ENROL.PLEASE_PICK_COURSE') as string)
      router.push(originalUrl ?? '/')
    }

    // setEnrolForm(defaultEnrolState)
  }, [course, schedule])

  useEffect(() => {
    if (enrolForm.setMultipleClass) {
      const currentClassIndex = enrolForm.currentSelectedClassIndex
      const updatedClassData: SelectedClassDataState[] = [...enrolForm.selectedClassData]
      updatedClassData.splice(currentClassIndex, 1)

      const newIndex =
        enrolForm.currentSelectedClassIndex > 0 ? enrolForm.currentSelectedClassIndex - 1 : 0

      setPrevSelectedOption({
        ...enrolForm,
        selectedClassData: updatedClassData,
        currentSelectedClassIndex: newIndex,
      })
    } else {
      setPrevSelectedOption({
        ...enrolForm,
        selectedClassData: [],
        tuition: [],
      })
    }
  }, [])

  if (!course || !schedule || schedule.length === 0) {
    return <Text>{t('enrol:pickPeriodStep.noPhases')}</Text>
  }

  const handlePickPeriod = ({
    scheduleItem,
    period,
    lessonIndex,
  }: {
    scheduleItem: RegularPeriod
    period: PeriodLesson
    lessonIndex: number
  }) => {
    // setPrevSelectedOption(enrolForm)

    const classId = currentSelectedClassData?.selectedClass?.id ?? 0
    const periodId = scheduleItem.id
    const courseId = course?.id
    const pickedFirstDate = calculateLessonFormatAndDuration(period.startTime, period.endTime)[0]
    const isTuitionPicked =
      currentSelectedClassData?.selectedClass?.tuition ??
      enrolForm?.tuition?.[enrolForm.currentSelectedClassIndex]?.paymentAmount ??
      null

    if (!classId || !periodId || !pickedFirstDate || !courseId || isTuitionPicked === null) {
      toast.error(t('errors:UNKNOWN_ERROR') as string)
      return
    }

    let selectedLessons: PeriodLesson[] = []

    if (dropInClass) {
      const lessonsAfterToday = scheduleItem.lessons.filter(
        lesson => new Date(lesson.startTime) > new Date()
      )
      selectedLessons = lessonsAfterToday.slice(lessonIndex)
    } else {
      selectedLessons = scheduleItem.lessons
    }

    setEnrolForm(prev => {
      const updatedSelectedClassData = updateCurrentSelectedClass(
        prev.selectedClassData,
        prev.currentSelectedClassIndex,
        { selectedRegularPeriod: scheduleItem, selectedLessons, selectedPriceOption }
      )

      let updatedTuition = prev.tuition
      let nextStep = prev.currentStep + 1

      const selectedClass = updatedSelectedClassData[prev.currentSelectedClassIndex].selectedClass
      const tuition = selectedClass?.tuition ?? 0

      // If class type is workshop, we skip the next pick tuition step and set the tution directly here
      if (tuition === 0 || (classType === ClassType.workshop && selectedLessons.length > 0)) {
        if (!selectedClass) {
          toast.error(t('errors:ENROL.PLEASE_PICK_CLASS') as string)
          return prev
        }

        console.log(selectedPriceOption)

        const periodPrice = calculateClassPrice(
          selectedClass,
          selectedLessons.length,
          selectedClass.regularPeriods[0].lessons.length,
          selectedPriceOption
        )

        const feePerLesson = isTuitionPicked

        const tuitionData: Tuition = {
          originalFee: periodPrice,
          paymentAmount: periodPrice,
          feePerLesson: Number(feePerLesson),
          currency: siteSetting?.currency ?? 'USD',
          couponDiscount: 0,
          directDiscount: 0,
          bundleDiscount: 0,
          recurringDiscount: 0,
          totalDiscount: 0,
        }

        updatedTuition =
          prev.tuition.length > 0
            ? updateSelectedClassTuition(prev.tuition, prev.currentSelectedClassIndex, tuitionData)
            : [{ ...defaultTuition, ...tuitionData }]

        const currentSteps = getCourseEnrolSteps(
          currentSelectedClass?.type,
          currentSelectedClass?.setMultipleApplicant ?? false
        )
        const PickTuitionStep = dynamic(() => import('../PickTuitionStep'), {
          ssr: false,
        })
        const hasTuitionStep = currentSteps.includes(PickTuitionStep)
        if (tuition === 0) {
          hasTuitionStep ? (nextStep = prev.currentStep + 2) : (nextStep = prev.currentStep + 1)
        } else if (prev.setMultipleClass) {
          nextStep = 0
        } else {
          nextStep = prev.currentStep + 1
        }
      }

      return {
        ...prev,
        currentStep: nextStep,
        selectedClassData: updatedSelectedClassData,
        tuition: updatedTuition,
      }
    })
  }

  const renderLesson = (
    lesson: PeriodLesson,
    regularPeriod: RegularPeriod,

    lessonIndex: number,
    description?: JSX.Element
  ) => {
    if (lesson) {
      const lessonTime = calculateLessonFormatAndDuration(lesson.startTime, lesson.endTime)

      return (
        <BoxWithTextAction
          key={lesson.id}
          // text={`${lessonTime[0]} (${lessonTime[1]} ${t('common:unit.min')})`}
          text={lessonTime[0]}
          icon={<FaChevronRight />}
          action={() => {
            handlePickPeriod({
              scheduleItem: regularPeriod,
              period: lesson,
              lessonIndex,
              // lesson: lesson.startTime,
            })
            enrolCourseScrollAction(currentTheme)
          }}
          description={description}
        />
      )
    }
  }

  const renderStartedLesson = (lesson: PeriodLesson) => {
    const lessonTime = calculateLessonFormatAndDuration(lesson.startTime, lesson.endTime)

    return (
      <BoxWithTextAction
        disabled
        key={lesson.id}
        // text={`${lessonTime[0]} (${lessonTime[1]} ${t('common:unit.min')})`}
        text={lessonTime[0]}
        icon={<FaChevronRight />}
      />
    )
  }

  const RenderPagination = ({ period }: { period: RegularPeriod }): React.ReactElement => {
    const lessons = period.lessons

    if (!lessons) {
      return <></>
    }

    // const startedLessons = lessons?.filter(lesson => new Date(lesson.startTime) <= today)
    const notStartedLessons = lessons?.filter(lesson => new Date(lesson.startTime) > today)

    const classType = currentSelectedClassData?.selectedClass?.type ?? ClassType.workshop

    return (
      <div key={period.id} className="box-col-full items-start" id="select-class">
        {classType === ClassType.regular && <Text className="font-bold">{period.name}</Text>}
        {notStartedLessons?.map((lesson, index) => renderLesson(lesson, period, index))}
        {/* {startedLessons?.length > 0 && (
          <Text className="mt-4">{t('enrol:pickPeriodStep.startedLesson')}</Text>
        )}
        {startedLessons?.map(lesson => renderStartedLesson(lesson))} */}
      </div>
    )
  }

  const PickDropInLesson = (): React.ReactElement => {
    if (currentSelectedClass?.regularPeriods.length === 0) {
      return <Text className="font-bold">{t('enrol:pickPeriodStep.noCurrentPhases')}</Text>
    }

    const startTimeAscOrder = currentSelectedClass?.regularPeriods
      .map(period => ({
        ...period,
        lessons: [...period.lessons].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      }))
      .filter(period => {
        const notStartedLessons = period.lessons?.filter(
          lesson => new Date(lesson.startTime) > today
        )
        return notStartedLessons.length > 0
      })
      .sort((a, b) => {
        if (a.lessons.length === 0 || b.lessons.length === 0) return 0
        // Find the earliest valid lesson (after today) for each period
        const earliestLessonA = a.lessons.find(lesson => new Date(lesson.startTime) > today)
        const earliestLessonB = b.lessons.find(lesson => new Date(lesson.startTime) > today)
        if (!earliestLessonA || !earliestLessonB) return 0
        return (
          new Date(earliestLessonA.startTime).getTime() -
          new Date(earliestLessonB.startTime).getTime()
        )
      })
    return (
      <Pagination itemsPerPage={1} hidePaginationIfOnePage>
        {startTimeAscOrder?.map(period => <RenderPagination key={period.id} period={period} />) ??
          []}
      </Pagination>
    )
  }

  const PickNonDropInLesson = (): JSX.Element => {
    if (scheduleAllLessonAfterTodayOnly?.length > 0) {
      return (
        <Pagination itemsPerPage={3} hidePaginationIfOnePage>
          {scheduleAllLessonAfterTodayOnly.map((regularPeriod: RegularPeriod, index: number) => {
            const notStartedLessons = regularPeriod.lessons

            if (!notStartedLessons || notStartedLessons.length === 0) {
              return <></>
            }

            const [firstLesson, ...remainingLessons] = notStartedLessons

            const description = (
              <div className="mt-2 flex flex-col gap-2" id="generatedLessonDate">
                {remainingLessons
                  ?.sort((a, b) => {
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                  })
                  ?.map((item: any, index: number) => {
                    if (!item) {
                      return <></>
                    }

                    return (
                      <div key={item} id={`generatedLessonDate-${index}`}>
                        {calculateLessonFormatAndDuration(item.startTime, item.endTime)[0]}
                      </div>
                    )
                  })}
              </div>
            )

            return renderLesson(firstLesson, regularPeriod, index, description)
          })}
        </Pagination>
      )
    }
    return (
      <div className="box-col-full w-full items-start">
        <Text className="font-bold">{t('enrol:pickPeriodStep.noCurrentPhases')}</Text>
        <Button
          iconBefore={<LucidePhone />}
          onClick={() => {
            const contactLink = getContactMethodLink({
              contactId: school?.contactId,
              contactMethod: school?.phoneContactMethod ?? PhoneContactMethod.WhatsApp,
              phone: school?.phone ?? '',
              schoolUrl: school?.url ?? '',
              domain: course?.site?.url ?? '',
            })
            window.open(contactLink, '_blank')
          }}
        >
          {t('common:action.contact')}
        </Button>
      </div>
    )
  }

  return (
    <div className="box-col-full w-full items-start">
      <Heading>{t(applicationDescription.selectDate[classType])}</Heading>
      <Text>
        {t('enrol:pickPeriodStep.time')}
        {course.site.timeZone.id} {getTimeZone(course.site.timeZone.id)}
        {t('enrol:pickPeriodStep.timeExplain')}{' '}
      </Text>
      {dropInClass ? <PickDropInLesson /> : <PickNonDropInLesson />}
    </div>
  )
}

export default PickPeriodStep
