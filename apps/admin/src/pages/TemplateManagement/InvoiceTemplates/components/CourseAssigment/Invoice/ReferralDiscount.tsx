import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuGift } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidv4 } from 'uuid'

import { getCreditBalance } from '@/api/credit'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import {
  appliedPromotionsState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  studentListState,
} from '@/stores/studentInvoice.store'
import { DiscountType } from '@/types/coupon'
import { StudentEnrolmentRecord } from '@/types/student'
import {
  AppliedPromotion,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

const ReferralDiscount = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const { currentSchool } = useSchoolData()
  const currentSchoolId = currentSchool?.id ?? 0
  const { currentSite } = useSiteData()
  const currency = currentSite?.currency ?? DEFAULT_CURRENCY
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const [appliedPromotions, setAppliedPromotions] = useRecoilState(
    appliedPromotionsState
  )
  const isCombined = useMemo(() => {
    return invoiceCampaign?.isCombined ?? false
  }, [invoiceCampaign])
  const currentParent = useRecoilValue(currentActiveParentState)
  const currentStudent = useRecoilValue(currentActiveStudentState)
  const selectedParentsOfStudent = useMemo(() => {
    if (isCombined) {
      return [currentParent?.id ?? 0]
    }
    return [currentStudent?.childOfUserAliasId ?? currentStudent?.id ?? 0]
  }, [
    isCombined,
    currentParent?.id,
    currentStudent?.childOfUserAliasId,
    currentStudent?.id,
  ])
  const students = useRecoilValue(studentListState)
  const eligibleParents = useMemo(() => {
    if (Array.isArray(students) && students.length > 0) {
      return (students as StudentEnrolmentRecord[]).filter(student =>
        selectedParentsOfStudent.includes(student.id)
      ) as StudentEnrolmentRecord[]
    }
    return []
  }, [students, selectedParentsOfStudent])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [parentBalanceMap, setParentBalanceMap] = useState<
    Record<number, number>
  >({})
  const [referralDiscountForm, setReferralDiscountForm] = useState({
    parentId: currentParent?.id?.toString() ?? '',
    studentDiscount: 0,
    discountType: DiscountType.FIXED_AMOUNT,
    parentCredit: 0,
  })
  const selectedParent = useMemo(() => {
    if (isCombined) {
      return currentParent
    }
    return eligibleParents.find(
      parent => referralDiscountForm.parentId === parent.id?.toString()
    )
  }, [
    eligibleParents,
    referralDiscountForm.parentId,
    currentParent,
    isCombined,
  ])
  const isValidForm = useMemo(() => {
    return (
      referralDiscountForm.parentId !== '' &&
      referralDiscountForm.studentDiscount >= 0 &&
      !!referralDiscountForm.discountType &&
      referralDiscountForm.parentCredit > 0
    )
  }, [referralDiscountForm])
  const existingReferral = useMemo(() => {
    const referral = appliedPromotions.find(
      promo =>
        promo.type === PromotionTypeItem.REFERRAL &&
        promo.parentId === currentParent?.id
    )
    if (!isCombined) {
      return appliedPromotions.find(
        promo =>
          promo.studentId === currentStudent?.id &&
          promo.type === PromotionTypeItem.REFERRAL
      )
    }
    return referral
  }, [appliedPromotions, isCombined, currentParent, currentStudent])
  useEffect(() => {
    if (existingReferral) {
      setReferralDiscountForm(prev => ({
        ...prev,
        studentDiscount: existingReferral.amount,
        parentCredit: existingReferral.parentCredit ?? 0,
      }))
      setIsCollapsed(true)
    }
  }, [existingReferral])
  const handleApplyReferralDiscount = useCallback(() => {
    if (!isValidForm) {
      return
    }
    setAppliedPromotions(prev => {
      const lastApplied = [...prev].sort((a, b) => b.order - a.order).at(0)
      if (existingReferral) {
        return [
          ...prev.filter(promo => promo.id !== existingReferral.id),
          {
            ...existingReferral,
            discountType: referralDiscountForm.discountType,
            amount: referralDiscountForm.studentDiscount,
            parentCredit: referralDiscountForm.parentCredit,
          },
        ]
      }
      const newAppliedReferral: AppliedPromotion = {
        id: uuidv4(),
        name: 'Referral Discount',
        feeType: 'deduct',
        discountType: referralDiscountForm.discountType,
        amount: referralDiscountForm.studentDiscount,
        order: lastApplied ? lastApplied?.order + 1 : 1,
        type: PromotionTypeItem.REFERRAL,
        parentCredit: referralDiscountForm.parentCredit,
        studentId: !isCombined ? currentStudent?.id : undefined,
        parentId: selectedParent?.id ?? undefined,
      }
      return [...prev, newAppliedReferral]
    })
  }, [
    isValidForm,
    referralDiscountForm.discountType,
    referralDiscountForm.parentCredit,
    referralDiscountForm.studentDiscount,
    setAppliedPromotions,
    selectedParent,
    currentStudent,
    isCombined,
    existingReferral,
  ])
  const fetchCreditBalance = useCallback(async () => {
    const fetchPromises = eligibleParents.map(async parent => {
      const response = await getCreditBalance(currentSchoolId, parent.id)
      return { parentId: parent.id, balance: response }
    })
    const results = await Promise.all(fetchPromises)
    setParentBalanceMap(
      results.reduce((acc, curr) => {
        acc[curr.parentId] = curr.balance
        return acc
      }, {} as Record<number, number>)
    )
  }, [currentSchoolId, eligibleParents])
  useEffect(() => {
    fetchCreditBalance()
  }, [fetchCreditBalance])
  return (
    <div className="p-4 mt-4 border-t border-gray-300">
      <div
        className={cn(
          'flex items-center justify-between',
          isCollapsed && 'mb-4'
        )}
      >
        <div className="font-medium">
          {t('invoice.discount.referralDiscount')}
        </div>
        <Button
          variant={isCollapsed ? 'outline' : 'primary-outline'}
          onClick={() => setIsCollapsed(!isCollapsed)}
          type="button"
        >
          {!isCollapsed
            ? t('invoice.discount.addButton')
            : t('common:action.cancel')}
        </Button>
      </div>
      {isCollapsed && (
        <div className="flex flex-col gap-2">
          <Label>{t('invoice.discount.selectReferringParent')}</Label>
          <div className="flex">
            <Select
              value={referralDiscountForm.parentId}
              onValueChange={e =>
                setReferralDiscountForm({
                  ...referralDiscountForm,
                  parentId: e,
                })
              }
            >
              <SelectTrigger className="w-full border-gray-300 rounded-lg text-gray-500">
                <SelectValue
                  defaultValue={currentParent?.id?.toString() ?? ''}
                  placeholder={t('invoice.discount.selectReferringParent')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {eligibleParents?.map(parent => (
                    <SelectItem
                      key={`parent-${parent.id}`}
                      value={parent.id.toString()}
                    >
                      {parent.name} -
                      {parentBalanceMap[parent.id] >= 0 &&
                        t('invoice.discount.creditBalanceParent', {
                          currency,
                          creditBalance: parentBalanceMap[parent.id],
                        })}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-end gap-x-2">
            <div className="w-full space-y-2">
              <Label>{t('invoice.discount.studentDiscount')}</Label>
              <Input
                className="w-full"
                value={referralDiscountForm.studentDiscount}
                onChange={e =>
                  setReferralDiscountForm({
                    ...referralDiscountForm,
                    studentDiscount: Number(e.target.value),
                  })
                }
                type="number"
                min={0}
                placeholder={t('invoice.discount.amountPlaceholder').toString()}
              />
            </div>
            <div className="w-full sm:w-2/12">
              <Select
                value={referralDiscountForm.discountType}
                onValueChange={e =>
                  setReferralDiscountForm({
                    ...referralDiscountForm,
                    discountType: e as DiscountType,
                  })
                }
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
            <div className="w-full sm:w-4/12 space-y-2">
              <Label>{t('invoice.discount.parentCredit')}</Label>
              <Input
                prefixText="$ "
                min={0}
                value={referralDiscountForm.parentCredit}
                onChange={e =>
                  setReferralDiscountForm({
                    ...referralDiscountForm,
                    parentCredit: Number(e.target.value),
                  })
                }
                type="number"
                placeholder={t('invoice.discount.amountPlaceholder').toString()}
              />
            </div>
          </div>
          <div className="border border-blue-300 bg-blue-200/90 p-4 rounded-md shadow-sm text-blue-900 mt-2">
            <div className="flex items-center gap-x-2 mb-4">
              <LuGift />
              <span className="font-bold">
                {t('invoice.discount.referralPreview')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="">
                <span className="font-bold">
                  {t('invoice.discount.studentsGets')}:
                </span>{' '}
                {referralDiscountForm.discountType === DiscountType.PERCENTAGE
                  ? `${referralDiscountForm.studentDiscount}% off`
                  : `${formatCurrency(
                      referralDiscountForm.studentDiscount,
                      currency
                    )} off`}
              </div>
              <div className="">
                <span className="font-bold">
                  {t('invoice.discount.parentsGets')}:
                </span>{' '}
                +{formatCurrency(referralDiscountForm.parentCredit, currency)}{' '}
                {t('invoice.discount.creditBalance')}
              </div>

              <div className="">
                <span className="font-bold">
                  {t('invoice.discount.referringParent')}:
                </span>{' '}
                {selectedParent?.name}
              </div>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleApplyReferralDiscount}
            className="mt-4"
            disabled={!isValidForm}
          >
            {existingReferral
              ? t('invoice.discount.updateReferralDiscount')
              : t('invoice.discount.applyReferralDiscount')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReferralDiscount
