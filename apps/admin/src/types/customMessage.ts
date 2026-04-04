export enum SupportedType {
  STUDENT_LESSON_REMINDER = 'student_lesson_reminder',
  CREATE_INVOICE = 'create_invoice',
}

export const SUPPORTED_WHATSAPP_TEMPLATE = Object.values(SupportedType)

export type CustomMessage = {
  id?: number
  name: string
  content: string
  repeaterFormat?: string
  type: SupportedType
  variables?: Record<string, any>
  emailNotification?: boolean
  whatsappNotification?: boolean

  createdAt?: string
  updatedAt?: string
}

export type CustomMessageVariable = {
  label: string
  value: string
}

export type CustomMessagePreparedData = {
  types: SupportedType[]
  variables: {
    type: SupportedType
    variables: CustomMessageVariable[]
  }[]
}
