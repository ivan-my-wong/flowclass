import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { GiNewShoot } from 'react-icons/gi'
import { useRecoilState, useRecoilValue } from 'recoil'

import RemarkIcon from '@/assets/svgs/student/RemarkIcon'
import ModalRemark from '@/components/Popups/ModalRemark'
import { Badge } from '@/components/ui/Badge'
import Text from '@/components/ui/Text'
import { schoolState } from '@/stores/schoolData'
import { remarksState } from '@/stores/studentData'
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
  const { currentSchool } = useRecoilValue(schoolState)
  const currentSchoolId = currentSchool?.id || 0
  const [remarks, setRemarks] = useRecoilState(remarksState)

  const filteredRecurrClasses =
    data.enrollCourses?.filter((item: SingleStudentCrmRecordEnrollCourse) => {
      if (item.studentSchedule === null || item.studentSchedule.length === 0) {
        return false
      }
      return item.studentSchedule[0].class?.type === ClassTypeEnum.recurring
    }) ?? []
  const studentId = data.id
  useEffect(() => {
    const studentMemoItem = data.studentMemo
    const isShow =
      (studentMemoItem !== null && studentMemoItem !== undefined) || false
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [studentId]: {
        ...prevRemarks[studentId],
        isShow,
      },
    }))
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [studentId]: {
        ...prevRemarks[studentId],
        memo: studentMemoItem?.memo ?? null,
      },
    }))
  }, [studentId, setRemarks, currentSchoolId, data?.studentMemo])

  const remark = remarks[studentId]?.isShow && (
    <ModalRemark
      studentId={studentId}
      title={t('common:description.remark')}
      placeholder={t('teachingService:remark.placeholder')}
      defaultValue={remarks[studentId].memo || ''}
      trigger={
        <div data-testid="remark-trigger-button">
          <RemarkIcon />
        </div>
      }
    />
  )
  return (
    <>
      {filteredRecurrClasses.length === 1 ? (
        <div className="box-row-full py-2 justify-start items-start">
          {remark}
          <Badge variant="success">
            <GiNewShoot size="15" />
            {t('teachingService:firstEnrolStatus.newStudent')}
          </Badge>
          <Text>{value}</Text>
        </div>
      ) : (
        <div
          className="box-row-full py-2 justify-start"
          data-testid="remark-button"
        >
          {remark}
          <span>{value}</span>
        </div>
      )}
    </>
  )
}

export default TeachingServiceNameColumn
