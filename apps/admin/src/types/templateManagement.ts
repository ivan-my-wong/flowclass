import { Invoice } from './enrollCourse'
import { StudentEnrolmentRecord } from './student'
import {
  InvoiceCampaignDetailDto,
  NotificationChannel,
} from './studentInvoice.type'

export enum DocumentTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type DocumentTemplate = {
  id: number
  name: string
  description?: string
  status: DocumentTemplateStatus
  institutionId?: number
  campaigns?: BulkSendDocument[]
  fieldData?: TemplateFieldData[]
  background?: TemplateBackgroundProps
  type: DocumentTemplateType
  createdAt: string
  updatedAt: string
}

export type TemplateFieldData = {
  id: string
  name: string
  field: string
  x: number
  y: number
  fontSize: number
  color: string
}

export type TemplateBackgroundProps = {
  url: string
  width: number
  height: number
}

export enum DocumentTemplateType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  CERTIFICATE = 'certificate',
}

export enum BulkSendDocumentStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export type BulkSendDocument = {
  id: number
  institutionId: number
  documentId: number
  document?: DocumentTemplate
  courseId?: number
  classId?: number
  emailSubject: string
  emailBody: string
  title: string
  userId: number
  user: {
    id: number
    fullName: string
    email: string
    phone: string
  }
  recipients: number
  recipientIds?: number[]
  recipientList?: RecipientCampaign[]
  status: BulkSendDocumentStatus
  createdAt: string
  updatedAt: string
}

export enum RecipientCampaignStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

export type RecipientCampaign = {
  id: number
  campaignId: number
  institutionId: number
  studentId: number
  channel: NotificationChannel
  student: StudentEnrolmentRecord
  status: RecipientCampaignStatus
  documentUrl: string
  invoice?: Invoice
}

export type FieldDocumentTemplate = {
  id: number
  institutionId: number
  name: string
  field: string
  required: boolean
  example: string
}

export const getDocumentColorByStatus = (
  status: BulkSendDocumentStatus | RecipientCampaignStatus
) => {
  switch (status) {
    case BulkSendDocumentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-600'
    case BulkSendDocumentStatus.SENT:
      return 'bg-blue-100 text-blue-600'
    case BulkSendDocumentStatus.FAILED:
      return 'bg-red-100 text-red-600'
    case BulkSendDocumentStatus.COMPLETED:
    case RecipientCampaignStatus.DELIVERED:
      return 'bg-green-100 text-green-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export type InvoiceCampaignConfiguration = {
  invoices?: InvoiceCampaignDetailDto[]
}

export type DocumentCampaignConfiguration = InvoiceCampaignConfiguration // For another campaign type, you can define a different type

export type InvoiceCampaign = {
  id?: number
  title: string
  isDraft: boolean
  sendViaEmail: boolean
  emailSubject: string
  emailBody: string
  sendViaWhatsapp: boolean
  whatsappContent: string
  isCombined: boolean
  recipients?: number
  invoiceIds: number[]
  invoices: Invoice[]
  jobId?: string
  status?: BulkSendDocumentStatus
  createdAt?: string
  updatedAt?: string
  metadata?: DocumentCampaignConfiguration
  recipientList?: RecipientCampaign[]
}
