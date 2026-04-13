import { NotificationRecordItem } from '@/api/recordLogs'
import { FilterCriteriaType } from '@/types/notifications'

import dayjs from './dayjs'

export const filterNotifications = (
  notifications: NotificationRecordItem[],
  filters: FilterCriteriaType
): NotificationRecordItem[] => {
  const {
    selectedNotificationWhatsappTemplate,
    selectedNotificationType,
    selectedNotificationStatus,
  } = filters
  const notificationWhatsappTemplate =
    selectedNotificationWhatsappTemplate || []
  if (notifications.some(n => !n)) {
    console.warn(
      'Unexpected null notifications detected:',
      notifications.filter(n => !n)
    )
  }
  return notifications
    .filter(item => {
      const isWhatsappTemplateMatches =
        notificationWhatsappTemplate.length > 0
          ? notificationWhatsappTemplate.some(
              data => data.value === item.whatsappTemplate?.id
            )
          : true

      const isTypeMatches =
        selectedNotificationType.length > 0
          ? selectedNotificationType.some(
              type => type.value === item.notificationType
            )
          : true

      const isStatusMatches =
        selectedNotificationStatus.length > 0
          ? selectedNotificationStatus.some(
              status => status.value === item.notificationStatus
            )
          : true
      return isWhatsappTemplateMatches && isTypeMatches && isStatusMatches
    })
    .sort((a, b) => {
      const dateA = dayjs(a.createdAt)
      const dateB = dayjs(b.createdAt)
      return dateB.diff(dateA)
    })
}
