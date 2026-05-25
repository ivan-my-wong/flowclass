import React, { useEffect, useMemo, useState } from 'react'

import { useDebounce } from '@uidotdev/usehooks'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import {
  BiChevronDown,
  BiChevronRight,
  BiSearch,
  BiUserPlus,
} from 'react-icons/bi'
import { FiMoreHorizontal } from 'react-icons/fi'
import Select, { StylesConfig } from 'react-select'

import { getLessonDetail } from '@/api/invoice'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import LabelSelector, {
  selectCustomStyles,
} from '@/components/Selector/LabelSelector'
import { Button } from '@/components/ui/Button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination'
import { DEBOUNCE_TIME } from '@/constants/common'
import useCourseData from '@/hooks/useCourseData'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { useLessonList } from '@/hooks/useStatisticsData'
import useUsersManagement from '@/hooks/useUsersManagement'
import { OptionProps as CourseOptionType } from '@/types/courseSelector.type'
import { RevenueOverview } from '@/types/enrollCourse'
import { formatCurrency } from '@/utils/currency'

// Types
type CourseAndClassList = {
  value: number
  label: string
  course: string
  courseId: number
  previewImageUrl: null
}

type LessonList = {
  value: number
  label: string
}

interface OverviewTabProps {
  overviewData?: RevenueOverview
  isLoading: boolean
  chartDate: {
    startDate: string
    endDate: string
  }
}

type SortDirection = 'asc' | 'desc' | null

type SortConfig = {
  key: string | null
  direction: SortDirection
}

interface SummaryCardProps {
  title: string
  value: number | string
  isLoading: boolean
}

interface SortableHeaderProps {
  label: string
  sortKey: string
  currentSort: SortConfig
  onSort: (key: string) => void
}

interface LessonData {
  id: number
  date: string
  time: string
  course: string
  class: string
  lesson: string
  teachers: string
  students: number | string
  status: string
  totalRevenue: number
  [key: string]: any
}

interface StudentPayment {
  name: string
  phone: string
  totalLessonValue: number
  creditApplied: number
  netPayment: number
  paymentStatus: string
  attendanceStatus: string
}

interface ExpandableRowProps {
  lesson: LessonData
  isExpanded: boolean
  expandedDetails: Record<number, StudentPayment[]>
  onToggle: (id: number) => void
}

// Reusable Components
const SummaryCard = ({ title, value, isLoading }: SummaryCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    {isLoading ? (
      <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
    ) : (
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    )}
  </div>
)

const SortableHeader = ({
  label,
  sortKey,
  currentSort,
  onSort,
}: SortableHeaderProps) => {
  const renderSortIndicator = () => {
    if (currentSort.key !== sortKey) return null
    if (currentSort.direction === 'asc')
      return <span className="ml-1 text-xs">▲</span>
    if (currentSort.direction === 'desc')
      return <span className="ml-1 text-xs">▼</span>
    return null
  }

  const getAriaSort = (): 'ascending' | 'descending' | 'none' => {
    if (currentSort.key !== sortKey) return 'none'
    return currentSort.direction === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <th
      className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(sortKey)}
      aria-sort={getAriaSort()}
    >
      {label} {renderSortIndicator()}
    </th>
  )
}

const StudentPaymentDetails = ({
  payments,
}: {
  payments: StudentPayment[]
}) => {
  const { t } = useTranslation()
  const [paymentSort, setPaymentSort] = useState<SortConfig>({
    key: null,
    direction: null,
  })

  const sortedPayments = useMemo(() => {
    if (!paymentSort.key || !paymentSort.direction) return payments

    return [...payments].sort((a, b) => {
      const key = paymentSort.key as keyof StudentPayment
      const aVal = a[key]
      const bVal = b[key]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return paymentSort.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      const comparison = aStr.localeCompare(bStr)
      return paymentSort.direction === 'asc' ? comparison : -comparison
    })
  }, [payments, paymentSort])

  const handlePaymentSort = (key: string) => {
    setPaymentSort(prev => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
  }

  const PaymentSortableHeader = ({
    label,
    sortKey,
  }: {
    label: string
    sortKey: string
  }) => (
    <th
      className="text-left py-2 px-4 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
      onClick={() => handlePaymentSort(sortKey)}
    >
      {label}
      {paymentSort.key === sortKey && (
        <span className="ml-1">
          {paymentSort.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  )

  return (
    <div className="ml-8">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        {t('statistics:invoices.studentPaymentsForLessons')}
      </h4>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <PaymentSortableHeader
              label={t('statistics:common.name')}
              sortKey="name"
            />
            <PaymentSortableHeader
              label={t('statistics:common.phone')}
              sortKey="phone"
            />
            <PaymentSortableHeader
              label={t('statistics:invoices.totalLessonValue')}
              sortKey="totalLessonValue"
            />
            <PaymentSortableHeader
              label={t('statistics:invoices.creditApplied')}
              sortKey="creditApplied"
            />
            <PaymentSortableHeader
              label={t('statistics:invoices.netPayments')}
              sortKey="netPayment"
            />
            <PaymentSortableHeader
              label={t('statistics:invoices.paymentStatus')}
              sortKey="paymentStatus"
            />
            <PaymentSortableHeader
              label={t('statistics:invoices.attendanceStatus')}
              sortKey="attendanceStatus"
            />
          </tr>
        </thead>
        <tbody>
          {sortedPayments.map((payment, pIndex) => (
            <tr key={pIndex} className="border-b border-gray-200">
              <td className="py-3 px-4 text-sm text-gray-900">
                {payment.name}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {payment.phone}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {formatCurrency(payment.totalLessonValue)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {formatCurrency(payment.creditApplied)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {formatCurrency(payment.netPayment)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${(() => {
                    switch (payment.paymentStatus) {
                      case 'PAID':
                        return 'bg-green-100 text-green-700'
                      case 'PENDING':
                        return 'bg-yellow-100 text-yellow-700'
                      case 'REJECTED':
                        return 'bg-red-100 text-red-700'
                      default:
                        return 'bg-gray-100 text-gray-700'
                    }
                  })()}`}
                >
                  {payment.paymentStatus}
                </span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    payment.attendanceStatus === 'PRESENT'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {payment.attendanceStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ExpandableRow = ({
  lesson,
  isExpanded,
  expandedDetails,
  onToggle,
}: ExpandableRowProps) => {
  useTranslation()

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      COMPLETED: 'bg-success-subtle text-success',
      SCHEDULED: 'bg-background-primary-subtle text-primary',
      CANCELLED: 'bg-rose-100 text-warn',
    }
    return statusMap[status] || 'bg-gray-100 text-text-subtle'
  }

  return (
    <React.Fragment key={lesson.id}>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(lesson.id)}
            iconAfter={
              isExpanded ? (
                <BiChevronDown className="w-5 h-5" />
              ) : (
                <BiChevronRight className="w-5 h-5" />
              )
            }
          />
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          {dayjs(lesson.date).format('DD MMM YYYY')}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          {dayjs(lesson.time, 'HH:mm:ss').format('HH:mm A')}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">{lesson.course}</td>
        <td className="py-3 px-4 text-sm text-gray-900">{lesson.class}</td>
        <td className="py-3 px-4 text-sm text-gray-900">{lesson.lesson}</td>
        <td className="py-3 px-4 text-sm text-gray-900 whitespace-pre-line">
          {lesson.teachers}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          <div className="flex items-center gap-1">
            <BiUserPlus className="w-4 h-4" />
            {lesson.students}
          </div>
        </td>
        <td className="py-3 px-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
              lesson.status
            )}`}
          >
            {lesson.status.charAt(0) + lesson.status.slice(1).toLowerCase()}
          </span>
        </td>
        <td className="py-3 px-4 text-sm font-medium text-gray-900">
          {formatCurrency(lesson.totalRevenue)}
        </td>
        <td className="py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            iconAfter={<FiMoreHorizontal className="w-5 h-5" />}
          />
        </td>
      </tr>
      {isExpanded && expandedDetails[lesson.id] && (
        <tr>
          <td colSpan={11} className="bg-gray-50 px-4 py-4">
            <StudentPaymentDetails payments={expandedDetails[lesson.id]} />
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}

// Custom Hooks
const useSorting = (data: LessonData[], sortConfig: SortConfig) => {
  return useMemo(() => {
    if (!data || data.length === 0) return []

    const { key, direction } = sortConfig
    if (!key || !direction) return data

    const compare = (a: LessonData, b: LessonData) => {
      let av: any = a[key]
      let bv: any = b[key]

      if (key === 'date' || key === 'time') {
        const aDate = dayjs(
          `${a.date ?? ''} ${a.time ?? ''}`.trim(),
          [
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DD HH:mm',
            'DD-MM-YYYY HH:mm A',
            'YYYY-MM-DDTHH:mm:ssZ',
          ],
          true
        )
        const bDate = dayjs(
          `${b.date ?? ''} ${b.time ?? ''}`.trim(),
          [
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DD HH:mm',
            'DD-MM-YYYY HH:mm A',
            'YYYY-MM-DDTHH:mm:ssZ',
          ],
          true
        )
        if (aDate.isValid() && bDate.isValid()) {
          return aDate.valueOf() - bDate.valueOf()
        }
        av = `${a.date ?? ''} ${a.time ?? ''}`.trim()
        bv = `${b.date ?? ''} ${b.time ?? ''}`.trim()
      } else if (key === 'totalRevenue' || key === 'students') {
        av = typeof av === 'number' ? av : Number(av) || 0
        bv = typeof bv === 'number' ? bv : Number(bv) || 0
      } else {
        av = (av ?? '').toString()
        bv = (bv ?? '').toString()
      }

      if (typeof av === 'number' && typeof bv === 'number') {
        return av - bv
      }
      return av
        .toString()
        .localeCompare(bv.toString(), undefined, { numeric: true })
    }

    const sorted = [...data].sort((a, b) => {
      const res = compare(a, b)
      return direction === 'asc' ? res : -res
    })
    return sorted
  }, [data, sortConfig])
}

const useCourseAndClassOptions = () => {
  const { courseData } = useCourseData()

  return useMemo(() => {
    if (!courseData) return []
    return courseData.courses.map(courseItem => ({
      label: courseItem.name || 'Unknown Course',
      options: courseItem.classes.map(cls => ({
        value: cls.id,
        label: cls.name || 'Unknown Class',
        course: courseItem.name || 'Unknown Course',
        courseId: courseItem.id,
        previewImageUrl: null,
      })),
    }))
  }, [courseData])
}

const useInstructorOptions = () => {
  const { useGetInstructors } = useUsersManagement()
  const { data: instructors } = useGetInstructors()

  return useMemo(() => {
    return (instructors || []).map(instructor => ({
      label: `${instructor.user?.firstName} ${
        instructor.user?.lastName || ''
      } - ${instructor.user?.email}`,
      value: instructor.id?.toString() || '',
    }))
  }, [instructors])
}

const useLessonOptions = (classLessons: any[]) => {
  return useMemo(() => {
    if (!classLessons) return []
    return classLessons.map(item => {
      const date = dayjs(item.start).format('DD-MM-YYYY')
      const start = dayjs(item.start).format('HH:mm A')
      const end = dayjs(item.end).format('HH:mm A')
      return {
        label: `${date} ${start} - ${end}`,
        value: item.id,
      }
    })
  }, [classLessons])
}

const usePaginationInfo = (pagination: any) => {
  return useMemo(() => {
    const raw = pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
    const totalPages = Math.ceil(raw.total / raw.limit) || 1
    return { ...raw, totalPages }
  }, [pagination])
}

// Utility Functions
const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const delta = 1
  const leftBoundary = Math.max(2, currentPage - delta)
  const rightBoundary = Math.min(totalPages - 1, currentPage + delta)

  const pages: (number | '...')[] = [1]

  if (leftBoundary > 2) pages.push('...')
  for (let i = leftBoundary; i <= rightBoundary; i++) {
    pages.push(i)
  }
  if (rightBoundary < totalPages - 1) pages.push('...')
  if (totalPages > 1) pages.push(totalPages)

  return pages
}

// Main Component
export const Overview = ({
  overviewData,
  isLoading,
  chartDate,
}: OverviewTabProps) => {
  const { t } = useTranslation()

  const [filters, setFilters] = useState({
    studentName: '',
    classIds: [] as number[],
    lessonIds: [] as number[],
    teacherId: [] as number[],
    status: 'COMPLETED',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [expandedDetails, setExpandedDetails] = useState<
    Record<number, StudentPayment[]>
  >({})
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  })
  const [selectedCourse, setSelectedCourse] = useState<CourseAndClassList[]>([])
  const [selectedLesson, setSelectedLesson] = useState<LessonList[]>([])

  const { currentSite } = useSiteData()
  const { currentSchool } = useSchoolData()

  const debouncedSearchStudentName = useDebounce(
    filters.studentName,
    DEBOUNCE_TIME
  )

  const {
    data: lessonListData,
    isLoading: isLessonLoading,
    refetch: refetchLessons,
  } = useLessonList({
    startDate: chartDate.startDate,
    endDate: chartDate.endDate,
    status: filters.status,
    classId: filters.classIds.length > 0 ? filters.classIds[0] : undefined,
    instructorId:
      filters.teacherId.length > 0 ? filters.teacherId[0] : undefined,
    studentName: debouncedSearchStudentName || undefined,
    lessonId: filters.lessonIds.length > 0 ? filters.lessonIds[0] : undefined,
    page: currentPage,
    limit: 10,
  })

  const courseAndClassList = useCourseAndClassOptions()
  const instructorsOptions = useInstructorOptions()

  const { useFetchAllLessonData } = useLessonDateTimeData()
  const lessonFilter = useMemo(() => {
    if (!selectedCourse.length) return { classIdSelected: [] }
    return {
      classIdSelected: selectedCourse.map(item => item.value),
      startDate: dayjs(chartDate.startDate).toDate(),
      endDate: dayjs(chartDate.endDate).toDate(),
    }
  }, [selectedCourse, chartDate])

  const { data: classLessons } = useFetchAllLessonData(lessonFilter)
  const lessonList = useLessonOptions(classLessons || [])
  const paginationInfo = usePaginationInfo(lessonListData?.pagination)

  // Event Handlers
  const toggleRow = (lessonId: number) => {
    setExpandedRows(prev => {
      const isExpanded = prev.includes(lessonId)
      if (!isExpanded && !expandedDetails[lessonId]) {
        fetchLessonDetail(lessonId)
      }
      return isExpanded
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    })
  }

  const fetchLessonDetail = async (lessonId: number) => {
    try {
      const { data: detail } = await getLessonDetail({
        lessonId,
        institutionId: currentSchool?.id ?? 0,
        siteId: currentSite?.id ?? 0,
      })
      setExpandedDetails(prev => ({
        ...prev,
        [lessonId]: detail.studentPayments,
      }))
    } catch (error) {
      console.error('Failed to fetch lesson detail:', error)
    }
  }

  const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, studentName: e.target.value }))
    setCurrentPage(1)
  }

  const handleInstructorChange = (selected: any) => {
    const selectedIds = Array.isArray(selected)
      ? selected.map((opt: { value: string }) => Number(opt.value))
      : []
    setFilters(prev => ({ ...prev, teacherId: selectedIds }))
    setCurrentPage(1)
  }

  const handleCourseAndClassChange = (data: CourseAndClassList[]) => {
    setSelectedLesson([])
    setSelectedCourse(data)
    const classIds = data.map(item => item.value)
    setFilters(prev => ({ ...prev, classIds, lessonIds: [] }))
    setCurrentPage(1)
  }

  const handleLessonChange = (selectedLessons: LessonList[]) => {
    setSelectedLesson(selectedLessons)
    const lessonIds = selectedLessons.map(item => item.value)
    setFilters(prev => ({ ...prev, lessonIds }))
    setCurrentPage(1)
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
  }

  const sortedLessons = useSorting(lessonListData?.data ?? [], sortConfig)

  // Effects
  useEffect(() => {
    refetchLessons()
  }, [
    filters.status,
    filters.classIds,
    filters.lessonIds,
    filters.teacherId,
    currentPage,
    debouncedSearchStudentName,
    chartDate.startDate,
    chartDate.endDate,
    refetchLessons,
  ])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const summaryCards = [
    {
      title: t('statistics:invoices.totalRevenue'),
      value: formatCurrency(overviewData?.totalRevenue || 0),
    },
    {
      title: t('statistics:invoices.completedLessons'),
      value: overviewData?.completedLessons || 0,
    },
    {
      title: t('statistics:invoices.activeStudents'),
      value: overviewData?.activeStudents || 0,
    },
  ]

  const sortableColumns = [
    { label: t('statistics:common.date'), key: 'date' },
    { label: t('statistics:common.time'), key: 'time' },
    { label: t('statistics:common.course'), key: 'course' },
    { label: t('statistics:common.class'), key: 'class' },
    { label: t('statistics:common.lesson'), key: 'lesson' },
    { label: t('statistics:common.teacher'), key: 'teachers' },
    { label: t('statistics:common.students'), key: 'students' },
    { label: t('statistics:common.status'), key: 'status' },
    { label: t('statistics:invoices.totalRevenue'), key: 'totalRevenue' },
  ]

  const statusOptions = [
    { value: 'COMPLETED', label: t('statistics:status.completed') },
    { value: 'SCHEDULED', label: t('statistics:status.scheduled') },
    { value: 'CANCELLED', label: t('statistics:status.cancelled') },
  ]

  return (
    <div>
      <div>
        {/* Filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('statistics:invoices.searchByStudentName') ?? ''}
              value={filters.studentName}
              onChange={handleStudentNameChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="min-w-[200px]">
              <CourseAndClassSelector
                value={selectedCourse as unknown as CourseOptionType[]}
                options={courseAndClassList}
                onChange={selected => {
                  if (selected) {
                    handleCourseAndClassChange(
                      selected as unknown as CourseAndClassList[]
                    )
                  }
                }}
                width="100%"
                placeholder={t('statistics:common.selectClass') ?? ''}
              />
            </div>

            <div className="min-w-[200px]">
              <LabelSelector
                selectOption={selectedLesson}
                options={lessonList}
                onChange={handleLessonChange}
                isMulti
                isDisabled={!selectedCourse.length}
                placeHolder={t('statistics:common.selectLesson')}
              />
            </div>

            <div className="min-w-[220px]">
              <Select
                options={instructorsOptions}
                styles={selectCustomStyles('100%') as StylesConfig}
                name="instructor-selector"
                inputId="instructor-selector"
                placeholder={t('statistics:common.noInstructorSelected')}
                isMulti
                isClearable
                data-testid="filter-by-instructor"
                value={instructorsOptions.filter(opt =>
                  filters.teacherId.includes(Number(opt.value))
                )}
                onChange={handleInstructorChange}
              />
            </div>

            {/* <div className="min-w-[160px]">
              <Select
                value={statusOptions.find(opt => opt.value === filters.status)}
                onChange={newValue => {
                  const option = newValue as {
                    value: string
                    label: string
                  } | null
                  setFilters(prev => ({
                    ...prev,
                    status: option?.value || 'COMPLETED',
                  }))
                  setCurrentPage(1)
                }}
                options={statusOptions}
                styles={selectCustomStyles('100%') as StylesConfig}
                placeholder={t('statistics:common.selectStatus')}
                isSearchable={false}
                isClearable={false}
              />
            </div> */}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {summaryCards.map((card, index) => (
            <SummaryCard
              key={index}
              title={card.title}
              value={card.value}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Lessons Table */}
        {isLessonLoading && (
          <div className="p-8 text-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded animate-pulse mx-4"
                />
              ))}
            </div>
          </div>
        )}
        {!isLessonLoading && lessonListData?.data?.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            {t('statistics:common.noLessonsFound')}
          </div>
        )}
        {!isLessonLoading && lessonListData?.data?.length !== 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-8" />
                    {sortableColumns.map(column => (
                      <SortableHeader
                        key={column.key}
                        label={column.label}
                        sortKey={column.key}
                        currentSort={sortConfig}
                        onSort={handleSort}
                      />
                    ))}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t('statistics:common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLessons.map(lesson => (
                    <ExpandableRow
                      key={lesson.id}
                      lesson={lesson}
                      isExpanded={expandedRows.includes(lesson.id)}
                      expandedDetails={expandedDetails}
                      onToggle={toggleRow}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-end mt-4">
          {paginationInfo.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={e => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(prev => prev - 1)
                    }}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>

                {getPageNumbers(currentPage, paginationInfo.totalPages).map(
                  (pageNum, idx) =>
                    pageNum === '...' ? (
                      <PaginationItem key={`ellipsis-${currentPage}-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={`page-${pageNum}-${idx}`}>
                        <PaginationLink
                          isActive={pageNum === currentPage}
                          onClick={e => {
                            e.preventDefault()
                            setCurrentPage(pageNum)
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={e => {
                      e.preventDefault()
                      if (currentPage < paginationInfo.totalPages)
                        setCurrentPage(prev => prev + 1)
                    }}
                    aria-disabled={currentPage === paginationInfo.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  )
}
