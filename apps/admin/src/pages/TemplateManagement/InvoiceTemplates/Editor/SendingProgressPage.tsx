import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import {
  LuCheckCircle2,
  LuCircleDashed,
  LuLoader,
  LuSend,
  LuXCircle,
} from 'react-icons/lu'
import { useRecoilState } from 'recoil'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import ModalDialog from '@/components/ui/ModalDialog'
import TextArea from '@/components/ui/TextArea'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { sendingInvoiceCampaignState } from '@/stores/studentInvoice.store'
import {
  SendingCampaignStatus,
  SendingInvoiceData,
  SendingProcessPhase,
} from '@/types/studentInvoice.type'

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({
  status,
}: {
  status: SendingCampaignStatus
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  if (status === SendingCampaignStatus.SENT) {
    return (
      <span className="inline-flex items-center gap-1 text-green-700 font-medium text-sm">
        <LuCheckCircle2 className="w-4 h-4" />
        {t('editor.send.status.sent')}
      </span>
    )
  }
  if (status === SendingCampaignStatus.CREATED) {
    return (
      <span className="inline-flex items-center gap-1 text-blue-700 font-medium text-sm">
        <LuCheckCircle2 className="w-4 h-4" />
        {t('editor.send.status.created')}
      </span>
    )
  }
  if (status === SendingCampaignStatus.FAILED) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm">
        <LuXCircle className="w-4 h-4" />
        {t('editor.send.status.failed')}
      </span>
    )
  }
  if (
    status === SendingCampaignStatus.CREATING ||
    status === SendingCampaignStatus.SENDING
  ) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-500 font-medium text-sm animate-pulse">
        <LuLoader className="w-4 h-4 animate-spin" />
        {t('editor.send.status.processing')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
      <LuCircleDashed className="w-4 h-4" />
      {t('editor.send.status.pending')}
    </span>
  )
}

// ─── WhatsApp dialog ──────────────────────────────────────────────────────────

const VARIABLES = [
  { label: 'Student Name', token: '[studentName]' },
  { label: 'Amount', token: '[amount]' },
  { label: 'Invoice #', token: '[invoiceNumber]' },
]

const WhatsAppDialog = ({
  invoices,
  onClose,
}: {
  invoices: SendingInvoiceData[]
  onClose: () => void
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const [message, setMessage] = useState('')
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  const insertToken = (token: string) => {
    const textarea = textAreaRef.current
    if (!textarea) {
      setMessage(prev => prev + token)
      return
    }
    const start = textarea.selectionStart ?? message.length
    const end = textarea.selectionEnd ?? message.length
    const next = message.substring(0, start) + token + message.substring(end)
    setMessage(next)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + token.length, start + token.length)
    }, 0)
  }

  const buildLink = (inv: SendingInvoiceData): string => {
    const text = message
      .replace(/\[studentName\]/g, inv.name)
      .replace(/\[amount\]/g, inv.amount ?? '')
      .replace(/\[invoiceNumber\]/g, inv.invoiceNumber ?? '')
    const phone = (inv.phone ?? '').replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  return (
    <ModalDialog
      title={t('editor.send.sendViaWhatsApp')}
      open
      onOpenChange={open => {
        if (!open) onClose()
      }}
      className="max-w-lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          {t('common:action.close')}
        </Button>
      }
    >
      <div className="space-y-4 mt-2">
        {/* Variable badges */}
        <div className="flex flex-wrap gap-1">
          {VARIABLES.map(v => (
            <Badge
              key={v.token}
              variant="light"
              className="cursor-pointer"
              onClick={() => insertToken(v.token)}
            >
              {v.label}
            </Badge>
          ))}
        </div>

        {/* Message textarea */}
        <TextArea
          ref={textAreaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t('editor.send.whatsappPlaceholder') as string}
          rows={5}
        />

        {/* One button per student */}
        <div className="space-y-2 pt-1">
          {invoices.map((inv, i) => (
            <a
              key={inv.id ?? i}
              href={buildLink(inv)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between w-full rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="font-medium text-gray-900">{inv.name}</span>
                {inv.phone && (
                  <span className="ml-2 text-gray-400 text-xs">
                    {inv.phone}
                  </span>
                )}
              </div>
              <LuSend className="w-4 h-4 text-green-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </ModalDialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const SendingProgressPage = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  const [isOpen, setIsOpen] = useState(true)
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false)
  const [params] = useSearchParams()
  const documentId = params.get('documentId')
  const { useFetchDetailInvoiceCampaign } = useInvoiceCampaignData()
  const [sendingInvoiceCampaign, setSendingInvoiceCampaign] = useRecoilState(
    sendingInvoiceCampaignState
  )
  const navigate = useNavigate()

  const { data: invoiceCampaign } = useFetchDetailInvoiceCampaign(
    documentId || ''
  )
  const totalCount = useMemo(
    () => invoiceCampaign?.recipients || 0,
    [invoiceCampaign?.recipients]
  )

  const invoices = useMemo<SendingInvoiceData[]>(
    () => sendingInvoiceCampaign?.data ?? [],
    [sendingInvoiceCampaign?.data]
  )

  const isComplete =
    sendingInvoiceCampaign?.currentPhase === SendingProcessPhase.COMPLETE

  const finishedInvoices = useMemo(
    () =>
      invoices.filter(
        inv =>
          inv.status === SendingCampaignStatus.CREATED ||
          inv.status === SendingCampaignStatus.SENT ||
          Boolean(inv.invoiceNumber)
      ),
    [invoices]
  )

  const onBack = useCallback(() => {
    if (!sendingInvoiceCampaign?.eventSource) {
      setSendingInvoiceCampaign(prev => ({
        ...prev,
        data: [],
        eventSource: null,
      }))
    }
    navigate(`/invoice-templates/editor?documentId=${documentId}`)
  }, [documentId, sendingInvoiceCampaign?.eventSource, navigate])

  useEffect(() => {
    if (!isOpen) onBack()
  }, [isOpen, onBack])

  const isDone = isComplete && finishedInvoices.length > 0

  const title = isDone
    ? t('invoiceCampaign:editor.send.allDoneWhatsApp')
    : t('invoiceCampaign:editor.send.processingInvoices')

  const subtitle = isDone
    ? t('invoiceCampaign:editor.send.partialSuccessMessage', {
        invoicesCount: finishedInvoices.length,
      })
    : t('invoiceCampaign:editor.send.processingInvoicesDesc')

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>

            {/* Invoice table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      {t('invoiceCampaign:editor.send.table.name')}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      {t('invoiceCampaign:editor.send.table.amount')}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      {t('invoiceCampaign:editor.send.table.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        {t('invoiceCampaign:editor.send.waitingForInvoices')}
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, i) => (
                      <tr key={inv.id ?? i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {inv.name}
                          {inv.invoiceNumber && (
                            <span className="ml-2 text-xs text-gray-400">
                              {inv.invoiceNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {inv.amount ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {totalCount > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-xs text-gray-400 text-right"
                      >
                        {finishedInvoices.length} / {totalCount}{' '}
                        {t('invoiceCampaign:editor.send.table.completed')}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* WhatsApp button — only when complete */}
            {isDone && (
              <div className="flex justify-end">
                <Button
                  iconBefore={<LuSend />}
                  variant="outline"
                  onClick={() => setIsWhatsAppOpen(true)}
                >
                  {t('invoiceCampaign:editor.send.sendViaWhatsApp')}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isWhatsAppOpen && (
        <WhatsAppDialog
          invoices={finishedInvoices}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}
    </>
  )
}

export default SendingProgressPage
