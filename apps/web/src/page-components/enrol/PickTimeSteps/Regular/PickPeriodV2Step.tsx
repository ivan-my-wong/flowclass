import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import { LucideChevronRight, Plus } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'

import { getRegularSchedulePreview } from '@/api/courseApi'
import Button from '@/components/Buttons/Button'
import Spinner from '@/components/Loaders/Spinner'
import { enrolState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { Class } from '@/types/class'
import {
  ClassRegularPeriodsSelectionMode,
  RegularScheduleLessonPreview,
  RegularSchedulePreview,
} from '@/types/regularSchedule'
import { updateCurrentSelectedClass } from '@/utils/courseDisplay'
import dayjs from '@/utils/dayjs'
import { getSelectedPeriodGroupFromListOfPreviewLessons } from '@/utils/enroll-course.utils'

import LessonSelection from '../../RegularScheduleSelection/LessonSelection'

const useRegularSchedulePreviewQuery = (
  scheduleId: number,
  institutionId: number,
  startingScheduleIndex = 0,
  previewPeriodCount = 5
): ReturnType<typeof useQuery<RegularSchedulePreview, Error>> => {
  return useQuery({
    queryKey: [
      'regularSchedulePreview',
      scheduleId,
      institutionId,
      startingScheduleIndex,
      previewPeriodCount,
    ],
    queryFn: () =>
      getRegularSchedulePreview({
        institutionId,
        scheduleId,
        startingScheduleIndex,
        previewPeriodCount,
      }),
    enabled: !!scheduleId && !!institutionId,
  })
}

const PickPeriodV2Step = (): JSX.Element => {
  const { t } = useTranslation()
  const { course, school } = useEnrolState()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)

  const selectedClassDataState = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]
  const { selectedClass, selectedRecurLessons } = selectedClassDataState

  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [initialSelectedLessons, setInitialSelectedLessons] = useState<
    RegularScheduleLessonPreview[]
  >([])

  // Get the currently selected class's regular schedule id
  const institutionId = school?.id || 0

  const currentClass = course?.classes?.find(
    (c: Class) => c.id === selectedClassDataState?.selectedClass?.id
  )

  const regularScheduleV2 = currentClass?.regularScheduleV2
  const periodsCount = regularScheduleV2?.periodRepeatCount || -1
  const selectionMode = regularScheduleV2?.selectionMode

  const beginningPeriodCount = () => {
    if (periodsCount === -1) {
      return 2
    }

    if (periodsCount < 2) {
      return periodsCount
    }

    return 2
  }

  const [visiblePeriods, setVisiblePeriods] = useState(beginningPeriodCount())

  const { data: previewData, isLoading: isPreviewLoading } = useRegularSchedulePreviewQuery(
    regularScheduleV2?.id || 0,
    institutionId,
    0,
    visiblePeriods
  )

  // Check if there are more periods available
  useEffect(() => {
    if (selectedRecurLessons && selectedRecurLessons.length > 0) {
      // Filter out blocked lessons before processing - these should not appear on selection screen
      // This matches the backend logic where isBlocked=true or isAvailable=false lessons are excluded
      const availableLessons =
        previewData?.lessons.filter(lesson => !lesson.isBlocked || !lesson.isOverride) || []
      const selectedPreviewLessons =
        availableLessons.filter(lesson =>
          selectedRecurLessons.some(lessonString => {
            const [startTime, endTime] = lessonString.split(' ')

            return (
              dayjs(startTime).isSame(dayjs(lesson.date), 'day') &&
              dayjs(endTime).isSame(dayjs(lesson.endTime), 'hour')
            )
          })
        ) || []

      setInitialSelectedLessons(selectedPreviewLessons)
    }
  }, [previewData?.lessons])

  const handleTimeSlotSelection = async (selectedLessons: RegularScheduleLessonPreview[]) => {
    const mappedSelectedLessons = selectedLessons.map(
      lesson => `${lesson.startTime} ${lesson.endTime}`
    )
    setSelectedLessons(mappedSelectedLessons)

    // Filter out blocked lessons before processing period groups
    // This ensures only available lessons are considered for enrollment
    const availableLessons =
      previewData?.lessons.filter(lesson => !lesson.isBlocked || !lesson.isOverride) || []

    const allPeriodGroups = getSelectedPeriodGroupFromListOfPreviewLessons(availableLessons)
    const selectedPeriodGroup = allPeriodGroups.filter(group =>
      group.lessons.some(lesson =>
        selectedLessons.some(selectedLesson => selectedLesson.id === lesson.id)
      )
    )

    setEnrolForm(prev => ({
      ...prev,
      selectedClassData: updateCurrentSelectedClass(
        prev.selectedClassData,
        prev.currentSelectedClassIndex,
        {
          selectedRecurLessons: mappedSelectedLessons,
          selectedRegularSchedulePreviewV2: selectedPeriodGroup,
        }
      ),
    }))
  }

  const handleNextStep = () => {
    setEnrolForm(prev => ({
      ...prev,
      selectedClassData: updateCurrentSelectedClass(
        prev.selectedClassData,
        prev.currentSelectedClassIndex,
        { selectedRecurLessons: selectedLessons }
      ),
      currentStep: prev.currentStep + 1,
    }))
  }

  if (!previewData) {
    return <Spinner />
  }

  return (
    <div className="box-col-full items-start">
      <div className="box-row-full items-start text-left">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold">
            {t('enrol:pickPeriodStep.selectTimeSlot.lessonsChosen')}
          </h1>
          <p className="text-gray-600">{t('enrol:pickPeriodStep.selectTimeSlot.recurring')}</p>
        </div>

        {beginningPeriodCount() >= 2 && (
          <Button
            onClick={() => {
              setVisiblePeriods(prev => prev + 1)
            }}
            variant="outlined"
            className="ml-auto flex w-fit items-center gap-2"
            disabled={isPreviewLoading || !previewData?.hasNextPeriod}
          >
            {isPreviewLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isPreviewLoading
              ? t('enrol:pickPeriodStep.selectTimeSlot.searchingForTime')
              : !previewData?.hasNextPeriod
              ? t('enrol:pickPeriodStep.selectTimeSlot.noMorePeriods')
              : t('enrol:pickPeriodStep.selectTimeSlot.showNextPeriod')}
          </Button>
        )}
      </div>
      <LessonSelection
        selectionMode={selectionMode ?? ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD}
        onSelectionChange={handleTimeSlotSelection}
        listOfLessons={previewData.lessons || []}
        initialSelectedLessons={initialSelectedLessons}
        schedules={previewData.schedules}
        isLoading={isPreviewLoading}
      />

      {/* Confirm Button */}
      <Button
        onClick={handleNextStep}
        disabled={selectedLessons.length === 0}
        className="w-full"
        iconAfter={<LucideChevronRight />}
      >
        {`${t('enrol:payment.proceedWith')} ${selectedLessons.length} ${t(
          'enrol:successPayment.lessons'
        )}`}
      </Button>
    </div>
  )
}

export default PickPeriodV2Step
