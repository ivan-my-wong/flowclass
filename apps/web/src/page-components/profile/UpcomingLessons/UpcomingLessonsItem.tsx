import {
  LucideCalendar,
  LucideClipboardCheck,
  LucideHourglass,
  LucideMapPinCheckInside,
  LucideReceipt,
  LucideStepForward,
  LucideUser,
} from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Buttons/Button'
import { School } from '@/types'
import { AttendanceStatus, PaymentStatus, UpcomingLesson } from '@/types/profile'
import {
  formatDateRange,
  getColorPaymentStatus,
  getTimeUntilStart,
  getUrlPaymentView,
} from '@/utils/profile'

import ActionPaymentEmail from './ActionPaymentEmail'
import RequestTimeChange from './RequestTimeChange'
import SendQuestion from './SendQuestion'

type UpcomingLessonsItemProps = {
  data?: UpcomingLesson[]
  refetch: () => void
  school: School
  isPastLesson?: boolean
}

const UpcomingLessonsItem = ({
  data: upcomingLessonsList,
  school,
  isPastLesson,
}: UpcomingLessonsItemProps): React.ReactElement => {
  const { t } = useTranslation()

  const pendingIndex =
    upcomingLessonsList?.findIndex(o => o.invoice.paymentState !== PaymentStatus.PAID) ?? -1

  const firstItem = upcomingLessonsList?.sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })[0]
  const lastItem = upcomingLessonsList?.sort((a, b) => {
    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
  })[0]

  let data = firstItem
  if (upcomingLessonsList?.[pendingIndex]) {
    data = upcomingLessonsList?.[pendingIndex]
  }

  const paymentState = pendingIndex >= 0 ? PaymentStatus.PENDING : PaymentStatus.PAID

  const paymentColor = getColorPaymentStatus(paymentState)

  const urlView = getUrlPaymentView({
    proofToken: data?.invoice?.proofToken,
    enrollId: data?.invoice?.enrollCourses?.at(0)?.id ?? undefined,
    enrollIds: (data?.invoice?.enrollCourses ?? [])?.map(enroll => enroll.id.toString()).join(','),
    paymentState: data?.invoice?.paymentState,
    schoolPath: school?.url ?? '',
    coursePath: data?.course?.path,
  })

  const time = formatDateRange(data?.startTime, lastItem?.endTime)
  const startingAt = getTimeUntilStart(t, data?.startTime)
  const instructorName = data?.class?.instructorName
  const locationRoomName = data?.class?.locationRoomName

  // const lessonSequence = `${(listData?.lessonIndex ?? 0) + 1} / ${listData?.length ?? 0}`

  if (!upcomingLessonsList || upcomingLessonsList.length === 0) {
    return <></>
  }

  if (upcomingLessonsList.length > 0) {
    return (
      <>
        {upcomingLessonsList.map(item => {
          const attedanceColor =
            item?.attendanceStatus !== AttendanceStatus.ATTENDED ? 'light' : 'success'
          const lessonSequence = `${item?.lessonIndex ?? 0} / ${item?.totalLessons ?? 0}`
          const timeCurrent = formatDateRange(item?.startTime, item?.endTime)
          const timeOriginal =
            item?.originalStartTime && item?.originalEndTime
              ? formatDateRange(item?.originalStartTime, item?.originalEndTime)
              : ''

          return (
            <div
              key={`lesson-${item?.id}`}
              className="bg-background-layer-2 mx-auto w-full space-y-4 rounded-2xl p-6"
            >
              <div>
                <h2 className="text-xl font-semibold">{item?.course?.name}</h2>
                <p className="text-gray-500">{item?.class?.name}</p>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <LucideCalendar size={16} />
                  <span>{t('profile:time')}</span>
                </div>
                <div className="text-right">
                  <div className={item?.hasTimeChange ? 'text-lg font-semibold' : ''}>
                    {timeCurrent}
                  </div>
                  {item?.hasTimeChange && !!timeOriginal && (
                    <div className="text-gray-500 line-through">{timeOriginal}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <LucideHourglass size={16} />
                  <span>{t('profile:requestTimeChange.startsAt')}</span>
                </div>
                <div>{startingAt}</div>
              </div>
              {!!instructorName && (
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <LucideUser size={16} />
                    <span>{t('profile:instructor')}</span>
                  </div>
                  <div>{instructorName}</div>
                </div>
              )}
              {!!locationRoomName && (
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <LucideMapPinCheckInside size={16} />
                    <span>{t('profile:location')}</span>
                  </div>
                  <div>{locationRoomName}</div>
                </div>
              )}
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <LucideStepForward size={16} />
                  <span>{t('profile:lessonSequence')}</span>
                </div>
                <div>{lessonSequence}</div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <LucideClipboardCheck size={16} />
                  <span>{t('profile:attendenceStatus')}</span>
                </div>
                <Badge variant={attedanceColor}>
                  {t(`school:profile.attendanceStatus.${item?.attendanceStatus}`)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <LucideReceipt size={16} />
                  <span>
                    {t('profile:invoiceId')} #{item?.invoice?.id}
                  </span>
                </div>
                <Badge variant={paymentColor}>
                  {t(`school:profile.invoiceStatus.${paymentState}`)}
                </Badge>
              </div>

              <div className="mt-4 items-center justify-between space-y-1 lg:flex  lg:space-y-0">
                <div className="items-center gap-4 space-y-1 lg:flex lg:space-y-0">
                  <ActionPaymentEmail data={item} />
                  {!isPastLesson && <RequestTimeChange data={item} schoolName={school?.name} />}
                  <SendQuestion
                    data={item}
                    schoolName={school?.name}
                    lessonDetails={{ time, startingAt, lessonSequence }}
                  />
                </div>
                <Button className="w-full lg:w-fit" onClick={() => window.open(urlView, '_blank')}>
                  {t('profile:visitReceiptPage')}
                </Button>
              </div>
            </div>
          )
        })}
      </>
    )
  }

  return <></>
}

export default UpcomingLessonsItem
