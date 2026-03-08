import { useEffect, useState } from 'react'

import {
  CalendarIcon,
  EyeOpenIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Buttons/Button'

import IconButton from '../../../components/Buttons/IconButton'
import { BundleDiscount, BundleTable } from '../../../types/bundleDiscounts'
import { DiscountType } from '../../../types/coupon'

const Badge = ({ label, className }: { label: string; className?: string }) => (
  <span
    className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', className)}
  >
    {label}
  </span>
)

const BundleCard = ({
  bundleDiscounts,
  // bundleTable,
  isEditable,
  currency = 'HK$',
  handleChange,
  onEdit,
  onDelete,
  onDetail,
}: {
  bundleDiscounts: BundleDiscount
  // bundleTable: BundleTable
  isEditable?: boolean
  currency?: string
  handleChange?: (e: BundleTable) => any
  onEdit?: () => void
  onDelete?: () => void
  onDetail?: () => void
}): JSX.Element => {
  const { t } = useTranslation()
  // const [currentBundleTable, setCurrentBundleTable] =
  //   useState<BundleTable>(bundleTable)

  // useEffect(() => {
  //   setCurrentBundleTable(bundleTable)
  // }, [bundleTable])

  // Create bundle table from amount and minQty if bundleTable is null
  const getBundleTableData = (): BundleTable => {
    if (bundleDiscounts.bundleTable && bundleDiscounts.bundleTable.length > 0) {
      return bundleDiscounts.bundleTable
    }
    // Fallback: create from amount and minQty
    return [
      { amount: bundleDiscounts.minQty, discount: bundleDiscounts.amount },
    ]
  }

  const [currentBundleTable, setCurrentBundleTable] = useState<BundleTable>(
    getBundleTableData()
  )

  useEffect(() => {
    setCurrentBundleTable(getBundleTableData())
  }, [
    bundleDiscounts.bundleTable,
    bundleDiscounts.amount,
    bundleDiscounts.minQty,
  ])

  const handleCellChange = (
    e: number,
    type: 'amount' | 'discount',
    index: number
  ) => {
    const updated = [...currentBundleTable]
    if (type === 'amount') {
      updated[index] = { ...updated[index], amount: e }
    } else {
      updated[index] = { ...updated[index], discount: e }
    }

    setCurrentBundleTable(updated)

    handleChange?.(updated)
  }

  const handleDeleteCell = (index: number) => {
    const updated = [...currentBundleTable]
    updated.splice(index, 1)
    setCurrentBundleTable(updated)
    handleChange?.(updated)
  }

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const locale = navigator.language || 'zh-HK'
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Helper function to format discount value
  const formatDiscount = (discount: number, discountType: DiscountType) => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discount}%`
    }
    return `${currency}${discount.toLocaleString()}`
  }

  // Generate bundle description
  const getBundleDescription = () => {
    // Use amount and minQty directly from bundleDiscounts
    return `Buy ${bundleDiscounts.minQty} Get ${formatDiscount(
      bundleDiscounts.amount,
      bundleDiscounts.discountType
    )} Off`
  }

  const normalizeDiscountType = (discountType: DiscountType) => {
    if (discountType === DiscountType.PERCENTAGE) {
      return t('promotion:types.percentage')
    }
    return t('promotion:types.fixedAmount')
  }

  return (
    <div className="bg-white rounded-xl border px-6 py-4 shadow-sm w-full space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-lg">{bundleDiscounts.name}</h3>
          <p className="text-sm text-muted-foreground">
            {getBundleDescription()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {bundleDiscounts.isAutoApply && (
            <Badge
              label={t('promotion:bundleDiscount.form.autoApply')}
              className="bg-blue-100 text-blue-800"
            />
          )}
          {bundleDiscounts.isRetroactive && (
            <Badge
              label={t('promotion:bundleDiscount.form.retroactive')}
              className="bg-purple-100 text-purple-800"
            />
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">
            {t('promotion:bundleDiscount.form.discountType')}
          </p>
          <p className="font-medium capitalize">
            {normalizeDiscountType(bundleDiscounts.discountType)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {t('promotion:bundleDiscount.form.minimumQty')}
          </p>
          <p className="font-medium">{bundleDiscounts.minQty}</p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {t('promotion:bundleDiscount.form.discountAmount')}
          </p>
          <p className="font-medium">
            {formatDiscount(
              bundleDiscounts.amount,
              bundleDiscounts.discountType
            )}
          </p>
        </div>
      </div>

      {isEditable && (
        <div className="pt-2">
          <Button
            onClick={() => {
              const lastAmount =
                currentBundleTable[currentBundleTable.length - 1]?.amount ?? 0
              const newTier = { amount: lastAmount + 1, discount: 0 }
              const updatedTable = [...currentBundleTable, newTier]
              setCurrentBundleTable(updatedTable)
              handleChange?.(updatedTable)
            }}
            variants="plain"
          >
            + {t('promotion:bundles.addBundleOption')}
          </Button>
        </div>
      )}

      {/* Footer: Date + Actions */}
      <div className="flex justify-between items-center pt-2 text-sm text-muted-foreground border-t">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {formatDate(bundleDiscounts.startDate)} to{' '}
            {formatDate(bundleDiscounts.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* <IconButton
            plain
            icon={<EyeOpenIcon className="w-4 h-4" />}
            onClick={onDetail}
            title="View details"
            css={{
              '&:hover': {
                backgroundColor: '$blue3',
                color: '$blue11',
              },
            }}
          /> */}
          {/* <IconButton
            plain
            icon={<Pencil1Icon className="w-4 h-4" />}
            onClick={onEdit}
            title="Edit bundle"
            css={{
              '&:hover': {
                backgroundColor: '$yellow3',
                color: '$yellow11',
              },
            }}
          /> */}
          <IconButton
            plain
            icon={<TrashIcon className="w-4 h-4 text-red-500" />}
            onClick={onDelete}
            title="Delete bundle"
            css={{
              '&:hover': {
                backgroundColor: '$red3',
                '& svg': {
                  color: '$red11',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default BundleCard
