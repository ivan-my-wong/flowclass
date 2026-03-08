import { FC, useCallback, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { FaCaretRight } from 'react-icons/fa'
import { useRecoilValue } from 'recoil'

import { TableCell, TableRow } from '@/components/ui/Table'
import {
  currentActiveStudentState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import { ClassTypeEnum } from '@/types/course'
import { InvoiceClassType } from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'
import { formatTotalPriceInvoicePerItem } from '@/utils/invoice-campaign.utils'

type Props = {
  isCombined: boolean
  invoice: InvoiceClassType
  currency: string
  studentId?: number | null
}

const PreviewInvoiceTableRow: FC<Props> = ({
  isCombined,
  invoice,
  currency,
  studentId,
}) => {
  const { t } = useTranslation(['invoiceCampaign'])
  const allStudents = useRecoilValue(invoiceStudentState)
  const allSessions = useRecoilValue(invoiceSessionState)

  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentStudent = useMemo(() => {
    return studentId
      ? allStudents.find(student => student.id === studentId)
      : currentActiveStudent
  }, [allStudents, currentActiveStudent, studentId])
  const calculatePriceItem = (item: InvoiceClassType) => {
    return formatTotalPriceInvoicePerItem(item, currency)
  }

  const renderSessions = useCallback(
    (classItem: InvoiceClassType) => {
      const currentSessions = allSessions.filter(
        session =>
          session.studentItem?.id === currentStudent?.id &&
          session.classItem?.classId === classItem.classId
      )
      return (
        <div className="space-y-1">
          {currentSessions.map(session => (
            <div
              key={`${currentStudent?.id}-${session.id}`}
              className="flex items-start gap-2"
            >
              <FaCaretRight
                className="mt-1"
                aria-hidden="true"
                focusable="false"
              />
              <div>
                <div>
                  {dayjs(session.startTime).format('YYYY-MM-DD hh:mm A')}
                </div>
                <div>{dayjs(session.endTime).format('YYYY-MM-DD hh:mm A')}</div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    [allSessions, currentStudent?.id]
  )
  return (
    <TableRow>
      {isCombined && currentStudent && (
        <TableCell>{currentStudent?.name}</TableCell>
      )}
      <TableCell className="align-top">
        <div className="font-medium">{invoice.courseName}</div>
        <div>{invoice.remark ? <div>{invoice.remark}</div> : null}</div>
      </TableCell>
      <TableCell>
        {invoice.type !== ClassTypeEnum.subscription ? (
          <>
            <div className="font-medium mb-2">
              {t('invoice.numOfSelectedLessons', {
                count: invoice.sessionLength,
              })}
            </div>
            <div>{renderSessions(invoice)}</div>
          </>
        ) : (
          <div>-</div>
        )}
      </TableCell>
      <TableCell className="text-right align-top">
        {formatCurrency(+invoice.price, currency)}
      </TableCell>
      <TableCell className="text-right align-top">
        {calculatePriceItem(invoice)}
      </TableCell>
    </TableRow>
  )
}

export default PreviewInvoiceTableRow
