import { useTranslation } from 'react-i18next'
import { GiNewShoot } from 'react-icons/gi'

import { Badge } from '@/components/ui/Badge'
import Text from '@/components/ui/Text'
import { ClassTypeEnum } from '@/types/course'
import {
  SingleStudentCrmRecordEnrollCourse,
  StudentEnrolmentRecord,
} from '@/types/student'

const TeachingServiceNameColumn = ({
  data,
  value,
}: {
  data: StudentEnrolmentRecord
  value: string
}): JSX.Element => {
  const { t } = useTranslation()

  const filteredRecurrClasses =
    data.enrollCourses?.filter((item: SingleStudentCrmRecordEnrollCourse) => {
      if (item.studentSchedule === null || item.studentSchedule.length === 0) {
        return false
      }
      return item.studentSchedule[0].class?.type === ClassTypeEnum.recurring
    }) ?? []

  const remarks = data.remarks?.trim()

  const nameNode = (
    <div className="flex flex-col min-w-0">
      <span>{value}</span>
      {remarks && (
        <span className="text-[10px] text-amber-600 leading-tight truncate max-w-[160px]">
          {remarks}
        </span>
      )}
    </div>
  )

  return (
    <>
      {filteredRecurrClasses.length === 1 ? (
        <div className="box-row-full py-2 justify-start items-start">
          <Badge variant="success">
            <GiNewShoot size="15" />
            {t('teachingService:firstEnrolStatus.newStudent')}
          </Badge>
          {nameNode}
        </div>
      ) : (
        <div
          className="box-row-full py-2 justify-start"
          data-testid="remark-button"
        >
          {nameNode}
        </div>
      )}
    </>
  )
}

export default TeachingServiceNameColumn
