import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Translate } from 'next-translate'

import { PaymentMethod, PaymentStatus } from '@/types/profile'

dayjs.extend(duration)
dayjs.extend(relativeTime)

interface OptionItem {
  id?: string | number
  value?: string | number
  name?: string
  label?: string
}

export const getValueFromOptions = (listData?: OptionItem[], value?: string | number) => {
  const option = listData?.find(option => (option.id || option.value) === value)
  return option ? { label: option.name || option.label, value: option.id || option.value } : null
}

export const formatDateRange = (startDate?: Date, endDate?: Date, locale?: string) => {
  if (!startDate || !endDate) return ''
  const start = dayjs(startDate)
    .locale(locale || 'en')
    .format('MMM D, YYYY h:mm a')
  const end = dayjs(endDate)
    .locale(locale || 'en')
    .format('MMM D, YYYY h:mm a')
  return `${start} - ${end}`
}

export const getColorPaymentStatus = (
  status: string
):
  | 'light'
  | 'success'
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'error'
  | 'warning'
  | 'dark' => {
  return status === PaymentStatus.PENDING
    ? 'outline'
    : status === PaymentStatus.PAID
    ? 'success'
    : 'light'
}

export const getPaymentMethodText = (paymentMethod: string, t: Translate): string => {
  return paymentMethod === PaymentMethod.PAY_NOW
    ? t('profile:paymentRecord.payNow')
    : t('profile:paymentRecord.payLater')
}

export const getUrlPaymentView = (data: {
  proofToken?: string
  enrollId?: number
  enrollIds?: string
  paymentState?: string
  schoolPath?: string
  coursePath?: string
}): string => {
  const params = `school=${data.schoolPath ?? ''}&course=${data?.coursePath}&token=${
    data?.proofToken
  }&enrolId=${data?.enrollId}&enrolIds=${data?.enrollIds}`
  const urlSuccess = `/enrol/success-payment?${params}`
  const urlUpload = `/enrol/upload-receipt?${params}`
  return data?.paymentState === PaymentStatus.PAID ? urlSuccess : urlUpload
}

export const getTimeUntilStart = (t: Translate, startTime?: Date): string => {
  if (!startTime) return ''
  const now = dayjs()
  const start = dayjs(startTime)
  const diff = dayjs.duration(start.diff(now))

  if (diff.asMinutes() < 0) return t('profile:alreadyStarted')

  const days = diff.days()
  const hours = diff.hours()
  const minutes = diff.minutes()

  const result = []
  if (days > 0) result.push(`${days} ${t('common:unit.day')}`)
  if (hours > 0 || days > 0) result.push(`${hours} ${t('common:unit.hour')}`)
  if (minutes > 0 || hours > 0 || days > 0) result.push(`${minutes} ${t('common:unit.minute')}`)

  return result.join(', ')
}
