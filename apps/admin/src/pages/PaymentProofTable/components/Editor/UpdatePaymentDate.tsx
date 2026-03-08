'use client'

import { useCallback, useEffect, useState } from 'react'

import { CalendarIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuPencil } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import { Label } from '@/components/ui/Label'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import useConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSiteData from '@/hooks/useSiteData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { PaymentProofTableItem } from '@/types/enrollCourse'
import { cn } from '@/utils/cn'

interface UpdatePaymentDateProps {
  data: PaymentProofTableItem
  refetch: () => void
}

const UpdatePaymentDate = ({ data, refetch }: UpdatePaymentDateProps) => {
  const { t } = useTranslation(['student', 'common'])
  useSiteData()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const { usePaymentDateUpdate } = usePaymentEvidenceData()
  const { mutateAsync: updatePaymentDate, isLoading } = usePaymentDateUpdate()

  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  useEffect(() => {
    if (isOpen && data?.paymentDate) {
      const parsed = dayjs(data.paymentDate).toDate()
      setSelectedDate(Number.isNaN(parsed.getTime()) ? null : parsed)
    } else if (isOpen) {
      setSelectedDate(null)
    }
  }, [isOpen, data?.paymentDate])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date || null)
    setIsCalendarOpen(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!data?.id) return

    const formattedDate = selectedDate
      ? dayjs(selectedDate).format('YYYY-MM-DD')
      : null

    setConfirm({
      title: t('student:paymentProof.updatePaymentDateTitle').toString(),
      description: t(
        'student:paymentProof.updatePaymentDateDescription'
      ).toString(),
      alertType: AlertTypes.WARN,
      cancelText: t('common:action.cancel').toString(),
      confirmText: t('common:action.confirm').toString(),
      onConfirm: async () => {
        try {
          await updatePaymentDate({
            invoiceId: data.id,
            paymentDate: formattedDate ?? '',
          })
          refetch()
          setIsOpen(false)
        } catch (error) {
          console.error('Failed to update payment date:', error)
        } finally {
          closeConfirm()
        }
      },
    }).open()
  }, [
    selectedDate,
    data?.id,
    updatePaymentDate,
    refetch,
    t,
    setConfirm,
    closeConfirm,
  ])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
  }, [])

  const displayDate = data?.paymentDate
    ? dayjs(data.paymentDate).format('DD MMM YYYY')
    : t('common:notSet')

  return (
    <>
      <div className="flex items-center group h-full">
        <div className="text-sm text-gray-700">{displayDate}</div>
        <button
          type="button"
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsOpen(true)}
          aria-label={t('common:action.edit').toString()}
        >
          <LuPencil className="text-primary hover:text-blue-600 w-4 h-4" />
        </button>
      </div>

      <ModalDialog
        open={isOpen}
        title={t('student:paymentProof.editPaymentDate')}
        onOpenChange={setIsOpen}
        className="max-w-md"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              loading={isLoading}
            >
              {t('common:action.save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-date">
              {t('student:paymentProof.paymentDate')}
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    dayjs(selectedDate).format('DD MMMM YYYY')
                  ) : (
                    <span>{t('student:paymentProof.selectDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {data?.paymentDate && (
            <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-md border border-gray-200">
              <strong>{t('student:paymentProof.currentPaymentDate')}:</strong>
              <br />
              {dayjs(data.paymentDate).format('DD MMMM YYYY')}
            </div>
          )}
        </div>
      </ModalDialog>
    </>
  )
}

export default UpdatePaymentDate
