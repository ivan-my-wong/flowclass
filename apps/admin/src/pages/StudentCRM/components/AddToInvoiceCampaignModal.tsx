import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { useTranslation } from 'react-i18next'
import { LuLoader2, LuSearch } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { PaymentState } from '@/constants/payment'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { cn } from '@/utils/cn'
import dayjs from '@/utils/dayjs'

interface Props {
  open: boolean
  onClose: () => void
  studentIds: number[]
}

const paymentStateBadgeClass: Record<string, string> = {
  [PaymentState.PAID]: 'bg-success-subtle text-success',
  [PaymentState.PARTIALLY_PAID]: 'bg-warn/10 text-warn',
  [PaymentState.PENDING]: 'bg-gray-100 text-text-sub',
  [PaymentState.SUBMITTED]: 'bg-background-primary-subtle text-primary',
}

const AddToInvoiceCampaignModal = ({
  open,
  onClose,
  studentIds,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null
  )

  const debouncedSearch = useDebounce(search, 300)

  const { useFetchStudentInvoices } = usePaymentEvidenceData()
  const { data: invoices = [], isLoading } = useFetchStudentInvoices(
    undefined,
    { search: debouncedSearch || undefined, isInitialRequest: true },
    undefined,
    { enabled: open }
  )

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId)

  const handleConfirm = () => {
    if (!selectedInvoice?.documentCampaignId) return
    const params = new URLSearchParams({
      documentId: selectedInvoice.documentCampaignId.toString(),
    })
    if (studentIds.length > 0) {
      params.set('studentIds', studentIds.join(','))
    }
    navigate(`/invoice-templates/editor?${params.toString()}`)
    onClose()
  }

  const isConfirmDisabled =
    !selectedInvoiceId || !selectedInvoice?.documentCampaignId

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose()
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('student:button.addToExistingInvoice')}</DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-3">
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              placeholder={t('common:action.search')}
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setSelectedInvoiceId(null)
              }}
            />
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-md border border-gray-200">
            {(() => {
              if (isLoading) {
                return (
                  <div className="flex items-center justify-center py-12">
                    <LuLoader2
                      className="animate-spin text-primary"
                      size={24}
                    />
                  </div>
                )
              }
              if (invoices.length === 0) {
                return (
                  <p className="py-10 text-center text-sm text-text-sub">
                    {t('student:paymentProof.noInvoiceItems')}
                  </p>
                )
              }
              return (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-text-sub">
                        {t('student:column.name')}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-text-sub">
                        {t('student:column.teachingServiceEnrolled')}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-text-sub">
                        {t('student:column.lastUpdated')}
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-text-sub">
                        {t('student:paymentProof.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => {
                      const studentName =
                        invoice.userAlias?.name ||
                        invoice.enrollCourses?.[0]?.name ||
                        '-'
                      const courses = (invoice.enrollCourses ?? [])
                        .map(
                          ec => ec.enrollInto?.[0]?.secondLevelName ?? ec.name
                        )
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(', ')
                      const isSelected = selectedInvoiceId === invoice.id
                      const badgeClass =
                        paymentStateBadgeClass[invoice.paymentState] ??
                        'bg-gray-100 text-text-sub'
                      const hasLinkedCampaign = !!invoice.documentCampaignId

                      return (
                        <tr
                          key={invoice.id}
                          className={cn(
                            'border-b border-gray-100 transition-colors last:border-0',
                            hasLinkedCampaign
                              ? 'cursor-pointer hover:bg-background-primary-subtle'
                              : 'opacity-40 cursor-not-allowed',
                            isSelected && 'bg-background-primary-subtle'
                          )}
                          onClick={() => {
                            if (hasLinkedCampaign)
                              setSelectedInvoiceId(invoice.id)
                          }}
                        >
                          <td className="px-4 py-3 font-medium">
                            {studentName}
                          </td>
                          <td className="px-4 py-3 text-text-sub">
                            {courses || '-'}
                          </td>
                          <td className="px-4 py-3 text-text-sub">
                            {invoice.createdAt
                              ? dayjs(invoice.createdAt).format('D MMM YYYY')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                                badgeClass
                              )}
                            >
                              {t(
                                `teachingService:paymentStatus.${invoice.paymentState}`
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            })()}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
          <Button variant="outline" onClick={onClose}>
            {t('common:action.cancel')}
          </Button>
          <Button disabled={isConfirmDisabled} onClick={handleConfirm}>
            {t('common:action.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddToInvoiceCampaignModal
