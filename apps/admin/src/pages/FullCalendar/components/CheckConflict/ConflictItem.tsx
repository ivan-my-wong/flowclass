import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Buttons/Button'
import useSiteData from '@/hooks/useSiteData'
import { ClassLesson } from '@/types/student'

type ConflictItemProps = {
  classes: ClassLesson
  index: number
  isClassroom?: boolean
}

const ConflictItem = (payload: ConflictItemProps) => {
  const { classes, index, isClassroom } = payload
  const { t } = useTranslation()

  const { timeZone } = useSiteData()

  const start = dayjs(classes.start).tz(timeZone).format('YYYY/MM/DD HH:mm A')
  const end = dayjs(classes.end).tz(timeZone).format('YYYY/MM/DD HH:mm A')

  return (
    <div className="flex gap-4">
      <div>{index + 1}.</div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="font-bold w-[140px]">
            {t(`component:courseEditDialog.class.name`)}
          </div>
          <div>:</div>
          <Button variants="link" className="p-0">
            {classes.class}
          </Button>
        </div>
        <div className="flex gap-2">
          <div className="font-bold w-[140px]">
            {t(`component:classCard.time`)}
          </div>
          <div>:</div>
          <div>
            {start} - {end}
          </div>
        </div>
        {isClassroom ? (
          <div className="flex gap-2">
            <div className="font-bold w-[140px]">
              {t(`component:classCard.locality`)}
            </div>
            <div>:</div>
            <div>{classes?.locationName || '-'}</div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="font-bold w-[140px]">
              {t(`teachingService:validate.assignedTeacher`)}
            </div>
            <div>:</div>
            <div>{classes?.instructorName || '-'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConflictItem
