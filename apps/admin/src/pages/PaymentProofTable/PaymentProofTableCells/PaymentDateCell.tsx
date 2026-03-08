'use client'

import { useState } from 'react'

import { CalendarIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import { MdSave } from 'react-icons/md'

import Label from '@/components/Inputs/Label'
import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
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
import { Invoice, PaymentProofTableItem } from '@/types/enrollCourse'
import { cn } from '@/utils/cn'

type PaymentDateCellProps = {
  data: PaymentProofTableItem
  filteredStudentList: Invoice[]
  setFilteredStudentList: (list: Invoice[]) => void
}

const PaymentDateCell = (props: PaymentDateCellProps) => {
  const { data, filteredStudentList, setFilteredStudentList } = props
  const { t } = useTranslation(['student', 'common'])
  useSiteData() // just to ensure site context if needed

  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const { usePaymentDateUpdate } = usePaymentEvidenceData()
  const { mutateAsync: handleUpdate, isLoading } = usePaymentDateUpdate()

  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  // Set initial date when modal opens
  const openModal = () => {
    setIsOpen(true)
    if (data?.paymentDate) {
      const parsed = dayjs(data.paymentDate).toDate()
      setSelectedDate(Number.isNaN(parsed.getTime()) ? null : parsed)
    } else {
      setSelectedDate(null)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null)
    setIsCalendarOpen(false)
  }

  const displayDate = data?.paymentDate
    ? dayjs(data.paymentDate).format('DD MMM YYYY')
    : t('common:notSet')

  return (
    <>
      <div className="!flex !items-center group h-full">
        <p className="text-sm text-gray-700">{displayDate}</p>
        <button
          type="button"
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={openModal}
        >
          <HiOutlinePencilSquare className="text-primary hover:text-blue-600" />
        </button>
      </div>

      <ModalDialog
        open={isOpen}
        title={t('student:paymentProof.editPaymentDate') as string}
        onOpenChange={() => setIsOpen(false)}
        className="max-w-md"
      >
        <div className="mb-4">
          <Label className="mb-2">
            {t('student:paymentProof.paymentDate') as string}
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
                disabled={date => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {data?.paymentDate && (
            <div className="mt-3 text-xs text-gray-600 p-3 bg-gray-50 rounded-md border border-gray-200">
              <strong>{t('student:paymentProof.currentPaymentDate')}:</strong>
              <br />
              {dayjs(data.paymentDate).format('DD MMMM YYYY')}
            </div>
          )}

          <Button
            className="mt-4 w-full"
            iconBefore={<MdSave />}
            onClick={() => {
              setIsOpen(false)
              const formattedDate = selectedDate
                ? dayjs(selectedDate).format('YYYY-MM-DD')
                : ''

              setConfirm({
                title: t(
                  'student:paymentProof.updatePaymentDateTitle'
                ).toString(),
                description: t(
                  'student:paymentProof.updatePaymentDateDescription'
                ).toString(),
                alertType: AlertTypes.WARN,
                cancelText: t('common:action.cancel').toString(),
                confirmText: t('common:action.confirm').toString(),
                onConfirm: async () => {
                  await handleUpdate({
                    invoiceId: data.id,
                    paymentDate: formattedDate,
                  }).then(() => {
                    const updatedList = filteredStudentList.map(item => {
                      if (item.id === data.id) {
                        return { ...item, paymentDate: formattedDate || null }
                      }
                      return item
                    })
                    setFilteredStudentList(updatedList)
                    closeConfirm()
                  })
                },
              }).open()
            }}
            disabled={isLoading}
            loading={isLoading}
          >
            {t('common:action.update')}
          </Button>
        </div>
      </ModalDialog>
    </>
  )
}

export default PaymentDateCell
