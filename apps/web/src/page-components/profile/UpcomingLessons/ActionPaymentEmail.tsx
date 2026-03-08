import { useCallback, useMemo, useState } from 'react'

import { LucideChevronDown, LucideLoader, LucideMail } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'
import Popover from '@/components/Tooltips/Popover'
import { useReminderPaymentRecord } from '@/hooks/useProfile'
import { PaymentRecordConfirm, SendPaymentActions, UpcomingLesson } from '@/types/profile'

const ActionPaymentEmail = ({ data }: { data?: UpcomingLesson }) => {
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

  const isEmail = typeSend === SendPaymentActions.SEND_MAIL_REMINDER

  const { mutateAsync: handleReminder, isLoading } = useReminderPaymentRecord()

  const payload: PaymentRecordConfirm = useMemo(() => {
    if (!data) return {} as PaymentRecordConfirm
    return {
      institutionId: data?.institutionId,
      siteId: data?.siteId,
      invoices: [{ invoiceId: data?.invoice?.id, proofToken: data?.invoice?.proofToken }],
    }
  }, [data])

  return (
    <div className="w-full lg:w-fit">
      <Popover
        trigger={
          <div>
            <Button variant="outlined" className="w-full" iconAfter={<LucideChevronDown />}>
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
            <LucideMail size={16} />
            <span>{t('profile:sendLessonReminderEmail')}</span>
          </div>
          {/* <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => sendPaymentEmail(SendPaymentActions.SEND_WA_REMINDER)}
          >
            <IoLogoWhatsapp size={16} />
            <span>{t('profile:sendLessonReminderWhatsApp')}</span>
          </div> */}
        </div>
      </Popover>

      <InfoDialog
        key={'action-payment-email'}
        title={t('profile:sendPaymentReminder')
          .replace('{count}', '1')
          .replace('{media}', isEmail ? 'e-Mail' : 'WhatsApp')}
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
                  toast.success(t('profile:sendPaymentReminderSuccess') as string)
                })
              }}
              className="flex gap-x-2"
            >
              {isLoading && <LucideLoader className="animate-spin" />}
              {t('common:action.yesSend')}
            </Button>
          </div>
        </div>
      </InfoDialog>
    </div>
  )
}

export default ActionPaymentEmail
