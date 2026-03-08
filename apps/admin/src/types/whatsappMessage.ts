export type WhatsappMessageType = {
  siteId: number
  institutionId: number
  wtsApiToken: string
  wtsApiSid: string
  wtsApiPhoneNumber: string
  studentPhone: string
  templateId: string
  variables?: Record<string, any>
}
