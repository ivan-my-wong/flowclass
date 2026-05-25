import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaGraduationCap, FaRegCreditCard } from 'react-icons/fa'

import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Inputs/Input'
import TextArea from '@/components/ui/TextArea'
import useCourseData from '@/hooks/useCourseData'
import useCredit from '@/hooks/useCredit'
import useSiteData from '@/hooks/useSiteData'
import { OptionProps } from '@/types/courseSelector.type'
import { CreditSourceType, CreditTransactionType } from '@/types/credit'
import { PriceOption } from '@/types/regularClass'
import { convertCreditToCurrency } from '@/utils/credit'

type AddOrDeductCreditModalProps = {
  userAliasId: number
  transactionType: CreditTransactionType
  refetchCreditHistory: () => void
}

export type AddOrDeductCreditModalHandle = {
  handleOpenChange: () => void
  openWithPreset: (amount: number, description: string) => void
}

const AddOrDeductCreditModal = forwardRef<
  AddOrDeductCreditModalHandle,
  AddOrDeductCreditModalProps
>(({ userAliasId, transactionType, refetchCreditHistory }, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [numberOfLessons, setNumberOfLessons] = useState(1)
  const [mode, setMode] = useState<'class' | 'manual'>('class')
  const [selectedClass, setSelectedClass] = useState<OptionProps>()

  const { t } = useTranslation()

  const { currency } = useSiteData()

  const handleOpenChange = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Reset form when opening
      setAmount(0)
      setReason('')
    }
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
    openWithPreset: (presetAmt: number, description: string) => {
      setMode('manual')
      setAmount(presetAmt)
      setReason(description)
      setIsOpen(true)
    },
  }))

  const {
    useGetCreditBalance,
    useAddCredit,
    useDeductCredit,
    useGetCreditSettings,
  } = useCredit()
  const { data: creditSettings } = useGetCreditSettings()
  const { data: creditBalance, refetch: refetchCreditBalance } =
    useGetCreditBalance(userAliasId, isOpen)
  const { mutateAsync: handleAdd, isLoading: isAddLoading } = useAddCredit()
  const { mutateAsync: handleDeduct, isLoading: isDeductLoading } =
    useDeductCredit()

  const { courseData, getFilteredCourseOptions } = useCourseData()

  const options = getFilteredCourseOptions()

  const isAdded = transactionType === CreditTransactionType.ADDED

  const classAmount = useMemo(() => {
    if (mode === 'class' && selectedClass) {
      let credits = 0

      courseData?.courses?.forEach(course => {
        const check = course?.classes?.find(cls => {
          return cls.id === Number(selectedClass.value)
        })

        if (check) {
          const priceOption = JSON.parse(JSON.stringify(check.priceOptions))
            ?.map((o: PriceOption) => ({
              ...o,
              amount: Number(o.amount) / (o.numberOfLessons ?? 1),
            }))
            ?.sort((a: PriceOption, b: PriceOption) => {
              return (
                Number(a.numberOfLessons ?? 0) - Number(b.numberOfLessons ?? 0)
              )
            })?.[0]

          credits = priceOption ? Number(priceOption.amount) : 0
        }
      })

      return credits
    }
    return 0
  }, [mode, selectedClass, courseData])

  const finalAmount = mode === 'class' ? classAmount * numberOfLessons : amount

  const newBalance = isAdded
    ? (creditBalance ?? 0) + (finalAmount || 0)
    : (creditBalance ?? 0) - (finalAmount || 0)

  const maxNumberOfLessons = Math.floor((creditBalance ?? 0) / classAmount)

  const isDisabled = !finalAmount || !reason
  const isLoading = isAddLoading || isDeductLoading

  const handleSubmit = async () => {
    if (isDisabled) return

    const data = {
      userAliasId,
      amount: finalAmount,
      sourceType: CreditSourceType.ADMIN_ADJUSTMENT,
      description: reason,
    }

    try {
      if (isAdded) {
        await handleAdd(data)
      } else {
        await handleDeduct(data)
      }

      // Reset form state but don't close modal
      refetchCreditBalance()
      refetchCreditHistory()
      handleCancel()
    } catch (error) {
      // Error will be handled by the mutation error handler
    }
  }

  const handleCancel = (nextMode?: 'class' | 'manual') => {
    // Reset form state and close this modal
    setAmount(0)
    setReason('')
    if (!nextMode) setIsOpen(false)
    setMode(nextMode ?? 'manual')
    setNumberOfLessons(1)
    setSelectedClass(undefined)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-4">
        <div className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold">
            {t(`student:credit.actions.${isAdded ? 'add' : 'deduct'}`)}
          </DialogTitle>
          <DialogClose />
        </div>

        <div className="flex gap-3">
          <Button
            variant={mode === 'class' ? 'default' : 'disabled'}
            iconBefore={<FaGraduationCap />}
            className="flex-1"
            onClick={() => handleCancel('class')}
          >
            {t('student:credit.actions.byClass')}
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'disabled'}
            iconBefore={<FaRegCreditCard />}
            className="flex-1"
            onClick={() => handleCancel('manual')}
          >
            {t('student:credit.actions.manual')}
          </Button>
        </div>

        <div className="mt-2 space-y-4">
          {/* Current Balance Display */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              {t('student:credit.balance.title')}
            </div>
            <div className="flex gap-3 border border-gray-200 p-3 rounded-lg bg-gray-50">
              <div className="text-green-600 font-medium">
                {creditBalance ?? 0} {t('student:credit.balance.credits')}
              </div>
              <div className="text-gray-500 text-sm">
                {`(${convertCreditToCurrency(
                  currency,
                  creditBalance ?? 0,
                  creditSettings?.conversionRate
                )})`}
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            {mode === 'manual' && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {t(
                    isAdded
                      ? 'student:credit.form.addedAmount'
                      : 'student:credit.form.deductionAmount'
                  )}{' '}
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={isAdded ? undefined : creditBalance}
                  placeholder={t('student:credit.form.enterAmount') || ''}
                  value={amount}
                  onChange={e => {
                    let value = Number(e.target.value)
                    if (!isAdded && value > (creditBalance ?? 0)) {
                      value = creditBalance ?? 0
                    }
                    setAmount(value)
                  }}
                />
              </div>
            )}

            {mode === 'class' && (
              <>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {t('student:credit.form.selectClass')}
                    <span className="text-red-500">*</span>
                  </div>
                  <CourseAndClassSelector
                    id="filter-class-selector"
                    hideSelectAll
                    isMulti={false}
                    options={options}
                    value={[...(selectedClass ? [selectedClass] : [])]}
                    onChange={value => {
                      const first = Array.isArray(value) ? value[0] : value
                      setSelectedClass(first)
                      setNumberOfLessons(1)
                    }}
                    width="100%"
                  />
                </div>
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {t('student:credit.form.numberOfLessons')}
                    <span className="text-red-500">*</span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={isAdded ? undefined : maxNumberOfLessons}
                    value={numberOfLessons}
                    onChange={e => {
                      let value = Number(e.target.value)
                      if (!isAdded && value > maxNumberOfLessons) {
                        value = maxNumberOfLessons
                      }
                      setNumberOfLessons(value)
                    }}
                  />
                </div>
                <div
                  className={[
                    'mt-4 text-sm border rounded-md p-2',
                    isAdded ? 'bg-green-100' : 'bg-red-100',
                  ].join(' ')}
                  hidden={!selectedClass}
                >
                  <div className="font-bold">
                    {t('student:credit.form.creditsCalculations')}:
                  </div>
                  <div className="flex gap-1">
                    <div>
                      {t('student:credit.form.calculationsCredit', {
                        credits: classAmount,
                        numberOfLessons,
                      })}{' '}
                      =
                    </div>
                    <div className="font-bold">
                      {t('student:credit.form.resultsCredits', {
                        credits: finalAmount,
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isAdded && (
              <div className="mt-2 text-xs text-gray-500">
                {t('student:credit.form.maximumReduction', {
                  amount: creditBalance,
                })}
              </div>
            )}
            <div className="mt-2 text-sm">
              {t('student:credit.balance.new', { amount: newBalance })}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              {t(
                isAdded
                  ? 'student:credit.form.reasonForAddition'
                  : 'student:credit.form.reasonForDeduction'
              )}{' '}
              <span className="text-red-500">*</span>
            </div>
            <TextArea
              rows={3}
              placeholder={t('student:credit.form.enterReason') || ''}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleCancel()}
            >
              {t('student:credit.form.cancel')}
            </Button>
            <Button
              variant={isAdded ? 'default' : 'destructive'}
              className={`flex-1 ${
                isAdded
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              disabled={isDisabled || isLoading}
              onClick={handleSubmit}
              loading={isLoading}
            >
              {t(
                `student:credit.actions.${
                  isAdded ? 'addCredits' : 'deductCredits'
                }`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default AddOrDeductCreditModal
