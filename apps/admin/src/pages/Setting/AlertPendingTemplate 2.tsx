import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { WhatsappTemplateStatus } from '@/types/whatsappTemplate'

type AlertPendingTemplateProps = {
  status: WhatsappTemplateStatus
}

const AlertPendingTemplate = ({ status }: AlertPendingTemplateProps) => {
  const { t } = useTranslation()
  const statusMessages = useMemo(() => {
    const messages = {
      [WhatsappTemplateStatus.PENDING]: {
        title: t('whatsappTemplate:form.alertPendingTemplate'),
        description: t('whatsappTemplate:form.alertPendingTemplateDescription'),
      },
      [WhatsappTemplateStatus.UNSUBMITTED]: {
        title: t('whatsappTemplate:form.alertUnsubmittedTemplate'),
        description: t(
          'whatsappTemplate:form.alertUnsubmittedTemplateDescription'
        ),
      },
      [WhatsappTemplateStatus.REJECTED]: {
        title: t('whatsappTemplate:form.alertRejectedTemplate'),
        description: t(
          'whatsappTemplate:form.alertRejectedTemplateDescription'
        ),
      },
    }
    return (
      messages[status as keyof typeof messages] || {
        title: '',
        description: '',
      }
    )
  }, [status, t])

  return (
    <Alert variant="destructive">
      <AlertTitle>{statusMessages.title}</AlertTitle>
      <AlertDescription>{statusMessages.description}</AlertDescription>
    </Alert>
  )
}

export default AlertPendingTemplate
