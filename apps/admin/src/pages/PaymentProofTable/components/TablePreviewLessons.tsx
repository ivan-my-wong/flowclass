import { useTranslation } from 'react-i18next'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import useSiteData from '@/hooks/useSiteData'
import { StudentLessonInfo } from '@/types/paymentProof'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'
import { getLessonDateTime } from '@/utils/timeFormat'

type Props = {
  lessons: StudentLessonInfo[]
}
const TablePreviewLessons = ({ lessons }: Props) => {
  const { t } = useTranslation(['paymentProof'])
  const { currency } = useSiteData()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            {t('student:column.name')}
          </TableHead>
          <TableHead>{t('student:column.lessons')}</TableHead>
          <TableHead className="text-right">
            {t('student:column.price')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map(lesson => (
          <TableRow key={`${lesson.studentScheduleId}-${lesson.invoiceId}`}>
            <TableCell className="font-medium align-top">
              {lesson.student?.fullName}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                {lesson.lessons.map(lesson => {
                  const [startTime, endTime] = lesson.split(' ')
                  return (
                    <span key={`${startTime}-${endTime}`}>
                      {getLessonDateTime(startTime, endTime, t)}
                    </span>
                  )
                })}
              </div>
            </TableCell>
            <TableCell className="text-right align-top">
              {formatCurrency(lesson.payAmount, currency)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TablePreviewLessons
