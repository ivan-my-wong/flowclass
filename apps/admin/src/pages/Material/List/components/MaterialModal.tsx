import { useEffect, useState } from 'react'

import { ChevronDownIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FiInfo } from 'react-icons/fi'

import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  student: {
    id: string | number
    name: string
    studentLessonId?: string | number
  } | null
  lessonInfo?: {
    startDate?: string
    endDate?: string
  }
  currentExpiryDate?: string | null
  createdAt?: string // Untuk menampilkan default 6 bulan
  onSave: (
    studentId: string | number,
    newExpiryDate: Date
  ) => void | Promise<void>
  isLoading?: boolean
}

const MaterialModal: React.FC<Props> = ({
  isOpen,
  setOpen,
  student,
  lessonInfo,
  currentExpiryDate,
  createdAt,
  onSave,
  isLoading = false,
}): JSX.Element => {
  useTranslation('material')

  // Initialize dengan current expiry atau default 6 bulan
  const getInitialDate = () => {
    if (currentExpiryDate) return new Date(currentExpiryDate)

    // Default: 6 bulan dari createdAt
    if (createdAt) {
      return dayjs(createdAt).add(6, 'months').toDate()
    }

    // Fallback: 6 bulan dari sekarang
    return dayjs().add(6, 'months').toDate()
  }

  const [expiryDate, setExpiryDate] = useState<Date>(getInitialDate())
  const [time, setTime] = useState<string>('23:59')
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const [error, setError] = useState<string>('')

  // Update state ketika modal dibuka
  useEffect(() => {
    if (isOpen && student) {
      const initialDate = getInitialDate()
      setExpiryDate(initialDate)
      setError('')

      // Extract time dari expiry date
      const hours = initialDate.getHours().toString().padStart(2, '0')
      const minutes = initialDate.getMinutes().toString().padStart(2, '0')
      setTime(`${hours}:${minutes}`)
    }
  }, [isOpen, student, currentExpiryDate, createdAt])

  const handleSave = async () => {
    if (!student) return

    // Validate date
    const now = new Date()
    const selectedDateTime = new Date(expiryDate)
    const [hours, minutes] = time.split(':')
    selectedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10))

    if (selectedDateTime <= now) {
      setError('Expiry date must be in the future')
      return
    }

    try {
      await onSave(student.id, selectedDateTime)
      setOpen(false)
      setError('')
    } catch (error) {
      setError('Failed to save expiry date')
    }
  }

  const handleCancel = () => {
    setExpiryDate(getInitialDate())
    setError('')
    setOpen(false)
  }

  if (!student) return <></>

  // Calculate default expiry (6 bulan dari creation)
  const defaultExpiryDate = createdAt
    ? dayjs(createdAt).add(6, 'months').format('DD/MM/YYYY')
    : null

  const formatLessonDate = () => {
    const startDate = dayjs(lessonInfo?.startDate).format('DD/MM/YYYY')
    const endDate = dayjs(lessonInfo?.endDate).format('DD/MM/YYYY')
    return `${startDate} - ${endDate}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Adjust expiry date for {student.name}
          </DialogTitle>
        </DialogHeader>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
          <div className="flex gap-2">
            <FiInfo className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              This expiry date applies to <strong>ALL class materials</strong>{' '}
              for this student, regardless of individual material expiry dates.
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-600 pt-2 space-y-1">
          {lessonInfo?.startDate && (
            <p>
              <span className="font-medium">Lesson:</span> {formatLessonDate()}
            </p>
          )}
        </div>

        <div className="py-4 space-y-4">
          {/* Date Picker */}
          <div>
            <Label htmlFor="expiry-date" className="mb-2">
              Expiry Date
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="expiry-date"
                  variant="outline"
                  className="w-full justify-between font-normal h-12 text-base"
                >
                  {dayjs(expiryDate).format('DD/MM/YYYY')}
                  <ChevronDownIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-4"
                align="start"
              >
                <Calendar
                  mode="single"
                  defaultMonth={expiryDate}
                  selected={expiryDate}
                  captionLayout="dropdown"
                  onSelect={date => {
                    if (date) {
                      setExpiryDate(date)
                      setCalendarOpen(false)
                      setError('')
                    }
                  }}
                  disabled={date =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Expiry Information */}
          <div className="space-y-2">
            {/* Current Expiry */}
            {currentExpiryDate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current expiry:</span>
                  <span className="ml-2 text-gray-900">
                    {dayjs(currentExpiryDate).format('DD/MM/YYYY HH:mm')}
                  </span>
                </p>
              </div>
            )}

            {/* Default Expiry Info */}
            {defaultExpiryDate && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">
                    Default expiry (6 months from enrollment):
                  </span>
                  <span className="ml-2 text-amber-900">
                    {defaultExpiryDate}
                  </span>
                </p>
                {createdAt && (
                  <p className="text-xs text-amber-600 mt-1">
                    Student enrolled:{' '}
                    {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2">⏳</span>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MaterialModal
