import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaCaretRight, FaRegClock, FaRegTrashAlt } from 'react-icons/fa'
import { FiEdit, FiMessageSquare } from 'react-icons/fi'
import { LuCircleDollarSign } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { Input } from '@/components/ui/Inputs/Input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import useSiteData from '@/hooks/useSiteData'
import { invoiceSessionState } from '@/stores/studentInvoice.store'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { InvoiceClassType } from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'

import ClassInfoItem from '../Course/ClassInfoItem'

interface Props {
  courseItem: InvoiceClassType
  onRemoveClass: () => void
  onRemarkChange: (remark: string) => void
}
const SelectedInvoiceCourse: React.FC<Props> = ({
  courseItem,
  onRemoveClass,
  onRemarkChange,
}): JSX.Element => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('documentId')

  const siteData = useSiteData()
  const { t } = useTranslation(['invoiceCampaign'])
  const allInvoiceSessions = useRecoilValue(invoiceSessionState)

  const sessionList = useMemo(() => {
    return allInvoiceSessions.filter(
      item =>
        item?.studentItem?.id === courseItem.studentItem.id &&
        item.classItem?.classId === courseItem.classId
    )
  }, [allInvoiceSessions, courseItem.classId, courseItem.studentItem.id])

  const priceLabel = useMemo(() => {
    const { price, sessionLength, priceType } = courseItem
    const multiplier =
      priceType === PriceType.PER_LESSON ||
      priceType === PriceType.MULTIPLE_OPTIONS
        ? sessionLength || 0
        : 1
    return formatCurrency(Number(price) * multiplier, siteData.currency)
  }, [courseItem, siteData.currency])

  const sessionLabel = useMemo(() => {
    if (!courseItem || courseItem.sessionLength === 0) return ''
    if (courseItem.sessionLength === 1) return t('editor.oneSession')
    return t('editor.countSessions', { count: courseItem.sessionLength })
  }, [courseItem, t])

  const onEditClassLessons = () => {
    const extra = documentId ? `&documentId=${documentId}` : ''
    navigate(
      `/invoice-templates/editor/${courseItem.classId}/select-lessons?edit${extra}`
    )
  }
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">
            {courseItem.courseName}
          </h4>
          <div className="flex items-start xl:items-center  gap-2 flex-col xl:flex-row">
            {courseItem.type !== ClassTypeEnum.subscription && (
              <ClassInfoItem icon={<FaRegClock />} label={sessionLabel} />
            )}
            <ClassInfoItem icon={<LuCircleDollarSign />} label={priceLabel} />
            {/* {courseItem.type === ClassTypeEnum.subscription && firstSession && (
              <ClassInfoItem
                icon={<FaRegClock />}
                label={`${dayjs(firstSession.startTime).format(
                  'YYYY/MM/DD'
                )} - ${dayjs(firstSession.endTime).format('YYYY/MM/DD')}`}
              />
            )} */}
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          {courseItem.type !== ClassTypeEnum.subscription && (
            <FiEdit
              className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
              onClick={onEditClassLessons}
            />
          )}
          <FaRegTrashAlt
            className="text-red-500 hover:text-red-700 cursor-pointer transition-colors"
            onClick={() => onRemoveClass()}
          />
        </div>
      </div>
      <div
        className="text-sm text-gray-500 mb-1"
        hidden={courseItem.type === ClassTypeEnum.subscription}
      >
        <div>{t('editor.selectedLessons')}</div>
        <div className="space-y-1">
          {sessionList.slice(0, 3).map(sessionItem => (
            <div
              key={`${sessionItem.studentItem?.id}-${sessionItem.classItem?.classId}-${sessionItem.id}`}
            >
              <div className="flex items-start gap-2">
                <FaCaretRight
                  className="mt-1"
                  aria-hidden="true"
                  focusable="false"
                />
                <div>
                  <div>
                    {dayjs(sessionItem.startTime).format('YYYY-MM-DD hh:mm A')}
                  </div>
                  {/* <div>
                    {dayjs(sessionItem.endTime).format('YYYY-MM-DD hh:mm A')}
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sessionList.length > 3 && (
          <Popover>
            <PopoverTrigger>
              <div className="text-primary my-1">
                {t('invoice.showAllLessons')}
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2 text-sm text-gray-700 h-[250px] overflow-y-auto">
                {sessionList.map(sessionItem => (
                  <div
                    key={`${sessionItem.studentItem?.id}-${sessionItem.classItem?.classId}-${sessionItem.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <FaCaretRight
                        className="mt-1"
                        aria-hidden="true"
                        focusable="false"
                      />
                      <div>
                        <div>
                          {dayjs(sessionItem.startTime).format(
                            'YYYY-MM-DD hh:mm A'
                          )}
                        </div>
                        <div>
                          {dayjs(sessionItem.endTime).format(
                            'YYYY-MM-DD hh:mm A'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {/* <div className="space-y-2">
        <ClassInfoItem
          icon={<FiMessageSquare />}
          label={t('invoice.invoiceRemark.title')}
        />
        <Input
          value={courseItem.remark}
          onChange={e => onRemarkChange(e.target.value)}
          className="border-gray-200"
          placeholder={t('invoice.invoiceRemark.placeholder') as string}
        />
      </div> */}
    </div>
  )
}

export default SelectedInvoiceCourse
