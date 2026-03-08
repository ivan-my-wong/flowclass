import { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { AttendanceStatus } from '@/constants/course'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { CalendarEvent } from '@/types/fullCalendar.type'

interface Props {
  event: CalendarEvent
}
const QuotaAttendance: FC<Props> = ({ event }): JSX.Element => {
  const { t } = useTranslation('calendar')
  const { useFetchCurrentLesson, useGetListStudentLesson } =
    useLessonDateTimeData()
  const { isLoading: isLoadingLessons, data: currentLesson } =
    useFetchCurrentLesson(Number(event.id))

  const { isLoading: isLoadingStudents, data: allStudentData } =
    useGetListStudentLesson(Number(event.id), {
      withUnpaid: true,
      allPage: true,
    })

  const isLoading = isLoadingLessons || isLoadingStudents

  const numberOfAttendedStudents = useMemo(() => {
    return (
      allStudentData?.content?.filter(
        student => student.attendance !== AttendanceStatus.PENDING
      ).length || 0
    )
  }, [allStudentData?.content])

  return (
    <div>
      <div className="flex items-center gap-1 text-xs">
        <div>{t(`attendance.quota`)}</div>
        {isLoading ? (
          <div>{t(`attendance.loading`)}</div>
        ) : (
          <div>
            {currentLesson?.quotaUsed ?? '-'} / {currentLesson?.quota ?? '-'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs">
        <div>{t(`attendance.recorded`)}</div>
        {isLoading ? (
          <div>{t(`attendance.loading`)}</div>
        ) : (
          <div>
            {numberOfAttendedStudents ?? '-'} /{' '}
            {currentLesson?.quotaUsed ?? '-'}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotaAttendance
