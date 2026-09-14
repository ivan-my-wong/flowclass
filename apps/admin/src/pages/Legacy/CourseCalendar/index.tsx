// a plugin!
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import { SelectItemValuesProps } from '@/components/Selector/Select'
import { selectCustomStyles } from '@/components/Selector/TextSearchMultiSelector'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import usePromotionData from '@/hooks/usePromotionData'
import ContentLayout from '@/layouts/ContentLayout'
import { CourseProps } from '@/types/coupon'
import dayjs from '@/utils/dayjs'
import { getCurrentWeek } from '@/utils/timeFormat'

import FullCalendarComponent from './components/FullCalender'

import '@/styles/components/calender.css'

export default () => {
  const { t } = useTranslation()
  // const { isMobile } = useResponsive()
  const [isOpenAddLesson] = useState<boolean>(false)
  // const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false)
  const [classIdSelected, setClassIdSelected] = useState<number[]>([])
  const [params, setSearchParams] = useSearchParams()

  // Initialize end date with date from url query params
  const startDate = useMemo(() => {
    const date = params.get('startDate')
    return date ? new Date(date) : new Date(getCurrentWeek(true))
  }, [params])

  // Initialize end date with date from url query params
  const endDate = useMemo(() => {
    const date = params.get('endDate')
    return date ? new Date(date) : new Date(getCurrentWeek(false))
  }, [params])

  const { useFetchAllLessonData } = useLessonDateTimeData()
  const { useFetchCourseAndStudentData } = usePromotionData()
  const fetchCourseAndStudentResult = useFetchCourseAndStudentData(true)
  const { data } = fetchCourseAndStudentResult
  const [courseOption, setCourseOption] = useState<CourseProps[]>(
    data ? JSON.parse(JSON.stringify(data?.listCourse)) : []
  )
  const [courseFilter, setCourseFilter] = useState<SelectItemValuesProps[]>([])
  const [classFilter, setClassFilter] = useState<SelectItemValuesProps[]>([])

  const { refetch } = useFetchAllLessonData({
    startDate,
    endDate,
    classIdSelected,
    courseIdSelected: courseFilter?.map(o => +o.value),
  })

  useEffect(() => {
    refetch()
    // setSearchParams({
    //   startDate: dayjs(startDate).format('YYYY-MM-DD'),
    //   endDate: dayjs(endDate).format('YYYY-MM-DD'),
    // })
  }, [
    courseFilter,
    classIdSelected,
    endDate,
    refetch,
    startDate,
    isOpenAddLesson,
  ])

  useEffect(() => {
    if (data) {
      setCourseOption(JSON.parse(JSON.stringify(data.listCourse)))
    }
  }, [data])

  const courseOptions = courseOption?.map(obj => ({
    label: obj.name,
    value: obj.id.toString(),
  }))

  const classOptions = courseOption
    .filter(course =>
      courseFilter.some(filter => course.id === Number(filter?.value))
    )
    .flatMap(course =>
      course.classes.map((obj: any) => ({
        label: obj.name,
        value: obj.id.toString(),
      }))
    )

  return (
    <ContentLayout
      leftHeader={<Heading>{t('lessonDateTime:lessonDateTime')}</Heading>}
    >
      <div className="p-8 box-col-full">
        <Box className="flex flex-col md:flex-row">
          <Select
            value={courseFilter}
            isMulti
            name="course"
            options={courseOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder={t('teachingService:course.selectCourse')}
            styles={selectCustomStyles('100%')}
            onChange={(e: any) => {
              setCourseFilter(e)
              setClassFilter([])

              // select or remove all class from selected course
              const idClassSelected: number[] = []
              courseOption
                .filter(course => {
                  return e
                    .map((o: any) => o.value)
                    .includes(course.id.toString())
                })
                .forEach(el => {
                  el.classes.forEach((o: any) => {
                    idClassSelected.push(o.id)
                  })
                })

              // set class id from selected course
              setClassIdSelected(idClassSelected)
            }}
          />
          <Select
            value={classFilter}
            isMulti
            name="class"
            options={classOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder={t('teachingService:course.selectClass')}
            styles={selectCustomStyles('100%')}
            onChange={(e: any) => {
              setClassFilter(e)
              let IdClassSelected: number[] = []
              IdClassSelected = classOptions
                .filter(course =>
                  e.some((filter: any) => course.value === filter?.value)
                )
                .map(el => Number(el.value))

              if (IdClassSelected.length === 0) {
                IdClassSelected = courseOption
                  .filter(course =>
                    courseFilter.some(
                      filter => course.id === Number(filter?.value)
                    )
                  )
                  .flatMap(course => course.classes)
                  .map(el => el.id)
              } else {
                IdClassSelected = classOptions
                  .filter(course =>
                    e.some((filter: any) => course.value === filter?.value)
                  )
                  .map(el => Number(el.value))
              }

              setClassIdSelected(IdClassSelected)
            }}
          />
        </Box>
        <FullCalendarComponent
          classIdSelected={classIdSelected}
          handleClassSelect={setClassIdSelected}
          initialDateRange={{
            start: startDate,
            end: endDate,
          }}
          onChangeDateRange={({ start, end }) => {
            setSearchParams({
              startDate: dayjs(start).format('YYYY-MM-DD'),
              endDate: dayjs(end).format('YYYY-MM-DD'),
            })
          }}
        />
      </div>
      <Outlet />
    </ContentLayout>
  )
}
