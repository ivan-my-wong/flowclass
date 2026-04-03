'use client'

import React, { useCallback, useEffect, useState } from 'react'

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
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { Invoice } from '@/types/enrollCourse'
import { cn } from '@/utils/cn'

type DateField = 'createdAt' | 'updatedAt'

interface UpdateInvoiceDateFieldProps {
  data: Invoice
  field: DateField
  refetch: () => void
}

const fieldConfig: Record<
  DateField,
  { labelKey: string; editTitleKey: string; currentLabelKey: string }
> = {
  createdAt: {
    labelKey: 'student:paymentProof.createdDate',
    editTitleKey: 'student:paymentProof.editCreatedDate',
    currentLabelKey: 'student:paymentProof.currentCreatedDate',
  },
  updatedAt: {
    labelKey: 'student:paymentProof.lastUpdatedDate',
    editTitleKey: 'student:paymentProof.editLastUpdatedDate',
    currentLabelKey: 'student:paymentProof.currentLastUpdatedDate',
  },
}

const UpdateInvoiceDateField = ({
  data,
  field,
  refetch,
}: UpdateInvoiceDateFieldProps): React.ReactElement => {
  const { t } = useTranslation(['student', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const { usePaymentDateUpdate } = usePaymentEvidenceData()
  const { mutateAsync: updatePaymentDate, isLoading } = usePaymentDateUpdate()

  const config = fieldConfig[field]
  const dateValue = data?.[field]

  useEffect(() => {
    if (isOpen && dateValue) {
      const parsed = dayjs(dateValue).toDate()
      setSelectedDate(Number.isNaN(parsed.getTime()) ? null : parsed)
    } else if (isOpen) {
      setSelectedDate(null)
    }
  }, [isOpen, dateValue])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date || null)
    setIsCalendarOpen(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!data?.id) return

    const formattedDate = selectedDate
      ? dayjs(selectedDate).format('YYYY-MM-DD')
      : undefined

    if (!formattedDate) return

    const payload =
      field === 'createdAt'
        ? { invoiceId: data.id, createdAt: formattedDate }
        : { invoiceId: data.id, updatedAt: formattedDate }

    try {
      await updatePaymentDate(payload)
      refetch()
      setIsOpen(false)
    } catch {
      // Error handled by mutation onError (toast)
    }
  }, [selectedDate, data?.id, field, updatePaymentDate, refetch])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
  }, [])

  const displayDate = dateValue
    ? dayjs(dateValue).format('DD MMM YYYY')
    : t('common:notSet')

  return (
    <>
      <div className="flex items-center group h-full">
        <div className="text-sm text-gray-700">{displayDate}</div>
        <button
          type="button"
          className="ml-2"
          onClick={() => setIsOpen(true)}
          aria-label={t('common:action.edit').toString()}
        >
          <LuPencil className="text-primary hover:text-blue-600" />
        </button>
      </div>

      <ModalDialog
        open={isOpen}
        title={t(config.editTitleKey)}
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
            <Label htmlFor={`${field}-date`}>{t(config.labelKey)}</Label>
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

          {dateValue && (
            <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-md border border-gray-200">
              <strong>{t(config.currentLabelKey)}:</strong>
              <br />
              {dayjs(dateValue).format('DD MMMM YYYY')}
            </div>
          )}
        </div>
      </ModalDialog>
    </>
  )
}

export default UpdateInvoiceDateField
