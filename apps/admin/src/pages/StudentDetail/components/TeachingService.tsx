import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { t } from 'i18next'
import { useQuery } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getTeachingService } from '@/api/student'
import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import { requiredParamsState } from '@/stores/requiredParamsData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { ChartDate } from '@/types/chartDate.type'
import { EnrollConfirmState, StudentFormResponse } from '@/types/enrollCourse'
import { TypeTeachingServiceInvoiceGroup } from '@/types/student'
import { StudentUser } from '@/types/user'
import { formatDateRelativeToToday } from '@/utils/timeString'

import CreateTeachingService from './createTeachingService'
import TeachingServiceItem from './TeachingServiceItem'

type Props = {
  tabName: string
  student: StudentUser
  studentEnrollmentForm: StudentFormResponse[]
}

const TeachingService = ({
  tabName,
  student,
  studentEnrollmentForm,
}: Props): React.ReactElement => {
  const [data, setData] = useState<TypeTeachingServiceInvoiceGroup[]>([])
  const requiredParams = useRecoilValue(requiredParamsState)
  const [searchParams, setSearchParams] = useSearchParams()

  const navigate = useNavigate()

  const [studentData, setStudentData] = useRecoilState(studentState)

  const {
    tableDrawers: { isOpenAssignCourse },
  } = studentData

  // Initialize date filter from URL params, or empty to show all by default
  const [dateFilter, setDateFilter] = useState<ChartDate>(() => {
    const startDate = searchParams.get('lessonStartDate')
    const endDate = searchParams.get('lessonEndDate')
    return {
      startDate: startDate || '',
      endDate: endDate || '',
    }
  })

  // Default date range for date picker display (when user wants to set a filter)
  const defaultDateRange: ChartDate = {
    startDate: formatDateRelativeToToday(365),
    endDate: formatDateRelativeToToday(0),
  }

  // Handle reset - clear the filter to show all items
  const handleResetFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
    })
  }

  // Update URL params when date filter changes
  useEffect(() => {
    const currentStartDate = searchParams.get('lessonStartDate')
    const currentEndDate = searchParams.get('lessonEndDate')

    // Only update if the values have changed
    if (
      dateFilter.startDate &&
      dateFilter.endDate &&
      (currentStartDate !== dateFilter.startDate ||
        currentEndDate !== dateFilter.endDate)
    ) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.set('lessonStartDate', dateFilter.startDate)
      newSearchParams.set('lessonEndDate', dateFilter.endDate)
      setSearchParams(newSearchParams, { replace: true })
    } else if (
      (!dateFilter.startDate || !dateFilter.endDate) &&
      (currentStartDate || currentEndDate)
    ) {
      // Remove params if filter is cleared
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('lessonStartDate')
      newSearchParams.delete('lessonEndDate')
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [dateFilter.startDate, dateFilter.endDate, searchParams, setSearchParams])

  const query = useQuery(
    [
      QUERY_KEY.teachingService.getTeachingServiceKey,
      requiredParams.userAliasId,
    ],
    () => {
      const params = {
        userId: requiredParams.userId,
        institutionId: requiredParams.institutionId,
        siteId: requiredParams.siteId ?? 0,
        userAliasId: requiredParams.userAliasId,
      }
      return getTeachingService(params)
    },
    {
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!requiredParams.userAliasId,
    }
  )

  useEffect(() => {
    if (query.data) {
      // Group data by invoiceId, put all enroll courses with the same invoiceId into the same group
      const invoiceMap = new Map<number, TypeTeachingServiceInvoiceGroup>()

      const validEnrollCourses = query.data.filter(
        item => item !== null && item !== undefined
      )

      validEnrollCourses.forEach(
        ({ invoiceId, paymentState, ...enrollCourse }) => {
          if (!invoiceMap.has(invoiceId)) {
            invoiceMap.set(invoiceId, {
              invoiceId,
              paymentState,
              enrollCourses: [],
            })
          }

          const invoiceGroup = invoiceMap.get(invoiceId)!
          invoiceGroup.enrollCourses.push({
            courseId: enrollCourse.courseId,
            courseName: enrollCourse.courseName,
            classId: enrollCourse.classId,
            className: enrollCourse.className,
            courseImg: enrollCourse.courseImg,
            enrollCourseId: enrollCourse.enrollCourseId,
            registrationForm: enrollCourse.registrationForm,
            confirmState: enrollCourse.confirmState,
            classType: enrollCourse.classType,
            lessons: enrollCourse.lessons,
          })
        }
      )

      // Sort enroll courses within each invoice by confirmState, then by lesson start time
      invoiceMap.forEach(invoiceGroup => {
        const sortedEnrollCourses = [...invoiceGroup.enrollCourses].sort(
          (a, b) => {
            const weight = (s: EnrollConfirmState) =>
              s === EnrollConfirmState.ACCEPTED ? 0 : 1
            const wa = weight(a.confirmState)
            const wb = weight(b.confirmState)
            if (wa !== wb) return wa - wb
            const aStart = a.lessons?.[0]?.startTime
            const bStart = b.lessons?.[0]?.startTime
            if (aStart && bStart) {
              return new Date(aStart).getTime() - new Date(bStart).getTime()
            }
            return 0
          }
        )

        invoiceMap.set(invoiceGroup.invoiceId, {
          ...invoiceGroup,
          enrollCourses: sortedEnrollCourses,
        })
      })

      // Convert map to array and sort by invoiceId (larger invoiceId first)
      const processedData = Array.from(invoiceMap.values()).sort((a, b) => {
        return b.invoiceId - a.invoiceId
      })

      setData(processedData)
    }
  }, [query.data])

  // Filter data based on date range - show items with at least one lesson within the range
  const filteredData = useMemo(() => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      return data
    }

    const filterStart = new Date(dateFilter.startDate).getTime()
    const filterEnd = new Date(dateFilter.endDate).getTime()

    return data
      .map(invoiceGroup => {
        // Filter enroll courses that have at least one lesson within the date range
        const filteredEnrollCourses = invoiceGroup.enrollCourses.filter(
          enrollCourse => {
            if (!enrollCourse.lessons || enrollCourse.lessons.length === 0) {
              return false
            }

            // Check if any lesson overlaps with the filter date range
            return enrollCourse.lessons.some(lesson => {
              const lessonStart = new Date(lesson.startTime).getTime()
              const lessonEnd = new Date(lesson.endTime).getTime()

              // Check if lesson overlaps with filter range
              return lessonStart <= filterEnd && lessonEnd >= filterStart
            })
          }
        )

        // Only include invoice group if it has at least one filtered enroll course
        if (filteredEnrollCourses.length === 0) {
          return null
        }

        return {
          ...invoiceGroup,
          enrollCourses: filteredEnrollCourses,
        }
      })
      .filter((item): item is TypeTeachingServiceInvoiceGroup => item !== null)
  }, [data, dateFilter])

  return (
    <div className="px-2">
      <div className="box-row-full justify-between" id={tabName}>
        <h2 className="text-xl font-bold">
          {t('student:teachingService.teachingServiceEnrolled')}
        </h2>

        <div className="flex items-center gap-2">
          <ChartDatePicker
            mode="month"
            chartDate={
              dateFilter.startDate && dateFilter.endDate
                ? dateFilter
                : defaultDateRange
            }
            handleChartDateChange={setDateFilter}
            includeFuture
            onReset={handleResetFilter}
            defaultDate={defaultDateRange}
          />
          <Button
            disabled={student.isDeleted ?? false}
            data-testid="add-course-btn"
            onClick={() => {
              navigate(
                `/student-record/${requiredParams.userAliasId}?userId=${requiredParams.userId}`
              )
              setStudentData(prev => ({
                ...prev,
                currentStudent: student,
                currentEnrolId: null,
                tableDrawers: {
                  ...prev.tableDrawers,
                  isOpenAssignCourse: true,
                  assignCourseMode: AddTeachingServiceMode.addCourseDirectly,
                },
              }))
            }}
          >
            {t('student:addBtn')}
          </Button>
        </div>
      </div>
      <Separator margin="large" />
      {filteredData && filteredData.length > 0 && (
        <div className="box-col-full">
          {filteredData.map((invoiceGroup, _index) => {
            return (
              <TeachingServiceItem
                key={`invoice-${invoiceGroup.invoiceId}`}
                invoiceGroup={invoiceGroup}
                student={student}
                institutionId={requiredParams.institutionId}
                siteId={requiredParams.siteId ?? 0}
                studentEnrollmentForm={studentEnrollmentForm}
              />
            )
          })}
        </div>
      )}
      {filteredData &&
        filteredData.length === 0 &&
        dateFilter.startDate &&
        dateFilter.endDate && (
          <div className="py-8 text-center text-text-disabled">
            <p>{t('student:teachingService.noLessonsFoundAdjustDatePicker')}</p>
          </div>
        )}
      <CreateTeachingService
        open={isOpenAssignCourse}
        handleClose={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...prev.tableDrawers,
              isOpenAssignCourse: false,
            },
          }))
          if (requiredParams.userAliasId) {
            navigate(`/student-record/${requiredParams.userAliasId}`)
          } else {
            navigate('/student-record')
          }
        }}
      />
    </div>
  )
}

export default TeachingService
