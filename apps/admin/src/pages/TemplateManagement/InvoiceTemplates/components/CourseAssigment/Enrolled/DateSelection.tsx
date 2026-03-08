import { useState } from 'react'

import { ChevronDownIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FiAlertCircle } from 'react-icons/fi'
import { useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { currentActiveStudentState } from '@/stores/studentInvoice.store'

import { useContextEnrolledClass } from './EnrolledClassContext'

interface Props {
  next: (isAllStudents: boolean) => void
}

const DateSelection: React.FC<Props> = ({ next }): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const currentStudentState = useRecoilValue(currentActiveStudentState)
  const { date, setDate, allStudentsToEnroll } = useContextEnrolledClass()
  const [isOpen, setOpen] = useState(false)
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiAlertCircle aria-hidden="true" focusable="false" />
          <div>
            <div className="font-medium text-gray-900 mb-2">
              {t('enrolledClass.disclaimer.title')}
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <strong>{t('enrolledClass.disclaimer.regular')}:</strong>{' '}
                {t('enrolledClass.disclaimer.regularText')}
              </li>
              <li>
                <strong>{t('enrolledClass.disclaimer.recurring')}:</strong>{' '}
                {t('enrolledClass.disclaimer.recurringText')}
              </li>
              <li>
                <strong>{t('enrolledClass.disclaimer.subscription')}:</strong>{' '}
                {t('enrolledClass.disclaimer.subscriptionText')}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiAlertCircle aria-hidden="true" focusable="false" />
          <div className="text-sm text-gray-700">
            <strong>{t('enrolledClass.disclaimer.note')}:</strong>{' '}
            <strong>{t('enrolledClass.disclaimer.stopped')}</strong>{' '}
            {t('enrolledClass.disclaimer.stoppedText')}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600 font-medium mb-1">
          {t('enrolledClass.dateSelectionTitle')}
        </div>
        <Popover open={isOpen} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-full justify-between font-normal"
            >
              {date
                ? dayjs(date).format('MMMM DD, YYYY')
                : t('enrolledClass.selectDate')}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              defaultMonth={date}
              selected={date}
              captionLayout="dropdown"
              onSelect={date => {
                setDate(date ?? new Date())
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={() => next(false)}>
          {t('enrolledClass.reviewLessonForNameOnly', {
            studentName: currentStudentState?.name ?? '-',
          })}
        </Button>
        {allStudentsToEnroll.length > 1 && (
          <Button onClick={() => next(true)}>
            {t('enrolledClass.reviewLessonForAllStudents', {
              studentCount: allStudentsToEnroll.length,
            })}
          </Button>
        )}
      </div>
    </div>
  )
}

export default DateSelection
