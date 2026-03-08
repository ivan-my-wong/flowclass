import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidv4 } from 'uuid'

import SwitchOptions from '@/components/SwitchOptions/SwitchOptions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
} from '@/stores/studentInvoice.store'
import {
  AppliedPromotion,
  InvoiceCampaignDetailDto,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'

import { useContextInvoiceEditDialog } from './EditInvoiceContext'

const defaultManualDiscount: AppliedPromotion = {
  id: uuidv4(),
  name: '',
  type: PromotionTypeItem.MANUAL,
  discountType: 'fixedAmount',
  amount: 0,
  order: 0,
  feeType: 'deduct',
}

const ManualDiscountForm = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const [invoiceCampaign, setInvoiceCampaign] =
    useRecoilState(invoiceCampaignState)
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const { appliedPromotions, setAppliedPromotions, calculatedDiscount } =
    useContextInvoiceEditDialog()
  const appliedManualDiscount = useMemo(() => {
    return (appliedPromotions || []).find(
      item => item.type === PromotionTypeItem.MANUAL
    )
  }, [appliedPromotions])
  const [manualDiscountForm, setManualDiscountForm] =
    useState<AppliedPromotion>(appliedManualDiscount || defaultManualDiscount)

  const updateManDiscount = (key: string, value: string | number) => {
    const newManDiscount = { ...manualDiscountForm }
    newManDiscount[key] = value
    if (key === 'discountType') {
      newManDiscount.amount = 0
    }
    setManualDiscountForm(newManDiscount)
  }

  const isDisabledBtnAdd = useMemo(() => {
    if (appliedManualDiscount) {
      return true
    }
    const { amount, name } = manualDiscountForm
    return amount <= 0 || name === ''
  }, [appliedManualDiscount, manualDiscountForm])

  const updateAppliedPromotion = () => {
    if (!currentActiveStudent) return
    setAppliedPromotions(prev => [
      ...prev,
      {
        ...manualDiscountForm,
        studentId: currentActiveStudent?.id,
        parentId:
          invoiceCampaign?.isCombined && currentActiveParent
            ? currentActiveParent?.id
            : null,
      },
    ])
    setManualDiscountForm(defaultManualDiscount)
    setInvoiceCampaign(prev => {
      if (!prev) return null
      if (prev.isCombined) {
        return {
          ...prev,
          combinedInvoice: {
            ...prev.combinedInvoice,
            discounts: [
              ...(prev.combinedInvoice?.discounts || []),
              manualDiscountForm,
            ],
          } as InvoiceCampaignDetailDto,
        }
      }
      return prev
    })
  }

  const onChangeFeeType = (event: string) => {
    const newForm = { ...defaultManualDiscount, feeType: event }
    setManualDiscountForm(newForm)
  }

  return (
    <div className="px-4">
      <SwitchOptions
        width={200}
        options={[
          { label: t('invoice.discount.switch.deductFee'), value: 'deduct' },
          { label: t('invoice.discount.switch.addFee'), value: 'add' },
        ]}
        onChange={onChangeFeeType}
      />
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
        <div className="w-full sm:w-6/12">
          <Input
            value={manualDiscountForm.name}
            className="w-full border-gray-300"
            placeholder={t(
              `invoice.discount.${
                manualDiscountForm.feeType === 'add'
                  ? 'addFeePlaceholder'
                  : 'discountNamePlaceholder'
              }`
            ).toString()}
            onChange={e => updateManDiscount('name', e.target.value)}
          />
        </div>
        <div className="w-full sm:w-2/12">
          <Select
            value={manualDiscountForm.discountType}
            onValueChange={e => updateManDiscount('discountType', e)}
          >
            <SelectTrigger className="w-full border-gray-300 rounded-lg text-gray-500">
              <SelectValue
                placeholder={t(
                  'invoice.discount.selectDiscountTypePlaceholder'
                ).toString()}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="fixedAmount">$</SelectItem>
                <SelectItem value="percentage">%</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-3/12">
          <Input
            value={manualDiscountForm.amount}
            className="w-full border-gray-300"
            placeholder={t('invoice.discount.amountPlaceholder').toString()}
            onChange={e => {
              const raw = e.target.value
              if (raw === '') {
                updateManDiscount('amount', 0)
                return
              }
              const num = Number(raw)
              if (!Number.isFinite(num)) return
              let clamped = 0
              if (manualDiscountForm.discountType === 'percentage') {
                clamped = Math.min(Math.max(num, 1), 100)
              } else {
                const cap = Math.max(
                  0,
                  calculatedDiscount?.priceAfterDiscount ?? 0
                )
                clamped = Math.min(Math.max(num, 0), cap)
              }
              updateManDiscount('amount', clamped)
            }}
          />
        </div>
        <Button
          className="w-full sm:w-1/12"
          disabled={isDisabledBtnAdd}
          onClick={updateAppliedPromotion}
        >
          {t('invoice.discount.addButton')}
        </Button>
      </div>
    </div>
  )
}

export default ManualDiscountForm
