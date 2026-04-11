import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoMdAdd } from 'react-icons/io'
import { LuCalculator, LuCheck, LuMapPin, LuUser2 } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import { Classes } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { PriceOption } from '@/types/regularClass'
import { InvoiceStudent } from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

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
  const siteData = useSiteData()
  const price = useMemo(() => {
    const values = {
      priceLabel: t('courseAssignment.free'),
      priceTypeLabel: '',
    }
    if (!classItem?.priceOptions) return values

    const { priceType, priceOptions } = classItem
    if (classItem.priceType === PriceType.MULTIPLE_OPTIONS) {
      values.priceLabel = formatPrice(priceOptions)
    } else {
      const { amount } = classItem.priceOptions[0]
      if (amount) {
        values.priceLabel = formatCurrency(Number(amount), siteData.currency)
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
  }, [classItem, formatPrice, siteData.currency, t])

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
          <Badge className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {classItem.type}
          </Badge>
        </div>
        <span className="text-xs text-gray-500 mt-1">ID: {classItem.id}</span>
        <p className="text-sm">{classItem.course?.name}</p>
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
            {price.priceTypeLabel && (
              <ClassInfoItem
                label={price.priceTypeLabel}
                icon={<LuCalculator aria-hidden="true" focusable="false" />}
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
