import { useState } from 'react'

import { t } from 'i18next'
import { TiEye } from 'react-icons/ti'

import Box from '@/components/ui/Box'
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
  PaymentProofStudentSchedule,
  PaymentProofTableItem,
} from '@/types/enrollCourse'
import { getLessonDateTime } from '@/utils/timeFormat'

const ClassDropDownCell = ({
  data,
}: {
  data: PaymentProofTableItem
}): JSX.Element => {
  const [open, setOpen] = useState(false)

  const renderTable = (schedules: PaymentProofStudentSchedule[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('student:teachingService.timeSlots')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.flatMap(schedule =>
            schedule.studentLessons && schedule.studentLessons.length > 0
              ? schedule.studentLessons.map((lesson, index) => (
                  <TableRow key={`${schedule.id}-${lesson.id || index}`}>
                    <TableCell>
                      {getLessonDateTime(
                        lesson.startTime,
                        lesson.endTime,
                        t
                      )}
                    </TableCell>
                  </TableRow>
                ))
              : [
                  <TableRow key={schedule.id}>
                    <TableCell>{t('student:noLessonsScheduled')}</TableCell>
                  </TableRow>,
                ]
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <Box direction="col" gap="sm" className="my-1">
      <>
        <Button
          variant="outline"
          iconAfter={<TiEye />}
          onClick={() => setOpen(true)}
        >
          {t('student:dropdown.clickToViewTimeSlots')}
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full p-8">
            <DialogTitle>
              {t('student:dropdown.clickToViewTimeSlots')}
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
            {renderTable(data.studentSchedules)}
          </DialogContent>
        </Dialog>
      </>
    </Box>
  )
}

export default ClassDropDownCell
