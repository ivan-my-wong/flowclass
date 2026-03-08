import { useCallback, useEffect, useState } from 'react'

import { CalendarIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import { Label } from '@/components/ui/Label'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { useClassMaterialsData } from '@/hooks/useClassMaterialsData'
import { StudentWithExpiry } from '@/types/class-material'
import { cn } from '@/utils/cn'

interface EditExpiryForStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classMaterialsId: number
  student?: StudentWithExpiry
}

const EditExpiryForStudentModal = ({
  open,
  onOpenChange,
  classMaterialsId,
  student,
}: EditExpiryForStudentModalProps) => {
  const { t } = useTranslation(['material', 'common'])
  const [expiryDate, setExpiryDate] = useState<Date | null>(
    student?.expiryDate ?? null
  )
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const { useUpdateClassMaterialExpiryForStudent } = useClassMaterialsData()

  const updateExpiryMutation = useUpdateClassMaterialExpiryForStudent(
    classMaterialsId,
    () => {
      onOpenChange(false)
    }
  )

  // Initialize form with current expiry date
  useEffect(() => {
    if (student?.expiryDate) {
      setExpiryDate(student?.expiryDate)
    } else {
      setExpiryDate(null)
    }
  }, [student?.expiryDate, open])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setExpiryDate(date || null)
    setIsCalendarOpen(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!expiryDate) return
    try {
      // Set to end of day (23:59:59) like in MaterialForm
      const expiryDateTime = dayjs(expiryDate)
        .hour(23)
        .minute(59)
        .second(59)
        .toISOString()

      await updateExpiryMutation.mutateAsync({
        expiryDate: expiryDateTime,
        studentId: student?.id || 0,
      })
    } catch (error) {
      console.error('Failed to update expiry:', error)
    }
  }, [expiryDate, updateExpiryMutation, student?.id])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const { isLoading } = updateExpiryMutation
  const canSave = expiryDate !== null

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('material:editExpiry.student.title')}
      className="max-w-md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t('common:action.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !canSave}
            loading={isLoading}
          >
            {t('common:action.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            {t('material:editExpiry.student.studentName')}:{' '}
            <strong>{student?.name}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry-date">
            {t('material:editExpiry.expiryDate')}
          </Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !expiryDate && 'text-muted-foreground'
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiryDate ? (
                  dayjs(expiryDate).format('DD MMMM YYYY')
                ) : (
                  <span>{t('material:editExpiry.selectDate')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate || undefined}
                onSelect={handleDateSelect}
                disabled={date => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {student?.expiryDate && (
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
            <strong>{t('material:editExpiry.currentExpiry')}:</strong>
            <br />
            {dayjs(student?.expiryDate).format('DD MMMM YYYY')}
          </div>
        )}
      </div>
    </ModalDialog>
  )
}

export default EditExpiryForStudentModal
