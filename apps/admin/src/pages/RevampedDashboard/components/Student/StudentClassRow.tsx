import React from 'react'

import dayjs from 'dayjs'
import { t } from 'i18next'
import { BiChevronDown, BiChevronRight } from 'react-icons/bi'

import { Button } from '@/components/ui/Button'
import { useDropoutStudents } from '@/hooks/useStatisticsData'

interface StudentClassRowProps {
  classItem: {
    classId: number
    courseName: string
    className: string
    totalStudents: number
    newStudents: number
    dropouts: number
    dropoutRate: number
    teacherName: string
  }
  isExpanded: boolean
  onToggle: (classId: number) => void
  chartDate: {
    startDate: string
    endDate: string
  }
}

export const StudentClassRow = ({
  classItem,
  isExpanded,
  onToggle,
  chartDate,
}: StudentClassRowProps) => {
  const { data: dropoutStudents, isLoading: isDropoutLoading } =
    useDropoutStudents(
      isExpanded ? classItem.classId : null,
      chartDate.startDate,
      chartDate.endDate
    )

  const formatPercentage = (value: number) => {
    const percentage = Math.min(Math.max(value, 0), 100)
    return `${percentage.toFixed(1)}%`
  }

  const getDropoutRateBadgeClass = (rate: number) => {
    if (rate > 0.1) return 'bg-red-100 text-red-700'
    if (rate > 0.05) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <React.Fragment key={classItem.classId}>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(classItem.classId)}
            className="text-gray-400 hover:text-gray-600 h-7 w-7"
          >
            {isExpanded ? (
              <BiChevronDown className="w-5 h-5" />
            ) : (
              <BiChevronRight className="w-5 h-5" />
            )}
          </Button>
        </td>
        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
          {classItem.courseName}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
          {classItem.className}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          {classItem.totalStudents}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          {classItem.newStudents}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          {classItem.dropouts}
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDropoutRateBadgeClass(
              classItem.dropoutRate
            )}`}
          >
            {formatPercentage(classItem.dropoutRate)}
          </span>
        </td>
        <td className="py-3 px-4 text-sm text-gray-900">
          {classItem.teacherName}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={8} className="bg-gray-50 px-4 py-4">
            <div className="ml-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t('statistics:student.dropoutStudents')}{' '}
              </h4>
              {isDropoutLoading && (
                <div className="text-center py-4 text-gray-500">
                  {t('common:loading')}
                </div>
              )}
              {!isDropoutLoading &&
                dropoutStudents &&
                dropoutStudents.length > 0 && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">
                          {t('statistics:common.name')}
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">
                          {t('statistics:common.phone')}
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">
                          {t('statistics:common.email')}
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">
                          {t('statistics:student.lastAttendance')}{' '}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dropoutStudents.map((student, sIndex: number) => (
                        <tr key={sIndex} className="border-b border-gray-200">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            {student.name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {student.phone || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {student.email || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {student.lastAttendance
                              ? dayjs(student.lastAttendance).format(
                                  'DD MMM YYYY'
                                )
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              {!isDropoutLoading &&
                (!dropoutStudents || dropoutStudents.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    {t('dashboard.student.noDropoutStudents')}
                  </div>
                )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}
