import type {
  InvoiceStudentConfig,
  VariableItem,
} from '@/types/studentInvoice.type'
import { InvoiceSplitType } from '@/types/studentInvoice.type'

export const defaultStudentInvoiceConfig = {
  invoiceRemark: '',
  appliedPromotions: [],
  invoiceSplitType: InvoiceSplitType.SINGLE,
  invoiceSplitItems: [],
} satisfies Readonly<InvoiceStudentConfig>

export const invoiceCampaignMessageTemplate = [
  {
    name: 'editor.send.variables.studentName',
    value: '{{studentName}}',
  },
  {
    name: 'editor.send.variables.invoiceNumber',
    value: '{{invoiceNumber}}',
  },
  {
    name: 'editor.send.variables.invoiceDate',
    value: '{{invoiceDate}}',
  },
  {
    name: 'editor.send.variables.dueDate',
    value: '{{dueDate}}',
  },
  {
    name: 'editor.send.variables.payAmount',
    value: '{{payAmount}}',
  },
  {
    name: 'editor.send.variables.uploadPaymentUrl',
    value: '{{uploadPaymentUrl}}',
  },
] as const satisfies readonly VariableItem[]
