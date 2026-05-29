import { useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { use } from 'i18next'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { FaTrashAlt } from 'react-icons/fa'
import { LuCreditCard, LuLock } from 'react-icons/lu'
import { TbFileExport } from 'react-icons/tb'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { deleteStudent, getTeachingService } from '@/api/student'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { Button } from '@/components/ui/Button'
import { AttendanceStatus } from '@/constants/course'
import { DATE_TIME_AM_FORMAT } from '@/constants/dateTimeFormat'
import { csvHeadersExportLessonRecords } from '@/constants/exportCSVPrefix'
import { QUERY_KEY } from '@/constants/queryKey'
import useCredit from '@/hooks/useCredit'
import useSiteData from '@/hooks/useSiteData'
import { AddOrDeductCreditModalHandle } from '@/pages/StudentCRM/components/AddOrDeductCreditModal'
import CreditBalanceModal, {
  CreditBalanceModalHandle,
} from '@/pages/StudentCRM/components/CreditBalanceModal'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { requiredParamsState } from '@/stores/requiredParamsData'
import { schoolState } from '@/stores/schoolData'
import { TypeDeleteStudentParams } from '@/types/student'
import { getFormatDate, getLessonDateTime } from '@/utils/timeFormat'

import ChangeAliasPasswordModal from './ChangeAliasPasswordModal'

type Props = {
  userId: number
  siteId: number
  institutionId: number
  isActive: boolean
  isStudentDeleted: boolean
  studentEmail: string
}

const RightHeaderStudentDetail = ({
  userId,
  institutionId,
  siteId,
  isActive,
  isStudentDeleted,
  studentEmail,
}: Props): JSX.Element => {
  const queryClient = useQueryClient()
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const creditBalanceModalHandle = useRef<CreditBalanceModalHandle | null>(null)

  const [schoolData] = useRecoilState(schoolState)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { useCheckCreditSystemActive } = useCredit()
  const { isActive: showCreditSystem } = useCheckCreditSystemActive()

  const isSiteManager = schoolData.currentSchool?.email === studentEmail
  const mutationDeleteStudent = useMutation({
    mutationFn: (params: Partial<TypeDeleteStudentParams>) =>
      deleteStudent(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEY.student.studentListKey,
          QUERY_KEY.student.getStudentDetailKey,
        ],
      }) // call API get list
      toast.success(t('student:detail.deleteStudentSuccess'))
      setShowConfirmPopup(false)
      navigate('/student-record')
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const handleDelete = () => {
    if (!isActive && !isStudentDeleted) {
      setShowConfirmPopup(true)
    }
  }
  const handleConfirm = () => {
    if (userId && institutionId) {
      const params: TypeDeleteStudentParams = {
        institutionId: Number(institutionId),
        siteId,
        userAliasIds: [userId],
      }
      mutationDeleteStudent.mutate(params)
    }
  }

  const { timeZone, getCurrentSiteTimeZoneDate } = useSiteData()
  dayjs.tz.setDefault(timeZone)

  const requiredParams = useRecoilValue(requiredParamsState)
  const query = useQuery(
    [
      QUERY_KEY.teachingService.getTeachingServiceKey,
      requiredParams.userAliasId,
    ],
    () => {
      const params = {
        userId: requiredParams.userId,
        institutionId: requiredParams.institutionId,
        siteId: requiredParams.siteId ?? 0,
        userAliasId: requiredParams.userAliasId,
      }
      return getTeachingService(params)
    },
    {
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!requiredParams.userAliasId,
    }
  )

  const getAttendanceStatus = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.ATTENDED:
        return t('student:attendanceStatus.attended')
      case AttendanceStatus.PENDING:
        return t('student:attendanceStatus.pending')
      case AttendanceStatus.POSTPONE:
        return t('student:attendanceStatus.postpone')
      case AttendanceStatus.NOT_ATTENDED:
        return t('student:attendanceStatus.absent')
      case AttendanceStatus.CANCELLED:
        return t('student:attendanceStatus.cancelled')
      default:
        return ''
    }
  }

  const csvFileName = `lesson_records_${dayjs().format('YYYYMMDD')}.csv`
  const csvData = useMemo(() => {
    if (!query.data) return []
    return query.data?.map(row => {
      let name = ''
      let phone = ''
      let email = ''

      if (row.registrationForm) {
        name =
          row.registrationForm
            .find(
              o =>
                o.columnMapping === 'name' ||
                o.question.toLowerCase() === 'name'
            )
            ?.value?.toString() ?? ''
        phone =
          row.registrationForm
            .find(
              o =>
                o.columnMapping === 'phone' ||
                o.question.toLowerCase() === 'phone'
            )
            ?.value?.toString() ?? ''
        email =
          row.registrationForm
            .find(
              o =>
                o.columnMapping === 'email' ||
                o.question.toLowerCase() === 'email'
            )
            ?.value?.toString() ?? ''
      }

      const lesson = row.lessons.find(
        o => o.enrollCourseId === row.enrollCourseId
      )

      if (!lesson) return {}

      const startTime = getCurrentSiteTimeZoneDate(lesson.startTime)!
      const endTime = getCurrentSiteTimeZoneDate(lesson.endTime)!
      const changeStartTime = getCurrentSiteTimeZoneDate(
        lesson.changeStartTime
      )!
      const changeEndTime = getCurrentSiteTimeZoneDate(lesson.changeEndTime)!
      const lastUpdated = getCurrentSiteTimeZoneDate(lesson.updatedAt!)

      return {
        id: row.invoiceId,
        name,
        phone,
        email,
        applicationId: row.enrollCourseId,
        courseName: row.courseName,
        className: row.className,
        lessonTimeStart: getFormatDate(
          startTime,
          DATE_TIME_AM_FORMAT
        ),
        lessonTimeEnd: getFormatDate(
          endTime,
          DATE_TIME_AM_FORMAT
        ),
        attendanceStatus: getAttendanceStatus(lesson.attendance),
        lastUpdated: getFormatDate(lastUpdated, DATE_TIME_AM_FORMAT),
      }
    })
  }, [query.data])

  return (
    <div className="box-row-full justify-end">
      {csvData.length > 0 && (
        <CSVLink
          headers={csvHeadersExportLessonRecords.map(o => ({
            label: t(o.label),
            key: o.key,
          }))}
          data={csvData}
          filename={csvFileName}
          target="_blank"
          style={{
            textDecoration: 'none',
            flexShrink: 0,
          }}
          onClick={(e: any) => {
            if (!query.data) e.preventDefault()
          }}
        >
          <Button iconBefore={<TbFileExport />} variant="primary-outline">
            {t('student:exportLessonRecords')}
          </Button>
        </CSVLink>
      )}
      {showCreditSystem && (
        <Button
          iconBefore={<LuCreditCard />}
          onClick={() => {
            creditBalanceModalHandle.current?.handleOpenChange?.()
          }}
          variant="outline"
        >
          {t('student:credit.title')}
        </Button>
      )}
      <Button
        iconBefore={<LuLock />}
        onClick={() => setShowChangePasswordModal(true)}
        disabled={isStudentDeleted}
        variant="outline"
      >
        {t('student:changePassword.button')}
      </Button>
      <Button
        iconBefore={<FaTrashAlt />}
        onClick={handleDelete}
        disabled={isActive || isStudentDeleted || isSiteManager}
        variant="destructive-outline"
      >
        {t('student:detail.delete')}
      </Button>
      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('student:dialog:descriptionAlertDialog')}
        title={`${t('student:dialog:titleAlertDialog')}`}
        alertType={AlertTypes.WARN}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleConfirm}
        loading={mutationDeleteStudent.isLoading}
      />
      <ChangeAliasPasswordModal
        userAliasId={userId}
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <CreditBalanceModal ref={creditBalanceModalHandle} userAliasId={userId} />
    </div>
  )
}

export default RightHeaderStudentDetail
