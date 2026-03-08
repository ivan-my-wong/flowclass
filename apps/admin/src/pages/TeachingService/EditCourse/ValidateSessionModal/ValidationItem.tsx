import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Buttons/Button'
import useCourseData from '@/hooks/useCourseData'
import useSiteData from '@/hooks/useSiteData'
import { Classes } from '@/types/classes'
import { getWeekdaysArray } from '@/utils/timeString'

type ValidationItemProps = {
  classes: Classes
  index: number
  isClassroom?: boolean
}

const ValidationItem = (payload: ValidationItemProps) => {
  const { classes, index, isClassroom } = payload
  const { t } = useTranslation()
  const { timeZone } = useSiteData()
  const { setCurrentCourse } = useCourseData()
  const navigate = useNavigate()

  return (
    <div className="flex gap-4 p-3 rounded-md bg-background-layer-2">
      <div className="text-gray-500 font-medium">{index + 1}.</div>
      <div className="space-y-2 flex-1">
        <div className="flex gap-2 items-center">
          <div className="font-bold w-[140px] text-gray-700 dark:text-gray-300">
            {t(`component:courseEditDialog.class.name`)}
          </div>
          <div className="text-gray-500">:</div>
          <Button
            variants="link"
            className="p-0 font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => {
              if (classes.id && classes.courseId) {
                setCurrentCourse(classes.courseId)
                navigate(
                  `/teaching-service/edit-course?tab=class&classId=${classes.id}`
                )
              }
            }}
          >
            {classes.name}
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="font-bold w-[140px] text-gray-700 dark:text-gray-300">
            {t(`component:classCard.time`)}
          </div>
          <div className="text-gray-500">:</div>
          <div className="space-y-2 text-gray-800 dark:text-gray-200">
            {classes.regularPeriods?.map(period => {
              return period.lessons?.map(lesson => {
                const start = dayjs(lesson.startTime)
                  .tz(timeZone)
                  .format('YYYY/MM/DD HH:mm A')
                const end = dayjs(lesson.endTime)
                  .tz(timeZone)
                  .format('YYYY/MM/DD HH:mm A')
                return (
                  <div key={`${period.id}-${lesson.id}`}>
                    {start} - {end}
                  </div>
                )
              })
            })}
            {classes.recurringSchedules
              ?.sort((a, b) => a.weekDay - b.weekDay)
              ?.map(schedule => {
                return (
                  <div key={`${schedule.id}`}>
                    <span className="font-medium">
                      {getWeekdaysArray(t)[schedule.weekDay]}
                    </span>
                    , {schedule.startTime} - {schedule.endTime}
                  </div>
                )
              })}
          </div>
        </div>
        {isClassroom ? (
          <div className="flex gap-2">
            <div className="font-bold w-[140px] text-gray-700 dark:text-gray-300">
              {t(`component:classCard.locality`)}
            </div>
            <div className="text-gray-500">:</div>
            <div className="text-gray-800 dark:text-gray-200">
              {classes?.locationRoom?.name || '-'}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="font-bold w-[140px] text-gray-700 dark:text-gray-300">
              {t(`teachingService:validate.assignedTeacher`)}
            </div>
            <div className="text-gray-500">:</div>
            <div className="text-gray-800 dark:text-gray-200">
              {classes?.instructor?.firstName || '-'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidationItem
