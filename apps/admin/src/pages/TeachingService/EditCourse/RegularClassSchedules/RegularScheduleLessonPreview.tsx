import { useEffect, useState } from 'react'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuArrowRight, LuEye, LuPen, LuX } from 'react-icons/lu'

import Collapsible from '@/components/Accordions/Collapsible'
import IconButton from '@/components/Buttons/IconButton'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import ModalDialog from '@/components/ui/ModalDialog'
import Text from '@/components/ui/Text'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import { ClassesForm, DateOverride } from '@/types/classes'
import { cn } from '@/utils/cn'
import dayjs from '@/utils/dayjs'
import {
  getRegularClassLessonsFromSchedule,
  getRegularClassSchedules,
  PeriodDateArray,
  SinglePreviewLesson,
} from '@/utils/regular-class-schedule.utils'

const PERIODS_PER_PAGE = 5

// Component for displaying grouped lessons
const GroupedLessonsDisplay = ({
  period,
  lessons,
  periodDates,
  lessonIndex,
  onEditLesson,
  onDeleteLesson,
}: {
  period: string
  lessons: SinglePreviewLesson[]
  periodDates: PeriodDateArray
  lessonIndex: number
  onEditLesson: (lesson: SinglePreviewLesson) => void
  onDeleteLesson: (date: string) => void
}) => {
  const { t } = useTranslation(['teachingService'])
  const periodIndex = Number(period) - 1

  return (
    <div className="box-col-full items-start bg-background-layer-2 rounded-lg p-4">
      <div className="box-col-full justify-between items-start">
        <Text className="font-medium">
          {`${t('teachingService:regularV2.period')} ${
            periodIndex + 1
          } (${dayjs(periodDates[lessonIndex]?.startDate).format(
            'YYYY-MM-DD'
          )} - ${dayjs(periodDates[lessonIndex]?.endDate)
            .subtract(1, 'day')
            .format('YYYY-MM-DD')})`}
        </Text>

        <Text className="text-sm">
          {lessons.length} {t('teachingService:regularV2.lessons')}
        </Text>
      </div>

      <div className="gap-2 grid grid-cols-1 md:grid-cols-2 w-full">
        {lessons?.map((lesson, index) => (
          <div
            key={`${lesson.period}-${lesson.id}`}
            className={cn(
              `p-3 rounded border flex justify-between items-center gap-2 w-full box-col-full`,
              {
                'bg-red-50 border-red-200': lesson.isBlocked,
                'bg-white': !lesson.isBlocked,
              }
            )}
          >
            <div className="flex flex-col">
              <Text className="text-xs">
                {t('teachingService:regularV2.lesson')} {index + 1}
              </Text>
              <Text className="text-sm font-semibold">
                {dayjs(lesson.date).format('YYYY-MM-DD, dddd')}
              </Text>
              <Text className="text-sm">
                {dayjs(lesson.startTime).format('HH:mm')} -{' '}
                {dayjs(lesson.endTime).format('HH:mm')}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditLesson(lesson)}
              >
                <LuPen className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDeleteLesson(lesson.date)}
              >
                <LuX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const RegularScheduleLessonPreview = (): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  const form = useFormContext<ClassesForm>()

  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0)

  // Unused for now
  const [
    groupedLessonStartingPeriodIndex,
    setGroupedLessonStartingPeriodIndex,
  ] = useState(0)

  const [editingLesson, setEditingLesson] =
    useState<SinglePreviewLesson | null>(null)

  const { useFetchAllblockTimeData } = useBlockTimeData()
  const { data: blockTimes } = useFetchAllblockTimeData()

  // Get form data
  const regularScheduleV2 = form.watch('regularScheduleV2')
  const periodRepeatCount = regularScheduleV2?.periodRepeatCount ?? -1

  const finalLessons = getRegularClassLessonsFromSchedule(
    regularScheduleV2,
    blockTimes || [],
    currentPeriodIndex
  )

  const periodDates = getRegularClassSchedules(
    regularScheduleV2,
    currentPeriodIndex
  )

  // Group lessons by period
  const groupedLessons = finalLessons?.reduce((acc, lesson) => {
    const periodKey = lesson.period
    if (!acc[periodKey]) {
      acc[periodKey] = []
    }
    if (lesson.isBlocked || lesson.isOverride) {
      return acc
    }

    acc[periodKey].push(lesson)
    return acc
  }, {} as Record<number, SinglePreviewLesson[]>)

  useEffect(() => {
    const startingPeriodIndex = Math.min(
      ...Object.keys(groupedLessons).map(Number)
    )
    setGroupedLessonStartingPeriodIndex(startingPeriodIndex)
  }, [groupedLessons])

  const handleEditLesson = (lesson: SinglePreviewLesson) => {
    setEditingLesson(lesson)
  }

  const handleSaveEdit = (startTime: string, endTime: string) => {
    if (!editingLesson) return

    const overrides: DateOverride[] =
      form.getValues('regularScheduleV2.dateOverrides') || []

    const filteredOverrides = overrides.filter(
      o => o.date !== editingLesson.date
    )
    const newOverride: DateOverride = {
      date: editingLesson.date,
      isAvailable: true,
      startTime,
      endTime,
    }

    form.setValue(
      'regularScheduleV2.dateOverrides',
      [...filteredOverrides, newOverride],
      { shouldDirty: true }
    )
    setEditingLesson(null)
  }

  const handleDeleteLesson = (date: string) => {
    const overrides: DateOverride[] =
      form.getValues('regularScheduleV2.dateOverrides') || []
    const filteredOverrides = overrides.filter(o => o.date !== date)
    const deleteOverride: DateOverride = {
      date,
      isAvailable: false,
    }

    form.setValue(
      'regularScheduleV2.dateOverrides',
      [...filteredOverrides, deleteOverride],
      { shouldDirty: true }
    )
  }

  const blockedLessons = finalLessons?.filter(lesson => lesson.isBlocked) || []

  const overrideLessons = finalLessons?.filter(lesson => lesson.isOverride)

  const BlockedLessonItem = ({
    key,
    lesson,
    index,
  }: {
    key: string
    lesson: SinglePreviewLesson
    index: number
  }) => {
    return (
      <div
        key={key}
        className="p-3 rounded border border-red-200 flex justify-between items-center gap-2"
      >
        <div className="flex flex-col">
          <Text className="text-xs">
            {t('teachingService:regularV2.period')} {lesson.period},{' '}
            {t('teachingService:regularV2.lesson')} {index + 1}
          </Text>
          <Text className="text-sm font-semibold">
            {dayjs(lesson.date).format('YYYY-MM-DD, dddd')}
          </Text>
          <Text className="text-sm">
            {dayjs(lesson.startTime).format('HH:mm')} -{' '}
            {dayjs(lesson.endTime).format('HH:mm')}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="p-4 w-full">
        <div className="box-row-full justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <LuEye />
            <Text className="text-xl font-semibold">
              {t('teachingService:regularV2.lessonPreview')}
            </Text>
          </div>

          <div className="flex items-center gap-2">
            {currentPeriodIndex > 0 && (
              <IconButton
                type="button"
                className="bg-background-layer-2 text-text"
                icon={<LuArrowLeft />}
                onClick={() => {
                  setCurrentPeriodIndex(prev => prev - PERIODS_PER_PAGE)
                }}
              >
                {t('teachingService:regularV2.loadMore') ||
                  `Load 5 More Periods (Page ${currentPeriodIndex + 2})`}
              </IconButton>
            )}

            {/* Only show right arrow if there are more periods to load */}
            {(() => {
              // Get the total number of periods from the configuration

              // If infinite periods (-1), always show right arrow
              if (periodRepeatCount === -1) {
                return (
                  <IconButton
                    type="button"
                    className="bg-background-layer-2 text-text"
                    icon={<LuArrowRight />}
                    onClick={() => {
                      setCurrentPeriodIndex(prev => prev + PERIODS_PER_PAGE)
                    }}
                  >
                    {t('teachingService:regularV2.loadMore') ||
                      `Load 5 More Periods (Page ${currentPeriodIndex + 2})`}
                  </IconButton>
                )
              }

              const hasNextPage =
                periodRepeatCount > 0
                  ? false
                  : currentPeriodIndex + PERIODS_PER_PAGE < periodRepeatCount

              // Show right arrow only if there are more periods to load
              return hasNextPage ? (
                <IconButton
                  type="button"
                  className="bg-background-layer-2 text-text"
                  icon={<LuArrowRight />}
                  onClick={() => {
                    setCurrentPeriodIndex(prev => prev + PERIODS_PER_PAGE)
                  }}
                >
                  {t('teachingService:regularV2.loadMore') ||
                    `Load 5 More Periods (Page ${currentPeriodIndex + 2})`}
                </IconButton>
              ) : null
            })()}
          </div>
        </div>

        <div className="mt-4 box-col-full items-start">
          {blockedLessons.length > 0 && (
            <div className="box-col-full items-start bg-background-layer-2 rounded-lg p-4">
              <Text className="font-medium text-red-600">
                {t('teachingService:regularV2.blockedLessons')}
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                {blockedLessons.map((lesson, index) => (
                  <BlockedLessonItem
                    key={`${lesson.period}-${lesson.id}`}
                    lesson={lesson}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {overrideLessons.length > 0 && (
            <div className="box-col-full items-start bg-background-layer-2 rounded-lg p-4">
              <Text className="font-medium text-yellow-600">
                {t('teachingService:regularV2.overrideLessons')}
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                {overrideLessons.map((lesson, index) => (
                  <BlockedLessonItem
                    key={`${lesson.period}-${lesson.id}`}
                    lesson={lesson}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Show message when no lessons are available */}
          {(!groupedLessons || Object.keys(groupedLessons).length === 0) && (
            <div className="box-col-full items-center justify-center bg-background-layer-2 rounded-lg p-8 text-center">
              <Text className="text-lg font-medium text-muted-foreground mb-2">
                {t('teachingService:regularV2.noLessonsAvailable') ||
                  'No Lessons Available'}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {t('teachingService:regularV2.allLessonsPassed') ||
                  'It is possible that all lessons have passed or no lessons are scheduled for the current period.'}
              </Text>
            </div>
          )}

          {(() => {
            const periodEntries = Object.entries(groupedLessons || {})
            const hasManyPeriods = periodEntries.length > PERIODS_PER_PAGE

            if (hasManyPeriods) {
              // Split periods into visible and hidden
              const visiblePeriods = periodEntries.slice(0, PERIODS_PER_PAGE)
              const hiddenPeriods = periodEntries.slice(PERIODS_PER_PAGE)

              const visiblePeriodElements = visiblePeriods.map(
                ([period, lessons]) => {
                  const lessonIndex =
                    periodRepeatCount === -1
                      ? (Number(period) - 1) % PERIODS_PER_PAGE
                      : Number(period) - 1

                  return (
                    <GroupedLessonsDisplay
                      key={period}
                      period={period}
                      lessons={lessons}
                      periodDates={periodDates}
                      lessonIndex={lessonIndex}
                      onEditLesson={handleEditLesson}
                      onDeleteLesson={handleDeleteLesson}
                    />
                  )
                }
              )

              const hiddenPeriodElements = hiddenPeriods.map(
                ([period, lessons]) => {
                  const lessonIndex =
                    periodRepeatCount === -1
                      ? (Number(period) - 1) % PERIODS_PER_PAGE
                      : Number(period) - 1

                  return (
                    <GroupedLessonsDisplay
                      key={period}
                      period={period}
                      lessons={lessons}
                      periodDates={periodDates}
                      lessonIndex={lessonIndex}
                      onEditLesson={handleEditLesson}
                      onDeleteLesson={handleDeleteLesson}
                    />
                  )
                }
              )

              return (
                <>
                  {visiblePeriodElements}
                  <Collapsible
                    title={`${
                      t('teachingService:regularV2.loadMore') || 'Load More'
                    } (${hiddenPeriods.length} more periods)`}
                    visibleChildren={[]}
                    hiddenChildren={hiddenPeriodElements}
                  />
                </>
              )
            }
            // Show all periods normally if there aren't too many
            return periodEntries.map(([period, lessons]) => {
              const lessonIndex =
                periodRepeatCount === -1
                  ? (Number(period) - 1) % PERIODS_PER_PAGE
                  : Number(period) - 1

              return (
                <GroupedLessonsDisplay
                  key={period}
                  period={period}
                  lessons={lessons}
                  periodDates={periodDates}
                  lessonIndex={lessonIndex}
                  onEditLesson={handleEditLesson}
                  onDeleteLesson={handleDeleteLesson}
                />
              )
            })
          })()}
        </div>
      </Card>

      {/* Edit Lesson Modal */}
      <ModalDialog
        open={!!editingLesson}
        onOpenChange={() => setEditingLesson(null)}
        title={t('teachingService:regularV2.editLesson') || 'Edit Lesson'}
        className="max-h-[90vh] my-4 overflow-visible max-w-lg"
      >
        {editingLesson && (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSaveEdit(editingLesson.startTime, editingLesson.endTime)
            }}
            className="space-y-4 py-2"
          >
            <div className="box-col-full items-start">
              <Label className="font-semibold">
                {t('teachingService:regularV2.date')}
              </Label>
              <Input
                value={dayjs(editingLesson.date).format('YYYY/MM/DD')}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="box-col-full items-start">
                <Label className="font-semibold">
                  {t('teachingService:regularV2.startTime')}
                </Label>
                <CustomDatePicker
                  showTimeSelect
                  showTimeSelectOnly
                  dateFormat="h:mm aa"
                  timeIntervals={5}
                  name="startTime"
                  readOnly={false}
                  selectedDate={editingLesson.startTime}
                  onChange={date => {
                    if (date) {
                      const newStartTime = dayjs(date).toISOString()
                      const currentEndTime = dayjs(editingLesson.endTime)
                      const newStartTimeObj = dayjs(newStartTime)

                      // Ensure end time is at least 1 hour after start time
                      let newEndTime = editingLesson.endTime
                      if (
                        currentEndTime.isBefore(newStartTimeObj) ||
                        currentEndTime.isSame(newStartTimeObj)
                      ) {
                        newEndTime = newStartTimeObj
                          .add(1, 'hour')
                          .toISOString()
                      }

                      setEditingLesson({
                        ...editingLesson,
                        startTime: newStartTime,
                        endTime: newEndTime,
                      })
                    }
                  }}
                />
              </div>
              <div className="box-col-full items-start">
                <Label className="font-semibold">
                  {t('teachingService:regularV2.endTime')}
                </Label>
                <CustomDatePicker
                  showTimeSelect
                  showTimeSelectOnly
                  readOnly={false}
                  dateFormat="h:mm aa"
                  timeIntervals={5}
                  name="endTime"
                  selectedDate={editingLesson.endTime}
                  onChange={date => {
                    setEditingLesson({
                      ...editingLesson,
                      endTime: date ? dayjs(date).toISOString() : '',
                    })
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLesson(null)}
              >
                {t('common:action.cancel')}
              </Button>
              <Button type="submit">{t('common:action.save')}</Button>
            </div>
          </form>
        )}
      </ModalDialog>
    </>
  )
}

// <CustomDatePicker
// showTimeSelect
// showTimeSelectOnly
// dateFormat="h:mm aa"
// timeIntervals={5}
// name="startTime"
// selectedDate={editingLesson.startTime}
// onChange={date => {
//   if (date) {
//     const newStartTime = dayjs(date).toISOString()
//     const currentEndTime = dayjs(editingLesson.endTime)
//     const newStartTimeObj = dayjs(newStartTime)

//     // Ensure end time is at least 1 hour after start time
//     let newEndTime = editingLesson.endTime
//     if (
//       currentEndTime.isBefore(newStartTimeObj) ||
//       currentEndTime.isSame(newStartTimeObj)
//     ) {
//       newEndTime = newStartTimeObj
//         .add(1, 'hour')
//         .toISOString()
//     }

//     setEditingLesson({
//       ...editingLesson,
//       startTime: newStartTime,
//       endTime: newEndTime,
//     })
//   }
// }}
// />
