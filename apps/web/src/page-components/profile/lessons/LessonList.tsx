import { Dispatch, FC, SetStateAction } from 'react'

import dayjs from 'dayjs'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { DateRange } from 'react-day-picker'
import Select, { MultiValue } from 'react-select'

import Button from '@/components/Buttons/Button'
import Spinner from '@/components/Loaders/Spinner'
import { UpcomingLesson } from '@/types/profile'
import { cn } from '@/utils/cn'

import CustomPicker from './CustomPicker'

type ClassOption = {
  label: string
  value: number
}

type LessonDate = {
  date: string
  lessons: UpcomingLesson[]
}
interface Props {
  lessonDate: LessonDate[]
  selectedLesson: UpcomingLesson | undefined
  onSelect: (selectedLesson: UpcomingLesson) => void
  range: DateRange | undefined
  setRange: Dispatch<SetStateAction<DateRange | undefined>>
  isLoading: boolean
  classOptions: ClassOption[]
  selectedClassIds: number[]
  onClassFilterChange: (classIds: number[]) => void
}
const LessonList: FC<Props> = ({
  lessonDate,
  selectedLesson,
  onSelect,
  range,
  setRange,
  isLoading,
  classOptions,
  selectedClassIds,
  onClassFilterChange,
}): JSX.Element => {
  const { t } = useTranslation()
  const changeMonth = (counter: number) => {
    setRange(prev => {
      const { from } = prev ?? {}
      if (from) {
        return {
          from: dayjs(from).add(counter, 'month').set('date', 1).toDate(),
          to: dayjs(from).add(counter, 'month').endOf('month').toDate(),
        }
      }
      return prev
    })
  }
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex w-full">
          <Button variant="text" onClick={() => changeMonth(-1)}>
            <LucideChevronLeft />
          </Button>
          <CustomPicker range={range} onChange={setRange} />
          <Button variant="text" onClick={() => changeMonth(1)}>
            <LucideChevronRight />
          </Button>
        </div>
        <Select
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          placeholder={t('profile:lessons.filterByClass')}
          noOptionsMessage={() => t('profile:lessons.noClassesAvailable')}
          options={classOptions}
          value={classOptions.filter(option => selectedClassIds.includes(option.value))}
          onChange={(options: MultiValue<ClassOption>) =>
            onClassFilterChange(options.map(option => option.value))
          }
          className="w-full"
          isDisabled={classOptions.length === 0 && selectedClassIds.length === 0}
        />
      </div>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 w-full flex-col items-center justify-center gap-1">
            <Spinner />
            <div>{t('profile:lessons.loadingLessons')}</div>
          </div>
        ) : (
          lessonDate.map(ld => (
            <div key={ld.date}>
              <div className="mb-2 text-lg font-semibold">
                {dayjs(ld.date).format('YYYY-MM-DD')}
              </div>
              {ld.lessons.map(lessonItem => (
                <div
                  key={`${ld.date}#${lessonItem.id}`}
                  className={cn(
                    'mb-2 cursor-pointer rounded-lg border border-l-4 border-gray-200 border-l-gray-700 p-4 hover:bg-blue-50',
                    selectedLesson?.id === lessonItem.id && 'border-blue-400 bg-blue-50'
                  )}
                  onClick={() => onSelect(lessonItem)}
                >
                  <div className="font-medium">
                    {dayjs(lessonItem.startTime).format('HH:mm A')} -{' '}
                    {dayjs(lessonItem.endTime).format('HH:mm A')}
                  </div>
                  <div className="text-textSubtle mb-2 flex flex-col text-sm font-medium md:flex-row md:gap-2">
                    <div>{lessonItem.course?.name}</div>
                    <span className="hidden text-gray-300 md:inline">•</span>
                    <div>{lessonItem.class?.name}</div>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row">
                    {(lessonItem.materials ?? []).length > 0 && (
                      <Button variant="outlined" className="text-sm font-normal">
                        {t('profile:lessons.materialsUploaded', {
                          count: (lessonItem.materials ?? []).length,
                        })}
                      </Button>
                    )}
                    {(lessonItem.studentSubmissions ?? []).length > 0 && (
                      <Button variant="outlined" className="text-sm font-normal">
                        {t('profile:lessons.assignmentSubmitted')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LessonList
