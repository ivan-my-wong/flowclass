import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuExternalLink } from 'react-icons/lu'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  DEFAULT_WHATSAPP_TEMPLATE_ID,
  WHATSAPP_TEMPLATES,
  WhatsAppTemplateVars,
} from '@/constants/whatsapp'

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

/** Strip everything except digits to produce E.164-compatible number */
const toE164Digits = (phone: string): string => phone.replace(/\D/g, '')

const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = toE164Digits(phone)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

const WhatsAppModal = ({ open, onClose, recipients }: Props): JSX.Element => {
  const { t } = useTranslation()

  const [templateId, setTemplateId] = useState(DEFAULT_WHATSAPP_TEMPLATE_ID)

  const selectedTemplate =
    WHATSAPP_TEMPLATES.find(t => t.id === templateId) ?? WHATSAPP_TEMPLATES[0]

  const buildMessage = (vars: WhatsAppTemplateVars) =>
    selectedTemplate.build(vars)

  const withPhone = recipients.filter(r => r.phone)
  const withoutPhone = recipients.filter(r => !r.phone)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('lessonList:whatsApp.title')}</DialogTitle>
        </DialogHeader>

        {/* Template selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            {t('lessonList:whatsApp.template')}
          </label>
          <select
            value={templateId}
            onChange={e => setTemplateId(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {WHATSAPP_TEMPLATES.map(tpl => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Recipients */}
        {withPhone.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('lessonList:whatsApp.noRecipients')}
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {withPhone.map(recipient => {
              const message = buildMessage({ studentName: recipient.name })
              const url = buildWhatsAppUrl(recipient.phone, message)
              return (
                <div
                  key={recipient.studentId}
                  className="rounded-md border border-gray-200 p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
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
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2 whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Students without phone */}
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
