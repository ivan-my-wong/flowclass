import { Course } from '@/types/course'
import { WhatsappTemplate } from '@/types/whatsappTemplate'

import { Classes } from './classes'

export type AutomationFunction = {
  id: number
  name: string
  functionName: string
  description?: string
  variables?: string[]
}

export type InstitutionAutomationFlow = {
  id: number
  enabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type AutomationFlowStep = {
  id: number
  name: string
  order: number
  emailTemplateId: number
  automationFunctionId?: number
  automationFunction?: AutomationFunction
  automationInterval?: string
  intervalLabel?: string | null
  labelPosition?: string | null | 'start' | 'end'
  createdAt?: Date
  updatedAt?: Date
  classIds?: number[]
  classes?: Classes[]
  whatsappTemplate?: WhatsappTemplate
  whatsappTemplateRequired?: boolean
}

export type SetTemplateAutomationFlowStep = {
  whatsappTemplateId: number
}

export type AutomationFlow = {
  id: number
  name: string
  enabled?: boolean
  frequencyCron: string
  frequencyUnit?: string
  steps: AutomationFlowStep[]
  institutionAutomationFlow?: InstitutionAutomationFlow
  createdAt?: Date
  updatedAt?: Date
  classIds?: number[]
  classes?: Classes[]
  courses?: Course[]
  pickedCourses?: Record<string, any>
}

export type AutomationFlowForm = {
  id: number
  name: string
  enabled?: boolean
  frequencyCron: string
  frequencyUnit?: string
  steps: AutomationFlowStep[]
  institutionAutomationFlow?: InstitutionAutomationFlow
  createdAt?: Date
  updatedAt?: Date
  classIds?: number[]
  classes?: Record<string, any>[]
  courses?: Record<string, any>[]
}

export type UpdateIntervalPayload = {
  automationInterval: string
}

export type AutomationFlowMutationVar = {
  data: Partial<AutomationFlow>
  automationFlowId: number
}

export enum AutomationSettingsType {
  INVOICE_REMINDER = 'invoice_reminder',
  LESSON_REMINDER = 'lesson_reminder',
}

export type AutomationSettings = {
  id: number
  type: AutomationSettingsType
  enableInvoiceGeneration: boolean
  sendWhatsappAfterGenerateInvoice: boolean
  enableLessonReminder: boolean
}
export type AutomationSettingsGet = {
  id: number
  type: AutomationSettingsType
  settings: {
    enableInvoiceGeneration?: boolean
    sendWhatsappAfterGenerateInvoice?: boolean
    enableLessonReminder?: boolean
  }
}
