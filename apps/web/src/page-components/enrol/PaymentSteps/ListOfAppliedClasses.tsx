import { useMemo } from 'react'

import { LucideChevronUp, LucideMapPin, LucideUser } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import ImageAspect from '@/components/Images/ImageAspect'
import { StudentSchedule } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'

const ListOfAppliedClasses = ({
  invoice,
  scrollToSection,
}: {
  invoice: InvoiceResponse
  scrollToSection: (sectionId: string) => void
}): JSX.Element => {
  const { t } = useTranslation()
  const { course, studentSchedules } = invoice

  const allClasses = useMemo(
    () =>
      studentSchedules?.map((item: StudentSchedule) => {
        const reOrderLessons = [...(item.studentLessons ?? [])].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        return {
          ...item,
          courseName: course.name,
          studentLessons: reOrderLessons,
        }
      }),
    [studentSchedules, course]
  )

  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex w-full items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="text-xl font-bold">{t('enrol:reviewItems')}</div>
      </div>
      {allClasses?.map(classItem => (
        <div key={classItem.id} className="border-b border-gray-200 pb-4">
          <div className="inline-flex w-full items-start justify-between space-x-4">
            <div className="w-full rounded-md lg:w-32">
              <ImageAspect
                s3="public"
                src={course.previewImageUrl}
                alt={course.name}
                ratio={16 / 9}
                imgClassName="object-cover"
              />
            </div>
            <div className="box-col-full">
              <p className="-mt-1 w-full text-left text-lg" data-testid="course-name">
                {classItem.class.name}
              </p>
              {classItem.class.instructor && (
                <div className="box-row-full justify-start" data-testid="instructor-name">
                  <LucideUser size={16} />
                  <p className="text-sm">
                    {t('enrol:uploadReceipt.instructor')} {classItem.class.instructor.firstName}
                  </p>
                </div>
              )}
              {classItem.class.locationRoom && (
                <div className="box-row-full justify-start" data-testid="location-room-name">
                  <LucideMapPin size={16} />
                  <p className="text-sm">
                    {t('enrol:uploadReceipt.location')} {classItem.class.locationRoom.name}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="box-row-full my-2 justify-start font-medium">
            <p>
              {t('enrol:lessons')} ({classItem.studentLessons.length})
            </p>
          </div>
          <div className="space-y-1">
            {classItem.studentLessons.map(lessonItem => {
              const startTime = lessonItem.startTime
              const endTime = lessonItem.endTime

              const changeStartTime = lessonItem.changeStartTime
              const changeEndTime = lessonItem.changeEndTime

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
                <div key={`${classItem.class.id}-${lessonItem.id}`} className="flex flex-col">
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
      ))}

      <Button
        variant="outlined"
        iconBefore={<LucideChevronUp />}
        className="!py-1"
        onClick={() => scrollToSection('payment-summary')}
      >
        {t('enrol:viewPaymentBtn')}
      </Button>
    </div>
  )
}

export default ListOfAppliedClasses
