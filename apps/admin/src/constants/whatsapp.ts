export type WhatsAppTemplateVars = {
  studentName: string
}

export type WhatsAppTemplate = {
  id: string
  label: string
  build: (vars: WhatsAppTemplateVars) => string
}

// ---------------------------------------------------------------------------
// Edit the `build` functions below to customise your message content.
// Variables available: studentName
// ---------------------------------------------------------------------------

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'payment_reminder',
    label: 'Payment Reminder',
    build: ({ studentName }) =>
      `Hi ${studentName}, this is a friendly reminder that your payment is due. Please let us know if you have any questions. Thank you!`,
  },
  {
    id: 'lesson_reminder',
    label: 'Lesson Reminder',
    build: ({ studentName }) =>
      `Hi ${studentName}, just a reminder about your upcoming lesson. Please be prepared and feel free to reach out if you need anything!`,
  },
]

export const DEFAULT_WHATSAPP_TEMPLATE_ID = WHATSAPP_TEMPLATES[0].id
