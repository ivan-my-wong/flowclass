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
import { cn } from '@/utils/cn'

interface EditExpiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classMaterialsId: number
  mediaMaterialId: number
  currentExpiryDate?: Date | null
  materialName: string
}

const EditExpiryModal = ({
  open,
  onOpenChange,
  classMaterialsId,
  mediaMaterialId,
  currentExpiryDate,
  materialName,
}: EditExpiryModalProps) => {
  const { t } = useTranslation(['material', 'common'])
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const { useUpdateClassMaterialExpiry } = useClassMaterialsData()

  const updateExpiryMutation = useUpdateClassMaterialExpiry(
    classMaterialsId,
    mediaMaterialId,
    useCallback(() => {
      onOpenChange(false)
    }, [onOpenChange])
  )

  // Initialize form with current expiry date
  useEffect(() => {
    if (currentExpiryDate) {
      setExpiryDate(currentExpiryDate)
    } else {
      setExpiryDate(null)
    }
  }, [currentExpiryDate, open])

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
      })
    } catch (error) {
      console.error('Failed to update expiry:', error)
    }
  }, [expiryDate, updateExpiryMutation])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const { isLoading } = updateExpiryMutation
  const canSave = expiryDate !== null

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('material:editExpiry.title')}
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
            {t('material:editExpiry.materialName')}:{' '}
            <strong>{materialName}</strong>
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

        {currentExpiryDate && (
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
            <strong>{t('material:editExpiry.currentExpiry')}:</strong>
            <br />
            {dayjs(currentExpiryDate).format('DD MMMM YYYY')}
          </div>
        )}
      </div>
    </ModalDialog>
  )
}

export default EditExpiryModal
