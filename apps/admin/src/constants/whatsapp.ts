export type WhatsAppTemplateVars = {
  studentName: string
}

export type WhatsAppTemplate = {
  id: string
  label: string
  build: (vars: WhatsAppTemplateVars) => string
  defaultRepeaterFormat?: string
}

// ---------------------------------------------------------------------------
// Edit the `build` functions below to customise your message content.
// Variables available: studentName
// ---------------------------------------------------------------------------

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'invoice_sending',
    label: 'Invoice Sending / 學費單',
    build: () =>
      `{{schoolName}} {{period}} {{className}} 學費單

學費總計：
👉 HK$ {{payAmount}}

課堂安排 細項：
------ ------
{{courseItems}}

付款連結: {{uploadPaymentUrl}}`,
    defaultRepeaterFormat: `課程 {{courseIndex}}) {{courseName}}
  {{schedule}} / {{lessonCount}}堂 / {{teacherName}}
  {{lessonDatesLabel}}: {{lessonDates}}
  HK$ {{coursePrice}}
------ ------`,
  },
  {
    id: 'lesson_list_sending',
    label: 'Lesson List / 課堂通知',
    build: ({ studentName }) =>
      `{{schoolName}} 課堂通知

${studentName} 您好！

以下是您的課堂安排：
{{lessonItems}}

如有任何疑問，請聯絡我們`,
    defaultRepeaterFormat: `{{lessonIndex}}. {{courseName}}
  日期: {{lessonDate}}
  時間: {{lessonTime}}
  導師: {{teacherName}}`,
  },
]

export const DEFAULT_WHATSAPP_TEMPLATE_ID = WHATSAPP_TEMPLATES[0].id
