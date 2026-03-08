import { Dispatch, FC, SetStateAction, useEffect } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuUser } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { Invoice } from '@/types/enrollCourse'
import { SendInvoiceBaseDto } from '@/types/studentInvoice.type'
import { InvoiceCampaign } from '@/types/templateManagement'
import { formatCurrency } from '@/utils/currency'

import InvoiceDeliveryMethods from '../components/SendInvoice/InvoiceDeliveryMethods'

type Props = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  invoice: Invoice
  invoiceCampaign?: InvoiceCampaign
}

const DialogSendInvoiceInstallment: FC<Props> = ({
  isOpen,
  setIsOpen,
  invoice,
  invoiceCampaign,
}): JSX.Element => {
  const form = useForm<SendInvoiceBaseDto>({
    defaultValues: {
      sendViaEmail: false,
      sendViaWhatsapp: false,
      emailSubject: '',
      emailBody: '',
      whatsappContent: '',
    },
  })
  const { useSendInvoiceDirectly } = useInvoiceCampaignData()
  const { mutate: sendInvoiceDirectly, isLoading } = useSendInvoiceDirectly(
    () => {
      setIsOpen(false)
    }
  )
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  const handleSubmit: SubmitHandler<SendInvoiceBaseDto> = async data => {
    // Handle form submission logic here
    sendInvoiceDirectly({
      ...data,
      invoiceId: invoice.id,
    })
  }
  useEffect(() => {
    if (invoiceCampaign) {
      form.reset({
        sendViaEmail: invoiceCampaign.sendViaEmail,
        sendViaWhatsapp: invoiceCampaign.sendViaWhatsapp,
        emailSubject: invoiceCampaign.emailSubject,
        emailBody: invoiceCampaign.emailBody,
        whatsappContent: invoiceCampaign.whatsappContent,
      })
    }
  }, [invoiceCampaign, form])
  const isEmailEnabled = form.watch('sendViaEmail')
  const isWhatsappEnabled = form.watch('sendViaWhatsapp')
  const isContentValid =
    !isEmailEnabled || !isWhatsappEnabled || form.watch('whatsappContent')
  const onBack = () => {
    setIsOpen(false)
  }
  return (
    <ModalDialog
      title={t('invoiceCampaign:editor.send.title') as string}
      onOpenChange={setIsOpen}
      open={isOpen}
      formData={form}
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-3xl"
      classBody="px-8 py-4"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onBack}>
            {t('common:action.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={!isContentValid || isLoading}
            loading={isLoading}
          >
            {t('invoiceCampaign:editor.send.sendSingleButton')}
          </Button>
        </>
      }
      footerClassName="px-8"
    >
      <div className="border border-gray-300 flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
          <LuUser className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{invoice?.userAlias?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {invoice?.userAlias?.email}
          </p>
          {/* <p className="text-sm text-muted-foreground">{classDetail?.name}</p> */}
          <p className="text-sm font-medium">
            {t('editor.invoicePreview.total')}:{' '}
            {formatCurrency(invoice?.payAmount ?? 0, invoice?.currency)}
          </p>
        </div>
      </div>
      <InvoiceDeliveryMethods />
    </ModalDialog>
  )
}

export default DialogSendInvoiceInstallment
