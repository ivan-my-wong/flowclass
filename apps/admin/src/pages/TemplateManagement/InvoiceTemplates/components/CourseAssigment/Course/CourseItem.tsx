import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoMdAdd } from 'react-icons/io'
import {
  LuCalculator,
  LuCheck,
  LuClock,
  LuMapPin,
  LuUser2,
} from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import { Classes } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { PriceOption } from '@/types/regularClass'
import { InvoiceStudent } from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'
import dayjs from '@/utils/dayjs'

import ClassInfoItem from './ClassInfoItem'

type Props = {
  isAssigned: boolean
  classItem: Classes
  currentActiveStudent: InvoiceStudent | null
}
const CourseItem = ({
  classItem,
  currentActiveStudent,
  isAssigned,
}: Props): JSX.Element => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation('invoiceCampaign')
  const { currency } = useSiteData()
  const formatMultiOptionPrice = useCallback(
    (options: PriceOption[]): string => {
      const amounts = options
        .filter(option => !option.isFreeOfCharge)
        .map(option => Number(option.amount))
        .filter(amount => !Number.isNaN(amount))

      if (amounts.length === 0) return t('courseAssignment.free')

      const min = Math.min(...amounts)
      const max = Math.max(...amounts)
      return min === max
        ? formatCurrency(min, currency)
        : `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
    },
    [currency, t]
  )

  const price = useMemo(() => {
    const values = {
      priceLabel: t('courseAssignment.free'),
      priceTypeLabel: '',
    }
    if (!classItem?.priceOptions) return values

    const { priceType, priceOptions } = classItem
    if (classItem.priceType === PriceType.MULTIPLE_OPTIONS) {
      values.priceLabel = formatMultiOptionPrice(priceOptions)
    } else {
      const { amount } = classItem.priceOptions[0]
      if (amount) {
        values.priceLabel = formatCurrency(Number(amount), currency)
      }
    }
    switch (priceType) {
      case PriceType.PER_LESSON:
        values.priceTypeLabel = t('courseAssignment.pricePerSession')
        break
      case PriceType.PER_CLASS:
        values.priceTypeLabel = t('courseAssignment.pricePerClass')
        break
      case PriceType.MULTIPLE_OPTIONS:
        values.priceTypeLabel = t('courseAssignment.multiplePrices')
        break
      default:
        values.priceTypeLabel = ''
        break
    }
    return values
  }, [classItem, formatMultiOptionPrice, currency, t])

  return (
    <div
      className={cn(
        'relative border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-start justify-between',
        isAssigned && 'border-green-500 bg-green-50 hover:bg-green-50'
      )}
    >
      <div className="box-col-full items-start">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold text-gray-900">
            {classItem.name}
          </h4>
        </div>
        <p className="text-sm">{classItem.course?.name}</p>
        <span className="text-xs text-gray-500 mt-1">ID: {classItem.id}</span>
        {(classItem?.locationRoom ||
          classItem.instructor ||
          price.priceTypeLabel) && (
          <div className="flex items-center text-gray-500 gap-3">
            {classItem.locationRoom && (
              <ClassInfoItem
                label={classItem.locationRoom?.name}
                icon={<LuMapPin aria-hidden="true" focusable="false" />}
              />
            )}
            {classItem.instructor?.fullName && (
              <ClassInfoItem
                label={classItem.instructor?.fullName}
                icon={<LuUser2 aria-hidden="true" focusable="false" />}
              />
            )}
          </div>
        )}
      </div>
      <div className="text-right w-fit shrink-0">
        <div className="text-lg font-bold mb-3">{price.priceLabel}</div>
        {currentActiveStudent && !isAssigned ? (
          <Button
            iconBefore={<IoMdAdd aria-hidden="true" focusable="false" />}
            onClick={() => {
              const base =
                classItem.type !== ClassTypeEnum.subscription
                  ? `/invoice-templates/editor/${classItem.id}/select-lessons`
                  : `/invoice-templates/editor/${classItem.id}/add-subscription-class`
              const docId = searchParams.get('documentId')
              navigate(docId ? `${base}?documentId=${docId}` : base)
            }}
          >
            {t('editor.addCourse')}
          </Button>
        ) : (
          <p className="text-sm text-gray-500">
            {t('courseAssignment.pleaseSelectStudent')}
          </p>
        )}
      </div>
      {isAssigned && (
        <div className="absolute top-[-10px] right-3 ">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
            <LuCheck size={12} aria-hidden="true" focusable="false" />
            {t('courseAssignment.assigned')}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseItem
