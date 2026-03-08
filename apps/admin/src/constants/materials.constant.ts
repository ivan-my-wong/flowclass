import type { VariableItem } from '@/types/studentInvoice.type'

export const materialMessageTemplate = [
  {
    name: 'setting:whatsappSetting.customMessageVariable.studentName',
    value: '{{studentName}}',
  },
  {
    name: 'setting:whatsappSetting.customMessageVariable.className',
    value: '{{className}}',
  },
  {
    name: 'setting:whatsappSetting.customMessageVariable.courseName',
    value: '{{courseName}}',
  },
  {
    name: 'setting:whatsappSetting.customMessageVariable.institutionName',
    value: '{{institutionName}}',
  },
  {
    name: 'setting:whatsappSetting.customMessageVariable.siteLink',
    value: '{{siteLink}}',
  },
] as const satisfies readonly VariableItem[]

export const studentSubmissionMessageTemplate = [
  {
    name: 'setting:whatsappSetting.customMessageVariable.studentName',
    value: '{{studentName}}',
  },
  {
    name: 'setting:whatsappSetting.customMessageVariable.className',
    value: '{{className}}',
  },
  {
    name: 'setting:whatsappSetting.customMessageVariable.institutionName',
    value: '{{institutionName}}',
  },
] as const satisfies readonly VariableItem[]
