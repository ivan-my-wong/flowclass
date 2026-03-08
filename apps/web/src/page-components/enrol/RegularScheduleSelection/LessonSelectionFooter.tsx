import { Calendar, CheckSquare, Clock } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import { RegularScheduleLessonPreview } from '@/types/regularSchedule'

interface LessonSelectionFooterProps {
  selectedLessons: RegularScheduleLessonPreview[]
  totalLessons: number
  courseName?: string
  lessonDuration?: string
  onConfirm: () => void
  isLoading?: boolean
}

const LessonSelectionFooter = ({
  selectedLessons,
  totalLessons,
  courseName,
  lessonDuration,
  onConfirm,
  isLoading = false,
}: LessonSelectionFooterProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto max-w-4xl">
        {/* Selection Summary Header */}
        <div className="mb-3 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">
            {t('enrol:pickPeriodStep.selectTimeSlot.lessonsChosen')}
          </h3>
          <span className="text-sm text-gray-600">
            {`${selectedLessons.length} ${t('enrol:successPayment.lessons')}`}
          </span>
        </div>

        {/* Course Details */}
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{t('enrol:successPayment.courseName')}</span>
          </div>
          <span className="font-medium">{courseName}</span>
        </div>

        {/* Duration Details */}
        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{t('enrol:pickTuitionStep.pricePerLesson')}</span>
          </div>
          <span className="font-medium">{lessonDuration}</span>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          disabled={selectedLessons.length === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              {t('enrol:customFieldStep.nextStep')}
            </div>
          ) : (
            `${t('enrol:payment.proceed')} ${selectedLessons.length} ${t(
              'enrol:successPayment.lessons'
            )}`
          )}
        </Button>
      </div>
    </div>
  )
}

export default LessonSelectionFooter
