import { FC, useCallback, useMemo, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuPencil, LuPlusSquare, LuTrash } from 'react-icons/lu'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'

import IconButton from '@/components/Buttons/IconButton'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
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
      queryClient.invalidateQueries(QUERY_KEY.student.getStudentDetailKey)
      setStudentData(prev => ({
        ...prev,
        currentEnrol: {
          ...service,
          invoices: [
            {
              invoiceId: invoiceData.id,
              paymentState: invoiceData.paymentState,
            },
          ],
        },
        currentStudent: student,
        tableDrawers: {
          ...studentData.tableDrawers,
          isOpenAssignCourse: true,
          assignCourseMode: AddTeachingServiceMode.changeLesson,
        },
        currentStudentLesson: lesson,
      }))
    },
    [
      service,
      student,
      invoiceData,
      studentData.tableDrawers,
      setStudentData,
      queryClient,
    ]
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
          <div className="mt-2 w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>{t('student:teachingService.lesson')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedServiceLessons.map((lesson, idx) => {
                  const isChangeDate = !!lesson.changeStartTime
                  const startTime = getCurrentSiteTimeZoneDate(lesson.startTime)
                  const endTime = getCurrentSiteTimeZoneDate(lesson.endTime)
                  const changeStartTime = getCurrentSiteTimeZoneDate(
                    lesson.changeStartTime
                  )
                  const changeEndTime = getCurrentSiteTimeZoneDate(
                    lesson.changeEndTime
                  )

                  return (
                    <TableRow key={`${lesson.id}-${idx}`}>
                      <TableCell className="w-10 text-center border-r border-gray-300 py-3 px-2">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="py-3 px-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-2">
                              <div
                                className="text-sm"
                                data-testid="lesson-time-slot"
                              >
                                {startTime &&
                                  endTime &&
                                  getLessonDateTime(
                                    startTime.toString(),
                                    endTime.toString(),
                                    t
                                  )}
                              </div>
                              {isChangeDate &&
                                changeStartTime &&
                                changeEndTime && (
                                  <div className="text-xs text-gray-400 line-through">
                                    {t('student:changedFrom')}{' '}
                                    {getLessonDateTime(
                                      changeStartTime.toString(),
                                      changeEndTime.toString(),
                                      t
                                    )}
                                  </div>
                                )}
                            </div>
                            <div className="flex-1">
                              {GetAttendanceStatusComponent(lesson.attendance)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sortedServiceLessons.length > 1 && (
                              <IconButton
                                icon={<LuTrash />}
                                plain
                                color="warn"
                                onClick={() =>
                                  handleDeleteLesson(Number(lesson.id))
                                }
                              />
                            )}

                            <Button
                              variant="ghost"
                              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 p-0 h-auto"
                              onClick={() => handleChangeLesson(lesson)}
                              data-testid="changeLesson"
                            >
                              {isChangeDate ? (
                                <div className="flex items-center gap-1">
                                  <div className="text-base font-normal">
                                    {t('student:editBtn')}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <LuPencil className="w-4 h-4" />{' '}
                                  <div className="text-base font-normal">
                                    {t('student:changeBtn')}
                                  </div>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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

export default ClassSchedules
