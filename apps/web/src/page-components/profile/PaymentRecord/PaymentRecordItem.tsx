import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { FaCalendar, FaCreditCard, FaReceipt, FaTicketAlt, FaUser } from 'react-icons/fa'
import { IoLocationSharp } from 'react-icons/io5'

import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Buttons/Button'
import { FEATURE_FLAGS } from '@/constants/common'
import { PaymentReports, PaymentStatus } from '@/types/profile'
import {
  formatDateRange,
  getColorPaymentStatus,
  getPaymentMethodText,
  getUrlPaymentView,
} from '@/utils/profile'
import { getPriceWithCurrency } from '@/utils/string.utils'

import ActionPaymentEmail from './ActionPaymentEmail'
import ViewApplicationForm from './ViewApplicationForm'
import ViewUploadedPaymentProof from './ViewUploadedPaymentProof'

type PaymentRecordItemProps = {
  data?: PaymentReports
  refetch: () => void
  schoolUrl: string
}

const PaymentRecordItem = ({
  data,
  refetch,
  schoolUrl,
}: PaymentRecordItemProps): React.ReactElement => {
  const { t } = useTranslation()

  const color = getColorPaymentStatus(data?.paymentState ?? '')

  const paymentMethod =
    !!data?.payAmount && data?.payAmount > 0
      ? getPaymentMethodText(data?.paymentMethod ?? '', t)
      : t('profile:paymentRecord.freeOfCharge')

  const urlView = getUrlPaymentView({
    proofToken: data?.proofToken,
    enrollId: data?.enrollCourses?.at(0)?.id,
    enrollIds: (data?.enrollCourses ?? []).map(enroll => enroll.id.toString()).join(','),
    paymentState: data?.paymentState,
    schoolPath: schoolUrl ?? '',
    coursePath: data?.course?.path,
  })

  const instructorName = Array.from(
    new Set(data?.lessons?.map(lesson => lesson?.class?.instructorName ?? '') ?? [])
  ).join(', ')

  const locationRoomName = Array.from(
    new Set(data?.lessons?.map(lesson => lesson?.class?.locationRoomName ?? '') ?? [])
  ).join(', ')

  return (
    <div className="bg-background-layer-2 mx-auto w-full space-y-4 rounded-2xl p-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{data?.course?.name}</h2>
          <div className="font-semibold">{data?.user?.name}</div>
        </div>
        <p className="text-gray-500">{data?.classes?.map(o => o.name).join(', ')}</p>
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <FaReceipt size={16} />
          <span>
            {t('profile:invoiceId')} #{data?.id}
          </span>
        </div>
        <Badge variant={color}>{t(`profile:status.${data?.paymentState}`)}</Badge>
      </div>

      {!!instructorName && (
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <FaUser size={16} />
            <span>{t('profile:instructor')}</span>
          </div>
          <div className="text-sm">{instructorName}</div>
        </div>
      )}

      {!!locationRoomName && (
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <IoLocationSharp size={16} />
            <span>{t('profile:location')}</span>
          </div>
          <div className="text-sm">{locationRoomName}</div>
        </div>
      )}

      {FEATURE_FLAGS.SHOW_LIST_OF_LESSONS && (
        <div className="items-start justify-between lg:flex">
          <div className="flex items-center gap-2 text-gray-700">
            <FaCalendar size={16} /> <span>{t('profile:listOfLessons')}</span>
          </div>
          <div className="text-sm">
            {[...(data?.lessons ?? [])]
              ?.sort((a, b) => {
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              })
              ?.map(({ startTime, endTime }, index) => (
                <div key={`time-${index}`}>{formatDateRange(startTime, endTime)}</div>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        {!!data?.paymentDate && (
          <p className="flex items-center gap-2 text-gray-700">
            <FaCalendar size={16} /> <span>{t('profile:paymentDate')}</span>
            <span className="ml-auto">{dayjs(data?.paymentDate).format('MMM DD, YYYY')}</span>
          </p>
        )}
        {!!data?.payAmount && (
          <p className="flex items-center gap-2 text-gray-700">
            <FaReceipt size={16} /> <span>{t('profile:amountPaid')}</span>
            <span className="ml-auto">
              {data?.payAmount > 0
                ? getPriceWithCurrency(data?.currency, data?.payAmount) ?? ''
                : t('profile:paymentRecord.freeOfCharge')}
            </span>
          </p>
        )}
        <p className="flex items-center gap-2 text-gray-700">
          <FaCreditCard size={16} /> <span>{t('profile:paymentMethod')}</span>
          <span className="ml-auto">{paymentMethod}</span>
        </p>
        {!!data?.promotion && (
          <p className="flex items-center gap-2 text-gray-700">
            <FaTicketAlt size={16} /> <span>{t('profile:promotionUsed')}</span>
            <span className="ml-auto">
              {t('profile:couponCode')}: {data?.promotion?.code}
            </span>
          </p>
        )}
      </div>

      <div className="mt-4 items-center justify-between space-y-1 lg:flex  lg:space-y-0">
        <div className="items-center gap-4 space-y-1 lg:flex lg:space-y-0">
          <ActionPaymentEmail data={data} />
          <ViewApplicationForm data={data} />
          {data?.paymentMethod === 'PAY_LATER' && data?.paymentState !== PaymentStatus.PAID && (
            <ViewUploadedPaymentProof data={data} refetch={refetch} schoolUrl={schoolUrl} />
          )}
        </div>
        <Button className="w-full lg:w-fit" onClick={() => window.open(urlView, '_blank')}>
          {data?.paymentState !== PaymentStatus.PAID
            ? t('profile:viewPay')
            : t('profile:viewReceipt')}
        </Button>
      </div>
    </div>
  )
}

export default PaymentRecordItem
