import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { useDebounce } from '@uidotdev/usehooks'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import { Input } from '@/components/ui/Inputs/Input'
import useCourseData from '@/hooks/useCourseData'
import { ChartDate } from '@/types/chartDate.type'
import { ListParams } from '@/types/class-material'
import { OptionProps as CourseOptionType } from '@/types/courseSelector.type'

type CourseAndClassList = {
  value: number
  label: string
  course: string
  courseId: number
  previewImageUrl: null
}

// const sortByOptions: { label: string; value: string }[] = []
type Props = {
  params: ListParams
  setParams: Dispatch<SetStateAction<ListParams>>
}
const MaterialFilter = ({ params, setParams }: Props): JSX.Element => {
  const { t } = useTranslation('material')
  const [search, setSearch] = useState<string>(params?.search ?? '')
  const debouncedSearch = useDebounce(search, 800)
  const [selectedCourse, setSelectedCourse] = useState<CourseAndClassList[]>([])
  const [selectedChartDate, setSelectedChartDate] = useState<ChartDate>({
    startDate: dayjs().startOf('month').toISOString(),
    endDate: dayjs().endOf('month').toISOString(),
  })
  // const [selectedSortBy, setSelectedSortBy] = useState<LessonList[]>([])
  const { courseData } = useCourseData()

  const courseAndClassList: { label: string; options: CourseAndClassList[] }[] =
    useMemo(() => {
      if (!courseData) return []
      return (
        courseData.courses.map(courseItem => {
          const classes = courseItem.classes.map(cls => ({
            value: cls.id,
            label: cls.name || 'Unknown Class',
            course: courseItem.name || 'Unknown Course',
            courseId: courseItem.id,
            previewImageUrl: null,
          }))
          return {
            label: courseItem.name || 'Unknown Course',
            options: classes,
          }
        }) || []
      )
    }, [courseData])

  const onCourseAndClassChange = (data: CourseAndClassList[]) => {
    setSelectedCourse(data)
  }

  useEffect(() => {
    setParams(prev => ({
      ...prev,
      search: debouncedSearch,
    }))
  }, [debouncedSearch, setParams])

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="w-full">
        <CourseAndClassSelector
          value={selectedCourse as unknown as CourseOptionType[]}
          options={courseAndClassList}
          onChange={selected => {
            if (selected) {
              onCourseAndClassChange(
                selected as unknown as CourseAndClassList[]
              )
              setParams(prev => ({
                ...prev,
                classIds: selected.map(item => item.value.toString()),
                lessonIds: [],
              }))
            }
          }}
          width="auto"
        />
      </div>
      <div className="w-full">
        <ChartDatePicker
          chartDate={selectedChartDate}
          className="h-10"
          handleChartDateChange={(data: ChartDate) => {
            const { startDate, endDate } = data
            setSelectedChartDate({
              startDate: dayjs(startDate).startOf('day').toISOString(),
              endDate: dayjs(endDate).endOf('day').toISOString(),
            })
            setParams(prev => ({
              ...prev,
              startDate: dayjs(startDate).startOf('day').toISOString(),
              endDate: dayjs(endDate).endOf('day').toISOString(),
            }))
          }}
          includeFuture
        />
      </div>
      <div className="w-full">
        <Input
          value={search}
          onChange={e => {
            setSearch(e.target.value)
          }}
          className="text-base h-[38px] rounded-sm"
          placeholder={t('filter.searchByName') as string}
        />
      </div>
      {/* <div className="w-full md:w-2/12">
        <LabelSelector
          selectOption={selectedSortBy}
          options={sortByOptions}
          onChange={setSelectedSortBy}
          placeHolder={t('filter.sortBy')}
        />
      </div> */}
    </div>
  )
}

export default MaterialFilter
