import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import { Button } from '@/components/ui/Button'

import { useContextEnrolledClass } from './EnrolledClassContext'

const Paginator = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const {
    studentToEnroll,
    setStudentToEnroll,
    isEnrollAllStudents,
    allStudentsToEnroll,
  } = useContextEnrolledClass()

  const currentIndex = useMemo(() => {
    return allStudentsToEnroll.findIndex(
      current => current.id === studentToEnroll?.id
    )
  }, [allStudentsToEnroll, studentToEnroll?.id])

  const switchStudent = (incrementer: number) => {
    const nextIndex = currentIndex + incrementer
    if (nextIndex < 0 || nextIndex >= allStudentsToEnroll.length) return
    setStudentToEnroll(allStudentsToEnroll[nextIndex])
  }
  return (
    <div className="space-y-4 w-full pt-3">
      {isEnrollAllStudents && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="xs"
            disabled={currentIndex === 0}
            onClick={() => switchStudent(-1)}
          >
            <FaChevronLeft />
          </Button>
          <div className="font-semibold">
            {t('enrolledClass.studentPagination', {
              counter: Math.max(0, currentIndex) + 1,
              all: allStudentsToEnroll.length,
            })}
          </div>
          <Button
            variant="outline"
            size="xs"
            disabled={currentIndex === allStudentsToEnroll.length - 1}
            onClick={() => switchStudent(1)}
          >
            <FaChevronRight />
          </Button>
        </div>
      )}
      <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-sm">
        <div className="flex">
          <div className="w-1/3 text-center">
            <div className="text-gray-600">{t('enrolledClass.name')}: </div>
            <div className="font-medium">{studentToEnroll?.name ?? '-'}</div>
          </div>
          <div className="w-1/3 text-center">
            <div className="text-gray-600">{t('enrolledClass.email')}:</div>
            <div className="font-medium">{studentToEnroll?.email ?? '-'}</div>
          </div>
          <div className="w-1/3 text-center">
            <div className="text-gray-600">{t('enrolledClass.phone')}:</div>
            <div className="font-medium">{studentToEnroll?.phone ?? '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Paginator
