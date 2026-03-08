export enum WhatsappTemplateStatus {
  PENDING = 'Pending',
  RECEIVED = 'Received',
  UNSUBMITTED = 'Unsubmitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum WhatsappTemplateCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  UTILITY = 'UTILITY',
  MARKETING = 'MARKETING',
}

export type WhatsappTemplate = {
  id?: number
  name: string
  content: string
  assignedTo?: Record<string, any> | null
  status?: WhatsappTemplateStatus
  twilioContentId?: string
  language?: string
  contentType?: string
  tags?: string[]
  category?: WhatsappTemplateCategory
  variables?: Record<string, any>
  createdAt?: string
  updatedAt?: string
  isDefault?: boolean
}

export type CustomMessageType = {
  name: string
  value: string
}

export type UpdateVariablesType = {
  whatsappTemplateId: number
  data: WhatsappTemplate
}
