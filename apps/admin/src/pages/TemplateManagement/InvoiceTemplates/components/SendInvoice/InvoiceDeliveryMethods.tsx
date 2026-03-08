import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AiOutlineDeliveredProcedure } from 'react-icons/ai'

import type { InvoiceCampaignDto } from '@/types/studentInvoice.type'
import { NotificationChannel } from '@/types/studentInvoice.type'

import CardDeliveryMethod from '../CardDeliveryMethod'

const InvoiceDeliveryMethods = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const form = useFormContext<InvoiceCampaignDto>()
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center gap-2 mb-4 text-gray-900">
        <AiOutlineDeliveredProcedure size={20} />
        <div className="font-semibold">{t('editor.send.deliveryMethods')}</div>
      </div>
      <CardDeliveryMethod
        channel={NotificationChannel.Email}
        name="emailBody"
        subjectName="emailSubject"
        switchName="sendViaEmail"
        isRequired={form.watch('sendViaEmail')}
        withSwitch
        module="invoiceCampaign"
      />
      <CardDeliveryMethod
        channel={NotificationChannel.WhatsApp}
        name="whatsappContent"
        switchName="sendViaWhatsapp"
        isRequired={form.watch('sendViaWhatsapp')}
        withSwitch
        module="invoiceCampaign"
      />
    </div>
  )
}

export default InvoiceDeliveryMethods
