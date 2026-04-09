import { FC, useCallback } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaCaretRight } from 'react-icons/fa'
import { RiMessageLine } from 'react-icons/ri'
import { useRecoilValue } from 'recoil'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useSiteData from '@/hooks/useSiteData'
import {
  currentActiveStudentState,
  invoiceSessionState,
} from '@/stores/studentInvoice.store'
import { ClassTypeEnum } from '@/types/course'
import { InvoiceClassType } from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatTotalPriceInvoicePerItem } from '@/utils/invoice-campaign.utils'

import ClassInfoItem from '../Course/ClassInfoItem'

interface Props {
  currentClasses: InvoiceClassType[]
  hideTotals?: boolean
}
const SelectedCourseTable: FC<Props> = ({
  currentClasses,
  hideTotals = false,
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const siteData = useSiteData()
  const currency = siteData?.currency ?? DEFAULT_CURRENCY
  const currentStudent = useRecoilValue(currentActiveStudentState)
  const allSessions = useRecoilValue(invoiceSessionState)

  const renderSessions = useCallback(
    (courseItem: InvoiceClassType) => {
      const currentSessions = allSessions.filter(
        session =>
          session.studentItem?.id === currentStudent?.id &&
          session.classItem?.classId === courseItem.classId
      )

      return (
        <>
          <div className="space-y-1 text-gray-600">
            {currentSessions.slice(0, 2).map(session => (
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
                  <div>
                    {dayjs(session.endTime).format('YYYY-MM-DD hh:mm A')}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {currentSessions.length > 2 && (
            <Popover>
              <PopoverTrigger className="text-primary mt-2">
                {t('invoice.showAllLessons')}
              </PopoverTrigger>
              <PopoverContent className="h-fit overflow-y-auto">
                <div className="text-sm text-gray-700">
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
                          {dayjs(session.startTime).format(
                            'YYYY-MM-DD hh:mm A'
                          )}
                        </div>
                        <div>
                          {dayjs(session.endTime).format('YYYY-MM-DD hh:mm A')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </>
      )
    },
    [allSessions, currentStudent?.id, t]
  )
  return (
    <table className="w-full">
      <thead className="text-sm">
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 font-semibold text-gray-900">
            {t('invoice.courseItem')}
          </th>
          <th className="text-left py-3 font-semibold text-gray-900">
            {t('invoice.sessions')}
          </th>
          {!hideTotals && (
            <th className="text-right py-3 font-semibold text-gray-900">
              {t('invoice.total')}
            </th>
          )}
        </tr>
      </thead>
      <tbody className="text-sm">
        {currentClasses.map((item, index) => (
          <tr
            key={item.classId}
            className={cn(
              'border-b border-gray-100 align-top',
              index === currentClasses.length - 1 && 'border-none'
            )}
          >
            <td className="py-3">
              <div>
                <p className="font-semibold text-gray-900">{item.courseName}</p>
                {item.remark && (
                  <ClassInfoItem
                    label={item.remark}
                    icon={<RiMessageLine aria-hidden="true" />}
                    className="text-gray-600"
                  />
                )}
              </div>
            </td>
            <td className="py-3">
              {item.type !== ClassTypeEnum.subscription ? (
                <>
                  <p className="font-semibold mb-1">
                    {t('invoice.numOfSelectedLessons', {
                      count: item.sessionLength,
                    })}
                  </p>
                  <div>{renderSessions(item)}</div>
                </>
              ) : (
                <div>-</div>
              )}
            </td>
            {!hideTotals && (
              <td className="text-right font-semibold py-3">
                {formatTotalPriceInvoicePerItem(item, currency)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default SelectedCourseTable
