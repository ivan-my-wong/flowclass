import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuExternalLink } from 'react-icons/lu'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { WHATSAPP_TEMPLATES } from '@/constants/whatsapp'
import { SupportedType } from '@/types/customMessage'

export type WhatsAppRecipient = {
  studentId: number
  name: string
  phone: string
  // Permissive bag of substitution variables that callers may pass.
  // Used for {{varName}} replacement in the message body.
  [key: string]: string | number | unknown
}

type Props = {
  open: boolean
  onClose: () => void
  recipients: WhatsAppRecipient[]
  defaultTemplateType?: SupportedType
}

const TEMPLATE_ID_BY_SUPPORTED_TYPE: Record<SupportedType, string> = {
  [SupportedType.CREATE_INVOICE]: 'invoice_sending',
  [SupportedType.STUDENT_LESSON_REMINDER]: 'lesson_list_sending',
}

const toE164Digits = (phone: string): string => phone.replace(/\D/g, '')

const buildWhatsAppUrl = (phone: string, message: string): string =>
  `https://wa.me/${toE164Digits(phone)}?text=${encodeURIComponent(message)}`

const substituteVariables = (
  template: string,
  recipient: WhatsAppRecipient
): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = recipient[key]
    if (value == null) return `{{${key}}}`
    return String(value)
  })

const WhatsAppModal = ({
  open,
  onClose,
  recipients,
  defaultTemplateType,
}: Props): JSX.Element => {
  const { t } = useTranslation()

  const templates = useMemo(
    () =>
      WHATSAPP_TEMPLATES.map(tpl => ({
        id: tpl.id,
        label: tpl.label,
        content: tpl.build({ studentName: '{{name}}' }),
      })),
    []
  )

  const initialTemplateId = useMemo(() => {
    if (defaultTemplateType) {
      const mapped = TEMPLATE_ID_BY_SUPPORTED_TYPE[defaultTemplateType]
      if (templates.some(tpl => tpl.id === mapped)) return mapped
    }
    return templates[0]?.id ?? ''
  }, [defaultTemplateType, templates])

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>(initialTemplateId)
  const initialBody = useMemo(
    () => templates.find(tpl => tpl.id === initialTemplateId)?.content ?? '',
    [initialTemplateId, templates]
  )
  const [messageBody, setMessageBody] = useState<string>(initialBody)

  useEffect(() => {
    setSelectedTemplateId(initialTemplateId)
    setMessageBody(initialBody)
  }, [initialTemplateId, initialBody])

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id)
    const tpl = templates.find(t => t.id === id)
    if (tpl) setMessageBody(tpl.content)
  }

  const withPhone = recipients.filter(r => r.phone)
  const withoutPhone = recipients.filter(r => !r.phone)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('lessonList:whatsApp.title')}</DialogTitle>
        </DialogHeader>

        {templates.length > 0 && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="whatsapp-template-select"
              className="text-xs font-medium text-gray-600"
            >
              {t('lessonList:whatsApp.template')}
            </label>
            <select
              id="whatsapp-template-select"
              value={selectedTemplateId}
              onChange={e => handleTemplateChange(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="whatsapp-message-body"
            className="text-xs font-medium text-gray-600"
          >
            {t('lessonList:whatsApp.messageBody')}
          </label>
          <textarea
            id="whatsapp-message-body"
            value={messageBody}
            onChange={e => setMessageBody(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
          <p className="text-[11px] text-gray-400">
            {t('lessonList:whatsApp.variableHint')}
          </p>
        </div>

        {withPhone.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('lessonList:whatsApp.noRecipients')}
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {withPhone.map(recipient => {
              const message = substituteVariables(messageBody, recipient)
              const url = buildWhatsAppUrl(recipient.phone, message)
              return (
                <div
                  key={recipient.studentId}
                  className="rounded-md border border-gray-200 p-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-medium text-sm">
                      {recipient.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {recipient.phone}
                    </span>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 shrink-0"
                  >
                    <LuExternalLink size={12} />
                    {t('lessonList:whatsApp.openButton')}
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {withoutPhone.length > 0 && (
          <div className="flex flex-col gap-1">
            {withoutPhone.map(r => (
              <div
                key={r.studentId}
                className="flex items-center gap-2 text-xs text-gray-400"
              >
                <span>{r.name}</span>
                <span>— {t('lessonList:whatsApp.noPhone')}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default WhatsAppModal
