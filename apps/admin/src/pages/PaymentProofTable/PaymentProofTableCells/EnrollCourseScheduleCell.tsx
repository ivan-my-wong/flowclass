import { useState } from 'react'

import { t } from 'i18next'
import { TiEye } from 'react-icons/ti'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  EnrollIntoInfo,
  PaymentProofStudentSchedule,
  PaymentProofTableEnrollCourse,
} from '@/types/enrollCourse'
import { getCourseIcon } from '@/utils/options'
import { getLessonDateTime } from '@/utils/timeFormat'

type EnrollCourseScheduleCellProps = {
  enrollCourse: PaymentProofTableEnrollCourse
  enroll: EnrollIntoInfo
  studentSchedules: PaymentProofStudentSchedule[]
}

const EnrollCourseScheduleCell = ({
  enrollCourse: _enrollCourse,
  enroll,
  studentSchedules,
}: EnrollCourseScheduleCellProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  const renderTable = (schedules: PaymentProofStudentSchedule[]) => {
    // Sort schedules by the earliest lesson start time
    const sortedSchedules = [...schedules].sort((a, b) => {
      const getEarliestStartTime = (schedule: PaymentProofStudentSchedule) => {
        if (!schedule.studentLessons || schedule.studentLessons.length === 0) {
          return new Date(0).getTime()
        }
        const startTimes = schedule.studentLessons.map(lesson => {
          const startTime = lesson.changeStartTime || lesson.startTime
          return new Date(startTime).getTime()
        })
        return Math.min(...startTimes)
      }

      return getEarliestStartTime(a) - getEarliestStartTime(b)
    })

    // Flatten and sort all lessons by start time
    const allLessons = sortedSchedules.flatMap(schedule => {
      if (!schedule.studentLessons || schedule.studentLessons.length === 0) {
        return []
      }
      return schedule.studentLessons.map(lesson => ({
        ...lesson,
        scheduleId: schedule.id,
      }))
    })

    // Sort lessons by start time (using changeStartTime if available, otherwise startTime)
    const sortedLessons = [...allLessons].sort((a, b) => {
      const aStartTime = new Date(a.changeStartTime || a.startTime).getTime()
      const bStartTime = new Date(b.changeStartTime || b.startTime).getTime()
      return aStartTime - bStartTime
    })

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('student:teachingService.timeSlots')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLessons.length > 0 ? (
            sortedLessons.map((lesson, index) => (
              <TableRow key={`${lesson.scheduleId}-${lesson.id || index}`}>
                <TableCell>
                  {getLessonDateTime(
                    lesson.changeStartTime || lesson.startTime,
                    lesson.changeEndTime || lesson.endTime,
                    t
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>{t('student:noLessonsScheduled')}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-hidden min-w-0 w-full">
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0"
        iconAfter={<TiEye />}
        onClick={() => setIsOpen(true)}
      >
        {t('student:dropdown.clickToViewTimeSlots')}
      </Button>
      <div className="flex-shrink-0">{getCourseIcon(enroll.type)}</div>
      <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {enroll.courseName}
      </span>
      <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {enroll.secondLevelName}
      </span>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full p-8">
          <DialogTitle>
            {enroll.courseName} - {enroll.secondLevelName}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              ×
            </Button>
          </DialogClose>
          {studentSchedules.length > 0 ? (
            renderTable(studentSchedules)
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {t('student:noLessonsScheduled')}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EnrollCourseScheduleCell
