import React, { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BiSearch } from 'react-icons/bi'
import Select, { StylesConfig } from 'react-select'

import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import { selectCustomStyles } from '@/components/Selector/LabelSelector'
import useCourseData from '@/hooks/useCourseData'
import { useStatistics } from '@/hooks/useStatistics'
import useUsersManagement from '@/hooks/useUsersManagement'
import { OptionProps as CourseOptionType } from '@/types/courseSelector.type'
import { StudentOverview } from '@/types/enrollCourse'

import { StudentClassRow } from './StudentClassRow'

// Types
type CourseAndClassList = {
  value: number
  label: string
  course: string
  courseId: number
  previewImageUrl: null
}

interface StudentOverviewTabProps {
  overviewData?: StudentOverview
  isLoading: boolean
}

type SortConfig = {
  key: string | null
  direction: 'ascending' | 'descending'
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
  className?: string
}

// Reusable Components
const SummaryCard = ({ title, value, isLoading }: SummaryCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    {isLoading ? (
      <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
    ) : (
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    )}
  </div>
)

const SortableHeader = ({
  label,
  sortKey,
  currentSort,
  onSort,
  className = '',
}: SortableHeaderProps) => (
  <th
    className={`text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 ${className}`}
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center gap-1">
      {label}
      {currentSort.key === sortKey && (
        <span className="text-xs">
          {currentSort.direction === 'ascending' ? '↑' : '↓'}
        </span>
      )}
    </div>
  </th>
)

// Custom Hooks
const useSorting = <T,>(data: T[], sortConfig: SortConfig) => {
  return useMemo(() => {
    if (!data || data.length === 0) return []

    if (sortConfig.key) {
      return [...data].sort((a, b) => {
        let aValue = a[sortConfig.key as keyof T]
        let bValue = b[sortConfig.key as keyof T]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase() as T[keyof T]
          bValue = bValue.toLowerCase() as T[keyof T]
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return [...data]
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
      name: `${instructor.user?.firstName} ${
        instructor.user?.lastName || ''
      }`.trim(),
    }))
  }, [instructors])
}

// Utility Functions
const formatPercentage = (value: number) => {
  const percentage = Math.min(Math.max(value, 0), 100)
  return `${percentage.toFixed(1)}%`
}
// Main Component
export const StudentOverviewTab = ({
  overviewData,
  isLoading,
}: StudentOverviewTabProps) => {
  const { t } = useTranslation()

  const [filters, setFilters] = useState({
    studentName: '',
    classIds: [] as number[],
    teacherNames: [] as string[],
  })

  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseAndClassList[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'ascending',
  })

  const { chartDate } = useStatistics()
  const courseAndClassList = useCourseAndClassOptions()
  const instructorsOptions = useInstructorOptions()

  // Filter classes based on filters
  const filteredClasses = useMemo(() => {
    if (!overviewData?.classes) return []

    let filtered = overviewData.classes

    // Filter by class IDs
    if (filters.classIds.length > 0) {
      filtered = filtered.filter(cls => filters.classIds.includes(cls.classId))
    }

    // Filter by teacher names
    if (filters.teacherNames.length > 0) {
      filtered = filtered.filter(cls =>
        filters.teacherNames.some(teacherName =>
          cls.teacherName?.toLowerCase().includes(teacherName.toLowerCase())
        )
      )
    }

    // Note: Student name filtering would require student-level data from API
    // Currently the API only returns aggregated class data
    // If you need student-level filtering, the API needs to return student details

    return filtered
  }, [overviewData?.classes, filters.classIds, filters.teacherNames])

  // Toggle row expansion
  const toggleRow = (classId: number) => {
    setExpandedRows(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  // Handle filters
  const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, studentName: e.target.value }))
  }

  const handleCourseAndClassChange = (data: CourseAndClassList[]) => {
    setSelectedCourse(data)
    const classIds = data.map(item => item.value)
    setFilters(prev => ({ ...prev, classIds }))
  }

  const handleInstructorChange = (selected: any) => {
    const selectedNames = Array.isArray(selected)
      ? selected.map((opt: { name: string }) => opt.name)
      : []
    setFilters(prev => ({ ...prev, teacherNames: selectedNames }))
  }

  // Sorting
  const requestSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const sortedData = useSorting(filteredClasses, sortConfig)

  // Summary data
  const summaryCards = [
    {
      title: t('statistics:student.activeStudents'),
      value: overviewData?.summary?.activeStudents || 0,
    },
    {
      title: t('statistics:student.newStudentsThisMonth'),
      value: overviewData?.summary?.newStudentsThisMonth || 0,
    },
    {
      title: t('statistics:student.totalDropouts'),
      value: overviewData?.summary?.totalDropouts || 0,
    },
    {
      title: t('statistics:student.dropoutRate'),
      value: formatPercentage(overviewData?.summary?.dropoutRate || 0),
    },
  ]

  const sortableColumns = [
    { label: t('statistics:student.totalStudents'), key: 'totalStudents' },
    { label: t('statistics:student.newStudentsThisMonth'), key: 'newStudents' },
    { label: t('statistics:student.dropoutThisMonth'), key: 'dropouts' },
    { label: t('statistics:student.dropoutRate'), key: 'dropoutRate' },
  ]

  return (
    <div>
      <div>
        {/* Filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* <div className="relative flex-1 max-w-xs">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={
                t('statistics:invoices.searchByStudentName') ??
                'Search by student name'
              }
              value={filters.studentName}
              onChange={handleStudentNameChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled
              title={
                t('statistics:student.searchRequiresStudentData') ||
                'Searching by student name requires student-level data from the API.'
              }
            />
          </div> */}

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
                placeholder={
                  t('statistics:common.selectClass') || 'Select Class'
                }
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
                  filters.teacherNames.includes(opt.name)
                )}
                onChange={handleInstructorChange}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <SummaryCard
              key={index}
              title={card.title}
              value={card.value}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Monthly Dropout Rates Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('statistics:student.monthlyDropoutRates')}
            </h2>
          </div>

          {/* Refactored to avoid nested ternary expressions */}
          {(() => {
            if (isLoading) {
              return (
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
              )
            }

            if (sortedData.length === 0) {
              return (
                <div className="p-8 text-center text-gray-500">
                  {t('statistics:student.noDropoutData')}
                </div>
              )
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-8" />
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t('statistics:common.course')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t('statistics:common.class')}
                      </th>
                      {sortableColumns.map(column => (
                        <SortableHeader
                          key={column.key}
                          label={column.label}
                          sortKey={column.key}
                          currentSort={sortConfig}
                          onSort={requestSort}
                        />
                      ))}
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t('statistics:common.teacher')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map(classItem => (
                      <StudentClassRow
                        key={classItem.classId}
                        classItem={classItem}
                        isExpanded={expandedRows.includes(classItem.classId)}
                        onToggle={toggleRow}
                        chartDate={chartDate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
