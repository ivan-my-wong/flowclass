import { FC, useCallback, useMemo, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaTrash } from 'react-icons/fa'
import { LuPlusSquare, LuTrash } from 'react-icons/lu'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'

import ChangeIcon from '@/assets/svgs/teachingService/ChangeIcon'
import IconButton from '@/components/Buttons/IconButton'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import useSiteData from '@/hooks/useSiteData'
import useTeachingServiceData from '@/hooks/useTeachingServiceData'
import { GetAttendanceStatusComponent } from '@/pages/StudentDetail/components/TeachingServiceItem'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { ClassTypeEnum } from '@/types/course'
import { Invoice } from '@/types/enrollCourse'
import { TypeTeachingServiceDetail } from '@/types/student'
import { StudentUser } from '@/types/user'
import { getLessonDateTime } from '@/utils/timeFormat'

interface Props {
  invoiceData: Invoice
  service: TypeTeachingServiceDetail
  student: StudentUser
}

const ClassSchedules: FC<Props> = ({
  service,
  student,
  invoiceData,
}): JSX.Element => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [studentData, setStudentData] = useRecoilState(studentState)
  const { timeZone, getCurrentSiteTimeZoneDate } = useSiteData()

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [lessonToBeDeleted, setLessonToBeDeleted] = useState<number | null>(
    null
  )

  // Set default timezone once
  useMemo(() => {
    dayjs.tz.setDefault(timeZone)
  }, [timeZone])

  const getTeachingService = useCallback(async () => {
    await queryClient.invalidateQueries([
      QUERY_KEY.teachingService.getTeachingServiceByInvoiceIdKey,
      invoiceData.id,
    ])
  }, [queryClient])

  const { useDeleteStudentLesson } = useLessonDateTimeData()
  const mutationDeleteStudentLesson = useDeleteStudentLesson()

  const { useDeleteTeachingService } = useTeachingServiceData()
  const mutationDeleteTeachingService = useDeleteTeachingService()

  const sortedServiceLessons = useMemo(() => {
    if (!service?.lessons?.length) return []
    return [...service.lessons].sort(
      (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
    )
  }, [service.lessons])

  const handleDeleteLesson = useCallback((lessonId: number) => {
    setLessonToBeDeleted(lessonId)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (lessonToBeDeleted !== null) {
      await mutationDeleteStudentLesson
        .mutateAsync(lessonToBeDeleted)
        .then(() => getTeachingService())
    }
    setLessonToBeDeleted(null)
  }, [lessonToBeDeleted, mutationDeleteStudentLesson])

  const handleChangeLesson = useCallback(
    (lesson: any) => {
      setStudentData(prev => ({
        ...prev,
        currentEnrol: service,
        currentStudent: student,
        tableDrawers: {
          ...prev.tableDrawers,
          isOpenAssignCourse: true,
          assignCourseMode: AddTeachingServiceMode.changeLesson,
        },
        currentStudentLesson: lesson,
      }))
    },
    [service, student, setStudentData]
  )

  const handleDeleteTeachingService = async () => {
    await mutationDeleteTeachingService
      .mutateAsync({
        enrollCourseId: Number(service.enrollCourseId),
        classId: Number(service.classId),
        institutionId: invoiceData.institutionId,
        siteId: invoiceData.siteId,
      })
      .then(() => getTeachingService())

    setShowConfirmDelete(false)
  }

  return (
    <>
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-2">
          <div className="space-y-2">
            <div className="font-semibold mb-1">{service.courseName}</div>
            <div>{service.className}</div>
          </div>
          <Button
            iconBefore={<LuTrash />}
            variant="destructive"
            className="ml-auto"
            onClick={() => setShowConfirmDelete(true)}
          >
            {t('common:action.delete')}
          </Button>
          {service.classType !== ClassTypeEnum.subscription && (
            <Button
              iconBefore={<LuPlusSquare />}
              onClick={() => {
                setStudentData(prev => ({
                  ...prev,
                  currentStudent: student,
                  currentEnrol: service,
                  currentStudentLesson: sortedServiceLessons?.[0],
                  tableDrawers: {
                    ...studentData.tableDrawers,
                    assignCourseMode: AddTeachingServiceMode.addLesson,
                    isOpenAssignCourse: true,
                  },
                }))
              }}
            >
              {t('student:teachingService.addLesson')}
            </Button>
          )}
        </div>

        {sortedServiceLessons.length > 0 && (
          <div className="mt-2.5 w-full">
            <div className="grid grid-cols-[1fr_126px] border border-[#808080]">
              <div className="text-base font-normal text-black p-2.5">
                {t('student:teachingService.lesson')}
              </div>
            </div>

            {sortedServiceLessons.map((lesson, idx) => (
              <LessonRow
                key={`${lesson.id}-${idx}`}
                lesson={lesson}
                index={idx}
                hasMultipleLessons={sortedServiceLessons.length > 1}
                onDelete={handleDeleteLesson}
                onChange={handleChangeLesson}
                getCurrentSiteTimeZoneDate={getCurrentSiteTimeZoneDate}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      <CustomedAlertDialog
        open={!!lessonToBeDeleted}
        setOpen={() => setLessonToBeDeleted(null)}
        title={t('student:teachingService.deleteStudentLesson')}
        description={t('student:teachingService.deleteStudentLesson')}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleConfirmDelete}
      />

      <CustomedAlertDialog
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        description={t(
          'student:teachingService.deteteTeachingServiceDescription'
        )}
        title={`${t('student:teachingService.deteteTeachingServiceTitle')}: ${
          service.courseName
        }`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleDeleteTeachingService}
      />
    </>
  )
}

// Separate component for lesson row to optimize re-renders
const LessonRow: FC<{
  lesson: any
  index: number
  hasMultipleLessons: boolean
  onDelete: (lessonId: number) => void
  onChange: (lesson: any) => void
  getCurrentSiteTimeZoneDate: (date: any) => any
  t: any
}> = ({
  lesson,
  index,
  hasMultipleLessons,
  onDelete,
  onChange,
  getCurrentSiteTimeZoneDate,
  t,
}) => {
  const changeDate = !!lesson.changeStartTime

  const timeSlots = useMemo(() => {
    const startTime = getCurrentSiteTimeZoneDate(lesson.startTime)
    const endTime = getCurrentSiteTimeZoneDate(lesson.endTime)
    const changeStartTime = getCurrentSiteTimeZoneDate(lesson.changeStartTime)
    const changeEndTime = getCurrentSiteTimeZoneDate(lesson.changeEndTime)

    return {
      original:
        startTime && endTime
          ? getLessonDateTime(startTime.toString(), endTime.toString(), t)
          : '',
      changed:
        changeDate && changeStartTime && changeEndTime
          ? getLessonDateTime(
              changeStartTime.toString(),
              changeEndTime.toString(),
              t
            )
          : '',
    }
  }, [lesson, getCurrentSiteTimeZoneDate, changeDate, t])

  return (
    <div className="grid grid-cols-[40px_1fr] border border-[#808080] border-t-0 h-auto min-h-[3rem]">
      <div className="w-10 border-r border-[#808080] py-4 px-2.5 h-full text-center">
        {index + 1}
      </div>

      <div className="box-responsive-full justify-between px-2">
        <div className="box-responsive-full justify-start">
          <div className="flex-2">
            <div className="text-sm" data-testid="lesson-time-slot">
              {timeSlots.original}
            </div>
            {timeSlots.changed && (
              <div className="text-xs">
                {t('student:changedTo')} {timeSlots.changed}
              </div>
            )}
          </div>
          <div className="flex-1">
            {GetAttendanceStatusComponent(lesson.attendance)}
          </div>
        </div>

        <div className="box-row-full w-fit">
          {hasMultipleLessons && (
            <IconButton
              icon={<FaTrash />}
              plain
              color="warn"
              onClick={() => onDelete(Number(lesson.id))}
            />
          )}

          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => onChange(lesson)}
          >
            {changeDate ? (
              <span className="text-base font-normal text-[#5C95FF]">
                {t('student:editBtn')}
              </span>
            ) : (
              <>
                <ChangeIcon />
                <span className="text-base font-normal text-[#5C95FF]">
                  {t('student:changeBtn')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassSchedules
