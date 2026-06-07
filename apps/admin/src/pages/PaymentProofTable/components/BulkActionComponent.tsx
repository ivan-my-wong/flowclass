import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AnimatePresence, motion } from 'framer-motion'
import JSZip from 'jszip'
import { useTranslation } from 'react-i18next'
import {
  LuDownload,
  LuPencil,
  LuSend,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import { fetchInvoicePdf } from '@/api/invoiceCampaign'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSchoolData from '@/hooks/useSchoolData'
import { PaymentEvidence, PaymentProofTableItem } from '@/types/enrollCourse'
import { DeletePaymentPayload, SendPaymentActions } from '@/types/paymentProof'

import ConfirmSendPaymentProof from './ConfirmSendPaymentProof'

type BulkActionComponentProps = {
  countText: string
  selectedCount: number
  selectedRows: PaymentProofTableItem[]
  onClearSelection: () => void
  paymentEvidenceList: PaymentEvidence[]
}
const BulkActionComponent = ({
  selectedCount,
  selectedRows,
  countText,
  onClearSelection,
  paymentEvidenceList,
}: BulkActionComponentProps): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentSchool } = useSchoolData()
  const { useDeletePaymentProof } = usePaymentEvidenceData()
  const { isLoading, mutateAsync: deletePaymentProof } = useDeletePaymentProof()
  const [reminderModalState, setReminderModalState] = useState<{
    isOpen: boolean
    action: SendPaymentActions | null
  }>({
    isOpen: false,
    action: null,
  })
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  const handleCloseReminderModal = () => {
    setReminderModalState({
      isOpen: false,
      action: null,
    })
  }
  const deletePayload = useMemo<DeletePaymentPayload>(() => {
    const isValid = selectedRows.every(
      row =>
        typeof row.id === 'number' &&
        typeof row.proofToken === 'string' &&
        row.proofToken.length > 0
    )

    if (!isValid) {
      return {
        ids: [],
        invoices: [],
      }
    }
    return {
      ids: selectedRows
        .map(row => {
          const paymentEvidence = paymentEvidenceList.find(
            payment => payment.invoiceId === row.id
          )
          return paymentEvidence?.id
        })
        .filter(Boolean) as number[],
      invoices: selectedRows.map(row => ({
        proofToken: row.proofToken,
        invoiceId: row.id,
      })),
    } as DeletePaymentPayload
  }, [selectedRows, paymentEvidenceList])
  const { setConfirm, closeConfirm } = useGlobalConfirm(isLoading)

  const onClickDelete = () => {
    setConfirm({
      title: t('student:paymentProof.deletePaymentTitle').toString(),
      description: t(
        'student:paymentProof.deletePaymentDescription'
      ).toString(),
      confirmText: t('common:action.confirm').toString(),
      cancelText: t('common:action.cancel').toString(),
      onConfirm: async () => {
        try {
          await deletePaymentProof(deletePayload)
        } finally {
          closeConfirm()
        }
      },
    }).open()
  }

  const handleDownloadPdf = useCallback(async () => {
    if (!currentSchool?.id || selectedRows.length === 0) return
    setIsDownloadingPdf(true)

    try {
      if (selectedRows.length === 1) {
        const url = await fetchInvoicePdf(currentSchool.id, selectedRows[0].id)
        if (url) window.open(url, '_blank')
      } else {
        const zip = new JSZip()
        const results = await Promise.allSettled(
          selectedRows.map(async row => {
            const url = await fetchInvoicePdf(currentSchool.id, row.id)
            if (!url) return null
            const response = await fetch(url)
            const blob = await response.blob()
            const studentName =
              row.userAlias?.name || row.sendWhatsapp?.name || `invoice`
            return { name: `${studentName}_${row.id}.pdf`, blob }
          })
        )

        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            zip.file(result.value.name, result.value.blob)
          }
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(zipBlob)
        link.download = `invoices_${new Date().toISOString().slice(0, 10)}.zip`
        link.click()
        URL.revokeObjectURL(link.href)
      }
    } catch {
      // Download failed silently
    } finally {
      setIsDownloadingPdf(false)
    }
  }, [currentSchool?.id, selectedRows])

  const editTarget = selectedRows.length === 1 ? selectedRows[0] : null
  const editHref = useMemo(() => {
    if (!editTarget) return ''
    const params = new URLSearchParams({
      id: String(editTarget.id),
    })
    if (editTarget.institutionId != null) {
      params.set('institutionId', String(editTarget.institutionId))
    }
    if (editTarget.userAlias?.id != null) {
      params.set('userAlias', String(editTarget.userAlias.id))
    }
    return `/application/edit?${params.toString()}`
  }, [editTarget])

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <Box
              className="bg-background-layer-3 shadow-sm px-2 py-2 rounded-md"
              justify="between"
            >
              <Box>
                <Button
                  onClick={onClearSelection}
                  variant="ghost"
                  className="rounded-full h-8 w-8 hover:bg-background-disabled hover:text-text-sub justify-center text-center p-0"
                >
                  <span className="text-primary">
                    <LuX fill="currentColor" />
                  </span>
                </Button>

                <Text className="text-sm mr-auto text-text-subtle">
                  {selectedCount} {countText}
                </Text>
              </Box>
              <Box className="gap-x-2" justify="end">
                <Button
                  iconBefore={<LuDownload />}
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  loading={isDownloadingPdf}
                >
                  {t('student:paymentProof.action.downloadPDF')}
                </Button>
                <Button
                  iconBefore={<LuSend />}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setReminderModalState({
                      isOpen: true,
                      action: SendPaymentActions.RESEND_PAYMENT_REMINDER,
                    })
                  }
                >
                  {t('student:paymentProof.sendInvoice')}
                </Button>
                <Button
                  iconBefore={<LuPencil />}
                  variant="outline"
                  size="sm"
                  disabled={!editTarget}
                  onClick={() => {
                    if (editHref) navigate(editHref)
                  }}
                  title={
                    editTarget
                      ? undefined
                      : t('student:paymentProof.editSelectOneRow') ||
                        'Select one row to edit'
                  }
                >
                  {t('common:action.edit')}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  loading={isLoading}
                  title={t('common:action.delete').toString()}
                  onClick={onClickDelete}
                >
                  <LuTrash2 />
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      {reminderModalState.isOpen && reminderModalState.action && (
        <ConfirmSendPaymentProof
          action={reminderModalState.action}
          selectedRows={selectedRows}
          isOpen={reminderModalState.isOpen}
          onClose={handleCloseReminderModal}
        />
      )}
    </>
  )
}
export default BulkActionComponent
