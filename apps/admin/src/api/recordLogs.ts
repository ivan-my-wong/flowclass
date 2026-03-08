import { INotificationLogFieldsType } from '@/constants/notificationLogs'
import { StudentActivityType } from '@/types/studentActivity.type'
import { WhatsappTemplate } from '@/types/whatsappTemplate'

import { HistoryCouponProps } from '../types/coupon'
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../types/notifications'

import apiClient from '.'

export type GetStudentActivityParamsDto = {
  page: number
  limit: number
  userId: number
  siteId: number
  institutionId: number
}

export type RecordLogPayload = {
  select?: Partial<INotificationLogFieldsType>
  search?: string
  startDate?: string
  endDate?: string
}

export type GetNotificationLogsRequestDto = {
  siteId: number
  institutionId: number
  payload?: RecordLogPayload
}

export type AssociatedClass = {
  id: number
  name: string
  courseId: number
}

export type NotificationRecordItem = {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
  createdBy?: number
  updatedBy?: number
  channel: NotificationChannel
  recipientUserId: number
  institutionId: number
  siteId: number
  recipientUserEmail: string
  recipientUserPhone?: string
  messageId: string
  subject: string
  message?: string
  sentAt?: Date
  automationFlow?: { id: number; name: string }
  whatsappTemplate?: WhatsappTemplate
  associatedClass?: AssociatedClass[]
  notificationType: NotificationType
  notificationStatus: NotificationStatus
  mappingType?: string
}

export const getHistoryCoupon = async (
  id: number,
  siteId: number,
  couponCode: string
): Promise<HistoryCouponProps[]> => {
  const res = await apiClient.get({
    url: '/admin/record-logs/coupon-history',
    needAuth: true,
    params: {
      institutionId: id,
      siteId,
      couponCode,
    },
  })

  return res?.data?.data ?? []
}

export const getActivity = async (
  params: Partial<GetStudentActivityParamsDto>
): Promise<StudentActivityType[]> => {
  const res = await apiClient.get({
    url: `/admin/record-logs/student-activity`,
    needAuth: true,
    params,
  })
  return res?.data?.data ?? []
}

export const getNotificationLogs = async ({
  siteId,
  institutionId,
  payload,
}: GetNotificationLogsRequestDto): Promise<NotificationRecordItem[]> => {
  const res = await apiClient.post({
    url: `/admin/record-logs/notification-log`,
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
    data: payload,
  })
  return res?.data?.data ?? []
}
