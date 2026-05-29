import { t } from 'i18next'
import { RiArrowDropDownLine } from 'react-icons/ri'

import OldButton from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import Text from '@/components/Texts/Text'
import Popover from '@/components/Tooltips/Popover'
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
  const sortedLessons = (() => {
    const allLessons = [...studentSchedules]
      .sort((a, b) => {
        const earliest = (s: PaymentProofStudentSchedule) =>
          Math.min(
            ...(s.studentLessons ?? []).map(l =>
              new Date(l.startTime).getTime()
            ),
            Infinity
          )
        return earliest(a) - earliest(b)
      })
      .flatMap(s =>
        (s.studentLessons ?? []).map(l => ({ ...l, scheduleId: s.id }))
      )
    return [...allLessons].sort(
      (a, b) =>
        new Date(a.changeStartTime || a.startTime).getTime() -
        new Date(b.changeStartTime || b.startTime).getTime()
    )
  })()

  const scheduleContent = (
    <Box
      gap="none"
      direction="column"
      css={{ width: '300px', maxHeight: '320px', overflow: 'auto' }}
    >
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
    </Box>
  )

  return (
    <div className="flex items-center gap-1 overflow-hidden min-w-0 w-full">
      <div className="flex-shrink-0">{getCourseIcon(enroll.type)}</div>
      <Popover
        trigger={
          <div>
            <OldButton
              variants="subtle"
              size="small"
              iconAfter={<RiArrowDropDownLine />}
            >
              <Text
                css={{
                  display: 'block',
                  color: '$text',
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {enroll.courseName}
              </Text>
            </OldButton>
          </div>
        }
      >
        {scheduleContent}
      </Popover>
      <span className="text-xs text-text-sub whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {enroll.secondLevelName}
      </span>
    </div>
  )
}

export default EnrollCourseScheduleCell
