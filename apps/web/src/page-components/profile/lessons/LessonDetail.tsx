import { FC, useMemo } from 'react'

import dayjs from 'dayjs'
import { LucideArrowLeft, LucideCalendar, LucideExternalLink } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Buttons/Button'
import { useGetDetailStudentLesson } from '@/hooks/useProfile'
import useResponsive from '@/hooks/useResponsive'
import { useAuth } from '@/stores/auth'
import { School } from '@/types'
import { UpcomingLesson } from '@/types/profile'
import { formatFileSize } from '@/utils/format'
import { getUrlPaymentView } from '@/utils/profile'

import RequestTimeChange from '../UpcomingLessons/RequestTimeChange'

import LessonFileCard from './LessonFileCard'
import UploadFiles from './UploadFiles'

interface Props {
  schoolId: number
  lessonData: UpcomingLesson | undefined
  onBack: () => void
  school: School
}

const LessonDetail: FC<Props> = ({ lessonData, onBack, schoolId, school }): JSX.Element => {
  const { t } = useTranslation()

  const { isMobile, isTablet } = useResponsive()
  const { auth } = useAuth()

  const { data: lessonDataDetail } = useGetDetailStudentLesson(lessonData?.id, schoolId)

  const isEmptyTeacherFeedback = useMemo(() => {
    return (lessonDataDetail?.teacherResponses ?? []).length === 0
  }, [lessonDataDetail?.teacherResponses])

  const isEmptyStudentSubmission = useMemo(() => {
    return (lessonDataDetail?.studentSubmissions ?? []).length === 0
  }, [lessonDataDetail?.studentSubmissions])

  const urlView = useMemo(() => {
    if (!lessonDataDetail) return ''

    return getUrlPaymentView({
      proofToken: lessonDataDetail.invoice?.proofToken,
      enrollId: lessonDataDetail.invoice?.enrollCourses?.at(0)?.id ?? undefined,
      enrollIds: (lessonDataDetail.invoice?.enrollCourses ?? [])
        ?.map(enroll => enroll.id.toString())
        .join(','),
      paymentState: lessonDataDetail.invoice?.paymentState,
      schoolPath: school?.url ?? '',
      coursePath: lessonDataDetail.course?.path,
    })
  }, [lessonDataDetail, school])

  if (!lessonDataDetail) return <div>{t('profile:lessons.noLessonSelected')}</div>

  return (
    <div className="space-y-2">
      {(isMobile || isTablet) && (
        <Button variant="outlined" iconBefore={<LucideArrowLeft />} onClick={onBack}>
          {t('profile:lessons.back')}
        </Button>
      )}
      <p className="text-lg font-semibold">{lessonDataDetail.course?.name}</p>
      <p>{lessonDataDetail.class?.name}</p>
      <div className="flex items-center gap-1">
        <LucideCalendar size={18} />
        <div className="text-sm">
          {dayjs(lessonDataDetail.startTime).format('YYYY-MM-DD')}{' '}
          {dayjs(lessonDataDetail.startTime).format('HH:mm A')} -{' '}
          {dayjs(lessonDataDetail.endTime).format('HH:mm A')}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-2 md:flex-row">
        <RequestTimeChange
          data={{ ...lessonDataDetail, institutionId: schoolId }}
          schoolName={school?.name}
        />

        <Button onClick={() => window.open(urlView, '_blank')}>
          {t('profile:visitReceiptPage')}
        </Button>
      </div>
      <p className="border-b border-gray-200 pb-2 pt-4 font-medium">
        {t('profile:lessons.lessonMaterials')}
      </p>
      {!lessonDataDetail.materials.length && <p>{t('profile:lessons.noMaterialsUploaded')}</p>}
      {lessonDataDetail.materials.map(materialItem => {
        const materialExpiryDate = materialItem.expiryDate ? dayjs(materialItem.expiryDate) : null
        const studentExpiryDate = lessonDataDetail.expiryDate
          ? dayjs(lessonDataDetail.expiryDate)
          : null

        let effectiveExpiryDate = null

        if (studentExpiryDate && materialExpiryDate) {
          effectiveExpiryDate = studentExpiryDate.isBefore(materialExpiryDate)
            ? studentExpiryDate
            : materialExpiryDate
        } else {
          effectiveExpiryDate = studentExpiryDate || materialExpiryDate
        }

        const isExpired = effectiveExpiryDate ? dayjs().isAfter(effectiveExpiryDate) : false

        const containerClass = isExpired
          ? 'relative flex justify-between rounded-lg bg-red-50 p-4'
          : 'relative flex justify-between rounded-lg bg-gray-50 p-4'

        const expiryText = effectiveExpiryDate
          ? isExpired
            ? t('profile:lessons.expiredAt', {
                date: effectiveExpiryDate.format('DD-MM-YYYY HH:mm A'),
              })
            : t('profile:lessons.expiresAt', {
                date: effectiveExpiryDate.format('DD-MM-YYYY HH:mm A'),
              })
          : t('profile:lessons.noExpiryDate')

        return (
          <div
            key={`material-${lessonDataDetail.id}#${materialItem.id}`}
            className={containerClass}
          >
            <div className="flex flex-col gap-2">
              <div className="ring-offset-dark-text-highlight line-clamp-2 font-medium">
                {materialItem.name}
              </div>
              {materialItem.size > 0 && (
                <div>
                  <Badge variant="outline">{formatFileSize(materialItem.size)}</Badge>
                </div>
              )}
              <div className="text-xs">{expiryText}</div>
            </div>
            {!isExpired && (
              <div>
                <Button
                  variant="outlined"
                  iconBefore={<LucideExternalLink size={18} />}
                  onClick={() => {
                    if (!materialItem.link) {
                      return toast.error(t('profile:lessons.noDownloadLinkAvailable') as string)
                    }
                    window.open(materialItem.link, '_blank')
                  }}
                >
                  {t('profile:lessons.view')}
                </Button>
              </div>
            )}
          </div>
        )
      })}
      <div className="border-b border-gray-200 pb-2 pt-4 font-medium">
        {t('profile:lessons.uploadedFiles')}
      </div>
      {(lessonDataDetail.studentSubmissions ?? []).map(uploadedItem => (
        <LessonFileCard
          key={`file-${lessonDataDetail.id}#${uploadedItem.id}`}
          fileDetail={uploadedItem}
          isClearable
          schoolId={schoolId}
          studentLessonId={lessonDataDetail.id}
        />
      ))}
      {isEmptyStudentSubmission && <p>{t('profile:lessons.noStudentSubmissions')}</p>}
      {auth?.id && (
        <UploadFiles
          schoolId={schoolId}
          studentLessonId={lessonDataDetail.id}
          studentId={auth?.id}
        />
      )}
      <div className="border-b border-gray-200 pb-2 pt-4 font-medium">
        {t('profile:lessons.response')}
      </div>
      {(lessonDataDetail.teacherResponses ?? []).map(responseItem => (
        <LessonFileCard
          key={`response-${lessonDataDetail.id}#${responseItem.id}`}
          fileDetail={responseItem}
          className="border-green-300 bg-green-50"
          schoolId={schoolId}
          studentLessonId={lessonDataDetail.id}
        />
      ))}
      {isEmptyTeacherFeedback && <p>{t('profile:lessons.noTeacherFeedback')}</p>}
    </div>
  )
}

export default LessonDetail
