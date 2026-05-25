import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuExternalLink } from 'react-icons/lu'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { WHATSAPP_TEMPLATES } from '@/constants/whatsapp'

export type WhatsAppRecipient = {
  studentId: number
  name: string
  phone: string
}

type Props = {
  open: boolean
  onClose: () => void
  recipients: WhatsAppRecipient[]
}

type TemplateOption = {
  id: string
  label: string
  content: string
}

const toE164Digits = (phone: string): string => phone.replace(/\D/g, '')

const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = toE164Digits(phone)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Replace {{variableName}} placeholders with actual values */
const substituteVariables = (
  template: string,
  vars: Record<string, string>
): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)

const WhatsAppModal = ({ open, onClose, recipients }: Props): JSX.Element => {
  const { t } = useTranslation()

  const templates: TemplateOption[] = WHATSAPP_TEMPLATES.map(tpl => ({
    id: tpl.id,
    label: tpl.label,
    content: tpl.build({ studentName: '{{studentName}}' }),
  }))

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [messageBody, setMessageBody] = useState<string>('')

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id)
      setMessageBody(templates[0].content)
    }
  }, [templates.length])

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

        {/* Template selector */}
        {templates.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {t('lessonList:whatsApp.template')}
            </label>
            <textarea
              id="whatsapp-message"
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />

            {copiedRecipient && (
              <div className="mt-1 rounded-md bg-gray-50 border border-gray-100 px-3 py-2 flex flex-col gap-1 overflow-hidden">
                <p className="text-[11px] font-medium text-gray-500">
                  {t('lessonList:whatsApp.copiedMessage')}
                </p>
                <pre className="whitespace-pre-wrap break-all font-sans text-[11px] text-gray-700 min-w-0">
                  {expandMessage(
                    messageBody,
                    activeRepeaterFormat,
                    copiedRecipient
                  )}
                </pre>
              </div>
            )}
          </div>

          {/* Recipients */}
          {withPhone.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              {t('lessonList:whatsApp.noRecipients')}
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
              {withPhone.map(recipient => {
                const message = expandMessage(
                  messageBody,
                  activeRepeaterFormat,
                  recipient
                )
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
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(recipient, message)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        {copiedRecipient?.studentId === recipient.studentId ? (
                          <LuCheck size={12} className="text-success" />
                        ) : (
                          <LuCopy size={12} />
                        )}
                        {t('lessonList:whatsApp.copyButton')}
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
                      >
                        <LuExternalLink size={12} />
                        {t('lessonList:whatsApp.openButton')}
                      </a>
                    </div>
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
            </select>
          </div>
        )}

        {/* Editable message body */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            {t('lessonList:whatsApp.messageBody')}
          </label>
          <textarea
            value={messageBody}
            onChange={e => setMessageBody(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
          <p className="text-[11px] text-gray-400">
            {t('lessonList:whatsApp.variableHint')}
          </p>
        </div>

        {/* Recipients */}
        {withPhone.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('lessonList:whatsApp.noRecipients')}
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {withPhone.map(recipient => {
              const message = substituteVariables(messageBody, {
                studentName: recipient.name,
              })
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
