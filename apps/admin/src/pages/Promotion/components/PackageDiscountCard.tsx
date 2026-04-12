import { EyeOpenIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import IconButton from '@/components/Buttons/IconButton'
import { PackageDiscount } from '@/types/packageDiscounts'
import { formatCurrency } from '@/utils/currency'

const Badge = ({ label, className }: { label: string; className?: string }) => (
  <span
    className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', className)}
  >
    {label}
  </span>
)

const PackageDiscountCard = ({
  packageDiscount,
  currency = 'HK$',
  onEdit,
  onDelete,
  onDetail,
}: {
  packageDiscount: PackageDiscount
  currency?: string
  onEdit?: () => void
  onDelete?: () => void
  onDetail?: () => void
}): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {packageDiscount.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(packageDiscount.amountPerLesson, currency)}{' '}
            {t('promotion:packageDiscount.perLesson')}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge
            label={
              packageDiscount.isActive
                ? t('common:status.active')
                : t('common:status.inactive')
            }
            className={
              packageDiscount.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-500">
            {t('promotion:packageDiscount.applicableTo')}:
          </span>
          <span className="ml-1 font-medium">
            {packageDiscount.isAllClasses
              ? t('promotion:packageDiscount.allClasses')
              : `${packageDiscount.applicableClassIds?.length ?? 0} ${t(
                  'promotion:packageDiscount.classes'
                )}`}
          </span>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onDetail && (
          <IconButton
            icon={<EyeOpenIcon />}
            onClick={onDetail}
            title={t('common:action.viewDetail') as string}
          />
        )}
        {onEdit && (
          <IconButton
            icon={<Pencil1Icon />}
            onClick={onEdit}
            title={t('common:action.edit') as string}
          />
        )}
        {onDelete && (
          <IconButton
            icon={<TrashIcon />}
            onClick={onDelete}
            title={t('common:action.delete') as string}
          />
        )}
      </div>
    </div>
  )
}

export default PackageDiscountCard
