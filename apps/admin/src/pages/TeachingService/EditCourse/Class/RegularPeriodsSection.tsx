/* eslint-disable react/no-array-index-key */
import { RefObject, useEffect, useState } from 'react'

import { DateInput } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import { t } from 'i18next'
import { useFieldArray, useFormContext } from 'react-hook-form'

import Separator from '@/components/Separators/Separator'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { PaginationComponent } from '@/components/ui/Pagination'
import { defaultRepeatFormat, RepeatUnit } from '@/constants/course'
import useClassData from '@/hooks/useClassData'
import { ClassesForm, PeriodLessons, RegularPeriods } from '@/types/classes'
import { defaultRegularPeriod } from '@/utils/convert-class.utils'
import dayjs from '@/utils/dayjs'
import { addMinutesToDate, addRepeatTypeToDate } from '@/utils/timeFormat'

import ValidateSessionModal from '../ValidateSessionModal'

import LessonSection from './LessonsSection'

type RegularPeriodsSectionProps = {
  calendarRef: RefObject<FullCalendar>
}

const RegularPeriodsSection = ({
  calendarRef,
}: RegularPeriodsSectionProps): JSX.Element => {
  const form = useFormContext<ClassesForm>()
  const { append, fields, update, remove } = useFieldArray({
    control: form.control,
    keyName: `uid`,
    name: 'regularPeriods',
  })

  const regularPeriods = form.watch('regularPeriods')

  const [currentPage, setCurrentPage] = useState(0)
  const { currentClass: classToBeEdited } = useClassData()

  const changeCurrentDisplayMonth = (date: DateInput | undefined) => {
    if (calendarRef?.current !== null) {
      const firstEventStartDate = date

      if (firstEventStartDate) {
        calendarRef?.current?.getApi().gotoDate(firstEventStartDate)
      } else {
        calendarRef?.current?.getApi().gotoDate(new Date())
      }
    }
  }

  useEffect(() => {
    if (
      regularPeriods &&
      regularPeriods.length > 0 &&
      regularPeriods[0].lessons &&
      regularPeriods[0].lessons.length > 0
    ) {
      changeCurrentDisplayMonth(regularPeriods[0].lessons[0].startTime)
    }
  }, [regularPeriods])

  const addPeriod = () => {
    const prevSchedule = regularPeriods[regularPeriods.length - 1]
    const newScheduleLessons: PeriodLessons[] = []

    if (prevSchedule) {
      const prevLessonArray = prevSchedule?.lessons ?? []

      const startDate =
        prevLessonArray && prevLessonArray.length > 0
          ? prevLessonArray[prevLessonArray.length - 1].startTime // Get the last lesson's start date
          : new Date().toISOString()

      const firstStartDate = addRepeatTypeToDate(
        startDate,
        prevSchedule.repeatFormat?.unit ?? RepeatUnit.weeks,
        prevSchedule.repeatFormat?.every ?? 1
      )

      const newStartDateWithEndDate = {
        startTime: firstStartDate,
        endTime: addMinutesToDate(firstStartDate, prevSchedule.duration),
      }

      newScheduleLessons.push(newStartDateWithEndDate)

      for (let i = 1; i < prevLessonArray.length; i += 1) {
        const prevScheduleStartDate =
          newScheduleLessons[newScheduleLessons.length - 1].startTime

        const newStartDate = addRepeatTypeToDate(
          prevScheduleStartDate,
          prevSchedule.repeatFormat?.unit ?? RepeatUnit.weeks,
          prevSchedule.repeatFormat?.every ?? 1
        )

        newScheduleLessons.push({
          startTime: newStartDate,
          endTime: addMinutesToDate(newStartDate, prevSchedule.duration),
        })
      }

      append({
        name: dayjs(startDate).format('YYYY-MM'),
        duration: prevSchedule.duration,
        lessons: newScheduleLessons,
        repeatFormat:
          prevSchedule.repeatFormat && Object.keys(prevSchedule).length > 0
            ? prevSchedule.repeatFormat
            : defaultRepeatFormat,
      })
    } else {
      append(defaultRegularPeriod(classToBeEdited?.courseId ?? 0))
    }
    setCurrentPage(currentPage + 1)
  }

  return (
    <Box direction="col" align="start">
      <Separator css={{ margin: '1rem 0' }} />
      <div
        id="classScheduleLesson"
        className="box-responsive-full justify-between"
      >
        <Heading id="classScheduleHeading">
          {t('teachingService:class.schedule')}
        </Heading>
        <ValidateSessionModal />
        <Button
          variant="outline"
          className="items-center"
          onClick={() => {
            const currentLength = regularPeriods.length

            addPeriod()
            setCurrentPage(currentLength)
          }}
        >
          + {t('teachingService:class.phases.addPeriod')}
        </Button>
      </div>

      <p id="classScheduleTips" className="text-left">
        {t('teachingService:class.minimumPurchaseLesson')}
      </p>
      <PaginationComponent
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageCount={fields.length}
        itemsPerPage={1}
      >
        {fields?.map(
          (singleSchedule: RegularPeriods, scheduleIndex: number) => {
            return (
              <LessonSection
                key={scheduleIndex}
                schedule={singleSchedule}
                scheduleIndex={scheduleIndex}
                update={update}
                remove={remove}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )
          }
        )}
      </PaginationComponent>
      <Separator css={{ margin: '1rem 0' }} />
    </Box>
  )
}

export default RegularPeriodsSection
