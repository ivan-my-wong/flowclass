import { useCallback, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LuBellRing,
  LuBookUp,
  LuCheckCircle,
  LuFileSignature,
  LuMails,
  LuMessageSquare,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import Text from '@/components/ui/Text'
import { PaymentEvidenceState } from '@/constants/payment'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { PaymentEvidence, PaymentProofTableItem } from '@/types/enrollCourse'
import { DeletePaymentPayload, SendPaymentActions } from '@/types/paymentProof'

import SendCustomMessages from '../SendCustomMessages'

import ConfirmSendPaymentProof from './ConfirmSendPaymentProof'

type BulkActionComponentProps = {
  countText: string
  selectedCount: number
  selectedRows: PaymentProofTableItem[]
  onClearSelection: () => void
  handleReject: () => void
  handleApprove: () => void
  paymentEvidenceList: PaymentEvidence[]
  isLoadingApprove: boolean
  isLoadingReject: boolean
}
const BulkActionComponent = ({
  selectedCount,
  selectedRows,
  countText,
  onClearSelection,
  handleApprove,
  handleReject,
  paymentEvidenceList,
  isLoadingReject,
  isLoadingApprove,
}: BulkActionComponentProps): JSX.Element => {
  const { t } = useTranslation()
  const { useDeletePaymentProof } = usePaymentEvidenceData()
  const { isLoading, mutateAsync: deletePaymentProof } = useDeletePaymentProof()
  const [reminderModalState, setReminderModalState] = useState<{
    isOpen: boolean
    action: SendPaymentActions | null
  }>({
    isOpen: false,
    action: null,
  })
  const [isCustomMessagesModalOpen, setIsCustomMessagesModalOpen] =
    useState(false)

  const MailIcon = () => <LuMails size={24} />
  const ReminderIcon = () => <LuBookUp size={24} />
  const onClickSendReminder = useCallback((action: SendPaymentActions) => {
    setReminderModalState({
      isOpen: true,
      action,
    })
  }, [])

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

  const isActionDisabled = useMemo(() => {
    return !selectedRows.some(node => {
      const paymentEvidence = paymentEvidenceList.find(
        payment => payment.invoiceId === node.id
      )
      return paymentEvidence?.status === PaymentEvidenceState.PROCESSING
    })
  }, [selectedRows, paymentEvidenceList])
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
  const notifMenus = useMemo(() => {
    return [
      {
        key: 'resend-upload-payment-proof-mail',
        typeIcon: <MailIcon />,
        type: <ReminderIcon />,
        text: t('student:paymentProof.sendPaymentReminder'),
        onClick: () =>
          onClickSendReminder(SendPaymentActions.RESEND_PAYMENT_REMINDER),
      },
      {
        key: 'resend-success-payment-receipt',
        typeIcon: <MailIcon />,
        type: <LuCheckCircle size={24} />,
        text: t('student:paymentProof.sendPaymentSuccess'),
        onClick: () =>
          onClickSendReminder(
            SendPaymentActions.RESEND_SUCCESS_PAYMENT_REMINDER
          ),
      },
    ]
  }, [t, onClickSendReminder])

  const updateStatusMenus = useMemo(() => {
    return [
      {
        key: 'approve-payment-proof',
        icon: (
          <LuCheckCircle size={24} className="fill-green-500 stroke-white" />
        ),
        text: t('student:button.approve'),
        onClick: () => handleApprove(),
        disabled: isLoadingApprove || isActionDisabled,
      },
      {
        key: 'reject-payment-proof',
        icon: <LuX size={24} className="stroke-red-500" />,
        text: t('student:button.reject'),
        onClick: () => handleReject(),
        disabled: isLoadingReject || isActionDisabled,
      },
    ]
  }, [
    isActionDisabled,
    isLoadingApprove,
    isLoadingReject,
    t,
    handleApprove,
    handleReject,
  ])
  const handleSendCustomMessages = useCallback(() => {
    setIsCustomMessagesModalOpen(true)
  }, [])

  const handleCloseCustomMessagesModal = useCallback(() => {
    setIsCustomMessagesModalOpen(false)
  }, [])
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
              className="bg-background-layer-3  shadow-sm px-2 py-2 rounded-md"
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
                  iconBefore={<LuMessageSquare />}
                  variant="outline"
                  size="sm"
                  onClick={handleSendCustomMessages}
                >
                  {t('student:paymentProof.sendCustomMessages')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      iconBefore={<LuBellRing />}
                      variant="outline"
                      size="sm"
                    >
                      {t('student:paymentProof.sendNotifications')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit max-w-80">
                    {notifMenus.map(menu => (
                      <DropdownMenuItem
                        key={menu.key}
                        className="flex gap-x-2 cursor-pointer"
                        onClick={menu.onClick}
                      >
                        <div className="flex gap-x-2">
                          {/* {menu.typeIcon} */}
                          {menu.type}
                        </div>
                        {menu.text}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={isActionDisabled}
                      // className="disabled:cursor-not-allowed"
                      iconBefore={<LuFileSignature />}
                      size="sm"
                      variant="outline"
                    >
                      {t('student:paymentProof.updateReceiptStatus')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {updateStatusMenus.map(menu => (
                      <DropdownMenuItem
                        key={menu.key}
                        disabled={menu.disabled}
                        className="flex gap-x-2 items-center cursor-pointer"
                        onClick={menu.onClick}
                      >
                        {menu.icon}
                        {menu.text}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

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
      {isCustomMessagesModalOpen && (
        <SendCustomMessages
          selectedRows={selectedRows}
          isOpen={isCustomMessagesModalOpen}
          onClose={handleCloseCustomMessagesModal}
        />
      )}
    </>
  )
}
export default BulkActionComponent
