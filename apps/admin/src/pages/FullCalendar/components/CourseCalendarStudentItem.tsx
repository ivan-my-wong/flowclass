import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa'
import {
  LuEye,
  LuMail,
  LuPhone,
  LuQrCode,
  LuRefreshCw,
  LuTrash,
} from 'react-icons/lu'
import { MdPending } from 'react-icons/md'
import { useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'

import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import SimpleToggleGroup from '@/components/ToggleGroup/SimpleToggleGroup'
import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Separator } from '@/components/ui/Separator'
import { AttendanceStatus } from '@/constants/course'
import { PaymentState } from '@/constants/payment'
import { QUERY_KEY } from '@/constants/queryKey'
import useConfirm from '@/hooks/useGlobalConfirm'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import MenuItem from '@/pages/FullCalendar/components/MenuItem'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { courseState } from '@/stores/courseData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { PromotionType } from '@/types/coupon'
import { StudentType as StudentProps } from '@/types/lessonDateTime'
import { StudentLesson } from '@/types/student'
import { StudentUser } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatPhoneNumber } from '@/utils/misc'
import { formatTs } from '@/utils/timeFormat'

type Props = {
  data: StudentProps
  refetch?: () => void
  isAboveInstructor?: boolean
}

const StudentStatus = ({
  data,
  refetch,
  isAboveInstructor,
}: Props): React.ReactElement => {
  const [, setStudentData] = useRecoilState(studentState)
  const { t } = useTranslation()
  const params = useParams()
  const { id: lessonId } = params as { id: string }
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    useUpdateAttendanceLesson,
    useDeleteStudentLesson,
    currentInstitutionId,
    currentSiteId,
  } = useLessonDateTimeData()
  const { courses } = useRecoilValue(courseState)
  const classes = useMemo(() => {
    return courses.flatMap(c => c.classes)
  }, [courses])

  const classEntity = useMemo(() => {
    return classes.find(d => d.id === data.classId)
  }, [classes, data.classId])

  const userAlias = data?.aliases

  const { mutateAsync, isLoading } = useUpdateAttendanceLesson()

  const [currentAttendance, setCurrentAttendance] = useState(data.attendance)

  const {
    mutateAsync: onDeleteStudentLesson,
    isLoading: isLoadingDeleteStudentLesson,
  } = useDeleteStudentLesson(async () => {
    await queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEY.course.getLessonDateTimeKey,
        +lessonId,
        currentInstitutionId,
        currentSiteId,
      ],
    })
  })

  const { setConfirm, closeConfirm } = useConfirm(
    isLoading || isLoadingDeleteStudentLesson
  )

  const handleAttendance = useCallback(
    _.throttle(async newStatus => {
      await mutateAsync({
        studentLessonId: data?.id,
        attendance: newStatus,
      }).then(() => {
        closeConfirm()
        refetch?.()
      })
    }, 1000),
    [data?.id]
  )

  const handleEditStudent = () => {
    if (userAlias) {
      navigate(`/student-record/${userAlias.id}?userId=${data.userId}`)
    }
  }

  const isDisabledAction = useMemo(() => {
    return new Date() > new Date(data?.end?.toString())
  }, [data?.end])

  const isTrialLesson = useMemo(() => {
    // Support both invoice (new) and invoices (old) for backward compatibility
    const invoices = data.enrollCourse?.invoice
      ? [data.enrollCourse.invoice]
      : data.enrollCourse?.invoices || []

    return invoices.some(invoice =>
      invoice.discounts?.includes(PromotionType.TRIAL_LESSON)
    )
  }, [data.enrollCourse])

  const currentStudentName = useMemo(() => {
    if (userAlias) {
      return userAlias.name
    }
    return data.name
  }, [userAlias, data.name])

  const currentStudentEmail = useMemo(() => {
    if (userAlias) {
      return userAlias.email
    }
    return data.email
  }, [userAlias, data.email])

  const menuRowItems: DropDownMenuItemType[] = useMemo(() => {
    return [
      MenuItem({
        icon: <LuEye />,
        onClick: () => handleEditStudent(),
        text: t('lessonDateTime:action.viewDetail'),
      }),
      MenuItem({
        icon: <LuQrCode />,
        onClick: () => {
          const urlParams = new URLSearchParams({
            studentLessonId: String(data?.id),
            student: String(data?.userId),
          })
          navigate(
            `/full-calendar/lesson/${lessonId}/view-qrcode?${urlParams.toString()}`
          )
        },
        text: t('lessonDateTime:viewQrCode'),
      }),
      MenuItem({
        icon: <LuRefreshCw />,
        disabled: isDisabledAction,
        onClick: () => {
          const urlParams = new URLSearchParams({
            startDate: searchParams.get('startDate') as string,
            endDate: searchParams.get('endDate') as string,
            student: String(data?.userId),
          })
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...prev.tableDrawers,
              isOpenAssignCourse: true,
              assignCourseMode: AddTeachingServiceMode.changeLesson,
            },
            currentStudent: {
              id: data.userId,
              fullName: data.name,
              phone: data.phone,
              email: data.email,
            } as StudentUser,
            currentStudentLesson: data as unknown as StudentLesson,
          }))
          navigate(
            `/full-calendar/lesson/${lessonId}/change-student-lesson?${urlParams.toString()}`
          )
        },
        text: t('lessonDateTime:action.changeStudentsLesson'),
      }),
      MenuItem({
        icon: <LuTrash className="text-red-500" />,
        disabled: isDisabledAction,
        onClick: () => {
          setConfirm({
            title: t('student:teachingService.deleteStudentLesson').toString(),
            description: t(
              'student:teachingService.deleteStudentLessonDescription'
            ).toString(),
            alertType: AlertTypes.WARN,
            cancelText: t('common:action.cancel').toString(),
            confirmText: t('common:action.confirm').toString(),
            onConfirm: async () => {
              if (data?.id) {
                await onDeleteStudentLesson(+data.id).then(() => {
                  closeConfirm()
                })
              }
            },
          }).open()
        },
        text: t('lessonDateTime:action.deleteClass'),
      }),
    ]
  }, [isDisabledAction])

  const toggleGroupPostponedStyle =
    data.attendance === AttendanceStatus.POSTPONE
      ? {
          backgroundColor: '$textSub',
          cursor: 'not-allowed',
          '&:hover': {
            backgroundColor: '$textSub',
          },
        }
      : {}
  const toggleGroupItems = useMemo(() => {
    return [
      {
        value: AttendanceStatus.ATTENDED,
        icon: <FaUserCheck />,
        tooltip: t('lessonDateTime:attendanceStatus.attended') || '',
        style: {
          pointerEvents: 'none',
          color: '$background',
          backgroundColor: '$success',
          ...toggleGroupPostponedStyle,
        },
      },
      {
        value: AttendanceStatus.NOT_ATTENDED,
        icon: <FaUserTimes />,
        tooltip: t('lessonDateTime:attendanceStatus.notAttended') || '',
        style: {
          pointerEvents: 'none',
          color: '$background',
          backgroundColor: '$warn',
        },
      },
      {
        value: AttendanceStatus.POSTPONE,
        icon: <FaUserClock />,
        tooltip: t('lessonDateTime:attendanceStatus.postpone') || '',
        disabled: classEntity?.type !== 'recurring',
        isHide: classEntity?.type !== 'recurring',
        style: {
          pointerEvents: 'none',
          color: '$background',
          backgroundColor: '$tertiary',
        },
      },
      {
        value: AttendanceStatus.PENDING,
        icon: <MdPending />,
        tooltip: t('lessonDateTime:attendanceStatus.pending') || '',
        style: {
          pointerEvents: 'none',
          color: '$background',
          backgroundColor: '$textSub',

          // ...toggleGroupPostponedStyle,
        },
      },
    ]
  }, [classEntity?.type])

  return (
    <>
      <Box
        className={cn([
          'bg-white rounded-md p-2',
          data.attendance === AttendanceStatus.POSTPONE &&
            'opacity-50 pointer-events-none',
        ])}
        direction="col"
      >
        <Box className="!p-0">
          <Box
            direction="col"
            align="start"
            justify="start"
            className="gap-y-4"
          >
            <span className="font-bold flex items-center gap-x-2">
              {currentStudentName}
              {isTrialLesson && (
                <Badge variant="secondary" className="text-sm">
                  {t('lessonDateTime:promotion.trialLesson') || 'Trial Lesson'}
                </Badge>
              )}
            </span>
            {isAboveInstructor && currentStudentEmail && (
              <span className="flex items-center gap-x-2">
                <LuMail />
                {currentStudentEmail}
              </span>
            )}
            {isAboveInstructor && data?.phone && (
              <span className="flex items-center gap-x-2">
                <LuPhone />
                {formatPhoneNumber(data.phone)}
              </span>
            )}
            <Box direction="col" className="!p-0 !w-fit">
              <Separator className="bg-gray-200" />
              <SimpleToggleGroup
                className="!p-0"
                isLoading={isLoading}
                disabled={data.attendance === AttendanceStatus.POSTPONE}
                currentItem={currentAttendance}
                items={toggleGroupItems}
                onChange={status => {
                  if (status.value === AttendanceStatus.POSTPONE) {
                    setConfirm({
                      title: t('lessonDateTime:postpone.postpone').toString(),
                      description: t(
                        'lessonDateTime:postpone.postponeWarning'
                      ).toString(),
                      alertType: AlertTypes.WARN,
                      cancelText: t('common:action.cancel') as string,
                      confirmText: t('common:action.confirm') as string,
                      onConfirm: () => {
                        handleAttendance(AttendanceStatus.POSTPONE)
                      },
                    }).open()
                  } else {
                    handleAttendance(status.value)
                    setCurrentAttendance(status.value)
                  }
                }}
              />
            </Box>
          </Box>
          <Box direction="col" justify="end" align="end">
            {isAboveInstructor && (
              <DropdownMenu
                menuItems={menuRowItems}
                className="!text-2xl font-normal"
                contentProps={{ width: '16rem', zIndex: 9999 }}
              />
            )}
            {data.changeDate && data.changeStartTime && data.changeEndTime && (
              <Badge variant="secondary" className="text-sm">
                {`Changed from ${formatTs(
                  data.changeDate.toString(),
                  'DD/MM/YY'
                )} ${formatTs(
                  data.changeStartTime.toString(),
                  'hhmm'
                )}-${formatTs(data.changeEndTime.toString(), 'hhmm')}`}
              </Badge>
            )}
            <Box justify="end" className="!p-0 text-sm">
              {t('lessonDateTime:lesson')}: {data?.completedLessons || 0} /{' '}
              {data?.lessons || 0}
            </Box>
            <Box justify="end" className="!p-0">
              <Badge
                variant={
                  data.payments.paymentState === PaymentState.PAID
                    ? 'success'
                    : 'secondary'
                }
                className="text-sm"
              >
                {data.payments.paymentState === PaymentState.PAID
                  ? t('teachingService:paymentStatus.paid')
                  : t('teachingService:paymentStatus.unpaid')}
              </Badge>
            </Box>
          </Box>
        </Box>
        {data.attendance === AttendanceStatus.POSTPONE && (
          <Badge variant="destructive" className="mr-auto">
            {t('lessonDateTime:postpone.postponed')}
          </Badge>
        )}
      </Box>
    </>
  )
}

export default StudentStatus
