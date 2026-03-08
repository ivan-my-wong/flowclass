import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { getRecurringCourseStartLesson, previewRecurringCourseLessons } from '@/api/courseApi'
import Spinner from '@/components/Loaders/Spinner'
import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { QUERY_KEY } from '@/constants/queryKey'
import { enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'
import { enrolCourseScrollAction, updateCurrentSelectedClass } from '@/utils/courseDisplay'
import { getTimeZone } from '@/utils/format'

const PickRecurStartLessonStep = (): JSX.Element => {
  const { t } = useTranslation()

  const { course, originalUrl } = useEnrolState()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const router = useRouter()
  const [prevSelectedOption, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const [currentTheme, setCurrentTheme] = useRecoilState(currentWebsiteTheme)
  const currentSelectedClassData = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]

  const { mutateAsync: previewLessons, isLoading: isLoadingPreviewLessons } = useMutation({
    mutationFn: (lesson: string) => {
      return previewRecurringCourseLessons(
        lesson,
        currentSelectedClassData.selectedRecurSchedule?.id ?? 0,
        currentSelectedClassData.selectedClass?.id ?? 0,
        course?.institutionId ?? 0,
        currentSelectedClassData.selectedPriceOption?.id
      )
    },
    onSuccess: (data: any) => {
      return data
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const { data: availabeLessonDates, isLoading } = useQuery(
    [QUERY_KEY.getRecurringClassStartDate, currentSelectedClassData?.selectedRecurSchedule?.id],
    () =>
      getRecurringCourseStartLesson(
        currentSelectedClassData?.selectedRecurSchedule?.id ?? 0,
        course?.site?.id ?? 0,
        course?.institutionId ?? 0,
        4
      ),
    {
      enabled: !!course?.id,
    }
  )

  const classes = course?.classes ?? []

  const lessonDates = classes.map(classItem => classItem.recurringSchedules).flat()

  useEffect(() => {
    if (!course) {
      toast.error(t('errors:ENROL.PLEASE_PICK_COURSE') as string)
      router.push(originalUrl ?? '/')
    }

    if (!enrolForm.selectedClassData) {
      toast.warning(t('errors:ENROL.PLEASE_PICK_CLASS') as string)
      setEnrolForm(prev => ({ ...prev, currentStep: 1 }))
    }
  }, [course, lessonDates])

  useEffect(() => {
    setPrevSelectedOption({
      ...enrolForm,
      currentStep: enrolForm.currentStep - 1,
      tuition: [],
    })
    if (enrolForm.setMultipleClass) {
      if (enrolForm.selectedClassData?.length === 1) {
        setPrevSelectedOption(prev => ({
          ...prev,
          selectedClassData: [],
        }))
      } else if (enrolForm.setMultipleClass) {
        // updatedMultipleData[updatedMultipleData.length - 1] = updatedElement
        const updatedMultipleData = [...(enrolForm.selectedClassData || [])]
        updatedMultipleData.splice(enrolForm.currentSelectedClassIndex, 1)
        setPrevSelectedOption(prev => ({
          ...prev,
          selectedClassData: updatedMultipleData,
        }))
      }
    }
  }, [])

  if (!course || !lessonDates || lessonDates.length === 0) {
    return <Text>{t('enrol:pickPeriodStep.noPhases')}</Text>
  }

  const renderLessonDatesBox = (lesson: string) => {
    const startTime = lesson.split(' ')[0]
    const endTime = lesson.split(' ')[1]

    return (
      <BoxWithTextAction
        key={lesson}
        text={calculateLessonFormatAndDuration(startTime, endTime)[0]}
        icon={<FaChevronRight />}
        action={async () => {
          const listLessons = await previewLessons(lesson)

          const updatedSelectedClassData = updateCurrentSelectedClass(
            enrolForm.selectedClassData,
            enrolForm.currentSelectedClassIndex,
            {
              selectedRecurLessons: listLessons,
            }
          )

          setEnrolForm(prev => {
            return {
              ...prev,
              currentStep: enrolForm.currentStep + 1,
              selectedClassData: updatedSelectedClassData,
            }
          })

          enrolCourseScrollAction(currentTheme)
        }}
      />
    )
  }

  return (
    <div className="box-col-full w-full items-start">
      <Heading>{t('enrol:pickPeriodStep.selectTimeSlot.recurring')}</Heading>
      <Text>
        {t('enrol:pickPeriodStep.time')}
        {course.site.timeZone.id} {getTimeZone(course.site.timeZone.id)}
        {t('enrol:pickPeriodStep.timeExplain')}{' '}
      </Text>

      <div className="box-col-full gap-3">
        {!isLoading && !isLoadingPreviewLessons ? (
          availabeLessonDates &&
          availabeLessonDates[currentSelectedClassData?.selectedRecurSchedule?.id ?? -1]?.map(
            (item: any) => {
              return renderLessonDatesBox(item)
            }
          )
        ) : (
          <div className="box-col">
            <Spinner />
            <h4>{t('enrol:pickTimeslotStep.searchingForTime')}</h4>
          </div>
        )}
      </div>
    </div>
  )
}

export default PickRecurStartLessonStep
