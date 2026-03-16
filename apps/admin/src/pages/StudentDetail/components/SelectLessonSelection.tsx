import { createRef, useEffect, useState } from 'react'

import { EventClickArg } from '@fullcalendar/core'
// a plugin!
import FullCalendar from '@fullcalendar/react'
import { t } from 'i18next'
import _ from 'lodash'

import CloseIcon from '@/assets/svgs/CloseIcon'
import Calendar from '@/components/DatePickers/Calendar'
import Drawer from '@/components/Drawer/Drawer'
import Text from '@/components/Texts/Text'
import EventContentMobile from '@/pages/FullCalendar/components/EventContentMobile'
import { StudentLesson } from '@/types/student'

type Props = {
  open: boolean
  handleCloseDrw: () => void
  lessonOpts: StudentLesson[]
  setNewLesson: (val: StudentLesson) => void
}

const SelectLessonSelection = ({
  handleCloseDrw,
  open,
  lessonOpts,
  setNewLesson,
}: Props) => {
  const calendarRef = createRef<FullCalendar>()
  const [optsSource, setOptsSource] = useState<StudentLesson[]>([])
  const [opts, setOpts] = useState<StudentLesson[]>([])
  const [, setOptsSourceFormated] = useState<any>([])

  const calenderOptions = {
    initialView: 'listMonth',
    weekends: true,
    slotEventOverlap: false,
    allDaySlot: false,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',

    buttonIcons: {
      prev: 'chevron-left',
      next: 'chevron-right',
      prevYear: 'chevrons-left', // double chevron
      nextYear: 'chevrons-right', // double chevron
    },
    selectable: true,
    height: 'parent',
  }

  useEffect(() => {
    if (optsSource.length > 0) {
      const newOpts = _.reduce(
        optsSource,
        (sum: any, n: any) => {
          if (!sum[n?.classId]) {
            // eslint-disable-next-line no-param-reassign
            sum[n.classId] = []
          }
          sum[n.classId].push(n)
          return sum
        },
        []
      )
      setOptsSourceFormated(newOpts)
    }
  }, [optsSource])

  useEffect(() => {
    if (lessonOpts.length) {
      const newOpts = lessonOpts.map(opt => {
        return { ...opt, start: opt.startTime, end: opt.endTime }
      })

      setOptsSource(newOpts)
      setOpts(newOpts)
    }
  }, [lessonOpts])

  const handleEventClick = (clickInfo: EventClickArg) => {
    const id = +clickInfo.event.id
    const rs = lessonOpts.find(item => Number(item.id) === id)
    if (rs) {
      setNewLesson(rs)
      handleCloseDrw()
    }
  }

  // const handleClassSelect = (val: number[]) => {
  //   if (val.length > 0) {
  //     const optsFiltered: StudentLesson[] = []
  //     val.forEach((item: number) => {
  //       if (optsSourceFormated[item]) {
  //         optsFiltered.push(...optsSourceFormated[item])
  //       }
  //     })
  //     setOpts(optsFiltered)
  //   } else {
  //     setOpts(optsSource)
  //   }
  // }

  return (
    <Drawer open={open} onClose={() => {}}>
      <>
        <div className="flex justify-between items-center">
          <div className="flex gap-2.5 h-fit items-center justify-between w-full">
            <Text bold size="large">
              {t('student:teachingService.lessonSelection')}
            </Text>
            <button
              type="button"
              className="cursor-pointer bg-transparent border-0 p-0"
              onClick={handleCloseDrw}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="w-full h-px bg-[#BFBFBF] my-[22px]" />
        {/* <CalendarHeader
          calendarRef={calendarRef}
          handleClassSelect={handleClassSelect}
          onChangeStartDate={onChangeStartDate}
          onChangeEndDate={onChangeEndDate}
          setCurrentDate={setCurrentDate}
          isTeachingService
        /> */}
        {/* <WeekHeaderCustom
          calendarRef={calendarRef}
          currentDate={dayjs(currentDate).format(TimeFormat.DD_MM_YYYY)}
          setCurrentDate={setCurrentDate}
        /> */}

        <Calendar
          ref={calendarRef}
          {...calenderOptions}
          eventContent={EventContentMobile}
          eventClick={handleEventClick}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
          }}
          titleFormat={{
            month: 'long', // Display full month name
            year: 'numeric', // Display 4-digit year
          }}
          events={opts.map((lesson: StudentLesson) => {
            const newLesson = { ...lesson }
            newLesson.id = lesson.id
            return newLesson
          })}
          headerToolbar={{
            start: 'title',
            center: 'today prev,next',
            end: 'listMonth',
          }}
        />
      </>
    </Drawer>
  )
}

export default SelectLessonSelection
