export interface IUserFieldsType {
  id: boolean
  firstName: boolean
  lastName: boolean
  email: boolean
  phone: boolean
}

export interface IWhatsappTemplateFieldsType {
  id: boolean
  name: boolean
}
export interface INotificationLogFieldsType {
  id: boolean
  createdAt: boolean
  updatedAt: boolean
  notificationStatus: boolean
  message: boolean
  recipientUserEmail: boolean
  recipientUserPhone: boolean
  user: IUserFieldsType
  automationFlow: IAutomationFlowFieldsType
  whatsappTemplate: IWhatsappTemplateFieldsType
  notificationType: boolean
}
/**
 * Default field selection configuration for notification logs.
 * Used to specify which fields should be included when fetching notification log data.
 */
export const SELECT_FIELDS_NOTIFICATION_LOGS: Partial<INotificationLogFieldsType> =
  {
    id: true,
    createdAt: true,
    updatedAt: true,
    notificationStatus: true,
    recipientUserEmail: true,
    recipientUserPhone: true,
    message: true,
    notificationType: true,
    user: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
    whatsappTemplate: {
      id: true,
      name: true,
    },
  }
