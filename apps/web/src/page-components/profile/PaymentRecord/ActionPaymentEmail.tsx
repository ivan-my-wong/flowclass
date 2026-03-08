import { useCallback, useMemo, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { FaAngleDown } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'
import { MdLoop } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'
import Popover from '@/components/Tooltips/Popover'
import { useReminderPaymentRecord } from '@/hooks/useProfile'
import {
  PaymentRecordConfirm,
  PaymentReports,
  PaymentStatus,
  SendPaymentActions,
} from '@/types/profile'

const ActionPaymentEmail = ({ data }: { data?: PaymentReports }) => {
  const { t } = useTranslation()

  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [typeSend, setTypeSend] = useState<SendPaymentActions>()

  const handleOpen = useCallback(() => {
    setShowInfoDialog(!showInfoDialog)
  }, [showInfoDialog])

  const sendPaymentEmail = (type: SendPaymentActions) => {
    setTypeSend(type)
    handleOpen()
  }

  const isReminder = typeSend === SendPaymentActions.SEND_MAIL_REMINDER

  const { mutateAsync: handleReminder, isLoading } = useReminderPaymentRecord()

  const payload: PaymentRecordConfirm = useMemo(() => {
    if (!data) return {} as PaymentRecordConfirm
    return {
      institutionId: data?.institutionId,
      siteId: data?.siteId,
      invoices: [{ invoiceId: data?.id, proofToken: data?.proofToken }],
    }
  }, [data])

  return (
    <div className="w-full lg:w-fit">
      <Popover
        trigger={
          <div>
            <Button variant="outlined" className="w-full" iconAfter={<FaAngleDown />}>
              {t('profile:action')}
            </Button>
          </div>
        }
      >
        <div className="-m-5 space-y-3 bg-[#fff] p-3">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => sendPaymentEmail(SendPaymentActions.SEND_MAIL_REMINDER)}
          >
            <FiMail size={16} />
            <span>{t('profile:sendPaymentProofUploadEmail')}</span>
          </div>
          {data?.paymentState === PaymentStatus.PAID && (
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => sendPaymentEmail(SendPaymentActions.SEND_SUCCESS_PAYMENT)}
            >
              <FiMail size={16} />
              <span>{t('profile:sendPaymentReceiptEmail')}</span>
            </div>
          )}
        </div>
      </Popover>

      <InfoDialog
        key={'action-payment-email'}
        title={t(`profile:${isReminder ? 'sendPaymentReminder' : 'sendPaymentSuccess'}`)
          .replace('{count}', '1')
          .replace('{media}', 'e-Mail')}
        description=""
        trigger={<div />}
        open={showInfoDialog}
        setOpen={handleOpen}
      >
        <div>
          <div className="flex justify-between gap-4 rounded-md border p-4">
            <div>{data?.user?.name}</div>
            <div>{data?.user?.email}</div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outlined" disabled={isLoading} onClick={handleOpen}>
              {t('common:action.cancel')}
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => {
                handleReminder({ ...payload, action: typeSend }).then(() => {
                  handleOpen()
                })
              }}
              className="flex gap-x-2"
            >
              {isLoading && <MdLoop className="animate-spin" />}
              {t('common:action.yesSend')}
            </Button>
          </div>
        </div>
      </InfoDialog>
    </div>
  )
}

export default ActionPaymentEmail
