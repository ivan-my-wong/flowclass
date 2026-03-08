import { useEffect, useMemo, useState } from 'react'

import { Clock } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import Checkbox from '@/components/Checkboxes/Checkbox'
import Spinner from '@/components/Loaders/Spinner'
import Collapsible from '@/components/Toggle/Collapsible'
import {
  ClassRegularPeriodsSelectionMode,
  RegularScheduleLessonPreview,
} from '@/types/regularSchedule'
import dayjs from '@/utils/dayjs'
import { getSelectedPeriodGroupFromListOfPreviewLessons } from '@/utils/enroll-course.utils'

interface LessonSelectionProps {
  selectionMode: ClassRegularPeriodsSelectionMode
  onSelectionChange: (selectedLessons: RegularScheduleLessonPreview[]) => void
  listOfLessons?: RegularScheduleLessonPreview[]
  initialSelectedLessons?: RegularScheduleLessonPreview[]
  isLoading?: boolean
  schedules: { startDate: string; endDate: string }[]
}

const LessonSelection = ({
  selectionMode,
  onSelectionChange,
  listOfLessons = [],
  initialSelectedLessons = [],
  isLoading,
  schedules,
}: LessonSelectionProps): JSX.Element => {
  const { t } = useTranslation()
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set())
  const [expandedPeriods, setExpandedPeriods] = useState<Set<number>>(new Set([1]))

  // Group lessons by period
  const periodGroups = useMemo(() => {
    // Filter out blocked lessons before grouping - these should not appear on selection screen
    // This matches the backend logic where isBlocked=true or isAvailable=false lessons are excluded
    const availableLessons = listOfLessons.filter(lesson => !lesson.isBlocked)
    return getSelectedPeriodGroupFromListOfPreviewLessons(availableLessons)
  }, [listOfLessons])

  // No longer auto-select lessons from initialSelectedLessons
  // Users must manually select lessons

  // Notify parent of selection changes
  useEffect(() => {
    // Only include available (non-blocked) lessons in selection
    // Blocked lessons are filtered out to match backend behavior
    const availableLessons = listOfLessons.filter(lesson => !lesson.isBlocked)
    const selectedLessonObjects = availableLessons.filter(lesson => selectedLessons.has(lesson.id))
    onSelectionChange(selectedLessonObjects)
  }, [selectedLessons, listOfLessons])

  useEffect(() => {
    if (initialSelectedLessons.length > 0) {
      // Only set selected lessons for available (non-blocked) lessons
      // This ensures consistency with the filtering logic
      const availableInitialLessons = initialSelectedLessons.filter(lesson => !lesson.isBlocked)
      setSelectedLessons(new Set(availableInitialLessons.map(lesson => lesson.id)))
    }
  }, [initialSelectedLessons])

  const handleLessonSelect = (lessonId: number, period: number) => {
    const newSelectedLessons = new Set(selectedLessons)

    if (selectionMode === ClassRegularPeriodsSelectionMode.MUST_SELECT_UNTIL_END) {
      // Find the lesson in the period
      const periodLessons = periodGroups.find(group => group.period === period)?.lessons || []
      const lessonIndex = periodLessons.findIndex(lesson => lesson.id === lessonId)

      if (lessonIndex !== -1) {
        // Select from this lesson to the end of the period
        for (let i = 0; i < lessonIndex; i++) {
          newSelectedLessons.delete(periodLessons[i].id)
        }

        for (let i = lessonIndex; i < periodLessons.length; i++) {
          newSelectedLessons.add(periodLessons[i].id)
        }
      }
    } else if (selectionMode === ClassRegularPeriodsSelectionMode.ALLOW_CUSTOM_SELECTION) {
      // Toggle individual lesson selection
      if (newSelectedLessons.has(lessonId)) {
        newSelectedLessons.delete(lessonId)
      } else {
        newSelectedLessons.add(lessonId)
      }
    }

    setSelectedLessons(newSelectedLessons)
  }

  const handlePeriodSelectAll = (period: number) => {
    const periodLessons = periodGroups.find(group => group.period === period)?.lessons || []
    const newSelectedLessons = new Set(selectedLessons)

    const allPeriodSelected = periodLessons.every(lesson => newSelectedLessons.has(lesson.id))

    if (allPeriodSelected) {
      // Clear period selection
      periodLessons.forEach(lesson => newSelectedLessons.delete(lesson.id))
    } else {
      // Select all lessons in period
      periodLessons.forEach(lesson => newSelectedLessons.add(lesson.id))
    }

    setSelectedLessons(newSelectedLessons)
  }

  const handlePeriodToggle = (period: number) => {
    const newExpandedPeriods = new Set(expandedPeriods)
    if (newExpandedPeriods.has(period)) {
      newExpandedPeriods.delete(period)
    } else {
      newExpandedPeriods.add(period)
    }
    setExpandedPeriods(newExpandedPeriods)
  }

  const isLessonDisabledBecauseOfSelectionMode = (
    lesson: RegularScheduleLessonPreview,
    period: number
  ) => {
    if (selectionMode === ClassRegularPeriodsSelectionMode.MUST_SELECT_UNTIL_END) {
      const periodLessons = periodGroups.find(group => group.period === period)?.lessons || []
      const lessonIndex = periodLessons.findIndex(l => l.id === lesson.id)

      // Check if any lesson before this one is selected
      for (let i = 0; i < lessonIndex; i++) {
        if (selectedLessons.size === 0 || selectedLessons.has(periodLessons[i].id)) {
          return false
        }
      }

      // if (lessonIndex === 0) {
      //   return selectedLessons.size > 0 && !selectedLessons.has(periodLessons[0].id)
      // }

      // It should disable the current selected lesson
      // return lessonIndex > 0 && !selectedLessons.has(periodLessons[lessonIndex - 1].id)

      return selectedLessons.has(periodLessons[lessonIndex].id)
    }

    return false
  }

  const getSelectedCountInPeriod = (period: number) => {
    const periodLessons = periodGroups.find(group => group.period === period)?.lessons || []
    return periodLessons.filter(lesson => selectedLessons.has(lesson.id)).length
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="w-full space-y-4">
      {periodGroups.map(({ period, lessons: periodLessons }) => {
        const selectedCount = getSelectedCountInPeriod(period)
        const isExpanded = expandedPeriods.has(period)
        const allSelected = periodLessons.every(lesson => selectedLessons.has(lesson.id))

        const periodStartDate = schedules[period - 1]?.startDate || ''
        const periodEndDate = schedules[period - 1]?.endDate || ''

        return (
          <div className="box-col-full rounded-lg border p-2" key={period}>
            <Collapsible
              title={
                <div>
                  <p>{`${dayjs(periodStartDate).format('YYYY-MM-DD')} - ${dayjs(periodEndDate)
                    .subtract(1, 'day')
                    .format('YYYY-MM-DD')}`}</p>

                  <p className="text-sm font-normal">
                    {`${selectedCount} ${t('enrol:pickPeriodStep.selectTimeSlot.lessonsChosen')}`}
                  </p>
                </div>
              }
              collapsibleOpen={isExpanded}
              setCollapsibleOpen={open => handlePeriodToggle(period)}
              rightHeader={
                <div
                  key="period-header"
                  className="mb-2 ml-10 flex w-full items-center justify-start md:ml-0 md:justify-end"
                >
                  <Button
                    variant="text"
                    onClick={() => handlePeriodSelectAll(period)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox value={allSelected} onChange={() => {}} />
                    {t('enrol:pickPeriodStep.selectTimeSlot.selectAllTimeslots')}
                  </Button>
                </div>
              }
              visibleChildren={[]}
              hiddenChildren={[
                <div key="period-lessons" className="w-full space-y-2 p-2">
                  {periodLessons.map((lesson, index) => {
                    const isSelected = selectedLessons.has(lesson.id)
                    const isDisabled = isLessonDisabledBecauseOfSelectionMode(lesson, period)

                    return (
                      <div
                        key={lesson.id}
                        className={`bg-background-layer-2 rounded-lg border p-4 ${
                          isSelected
                            ? 'border-primary-subtle'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 opacity-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {t('enrol:lessons')} {index + 1}
                            </h3>

                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {dayjs(lesson.date).format('YYYY-MM-DD')} •{' '}
                                  {dayjs(lesson.startTime).format('HH:mm')} -{' '}
                                  {dayjs(lesson.endTime).format('HH:mm')} •{' '}
                                  {dayjs(lesson.date).format('dddd')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <Checkbox
                              value={isSelected}
                              onChange={() => handleLessonSelect(lesson.id, period)}
                              disabled={
                                selectionMode ===
                                  ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD ||
                                isDisabled
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>,
              ]}
            />{' '}
          </div>
        )
      })}
    </div>
  )
}

export default LessonSelection
