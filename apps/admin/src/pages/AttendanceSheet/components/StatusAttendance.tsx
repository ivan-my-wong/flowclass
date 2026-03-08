import { useTranslation } from 'react-i18next'
import { GiHamburgerMenu } from 'react-icons/gi'
import { TbCreditCardOff } from 'react-icons/tb'

import { Spinner } from '@/components/Loaders/Spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { AttendanceStatus } from '@/constants/course'
import { PaymentState } from '@/constants/payment'
import useConfirm from '@/hooks/useGlobalConfirm'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { EnrollIntoInfo } from '@/types/enrollCourse'
import { StudentType } from '@/types/lessonDateTime'
import { getLessonDateTime } from '@/utils/timeFormat'

type StatusAttendanceProps = {
  onChange: (s: AttendanceStatus) => void
  studentLesson?: StudentType
}
const StatusAttendance = (props: StatusAttendanceProps) => {
  const { studentLesson, onChange } = props

  const { t } = useTranslation()

  const { useUpdateAttendanceLesson } = useLessonDateTimeData()
  const { mutateAsync: updateAttendance, isLoading: loadUpdate } =
    useUpdateAttendanceLesson()

  const { setConfirm, closeConfirm } = useConfirm(loadUpdate)

  const handleAttendance = async (newStatus: AttendanceStatus) => {
    await updateAttendance({
      studentLessonId: studentLesson?.id,
      attendance: newStatus,
    }).then(() => {
      onChange(newStatus)
      closeConfirm()
    })
  }

  if (loadUpdate) {
    return (
      <div className="flex justify-center">
        <Spinner size="small" />
      </div>
    )
  }

  if (!studentLesson) {
    return <div className="text-center font-bold">-</div>
  }

  const { payments, changeStartTime, changeEndTime, attendance, enrollCourse } =
    studentLesson

  if (changeStartTime && changeEndTime) {
    const enrollInto = (enrollCourse?.enrollInto as EnrollIntoInfo[])?.at(0)

    const time = getLessonDateTime(
      changeStartTime.toString(),
      changeEndTime.toString(),
      t
    ).split(' ')

    return (
      <div className="flex flex-col justify-center items-center">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-bold">{t('lessonMatrix:changeTo')}</div>
          <div>{enrollInto?.courseName}</div>
          <div>{enrollInto?.secondLevelName}</div>
          <div>{time[0]}</div>
          <div>{time.slice(1, time.length).join(' ')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex items-center gap-2 justify-center w-full">
        <button
          type="button"
          className={[
            'rounded-full px-3 py-1 text-sm w-[100px]',
            attendance === AttendanceStatus.ATTENDED
              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ].join(' ')}
          onClick={() => handleAttendance(AttendanceStatus.ATTENDED)}
        >
          {t('lessonMatrix:status.present')}
        </button>
        <button
          type="button"
          className={[
            'rounded-full px-3 py-1 text-sm w-[100px]',
            attendance === AttendanceStatus.NOT_ATTENDED
              ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ].join(' ')}
          onClick={() => handleAttendance(AttendanceStatus.NOT_ATTENDED)}
        >
          {t('lessonMatrix:status.absent')}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-full">
            <GiHamburgerMenu className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className={[
                'cursor-pointer',
                attendance === AttendanceStatus.PENDING
                  ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 hover:bg-blue-200'
                  : 'hover:bg-gray-100',
              ].join(' ')}
              onClick={() => {
                handleAttendance(AttendanceStatus.PENDING)
              }}
            >
              {t('lessonMatrix:status.pending')}
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              className={[
                'cursor-pointer',
                attendance === AttendanceStatus.POSTPONE
                  ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 hover:bg-yellow-200'
                  : 'hover:bg-gray-100',
              ].join(' ')}
              onClick={() => {
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
              }}
            >
              {t('lessonMatrix:status.postponed')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={[
                'cursor-pointer',
                attendance === AttendanceStatus.CANCELLED
                  ? 'bg-red-100 text-red-800 ring-1 ring-red-200 hover:bg-red-200'
                  : 'hover:bg-gray-100',
              ].join(' ')}
              onClick={() => {
                handleAttendance(AttendanceStatus.CANCELLED)
              }}
            >
              {t('lessonMatrix:status.cancelled')}
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
        {payments?.paymentState !== PaymentState.PAID && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <TbCreditCardOff
                size={20}
                className="text-red-500 hover:text-red-700"
              />
            </TooltipTrigger>
            <TooltipContent>
              <div>
                {t('lessonMatrix:tooltipUnpaid', {
                  paymentState: payments?.paymentState?.toLowerCase(),
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export default StatusAttendance
