import { Dispatch, FC, SetStateAction, useEffect, useMemo } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuUser } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import useClassData from '@/hooks/useClassData'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { ResendInvoiceDto } from '@/types/studentInvoice.type'
import { InvoiceCampaign, RecipientCampaign } from '@/types/templateManagement'
import { formatCurrency } from '@/utils/currency'

import CardDeliveryMethod from './CardDeliveryMethod'

type Props = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  invoiceCampaign?: InvoiceCampaign
  recipient?: RecipientCampaign
}

const ResendInvoiceModal: FC<Props> = ({
  isOpen,
  setIsOpen,
  invoiceCampaign,
  recipient,
}) => {
  const form = useForm<ResendInvoiceDto>({
    mode: 'onChange',
  })
  const { useFetchDetailClass } = useClassData()
  const { t } = useTranslation(['invoiceCampaign'])

  const { useResendInvoiceRecipient } = useInvoiceCampaignData()
  const { mutateAsync: resendInvoiceRecipient, isLoading: isSending } =
    useResendInvoiceRecipient(() => {
      setIsOpen(false)
    })
  const courseId = recipient?.invoice?.courseId ?? undefined
  const userAliasId = recipient?.studentId
  const classMetadata = useMemo(() => {
    return (
      (
        invoiceCampaign?.metadata?.invoices
          ?.filter(inv => inv.userAliasId === userAliasId)
          ?.flatMap(inv => inv.classes) ?? []
      ).find(cl => cl.courseId === courseId) || null
    )
  }, [courseId, invoiceCampaign?.metadata?.invoices, userAliasId])
  const { data: classDetail } = useFetchDetailClass(
    classMetadata?.classId as number
  )
  useEffect(() => {
    if (invoiceCampaign && recipient) {
      form.reset({
        channel: recipient.channel,
        recipientId: recipient.id,
        name: recipient.student?.name || '',
        email: recipient.student?.email,
        phone: recipient.student?.user?.phone,
        isEnabled: true,
        message:
          recipient?.channel === 'email'
            ? invoiceCampaign.emailBody
            : invoiceCampaign?.whatsappContent,
        subject:
          recipient.channel === 'email'
            ? invoiceCampaign.emailSubject
            : undefined,
      })
      // eslint-disable-next-line no-void
      void form.trigger()
    }
  }, [form, invoiceCampaign, recipient])
  const onResendInvoice: SubmitHandler<ResendInvoiceDto> = data => {
    resendInvoiceRecipient(data)
  }
  return (
    <ModalDialog
      title={t('resend.title', {
        channel: recipient?.channel,
      })}
      subtitle={t('resend.confirmDetailBelow')}
      open={isOpen}
      onOpenChange={setIsOpen}
      formData={form}
      onSubmit={form.handleSubmit(onResendInvoice)}
      className="max-w-3xl"
      classBody="px-8 py-4"
      footer={
        <>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setIsOpen(false)
            }}
          >
            {t('common:action.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSending || !form.formState.isValid}
            loading={isSending}
          >
            {t('resend.resendButton')}
          </Button>
        </>
      }
      footerClassName="px-8"
    >
      <div className="space-y-2 w-full py-4">
        <div className="border border-gray-300 flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
            <LuUser className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">{form.getValues('name')}</h3>
            <p className="text-sm text-muted-foreground">
              {form.getValues('email') ?? form.getValues('phone')}
            </p>
            <p className="text-sm text-muted-foreground">{classDetail?.name}</p>
            <p className="text-sm font-medium">
              {t('editor.invoicePreview.total')}:{' '}
              {formatCurrency(
                recipient?.invoice?.payAmount ?? 0,
                recipient?.invoice?.currency
              )}
            </p>
          </div>
        </div>
        <CardDeliveryMethod
          name="message"
          isRequired
          switchName="isEnabled"
          subjectName={recipient?.channel === 'email' ? 'subject' : undefined}
          //   withSwitch
          channel={recipient?.channel}
          module="invoiceCampaign"
        />
      </div>
    </ModalDialog>
  )
}

export default ResendInvoiceModal
