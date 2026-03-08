import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuEye } from 'react-icons/lu'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { StudentEnrolmentRecord } from '@/types/student'

type BadgeParentStudentProps = {
  studentData?: StudentEnrolmentRecord
  studentList?: StudentEnrolmentRecord[]
}

const Details = ({ child }: { child: StudentEnrolmentRecord }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <div className="py-1 flex justify-between items-center border border-background-layer-4 rounded-md p-2 gap-3 hover:bg-background-layer-2">
      <div>
        <div>{child.name}</div>
        <div className="text-xs text-background-disabled">
          {child.email ?? '-'}
        </div>
        <div className="text-xs text-background-disabled">
          {child.user?.phone ?? '-'}
        </div>
      </div>
      <LuEye
        size={20}
        className="text-primary cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={t('student:badge.viewStudentRecord') as string}
        title={t('student:badge.viewStudentRecord') as string}
        onClick={e => {
          e.stopPropagation()
          navigate(`/student-record/${child.id}?userId=${child.userId}`)
        }}
      />
    </div>
  )
}

const BadgeParentStudent = ({
  studentData,
  studentList,
}: BadgeParentStudentProps): JSX.Element => {
  const { t } = useTranslation()

  const [isOpenStudent, setIsOpenStudent] = useState(false)
  const [isOpenParent, setIsOpenParent] = useState(false)

  const timer = useRef<NodeJS.Timeout | null>(null)

  const listChild = useMemo(
    () =>
      studentList?.filter(o => o.childOfUserAliasId === studentData?.id) ?? [],
    [studentList, studentData?.id]
  )

  const parentDetail = useMemo(
    () => studentList?.find(o => o.id === studentData?.childOfUserAliasId),
    [studentList, studentData?.childOfUserAliasId]
  )

  return (
    <div>
      {studentData?.isStudentParent && (
        <Tooltip
          delayDuration={0}
          open={isOpenStudent && !!studentList?.length}
          onOpenChange={v => {
            timer.current = setTimeout(() => {
              setIsOpenStudent(v)
            }, 200)
          }}
        >
          <TooltipTrigger>
            <div className="min-w-[60px] bg-primary-subtle text-center text-white rounded-sm text-xs py-1">
              {t(`student:column.parent`)}
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="border-white p-0"
            onPointerLeave={() => setIsOpenStudent(false)}
            onPointerOver={() => {
              if (timer.current) clearTimeout(timer.current)
              setIsOpenStudent(true)
            }}
          >
            <div>
              <div className="font-bold p-3 text-center border-b border-b-background-layer-4">
                {t('student:badge.associatedStudents')}{' '}
                {`(${listChild?.length ?? 0})`}
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto p-3">
                {listChild?.map(child => (
                  <Details key={child.id} child={child} />
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {studentData?.childOfUserAliasId && (
        <Tooltip
          delayDuration={0}
          open={isOpenParent && !!studentList?.length}
          onOpenChange={v => {
            timer.current = setTimeout(() => {
              setIsOpenParent(v)
            }, 200)
          }}
        >
          <TooltipTrigger>
            <div className="min-w-[60px] bg-blue-100 text-center text-primary-highlight rounded-sm text-xs py-1">
              {t(`student:column.student`)}
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="border-white p-0"
            onPointerLeave={() => setIsOpenParent(false)}
            onPointerOver={() => {
              if (timer.current) clearTimeout(timer.current)
              setIsOpenParent(true)
            }}
          >
            <div>
              <div className="font-bold p-3 text-center border-b border-b-background-layer-4">
                {t('student:badge.associatedParent')}
              </div>
              <div className="p-3">
                {parentDetail && <Details child={parentDetail} />}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

export default BadgeParentStudent
