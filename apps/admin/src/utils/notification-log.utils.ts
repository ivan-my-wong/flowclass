import { NotificationRecordItem } from '@/api/recordLogs'
import { FilterCriteriaType } from '@/types/notifications'

import dayjs from './dayjs'

export const filterNotifications = (
  notifications: NotificationRecordItem[],
  filters: FilterCriteriaType
): NotificationRecordItem[] => {
  const {
    selectedNotificationAutomationFlow,
    selectedNotificationWhatsappTemplate,
    selectedNotificationType,
    selectedNotificationStatus,
  } = filters
  const notificationAutomationFlow = selectedNotificationAutomationFlow || []
  const notificationWhatsappTemplate =
    selectedNotificationWhatsappTemplate || []

  return (notifications || [])
    .filter(item => {
      if (!item) return false

      const isAutomationFlowMatches =
        notificationAutomationFlow.length > 0
          ? notificationAutomationFlow.some(
              data => data.value === item.automationFlow?.id
            )
          : true
      const isWhatsappTemplateMatches =
        notificationWhatsappTemplate.length > 0
          ? notificationWhatsappTemplate.some(
              data => data.value === item.whatsappTemplate?.id
            )
          : true

      const isTypeMatches =
        selectedNotificationType && selectedNotificationType.length > 0
          ? selectedNotificationType.some(
              type => type.value === item.notificationType
            )
          : true

      const isStatusMatches =
        selectedNotificationStatus && selectedNotificationStatus.length > 0
          ? selectedNotificationStatus.some(
              status => status.value === item.notificationStatus
            )
          : true

      return (
        isAutomationFlowMatches &&
        isWhatsappTemplateMatches &&
        isTypeMatches &&
        isStatusMatches
      )
    })
    .sort((a, b) => {
      const dateA = dayjs(a.sentAt || a.createdAt)
      const dateB = dayjs(b.sentAt || b.createdAt)
      return dateB.diff(dateA)
    })
}
