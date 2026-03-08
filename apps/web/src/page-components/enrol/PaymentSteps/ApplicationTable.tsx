import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import { currentWebsiteTheme } from '@/stores/schoolContext'
import { Class, ClassType } from '@/types'
import { EnrolCourseResponse, StudentLesson, StudentSchedule } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'
import { templateSectionBgColor } from '@/types/websiteTemplate'
import { calculateClassPrice } from '@/utils/calculateCourse'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'
import { getPriceWithCurrency } from '@/utils/string.utils'

interface ClassApplicationTableProps {
  enrollmentDetail?: EnrolCourseResponse
  studentSchedule: StudentSchedule
  invoice: InvoiceResponse
  showPrice?: boolean
  shouldShowPaymentSummary?: boolean
}

const findMatchClass = (
  enrollmentDetail: EnrolCourseResponse,
  studentSchedule: StudentSchedule
): Class | undefined => {
  const matchingClass = enrollmentDetail?.course?.classes?.find(
    classItem => classItem.id === studentSchedule?.classId
  )
  return matchingClass
}

export function calculateScheduleTuition(schedule: StudentSchedule): number {
  const enrolledClass = schedule.class
  let tuition = 0

  if (enrolledClass?.type === ClassType.regular || enrolledClass?.type === ClassType.workshop) {
    const periodId = schedule.periodId
    const regularPeriods = schedule.class?.regularPeriods || []
    const matchingPeriod = regularPeriods.find(period => period.id === periodId)
    const enrolledLessonNumber = schedule.studentLessons?.length ?? 1
    tuition = calculateClassPrice(
      enrolledClass,
      enrolledLessonNumber,
      matchingPeriod?.lessons?.length ?? enrolledLessonNumber
    )
  } else {
    const enrolledLessonNumber = schedule.studentLessons?.length ?? 1
    tuition = calculateClassPrice(enrolledClass, enrolledLessonNumber, enrolledLessonNumber)
  }

  return tuition
}

export function calculateInvoiceTotalWithAdjustments(invoice: InvoiceResponse): number {
  let total = 0
  // Sum tuition for all schedules
  if (Array.isArray(invoice?.studentSchedules)) {
    let tuitionTotal = 0
    invoice.studentSchedules.forEach(schedule => {
      tuitionTotal += calculateScheduleTuition(schedule)
    })

    // Add additional fee if present
    const additionalFee = Number(invoice.additionalFee) || 0

    // Subtract discounts (choose the correct field based on your business logic)
    // Here, using discountAmount as in TablePrice/FinalPrice
    const discount = Number(invoice.discountAmount) || 0

    total += tuitionTotal + additionalFee - discount
  }

  return total
}

const ClassApplicationTable = ({
  enrollmentDetail,
  studentSchedule,
  invoice,
  showPrice = true,
  shouldShowPaymentSummary = true,
}: ClassApplicationTableProps): JSX.Element => {
  const { t } = useTranslation()

  const [currentTheme] = useRecoilState(currentWebsiteTheme)

  const tuition = calculateScheduleTuition(studentSchedule)

  const renderClassRow = (schedule: StudentSchedule) => {
    if (!!enrollmentDetail && schedule.studentLessons && schedule.studentLessons.length > 0) {
      return (
        <div className={`w-full ${templateSectionBgColor(currentTheme)}`}>
          <div className="space-y-3">
            <div className="gap-2">
              {[...schedule.studentLessons]
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((lesson: StudentLesson) => {
                  const startTime = lesson.startTime
                  const endTime = lesson.endTime

                  const changeStartTime = lesson.changeStartTime
                  const changeEndTime = lesson.changeEndTime

                  const [lessonDate] =
                    startTime && endTime
                      ? calculateLessonFormatAndDuration(startTime.toString(), endTime.toString())
                      : ['', 0]

                  const [changeLessonDate] =
                    changeStartTime && changeEndTime
                      ? calculateLessonFormatAndDuration(
                          changeStartTime.toString(),
                          changeEndTime.toString()
                        )
                      : ['', 0]

                  return (
                    <div key={lesson.id} className="mb-1 flex flex-col">
                      {changeStartTime && changeEndTime ? (
                        <>
                          <p>{changeLessonDate}</p>
                          <p className="text-textSubtle text-sm line-through">{lessonDate}</p>
                        </>
                      ) : (
                        <p data-testid="lesson-date">{lessonDate}</p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      {enrollmentDetail && (
        <div className="box-col-full">
          <h4 className="w-full font-semibold">{t('enrol:successPayment.lessons')}</h4>
          {renderClassRow(studentSchedule)}
          {showPrice && typeof tuition === 'number' && (
            <div className="box-col-full items-start" data-testid="price-cell">
              {shouldShowPaymentSummary && (
                <>
                  <div className="font-semibold">{t('enrol:itemPrice')}</div>
                  <div>{getPriceWithCurrency(enrollmentDetail.currency, tuition)}</div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ClassApplicationTable
