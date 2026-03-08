import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { CgPlayListRemove } from 'react-icons/cg'

import Button from '../../../components/Buttons/Button'
import IconButton from '../../../components/Buttons/IconButton'
import Box from '../../../components/Containers/Box'
import { TextInput } from '../../../components/Inputs/TextInput'
import { BundleTable } from '../../../types/bundleDiscounts'
import { getCurrencySymbol } from '../../../utils/currency'

const BundleTableComponent = ({
  table,
  isEditable,
  currency,
  handleChange,
}: {
  table: BundleTable
  isEditable?: boolean
  currency?: string
  handleChange?: (e: BundleTable) => any
}): JSX.Element => {
  const { t } = useTranslation()

  const [currentBundleTable, setCurrentBundleTable] =
    useState<BundleTable>(table)

  useEffect(() => {
    setCurrentBundleTable(table)
  }, [table])

  const handleCellChange = (
    e: number,
    type: 'amount' | 'discount',
    index: number
  ) => {
    if (type === 'amount') {
      currentBundleTable[index].amount = e
    } else {
      currentBundleTable[index].discount = e
    }

    setCurrentBundleTable(currentBundleTable)
    if (handleChange) {
      handleChange(currentBundleTable)
    }
  }

  const handleDeleteCell = (index: number) => {
    setCurrentBundleTable(currentBundleTable.splice(index, 1))

    if (handleChange) {
      handleChange(currentBundleTable)
    }
  }

  return (
    <Box direction="column">
      {currentBundleTable.map((row, index) => {
        return (
          <Box
            key={`${row.amount}${index - 1}`}
            css={{
              backgroundColor: '$backgroundLayer2',
              padding: '$4',
              borderRadius: '$2',
            }}
            responsive
          >
            <TextInput
              label={t('promotion:bundles.purchaseAmount')}
              type="number"
              defaultValue={row.amount}
              onChange={e => {
                handleCellChange(parseInt(e.target.value, 10), 'amount', index)
              }}
              disabled={!isEditable}
              vertical
            />
            <TextInput
              label={`${t('promotion:bundles.discountAmount')} ${
                currency !== undefined
                  ? currency + getCurrencySymbol(currency)
                  : ''
              }`}
              type="number"
              defaultValue={row.discount}
              onChange={e => {
                handleCellChange(
                  parseInt(e.target.value, 10),
                  'discount',
                  index
                )
              }}
              disabled={!isEditable}
              vertical
            />

            {isEditable && (
              <IconButton
                plain
                size="medium"
                color="warn"
                css={{
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  opacity: 1,
                  marginLeft: 'auto',
                }}
                onClick={() => handleDeleteCell(index)}
                icon={<CgPlayListRemove />}
              />
            )}
          </Box>
        )
      })}
      {isEditable && (
        <Button
          onClick={() => {
            const lastElementAmount =
              currentBundleTable?.[currentBundleTable.length - 1]?.amount

            setCurrentBundleTable([
              ...currentBundleTable,
              {
                amount: lastElementAmount ? lastElementAmount + 1 : 1,
                discount: 0,
              },
            ])
          }}
          variants="plain"
        >
          + {t('promotion:bundles.addBundleOption')}
        </Button>
      )}
    </Box>
  )
}

export default BundleTableComponent
