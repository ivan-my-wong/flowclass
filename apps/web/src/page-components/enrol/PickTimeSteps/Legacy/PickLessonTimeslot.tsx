import { Fragment } from 'react'

import moment from 'moment'
import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'

import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import { SelectedClassDataState } from '@/stores/enrol'
import { RecurringSchedule } from '@/types'

type PropTypes = {
  selectedLessons: RecurringSchedule[]
  selectedClass: SelectedClassDataState
  onSelectLesson: (lesson: RecurringSchedule) => void
}
const PickLessonTimeslot = ({
  selectedLessons,
  selectedClass,
  onSelectLesson,
}: PropTypes): JSX.Element => {
  const { t } = useTranslation()
  const weekdays = [
    t('common:weekName.Sun'),
    t('common:weekName.Mon'),
    t('common:weekName.Tue'),
    t('common:weekName.Wed'),
    t('common:weekName.Thu'),
    t('common:weekName.Fri'),
    t('common:weekName.Sat'),
  ]
  return (
    <>
      <div className="box-col-full items-start">
        {weekdays.map((day, index) => {
          if (selectedLessons.some(item => item.weekDay === index)) {
            return (
              <div className="box-col-full items-start" key={day}>
                <p className="mt-2 font-bold">{day}</p>

                <div className="box-col-full gap-3">
                  {selectedLessons
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(lessonDatesItem => {
                      if (lessonDatesItem.weekDay === index) {
                        return (
                          <div key={lessonDatesItem.id} className="box-col-full items-start gap-3">
                            <BoxWithTextAction
                              percentage={
                                selectedClass.selectedClass
                                  ? lessonDatesItem.enrollCount ??
                                    (0 / (selectedClass.selectedClass?.quota ?? 0)) * 10
                                  : undefined
                              }
                              disabled={
                                selectedClass?.selectedClass &&
                                (lessonDatesItem?.enrollCount ?? 0) >=
                                  selectedClass?.selectedClass?.quota
                              }
                              key={lessonDatesItem.id}
                              text={`${moment(lessonDatesItem.startTime, 'HH:mm:ss').format(
                                'hh:mm a'
                              )} - ${moment(lessonDatesItem.endTime, 'HH:mm:ss').format(
                                'hh:mm a'
                              )}`}
                              icon={<FaChevronRight />}
                              action={() => onSelectLesson(lessonDatesItem)}
                            />
                          </div>
                        )
                      }
                      return <Fragment key={`fragment-${lessonDatesItem.id}`} />
                    })}
                </div>
              </div>
            )
          }

          return <Fragment key={`wrapper-fragment-${day}`} />
        })}
      </div>
    </>
  )
}
export default PickLessonTimeslot
