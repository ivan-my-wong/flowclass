'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { Dialog, DialogContent } from '@/components/ui/Dialog'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { sendingInvoiceCampaignState } from '@/stores/studentInvoice.store'
import {
  SendingCampaignStatus,
  SendingProcessPhase,
} from '@/types/studentInvoice.type'

import { CompleteStep } from './SendingSteps/CompletedStep'
import { CreatingStep } from './SendingSteps/CreatingStep'
import { ProgressSteps } from './SendingSteps/ProgressStep'
import { SendingStep } from './SendingSteps/SendingStep'

const SendingProgressPage = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)
  const [params] = useSearchParams()
  const documentId = params.get('documentId')
  const { useFetchDetailInvoiceCampaign } = useInvoiceCampaignData()
  const [sendingInvoiceCampaign, setSendingInvoiceCampaign] = useRecoilState(
    sendingInvoiceCampaignState
  )

  const { data: invoiceCampaign } = useFetchDetailInvoiceCampaign(
    documentId || ''
  )
  const totalCount = useMemo(() => {
    return invoiceCampaign?.recipients || 0
  }, [invoiceCampaign?.recipients])
  const summaryCount = useMemo(() => {
    const createdCount =
      sendingInvoiceCampaign?.data?.filter(
        inv => inv.status === SendingCampaignStatus.CREATED
      ).length || 0
    const sentCount =
      sendingInvoiceCampaign?.data?.filter(
        inv => inv.status === SendingCampaignStatus.SENT
      ).length || 0
    return {
      sentCount,
      createdCount,
    }
  }, [sendingInvoiceCampaign])
  const navigate = useNavigate()
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
    if (!isOpen) {
      onBack()
    }
  }, [isOpen, onBack])
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl bg-gray-50">
        <div className="bg-gray-50 w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-white rounded-2xl p-8"
          >
            {sendingInvoiceCampaign?.currentPhase !==
              SendingProcessPhase.COMPLETE && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {t('invoiceCampaign:editor.send.processingInvoices')}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {t('invoiceCampaign:editor.send.processingInvoicesDesc')}
                  </p>
                </div>
                {sendingInvoiceCampaign?.currentPhase && (
                  <ProgressSteps
                    currentPhase={sendingInvoiceCampaign?.currentPhase}
                  />
                )}
              </>
            )}

            {sendingInvoiceCampaign?.currentPhase ===
              SendingProcessPhase.CREATING_INVOICES && (
              <CreatingStep
                invoices={sendingInvoiceCampaign?.data || []}
                createdCount={summaryCount.createdCount}
                totalCount={totalCount}
              />
            )}

            {sendingInvoiceCampaign?.currentPhase ===
              SendingProcessPhase.SENDING_INVOICES && (
              <SendingStep
                invoices={sendingInvoiceCampaign?.data || []}
                sentCount={summaryCount.sentCount || 0}
                totalCount={totalCount}
              />
            )}

            {sendingInvoiceCampaign?.currentPhase ===
              SendingProcessPhase.COMPLETE && (
              <CompleteStep
                invoices={sendingInvoiceCampaign?.data || []}
                totalCount={totalCount}
              />
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default SendingProgressPage
