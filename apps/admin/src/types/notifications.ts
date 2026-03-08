import { MultiValue } from 'react-select'

import { SelectItemValuesProps } from '@/components/Selector/Select'

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  // LINE = 'LINE',
}

export enum NotificationType {
  CONFIRM_PAYMENT = 'CONFIRM_PAYMENT',
  REJECT_PAYMENT = 'REJECT_PAYMENT',
  REMINDER = 'REMINDER',
  APPLICATION = 'APPLICATION',
  FORGET_PASSWORD = 'FORGET_PASSWORD',
  INVITATION = 'INVITATION',
  LESSON_POSTPONE = 'LESSON_POSTPONE',
  ASSIGN_COURSE = 'ASSIGN_COURSE',
  OTHERS = 'OTHERS',
}

export enum NotificationStatus {
  SUCCESS = 'SUCCESS',
  SENT = 'SENT',
  FAILED = 'FAILED',
  QUEUED = 'QUEUED',
}

export type NotificationsSettingProps = {
  createdAt: string
  updatedAt: string
  displayEmailLogo: boolean
  customEmailSender: boolean
  sendReminders: boolean
  sendLessonReminders: boolean
  customMessage: string
  wtsApiToken: string
  wtsApiSid: string
  wtsApiPhoneNumber: string
  id: number
}

export type NotificationsSettingUpdateProps = {
  displayEmailLogo?: boolean
  customEmailSender?: boolean
  sendReminders?: boolean
  sendLessonReminders?: boolean
  customMessage?: string
  wtsApiToken?: string
  wtsApiSid?: string
  wtsApiPhoneNumber?: string
}

export const defaultNotificationsSetting: NotificationsSettingUpdateProps = {
  displayEmailLogo: false,
  customEmailSender: false,
  sendReminders: false,
  customMessage: '',
  wtsApiToken: '',
  wtsApiSid: '',
  wtsApiPhoneNumber: '',
}

export type FilterCriteriaType = {
  selectedNotificationWhatsappTemplate: MultiValue<SelectItemValuesProps>
  selectedNotificationType: MultiValue<SelectItemValuesProps>
  selectedNotificationStatus: MultiValue<SelectItemValuesProps>
}
