import { useState } from 'react'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuCheckCircle, LuSend } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import ConfirmSendPaymentProof from '@/pages/PaymentProofTable/components/ConfirmSendPaymentProof'
import {
  PaymentProofTableEnrollCourse,
  PaymentProofTableItem,
} from '@/types/enrollCourse'
import { SendPaymentActions } from '@/types/paymentProof'
import {
  SendingCampaignStatus,
  SendingInvoiceData,
} from '@/types/studentInvoice.type'
import { formatPhoneNumber } from '@/utils/misc'

interface CompleteStepProps {
  invoices: SendingInvoiceData[]
  totalCount: number
}

export function CompleteStep({
  invoices,
  totalCount,
}: CompleteStepProps): JSX.Element {
  const { t } = useTranslation(['invoiceCampaign'])
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)

  // Show all invoices that were created (not just ones to be sent)
  // Include invoices with status CREATED, SENT, or those that have invoiceNumber
  const createdInvoices = invoices.reduce<SendingInvoiceData[]>(
    (acc, invoice) => {
      // Include invoices that have been created
      // Check by status (CREATED, SENT) or by having invoiceNumber
      const isCreated =
        invoice.status === SendingCampaignStatus.CREATED ||
        invoice.status === SendingCampaignStatus.SENT ||
        Boolean(invoice.invoiceNumber)

      if (isCreated) {
        // Deduplicate by invoiceNumber or id
        acc.push(invoice)
      }
      return acc
    },
    []
  )
  return (
    <div className=" flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <LuCheckCircle
              className="w-12 h-12 text-green-600"
              aria-hidden="true"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            {t('editor.send.allDone')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg"
          >
            {t('editor.send.partialSuccessMessage', {
              invoicesCount: createdInvoices.length,
            })}
          </motion.p>
        </div>

        <div className="mb-8">
          <div className="space-y-4">
            {createdInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <LuCheckCircle
                            className="w-6 h-6 text-green-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {invoice.name}
                          </h3>
                          <p className="text-gray-600">{invoice.email}</p>
                          <p className="text-gray-600">
                            {formatPhoneNumber(invoice.phone)}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {invoice.invoiceNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            iconBefore={<LuSend />}
            variant="outline"
            onClick={() => setIsSendModalOpen(true)}
          >
            {t('editor.send.sendViaWhatsApp')}
          </Button>
        </div>

        {isSendModalOpen && (
          <ConfirmSendPaymentProof
            action={SendPaymentActions.RESEND_PAYMENT_REMINDER}
            selectedRows={createdInvoices
              .filter(inv => inv.invoiceId && inv.proofToken)
              .map(
                inv =>
                  ({
                    id: inv.invoiceId!,
                    proofToken: inv.proofToken!,
                    institutionId: inv.institutionId ?? 0,
                    userId: inv.userId ?? 0,
                    userAlias: {
                      id: inv.userAliasId ?? 0,
                      name: inv.name,
                      email: inv.email,
                      userId: inv.userId ?? 0,
                    },
                    sendWhatsapp: {
                      phone: inv.phone,
                      email: inv.email,
                      name: inv.name,
                    },
                  } as unknown as PaymentProofTableItem)
              )}
            isOpen={isSendModalOpen}
            onClose={() => setIsSendModalOpen(false)}
          />
        )}
      </motion.div>
    </div>
  )
}
